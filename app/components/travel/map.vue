<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import type { FeatureCollection, GeometryObject } from 'geojson';
import { hslToHex, vuetifyColorToHex } from '~/utils/color';
import { loadProvinceGeo } from '~/utils/province-geo';
import { useTheme } from '~/store/theme.store';
import { useTravelStore } from '~/store/travel.store';

interface MapPin {
  lon: number;
  lat: number;
  label?: string;
  active?: boolean;
}

interface CityPin {
  lon: number;
  lat: number;
  name: string;
  id: string;
  country: string;
}

interface Props {
  mode?: 'flat' | 'globe';
  focusCountries?: string[];
  visitedHues?: Record<string, number>;
  visitedRegions?: string[];
  dimmedRegions?: string[];
  tripPath?: { lon: number; lat: number }[] | null;
  activeDayPath?: { lon: number; lat: number }[] | null;
  placePins?: MapPin[];
  cityPins?: CityPin[];
  focusCityPin?: { lon: number; lat: number } | null;
  zoomCountry?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'flat',
  focusCountries: () => [],
  visitedHues: () => ({}),
  visitedRegions: () => [],
  dimmedRegions: () => [],
  tripPath: null,
  activeDayPath: null,
  placePins: () => [],
  cityPins: () => [],
  focusCityPin: null,
  zoomCountry: null,
});

const emit = defineEmits<{
  'country-click': [iso3: string];
  'place-click': [index: number];
  'city-click': [loc: { country: string; city: string }];
}>();

const { isDark } = storeToRefs(useTheme());
const { iso2ToIso3, iso3ToIso2 } = storeToRefs(useTravelStore());

const MAX_LATITUDE = 85;
const MAX_LONGITUDE = 180;
const MAX_ZOOM_LEVEL = 1024;
const ZOOM_DEBOUNCE_MS = 300;
const ANIM_DURATION_MS = 600;
const ZOOM_ANIM_DURATION_MS = 500;
const HALO_ANIM_DURATION_MS = 1600;
const HALO_STAGGER_DELAY_MS = 800;
const GRATICULE_STEP_DEG = 20;
const GLOBE_ZOOM_PATH_MIN = 1.5;
const GLOBE_ZOOM_PATH_MAX = 64;
const GLOBE_ZOOM_COUNTRY_MIN = 1.8;
const GLOBE_ZOOM_COUNTRY_MAX = 8;
const GLOBE_ZOOM_ANGULAR_DIVISOR = 120;
const PATH_PAD_RATIO = 0.15;
const COUNTRY_PAD_RATIO = 0.1;
const COUNTRY_PAD_MIN_DEG = 2;
const CITY_PIN_MIN_PAD_DEG = 1.0;
const CITY_PIN_MIN_SPAN_DEG = 0.18;
const PLACE_PIN_MIN_PAD_DEG = 0.1;

const landFill = () => vuetifyColorToHex('--v-theme-map-land');
const landStroke = () => vuetifyColorToHex('--v-theme-map-land-stroke');
const landHover = () => vuetifyColorToHex('--v-theme-map-land-hover');
const labelFill = () => vuetifyColorToHex('--v-theme-map-label');
const accentHex = () => vuetifyColorToHex('--v-theme-primary');
const backgroundHex = () => vuetifyColorToHex('--v-theme-background');

const visitedCountryFill = (hue: number) =>
  isDark.value ? hslToHex(hue, 55, 44) : hslToHex(hue, 62, 60);

const visitedCountryHover = (hue: number) =>
  isDark.value ? hslToHex(hue, 65, 54) : hslToHex(hue, 68, 50);

const visitedRegionFill = (hue: number) =>
  isDark.value ? hslToHex(hue, 55, 48) : hslToHex(hue, 62, 65);

// Hue-tinted rather than plain grey, so it still reads as this country's color, just muted.
const dimmedRegionFill = (hue: number) =>
  isDark.value ? hslToHex(hue, 12, 30) : hslToHex(hue, 15, 82);

const provinceStrokeColor = (hue: number) =>
  isDark.value ? hslToHex(hue, 40, 33) : hslToHex(hue, 48, 42);

function isIdContext(v: unknown): v is { id: string } {
  return typeof v === 'object' && v !== null && 'id' in v && typeof (v as { id: unknown }).id === 'string';
}

