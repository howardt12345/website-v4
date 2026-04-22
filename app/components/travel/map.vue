<script lang="ts">
import type { FeatureCollection } from 'geojson';

// Module-level geodata registry and cache — persists across component remounts.
// Add entries here as new visited countries are added.
const PROVINCE_LOADERS: Record<string, () => Promise<{ default: FeatureCollection }>> = {
  TWN: () => import('@amcharts/amcharts5-geodata/taiwanLow'),
  JPN: () => import('@amcharts/amcharts5-geodata/japanLow'),
  KOR: () => import('@amcharts/amcharts5-geodata/southKoreaLow'),
  CHN: () => import('@amcharts/amcharts5-geodata/chinaLow'),
  SGP: () => import('@amcharts/amcharts5-geodata/singaporeLow'),
  THA: () => import('@amcharts/amcharts5-geodata/thailandLow'),
  VNM: () => import('@amcharts/amcharts5-geodata/vietnamLow'),
  MYS: () => import('@amcharts/amcharts5-geodata/malaysiaLow'),
  IDN: () => import('@amcharts/amcharts5-geodata/indonesiaLow'),
  PHL: () => import('@amcharts/amcharts5-geodata/philippinesLow'),
  IND: () => import('@amcharts/amcharts5-geodata/indiaLow'),
  AUS: () => import('@amcharts/amcharts5-geodata/australiaLow'),
  NZL: () => import('@amcharts/amcharts5-geodata/newZealandLow'),
  USA: () => import('@amcharts/amcharts5-geodata/usaLow'),
  CAN: () => import('@amcharts/amcharts5-geodata/canadaLow'),
  MEX: () => import('@amcharts/amcharts5-geodata/mexicoLow'),
  BRA: () => import('@amcharts/amcharts5-geodata/brazilLow'),
  ARG: () => import('@amcharts/amcharts5-geodata/argentinaLow'),
  GBR: () => import('@amcharts/amcharts5-geodata/ukLow'),
  FRA: () => import('@amcharts/amcharts5-geodata/franceLow'),
  ITA: () => import('@amcharts/amcharts5-geodata/italyLow'),
  DEU: () => import('@amcharts/amcharts5-geodata/germanyLow'),
  ESP: () => import('@amcharts/amcharts5-geodata/spainLow'),
  PRT: () => import('@amcharts/amcharts5-geodata/portugalLow'),
  NLD: () => import('@amcharts/amcharts5-geodata/netherlandsLow'),
  CHE: () => import('@amcharts/amcharts5-geodata/switzerlandLow'),
  AUT: () => import('@amcharts/amcharts5-geodata/austriaLow'),
  GRC: () => import('@amcharts/amcharts5-geodata/greeceLow'),
  BEL: () => import('@amcharts/amcharts5-geodata/belgiumLow'),
  IRL: () => import('@amcharts/amcharts5-geodata/irelandLow'),
  POL: () => import('@amcharts/amcharts5-geodata/polandLow'),
  HUN: () => import('@amcharts/amcharts5-geodata/hungaryLow'),
  NOR: () => import('@amcharts/amcharts5-geodata/norwayLow'),
  SWE: () => import('@amcharts/amcharts5-geodata/swedenLow'),
  DNK: () => import('@amcharts/amcharts5-geodata/denmarkLow'),
  FIN: () => import('@amcharts/amcharts5-geodata/finlandLow'),
};

const provinceGeoCache: Record<string, FeatureCollection> = {};

async function loadProvinceGeo(iso3: string): Promise<FeatureCollection | null> {
  const loader = PROVINCE_LOADERS[iso3];
  if (!loader) return null;
  if (provinceGeoCache[iso3]) return provinceGeoCache[iso3]!;
  const mod = await loader();
  provinceGeoCache[iso3] = mod.default;
  return mod.default;
}
</script>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5geodata_worldHigh from '@amcharts/amcharts5-geodata/worldHigh';
import type { GeometryObject } from 'geojson';
import { hslToHex, vuetifyColorToHex } from '~/utils/color';
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
}

interface Props {
  mode?: 'flat' | 'globe';
  focusCountries?: string[];
  visitedHues?: Record<string, number>;
  visitedRegions?: string[];
  tripPath?: { lon: number; lat: number }[] | null;
  placePins?: MapPin[];
  cityPins?: CityPin[];
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'flat',
  focusCountries: () => [],
  visitedHues: () => ({}),
  visitedRegions: () => [],
  tripPath: null,
  placePins: () => [],
  cityPins: () => [],
});

