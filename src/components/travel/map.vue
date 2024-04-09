<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5geodata_data_countries2 from '@amcharts/amcharts5-geodata/data/countries2';

import { useTheme } from '@/store/theme.store';

interface Props {
  countryCode: string;
  visitedStates?: string[];
}

interface Emits {
  (event: 'selectState', state: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const countryMap = computed<string | undefined>(
  () => am5geodata_data_countries2[props.countryCode.toUpperCase()].maps[1],
);
const visited = computed<string[]>(() => props.visitedStates ?? []);
const selectedRegion = ref<am5.Sprite & am5map.MapPolygon | null>(null);

const chartdiv = ref<HTMLElement | null>();
let root!: am5.Root;
let chart: am5map.MapChart;
let polygonSeries: am5map.MapPolygonSeries;
const { themeColors } = storeToRefs(useTheme());

watch(
  () => props.countryCode,
  async () => {
    await setGeoData();
  },
);

const setGeoData = async () => {
  const result = await am5.net.load(
    'https://cdn.amcharts.com/lib/5/geodata/json/' + countryMap.value + '.json',
    chart,
  );

  let geodata = am5.JSONParser.parse(result.response ?? '');
  polygonSeries.setAll({
    geoJSON: geodata,
  });

  // Setup MapPolygon Styling
  polygonSeries.mapPolygons.template.setAll({
    tooltipText: '{name}',
    templateField: 'polygonSettings',
    fill: am5.color(themeColors.value['background_secondary']),
    stroke: am5.color(themeColors.value['text-secondary']),
    strokeWidth: 1,
    interactive: true,
  });

  // create highlight state
  polygonSeries.mapPolygons.template.states.create('active', {
    fill: am5.color(themeColors.value.primary),
    stroke: am5.color(themeColors.value['text-primary']),
    strokeWidth: 4,
  });

  polygonSeries.mapPolygons.template.events.on('click', async (event) => {
    const target = event.target;
    if (selectedRegion.value) {
      selectedRegion.value.states.apply("default");
    }
    target.states.apply('active');
    const dataItem = target.dataItem;
    if (dataItem) {
      const data = dataItem.dataContext;
      const zoomAnimation = polygonSeries.zoomToDataItem(dataItem);
      await zoomAnimation?.waitForStop();
      emits('selectState', data.name);
      selectedRegion.value = target;
    }
  });

  if (visited.value.length) {
    polygonSeries.data.setAll([
      ...visited.value.map((id) => ({
        id,
        polygonSettings: {
          fill: am5.color(themeColors.value.primary),
        },
      })),
      // ...transited_ids.map((id) => ({
      //   id,
      //   polygonSettings: {
      //     fillPattern: am5.LinePattern.new(root, {
      //       color: am5.color(themeColors.value.primary),
      //       rotation: 45,
      //     }),
      //   },
      // })),
    ]);
  }
};

onMounted(async () => {
  if (chartdiv.value) {
    // Create the Root
    root = am5.Root.new(chartdiv.value);
    // Setup Animations
    root.setThemes([am5themes_Animated.new(root)]);

    // Setup the MapChart
    chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'translateX',
        maxPanOut: 0.5,
        centerMapOnZoomOut: false,
      }),
    );

    polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));

    // Create MapPolygons
    await setGeoData();
  }
});

onUnmounted(() => {
  if (root) {
    root.dispose();
  }
});
</script>

<template>
  <div class="country-map" ref="chartdiv"></div>
</template>

<style scoped lang="scss">
.country-map {
  width: 100%;
  height: 100vh;
}
</style>