const mapEl = ref<HTMLElement | null>(null);
const chartReady = ref(false);
let root: am5.Root | null = null;
let chart: am5map.MapChart | null = null;
let currentWorldFC: FeatureCollection = am5geodata_worldLow as FeatureCollection;
let loadId = 0;
let loadsInFlight = 0;
let pendingOverlayRebuild = false;
let overlaySeriesStart = 0;
let zoomTimer: ReturnType<typeof setTimeout> | null = null;
const pinHaloTimers: ReturnType<typeof setTimeout>[] = [];
const clickBoundPolygons = new WeakSet<am5map.MapPolygon>();

const colorizeVisitedCountries = (
  worldSeries: am5map.MapPolygonSeries,
  provinceLoaded: Set<string>,
) => {
  const focusSet = new Set(props.focusCountries);
  worldSeries.mapPolygons.each((polygon) => {
    const ctx = polygon.dataItem?.dataContext;
    if (!isIdContext(ctx)) return;

    const iso3 = iso2ToIso3.value[ctx.id];
    const hue = iso3 ? props.visitedHues[iso3] : undefined;
    if (!iso3 || hue === undefined) return;

    if (focusSet.has(iso3) && provinceLoaded.has(iso3)) {
      polygon.setAll({ forceHidden: true });
    } else {
      polygon.set('fill', am5.color(visitedCountryFill(hue)));
      polygon.states.create('hover', { fill: am5.color(visitedCountryHover(hue)) });
      polygon.set('cursorOverStyle', 'pointer');
      if (!clickBoundPolygons.has(polygon)) {
        clickBoundPolygons.add(polygon);
        polygon.events.on('click', () => emit('country-click', iso3));
      }
    }
  });
};

const zoomToPathBounds = (
  path: { lon: number; lat: number }[],
  minPadDeg = 3,
  minSpanDeg = 0,
) => {
  if (!chart || path.length === 0) return;

  let rawMinLon = Infinity, rawMaxLon = -Infinity;
  let rawMinLat = Infinity, rawMaxLat = -Infinity;
  for (const p of path) {
    if (p.lon < rawMinLon) rawMinLon = p.lon;
    if (p.lon > rawMaxLon) rawMaxLon = p.lon;
    if (p.lat < rawMinLat) rawMinLat = p.lat;
    if (p.lat > rawMaxLat) rawMaxLat = p.lat;
  }

  const centLon = (rawMinLon + rawMaxLon) / 2;
  const centLat = (rawMinLat + rawMaxLat) / 2;
  const minLon = Math.min(rawMinLon, centLon - minSpanDeg / 2);
  const maxLon = Math.max(rawMaxLon, centLon + minSpanDeg / 2);
  const minLat = Math.min(rawMinLat, centLat - minSpanDeg / 2);
  const maxLat = Math.max(rawMaxLat, centLat + minSpanDeg / 2);

  if (props.mode === 'globe') {
    const centroidLon = (minLon + maxLon) / 2;
    const centroidLat = (minLat + maxLat) / 2;
    const effectiveSpan = Math.max(maxLon - minLon, maxLat - minLat, minSpanDeg, minPadDeg * 2);
    const zoomLevel = Math.max(GLOBE_ZOOM_PATH_MIN, Math.min(GLOBE_ZOOM_PATH_MAX, GLOBE_ZOOM_ANGULAR_DIVISOR / effectiveSpan));
    const easing = am5.ease.out(am5.ease.cubic);
    chart.animate({ key: 'rotationX', to: -centroidLon, duration: ANIM_DURATION_MS, easing });
    chart.animate({ key: 'rotationY', to: -centroidLat, duration: ANIM_DURATION_MS, easing });
    chart.animate({ key: 'zoomLevel', to: zoomLevel, duration: ANIM_DURATION_MS, easing });
  } else {
    const lonPad = Math.max((maxLon - minLon) * PATH_PAD_RATIO, minPadDeg);
    const latPad = Math.max((maxLat - minLat) * PATH_PAD_RATIO, minPadDeg);
    try {
      chart.zoomToGeoBounds({
        left: Math.max(minLon - lonPad, -MAX_LONGITUDE),
        right: Math.min(maxLon + lonPad, MAX_LONGITUDE),
        top: Math.min(maxLat + latPad, MAX_LATITUDE),
        bottom: Math.max(minLat - latPad, -MAX_LATITUDE),
      }, ZOOM_ANIM_DURATION_MS);
    } catch (err) {
      if (import.meta.dev) console.warn('[TravelMap] zoomToGeoBounds failed:', err);
    }
  }
};