const emit = defineEmits<{
  countryClick: [iso3: string];
  placeClick: [index: number];
}>();

const { isDark } = storeToRefs(useTheme());
const { iso2ToIso3, iso3ToIso2 } = storeToRefs(useTravelStore());

const MAX_LATITUDE = 85;
const MAX_LONGITUDE = 180;


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

const provinceStrokeColor = (hue: number) =>
  isDark.value ? hslToHex(hue, 40, 33) : hslToHex(hue, 48, 42);

const mapEl = ref<HTMLElement | null>(null);
let root: am5.Root | null = null;
let chart: am5map.MapChart | null = null;
let loadId = 0;
let loadsInFlight = 0;
let overlaySeriesStart = 0;

const colorizeVisitedCountries = (worldSeries: am5map.MapPolygonSeries) => {
  worldSeries.mapPolygons.each((polygon) => {
    const ctx = polygon.dataItem?.dataContext as { id: string } | undefined;
    if (!ctx) return;

    const iso3 = iso2ToIso3.value[ctx.id];
    const hue = iso3 ? props.visitedHues[iso3] : undefined;
    if (!iso3 || hue === undefined) return;

    if (props.focusCountries.includes(iso3)) {
      polygon.setAll({ forceHidden: true });
    } else {
      polygon.set('fill', am5.color(visitedCountryFill(hue)));
      polygon.states.create('hover', { fill: am5.color(visitedCountryHover(hue)) });
      polygon.set('cursorOverStyle', 'pointer');
      polygon.events.on('click', () => emit('countryClick', iso3));
    }
  });
};

const animateToCountry = (iso3: string) => {
  if (!chart) return;

  const iso2 = iso3ToIso2.value[iso3];
  if (!iso2) return;

  const worldFC = am5geodata_worldHigh as FeatureCollection;
  const feature = worldFC.features.find(
    (f) => f.id === iso2 || (f.properties as Record<string, unknown>)?.['id'] === iso2,
  );
  if (!feature?.geometry) return;

  try {
    const bounds = am5map.getGeoBounds(feature.geometry as GeometryObject);

    if (props.mode === 'globe') {
      const centroidLon = (bounds.left + bounds.right) / 2;
      const centroidLat = (bounds.top + bounds.bottom) / 2;
      const angularSpan = Math.max(bounds.right - bounds.left, bounds.top - bounds.bottom);
      const zoomLevel = Math.max(1.8, Math.min(8, 120 / angularSpan));
      const easing = am5.ease.out(am5.ease.cubic);

      chart.animate({ key: 'rotationX', to: -centroidLon, duration: 600, easing });
      chart.animate({ key: 'rotationY', to: -centroidLat, duration: 600, easing });
      chart.animate({ key: 'zoomLevel', to: zoomLevel, duration: 600, easing });
    } else {
      const lonPad = Math.max((bounds.right - bounds.left) * 0.1, 2);
      const latPad = Math.max((bounds.top - bounds.bottom) * 0.1, 2);
      chart.zoomToGeoBounds({
        left: Math.max(bounds.left - lonPad, -MAX_LONGITUDE),
        right: Math.min(bounds.right + lonPad, MAX_LONGITUDE),
        top: Math.min(bounds.top + latPad, MAX_LATITUDE),
        bottom: Math.max(bounds.bottom - latPad, -MAX_LATITUDE),
      }, 500);
    }
  } catch { /* malformed geometry */ }
};

const addTripPath = () => {
  if (!root || !chart || !props.tripPath || props.tripPath.length < 2) return;

  const series = chart.series.push(am5map.MapLineSeries.new(root, {}));
  series.mapLines.template.setAll({
    stroke: am5.color(accentHex()),
    strokeWidth: 2,
    strokeDasharray: [3, 5],
    strokeOpacity: 0.9,
  });
  series.data.push({
    geometry: {
      type: 'LineString',
      coordinates: props.tripPath.map((p) => [p.lon, p.lat]),
    },
  });
};