const applyZoom = () => {
  if (zoomTimer !== null) clearTimeout(zoomTimer);
  if (props.focusCityPin) {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed() || !props.focusCityPin) return;
      zoomToPathBounds([props.focusCityPin], CITY_PIN_MIN_PAD_DEG, CITY_PIN_MIN_SPAN_DEG);
    }, ZOOM_DEBOUNCE_MS);
  } else if (props.zoomCountry) {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed() || !props.zoomCountry) return;
      animateToCountry(props.zoomCountry);
    }, ZOOM_DEBOUNCE_MS);
  } else if (props.placePins.length) {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed()) return;
      zoomToPathBounds(props.placePins, PLACE_PIN_MIN_PAD_DEG);
    }, ZOOM_DEBOUNCE_MS);
  } else if (props.tripPath?.length) {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed()) return;
      zoomToPathBounds(props.tripPath!);
    }, ZOOM_DEBOUNCE_MS);
  } else if (props.focusCountries.length) {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed()) return;
      animateToCountry(props.focusCountries[0]!);
    }, ZOOM_DEBOUNCE_MS);
  } else {
    zoomTimer = setTimeout(() => {
      if (!chart || chart.isDisposed()) return;
      chart.goHome(ZOOM_ANIM_DURATION_MS);
    }, ZOOM_DEBOUNCE_MS);
  }
};

const animateToCountry = (iso3: string) => {
  if (!chart) return;

  const iso2 = iso3ToIso2.value[iso3];
  if (!iso2) return;

  const feature = currentWorldFC.features.find(
    (f) => f.id === iso2 || (f.properties as Record<string, unknown>)?.['id'] === iso2,
  );
  if (!feature?.geometry) return;

  let bounds: ReturnType<typeof am5map.getGeoBounds>;
  try {
    bounds = am5map.getGeoBounds(feature.geometry as GeometryObject);
  } catch (err) {
    if (import.meta.dev) console.warn('[TravelMap] getGeoBounds failed (malformed geometry):', err);
    return;
  }

  try {
    if (props.mode === 'globe') {
      const centroidLon = (bounds.left + bounds.right) / 2;
      const centroidLat = (bounds.top + bounds.bottom) / 2;
      const angularSpan = Math.max(bounds.right - bounds.left, bounds.top - bounds.bottom);
      const zoomLevel = Math.max(GLOBE_ZOOM_COUNTRY_MIN, Math.min(GLOBE_ZOOM_COUNTRY_MAX, GLOBE_ZOOM_ANGULAR_DIVISOR / angularSpan));
      const easing = am5.ease.out(am5.ease.cubic);

      chart.animate({ key: 'rotationX', to: -centroidLon, duration: ANIM_DURATION_MS, easing });
      chart.animate({ key: 'rotationY', to: -centroidLat, duration: ANIM_DURATION_MS, easing });
      chart.animate({ key: 'zoomLevel', to: zoomLevel, duration: ANIM_DURATION_MS, easing });
    } else {
      const lonPad = Math.max((bounds.right - bounds.left) * COUNTRY_PAD_RATIO, COUNTRY_PAD_MIN_DEG);
      const latPad = Math.max((bounds.top - bounds.bottom) * COUNTRY_PAD_RATIO, COUNTRY_PAD_MIN_DEG);
      chart.zoomToGeoBounds({
        left: Math.max(bounds.left - lonPad, -MAX_LONGITUDE),
        right: Math.min(bounds.right + lonPad, MAX_LONGITUDE),
        top: Math.min(bounds.top + latPad, MAX_LATITUDE),
        bottom: Math.max(bounds.bottom - latPad, -MAX_LATITUDE),
      }, ZOOM_ANIM_DURATION_MS);
    }
  } catch (err) {
    if (import.meta.dev) console.warn('[TravelMap] zoomToGeoBounds failed (malformed bounds):', err);
  }
};

const addTripPath = (r: am5.Root, c: am5map.MapChart) => {
  if (!props.tripPath || props.tripPath.length < 2) return;
  const accent = accentHex();
  const hasActiveDay = !!props.activeDayPath;

  const series = c.series.push(am5map.MapLineSeries.new(r, {}));
  series.mapLines.template.setAll({
    stroke: am5.color(accent),
    strokeWidth: 2,
    strokeDasharray: [3, 5],
    strokeOpacity: hasActiveDay ? 0.35 : 0.9,
  });
  series.data.push({
    geometry: {
      type: 'LineString',
      coordinates: props.tripPath.map((p) => [p.lon, p.lat]),
    },
  });
};

// Drawn after (on top of) the full trip path so the active day reads as the solid, prominent one.
const addActiveDayPath = (r: am5.Root, c: am5map.MapChart) => {
  if (!props.activeDayPath || props.activeDayPath.length < 2) return;
  const accent = accentHex();

  const series = c.series.push(am5map.MapLineSeries.new(r, {}));
  series.mapLines.template.setAll({
    stroke: am5.color(accent),
    strokeWidth: 3,
    strokeOpacity: 1,
  });
  series.data.push({
    geometry: {
      type: 'LineString',
      coordinates: props.activeDayPath.map((p) => [p.lon, p.lat]),
    },
  });
};

const addCityPins = (r: am5.Root, c: am5map.MapChart) => {
  if (!props.cityPins.length) return;
  const accent = accentHex();
  const bg = backgroundHex();
  const label = labelFill();

  const series = c.series.push(am5map.MapPointSeries.new(r, {}));
  series.bullets.push((_r, _s, dataItem) => {
    const ctx = dataItem.dataContext;
    if (!ctx || typeof ctx !== 'object') return undefined;
    const { id, country } = ctx as { name: string; id: string; country: string };
    const container = am5.Container.new(r, {});

    container.children.push(am5.Circle.new(r, {
      radius: 5,
      fill: am5.color(accent),
      stroke: am5.color(bg),
      strokeWidth: 2,
    }));
    container.children.push(am5.Label.new(r, {
      text: '{name}',
      fontSize: 11,
      fill: am5.color(label),
      centerX: am5.p50,
      centerY: am5.p100,
      y: -10,
      populateText: true,
    }));

    container.set('cursorOverStyle', 'pointer');
    container.events.on('click', () => emit('city-click', { country, city: id }));

    return am5.Bullet.new(r, { sprite: container });
  });

  for (const pin of props.cityPins) {
    series.data.push({
      geometry: { type: 'Point', coordinates: [pin.lon, pin.lat] },
      name: pin.name,
      id: pin.id,
      country: pin.country,
    });
  }
};

const createActivePinSprite = (r: am5.Root, label: string | undefined): am5.Container => {
  const container = am5.Container.new(r, {});
  const accent = accentHex();
  const bg = backgroundHex();

  const halo1 = am5.Circle.new(r, { radius: 8, fill: am5.color(accent), fillOpacity: 0.35 });
  container.children.push(halo1);
  halo1.animate({ key: 'radius', from: 7, to: 22, duration: HALO_ANIM_DURATION_MS, loops: Infinity });
  halo1.animate({ key: 'fillOpacity', from: 0.45, to: 0, duration: HALO_ANIM_DURATION_MS, loops: Infinity });

  const halo2 = am5.Circle.new(r, { radius: 8, fill: am5.color(accent), fillOpacity: 0.2 });
  container.children.push(halo2);
  // amCharts5 types omit the animation `delay` field; stagger via setTimeout instead.
  pinHaloTimers.push(setTimeout(() => {
    if (!halo2.isDisposed()) {
      halo2.animate({ key: 'radius', from: 7, to: 28, duration: HALO_ANIM_DURATION_MS, loops: Infinity });
      halo2.animate({ key: 'fillOpacity', from: 0.3, to: 0, duration: HALO_ANIM_DURATION_MS, loops: Infinity });
    }
  }, HALO_STAGGER_DELAY_MS));

  container.children.push(am5.Circle.new(r, {
    radius: 7,
    fill: am5.color(accent),
    stroke: am5.color(bg),
    strokeWidth: 2.5,
  }));

  if (label) {
    container.children.push(am5.Label.new(r, {
      text: label,
      fontSize: 11,
      fontWeight: '600',
      fill: am5.color(labelFill()),
      centerX: am5.p50,
      centerY: 0,
      y: 14,
      background: am5.RoundedRectangle.new(r, {
        fill: am5.color(bg),
        fillOpacity: 0.85,
        cornerRadiusTL: 4, cornerRadiusTR: 4, cornerRadiusBL: 4, cornerRadiusBR: 4,
      }),
      paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
    }));
  }

  return container;
};