const addCityPins = () => {
  if (!root || !chart || !props.cityPins.length) return;

  const series = chart.series.push(am5map.MapPointSeries.new(root, {}));
  series.bullets.push(() => {
    const container = am5.Container.new(root!, {});
    container.children.push(am5.Circle.new(root!, {
      radius: 5,
      fill: am5.color(accentHex()),
      stroke: am5.color(backgroundHex()),
      strokeWidth: 2,
    }));
    container.children.push(am5.Label.new(root!, {
      text: '{name}',
      fontSize: 11,
      fill: am5.color(labelFill()),
      centerX: am5.p50,
      centerY: am5.p100,
      y: -10,
      populateText: true,
    }));
    return am5.Bullet.new(root!, { sprite: container });
  });

  for (const pin of props.cityPins) {
    series.data.push({
      geometry: { type: 'Point', coordinates: [pin.lon, pin.lat] },
      name: pin.name,
    });
  }
};

const createActivePinSprite = (label: string): am5.Container => {
  const container = am5.Container.new(root!, {});
  const accent = accentHex();
  const bg = backgroundHex();

  const halo1 = am5.Circle.new(root!, { radius: 8, fill: am5.color(accent), fillOpacity: 0.35 });
  container.children.push(halo1);
  halo1.animate({ key: 'radius', from: 7, to: 22, duration: 1600, loops: Infinity });
  halo1.animate({ key: 'fillOpacity', from: 0.45, to: 0, duration: 1600, loops: Infinity });

  const halo2 = am5.Circle.new(root!, { radius: 8, fill: am5.color(accent), fillOpacity: 0.2 });
  container.children.push(halo2);
  // amCharts5 types omit the `delay` field; stagger via setTimeout instead.
  setTimeout(() => {
    if (!halo2.isDisposed()) {
      halo2.animate({ key: 'radius', from: 7, to: 28, duration: 1600, loops: Infinity });
      halo2.animate({ key: 'fillOpacity', from: 0.3, to: 0, duration: 1600, loops: Infinity });
    }
  }, 800);

  container.children.push(am5.Circle.new(root!, {
    radius: 7,
    fill: am5.color(accent),
    stroke: am5.color(bg),
    strokeWidth: 2.5,
  }));

  if (label) {
    container.children.push(am5.Label.new(root!, {
      text: label,
      fontSize: 11,
      fontWeight: '600',
      fill: am5.color(labelFill()),
      centerX: am5.p50,
      centerY: 0,
      y: 14,
      background: am5.RoundedRectangle.new(root!, {
        fill: am5.color(bg),
        fillOpacity: 0.85,
        cornerRadiusTL: 4, cornerRadiusTR: 4, cornerRadiusBL: 4, cornerRadiusBR: 4,
      }),
      paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
    }));
  }

  return container;
};

const createInactivePinSprite = (idx: number): am5.Container => {
  const container = am5.Container.new(root!, {});

  container.children.push(am5.Circle.new(root!, {
    radius: 9,
    fill: am5.color(backgroundHex()),
    stroke: am5.color(accentHex()),
    strokeWidth: 1.5,
    fillOpacity: 0.9,
  }));
  container.children.push(am5.Label.new(root!, {
    text: String(idx + 1),
    fontSize: 10,
    fontWeight: '600',
    fill: am5.color(accentHex()),
    centerX: am5.p50,
    centerY: am5.p50,
  }));

  container.set('cursorOverStyle', 'pointer');
  container.events.on('click', () => emit('placeClick', idx));

  return container;
};

const addPlacePins = () => {
  if (!root || !chart || !props.placePins.length) return;

  const series = chart.series.push(am5map.MapPointSeries.new(root, {}));
  series.bullets.push((_r, _s, dataItem) => {
    const ctx = dataItem.dataContext as { active: boolean; idx: number; label: string };
    const sprite = ctx.active
      ? createActivePinSprite(ctx.label)
      : createInactivePinSprite(ctx.idx);
    return am5.Bullet.new(root!, { sprite });
  });

  for (const [i, pin] of props.placePins.entries()) {
    series.data.push({
      geometry: { type: 'Point', coordinates: [pin.lon, pin.lat] },
      label: pin.label,
      active: pin.active,
      idx: i,
    });
  }

  const activePin = props.placePins.find((p) => p.active);
  if (activePin) {
    setTimeout(() => {
      if (!chart || chart.isDisposed()) return;
      try {
        chart.zoomToGeoPoint(
          { longitude: activePin.lon, latitude: activePin.lat },
          chart.get('zoomLevel') ?? 4,
          true,
        );
      } catch { /* geodata edge case — safe to ignore */ }
    }, 300);
  }
};