const createInactivePinSprite = (r: am5.Root, idx: number): am5.Container => {
  const container = am5.Container.new(r, {});
  const accent = accentHex();
  const bg = backgroundHex();

  container.children.push(am5.Circle.new(r, {
    radius: 9,
    fill: am5.color(bg),
    stroke: am5.color(accent),
    strokeWidth: 1.5,
    fillOpacity: 0.9,
  }));
  container.children.push(am5.Label.new(r, {
    text: String(idx + 1),
    fontSize: 10,
    fontWeight: '600',
    fill: am5.color(accent),
    centerX: am5.p50,
    centerY: am5.p50,
  }));

  container.set('cursorOverStyle', 'pointer');
  container.events.on('click', () => emit('place-click', idx));

  return container;
};

const addPlacePins = (r: am5.Root, c: am5map.MapChart) => {
  if (!props.placePins.length) return;

  const series = c.series.push(am5map.MapPointSeries.new(r, {}));
  series.bullets.push((_r, _s, dataItem) => {
    const ctx = dataItem.dataContext as { active: boolean; idx: number; label: string | undefined };
    const sprite = ctx.active
      ? createActivePinSprite(r, ctx.label)
      : createInactivePinSprite(r, ctx.idx);
    return am5.Bullet.new(r, { sprite });
  });

  for (const [i, pin] of props.placePins.entries()) {
    series.data.push({
      geometry: { type: 'Point', coordinates: [pin.lon, pin.lat] },
      label: pin.label,
      active: pin.active,
      idx: i,
    });
  }
};

const clearOverlays = () => {
  if (!chart) return;
  pinHaloTimers.forEach(clearTimeout);
  pinHaloTimers.length = 0;
  while (chart.series.length > overlaySeriesStart) {
    chart.series.removeIndex(overlaySeriesStart);
  }
};

const addOverlays = (r: am5.Root, c: am5map.MapChart) => {
  addTripPath(r, c);
  addActiveDayPath(r, c);
  addCityPins(r, c);
  addPlacePins(r, c);
};

const rebuildOverlays = () => {
  if (loadsInFlight > 0) {
    pendingOverlayRebuild = true;
    return;
  }
  if (!root || !chart) return;
  clearOverlays();
  addOverlays(root, chart);
  applyZoom();
};

const loadPolygons = async () => {
  if (!root || !chart) return;

  loadsInFlight++;
  const callId = ++loadId;

  try {
    const [provinceGeos, worldFC] = await Promise.all([
      Promise.all(
        props.focusCountries.map(async (iso3) => ({
          iso3,
          geo: await loadProvinceGeo(iso3),
        })),
      ),
      props.focusCountries.length
        ? import('@amcharts/amcharts5-geodata/worldHigh').then((m) => m.default as unknown as FeatureCollection)
        : Promise.resolve(am5geodata_worldLow as FeatureCollection),
    ]);
    if (callId !== loadId || !root || !chart) return;
    currentWorldFC = worldFC;

    const provinceLoaded = new Set(
      provinceGeos.filter((p) => p.geo).map((p) => p.iso3),
    );

    const land = landFill();
    const stroke = landStroke();
    const hover = landHover();

    while (chart.series.length) chart.series.removeIndex(0);

    if (props.mode === 'globe') {
      const graticule = chart.series.push(am5map.GraticuleSeries.new(root, { step: GRATICULE_STEP_DEG }));
      graticule.mapLines.template.setAll({ stroke: am5.color(stroke), strokeOpacity: 0.4 });
    }

    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: worldFC,
        exclude: ['AQ'],
      }),
    );

    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(land),
      stroke: am5.color(stroke),
      strokeWidth: 0.5,
      interactive: true,
      tooltipText: '{name}',
    });
    worldSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(hover),
    });

    let hasAnimated = false;

    worldSeries.events.on('datavalidated', () => {
      colorizeVisitedCountries(worldSeries, provinceLoaded);

      if (!hasAnimated && props.focusCountries.length && !props.tripPath) {
        hasAnimated = true;
        animateToCountry(props.focusCountries[0]!);
      }
    });

    for (const { iso3, geo } of provinceGeos) {
      if (!geo) continue;
      const hue = props.visitedHues[iso3] ?? 200;
      const visitedSet = new Set(props.visitedRegions);
      const dimmedSet = new Set(props.dimmedRegions);

      const provinceSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, { geoJSON: geo }),
      );

      provinceSeries.mapPolygons.template.setAll({
        fill: am5.color(land),
        stroke: am5.color(provinceStrokeColor(hue)),
        strokeWidth: 1.5,
        strokeOpacity: 0.4,
        interactive: true,
        tooltipText: '{name}',
      });
      provinceSeries.mapPolygons.template.states.create('hover', {
        fill: am5.color(hover),
      });

      let provinceColorized = false;
      provinceSeries.events.on('datavalidated', () => {
        if (provinceColorized) return;
        provinceColorized = true;
        provinceSeries.mapPolygons.each((polygon) => {
          const ctx = polygon.dataItem?.dataContext;
          if (!isIdContext(ctx)) return;
          if (visitedSet.has(ctx.id)) {
            polygon.set('fill', am5.color(visitedRegionFill(hue)));
          } else if (dimmedSet.has(ctx.id)) {
            polygon.set('fill', am5.color(dimmedRegionFill(hue)));
          }
        });
      });
    }

    overlaySeriesStart = chart.series.length;
    addOverlays(root, chart);
    applyZoom();
  } finally {
    loadsInFlight--;
    if (pendingOverlayRebuild) {
      pendingOverlayRebuild = false;
      rebuildOverlays();
    }
  }
};

const buildChart = () => {
  if (!mapEl.value) return;

  clearOverlays();
  loadsInFlight = 0;
  loadId++;

  root?.dispose();
  root = am5.Root.new(mapEl.value);
  root.setThemes([am5themes_Animated.new(root)]);

  const isGlobe = props.mode === 'globe';

  chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: isGlobe ? 'rotateX' : 'translateX',
      panY: isGlobe ? 'rotateY' : 'translateY',
      projection: isGlobe ? am5map.geoOrthographic() : am5map.geoMercator(),
      wheelY: 'none',
      maxZoomLevel: MAX_ZOOM_LEVEL,
    }),
  );

  root.events.once('frameended', () => { chartReady.value = true; });

  loadPolygons();
};

const onWheelModifierChange = (e: KeyboardEvent | MouseEvent) => {
  chart?.set('wheelY', e.ctrlKey || e.metaKey ? 'zoom' : 'none');
};
const zoomIn = () => chart?.zoomIn();
const zoomOut = () => chart?.zoomOut();

watch(() => props.mode, buildChart);
watch(
  [() => props.focusCountries, () => props.visitedHues, () => props.visitedRegions, () => props.dimmedRegions, isDark],
  loadPolygons,
  { deep: true },
);
watch(
  [() => props.tripPath, () => props.activeDayPath, () => props.placePins, () => props.cityPins, () => props.focusCityPin],
  rebuildOverlays,
);
watch(() => props.zoomCountry, applyZoom);

onMounted(() => {
  buildChart();
  if (import.meta.client) {
    window.addEventListener('keydown', onWheelModifierChange);
    window.addEventListener('keyup', onWheelModifierChange);
  }
});
onUnmounted(() => {
  if (zoomTimer !== null) clearTimeout(zoomTimer);
  pinHaloTimers.forEach(clearTimeout);
  if (import.meta.client) {
    window.removeEventListener('keydown', onWheelModifierChange);
    window.removeEventListener('keyup', onWheelModifierChange);
  }
  root?.dispose();
});
</script>

<template>
  <div class="travel-map">
    <div ref="mapEl" class="travel-map__canvas" />

    <div class="travel-map__zoom">
      <v-btn
        icon
        size="small"
        variant="text"
        :aria-label="$t('Zoom in')"
        @click="zoomIn"
      >
        <v-icon size="14">fas fa-plus</v-icon>
      </v-btn>
      <v-btn
        icon
        size="small"
        variant="text"
        :aria-label="$t('Zoom out')"
        @click="zoomOut"
      >
        <v-icon size="14">fas fa-minus</v-icon>
      </v-btn>
    </div>

    <Transition name="skeleton-fade">
      <div v-if="!chartReady" class="travel-map__skeleton" aria-hidden="true">
        <v-skeleton-loader type="image" height="100%" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.travel-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;

  &__skeleton {
    position: absolute;
    inset: 0;

    :deep(.v-skeleton-loader__image) {
      height: 100%;
      border-radius: 0;
    }
  }

  .skeleton-fade-enter-active,
  .skeleton-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .skeleton-fade-enter-from,
  .skeleton-fade-leave-to {
    opacity: 0;
  }

  &__canvas {
    width: 100%;
    height: 100%;
    background: rgb(var(--v-theme-map-ocean));
  }

  &__zoom {
    position: absolute;
    bottom: rem(14);
    left: rem(14);
    display: flex;
    flex-direction: column;
    background: $background-glass;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid $border-color;
    border-radius: rem(8);
    overflow: hidden;

    @media (max-width: 600px) {
      bottom: auto;
      top: rem(14);
    }
  }
}
</style>