const clearOverlays = () => {
  if (!chart) return;
  while (chart.series.length > overlaySeriesStart) {
    chart.series.removeIndex(overlaySeriesStart);
  }
};

const addOverlays = () => {
  addTripPath();
  addCityPins();
  addPlacePins();
};

const rebuildOverlays = () => {
  if (loadsInFlight > 0) return;
  clearOverlays();
  addOverlays();
};

const loadPolygons = async () => {
  if (!root || !chart) return;

  loadsInFlight++;
  const callId = ++loadId;

  try {
    const provinceGeos = await Promise.all(
      props.focusCountries.map(async (iso3) => ({
        iso3,
        geo: await loadProvinceGeo(iso3),
      })),
    );
    if (callId !== loadId || !root || !chart) return;

    while (chart.series.length) chart.series.removeIndex(0);

    if (props.mode === 'globe') {
      const graticule = chart.series.push(am5map.GraticuleSeries.new(root, { step: 20 }));
      graticule.mapLines.template.setAll({ stroke: am5.color(landStroke()), strokeOpacity: 0.4 });
    }

    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldHigh,
        exclude: ['AQ'],
      }),
    );

    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(landFill()),
      stroke: am5.color(landStroke()),
      strokeWidth: 0.5,
      interactive: true,
      tooltipText: '{name}',
    });
    worldSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(landHover()),
    });

    // amCharts fires `datavalidated` on every layout recalculation;
    // the flag prevents re-animating on subsequent fires.
    let hasAnimated = false;

    worldSeries.events.on('datavalidated', () => {
      colorizeVisitedCountries(worldSeries);

      if (!hasAnimated && props.focusCountries.length && !props.tripPath) {
        hasAnimated = true;
        animateToCountry(props.focusCountries[0]!);
      }
    });

    for (const { iso3, geo } of provinceGeos) {
      if (!geo) continue;
      const hue = props.visitedHues[iso3] ?? 200;

      const provinceSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: geo,
        }),
      );

      provinceSeries.mapPolygons.template.setAll({
        fill: am5.color(landFill()),
        stroke: am5.color(provinceStrokeColor(hue)),
        strokeWidth: 1.5,
        strokeOpacity: 0.4,
        interactive: true,
        tooltipText: '{name}',
      });
      provinceSeries.mapPolygons.template.states.create('hover', {
        fill: am5.color(landHover()),
      });

      provinceSeries.events.on('datavalidated', () => {
        provinceSeries.mapPolygons.each((polygon) => {
          const ctx = polygon.dataItem?.dataContext as { id: string } | undefined;
          if (!ctx) return;
          if (props.visitedRegions.includes(ctx.id)) {
            polygon.set('fill', am5.color(visitedRegionFill(hue)));
          }
        });
      });
    }

    overlaySeriesStart = chart.series.length;
    addOverlays();
  } finally {
    loadsInFlight--;
  }
};

const buildChart = () => {
  if (!mapEl.value) return;

  root?.dispose();
  root = am5.Root.new(mapEl.value);
  root.setThemes([am5themes_Animated.new(root)]);

  const isGlobe = props.mode === 'globe';

  chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: isGlobe ? 'rotateX' : 'translateX',
      panY: isGlobe ? 'rotateY' : 'translateY',
      projection: isGlobe ? am5map.geoOrthographic() : am5map.geoMercator(),
      wheelY: 'zoom',
      maxZoomLevel: 256,
    }),
  );

  loadPolygons();
};

watch(() => props.mode, buildChart);
watch(
  [() => props.focusCountries, () => props.visitedHues, () => props.visitedRegions, isDark],
  loadPolygons,
  { deep: true },
);
watch(
  [() => props.tripPath, () => props.placePins, () => props.cityPins],
  rebuildOverlays,
  { deep: true },
);

onMounted(buildChart);
onUnmounted(() => root?.dispose());
</script>

<template>
  <div class="travel-map">
    <div ref="mapEl" class="travel-map__canvas" />
  </div>
</template>

<style scoped lang="scss">
.travel-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;

  &__canvas {
    width: 100%;
    height: 100%;
    background: rgb(var(--v-theme-map-ocean));
  }
}
</style>
