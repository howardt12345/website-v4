<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am3geodata_japanHigh from '@amcharts/amcharts5-geodata/japanHigh';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5geodata_data_countries2 from '@amcharts/amcharts5-geodata/data/countries2';

import { useTheme } from '@/store/theme.store';

const chartdiv = ref<HTMLElement | null>();
let root!: am5.Root;
const { themeColors } = storeToRefs(useTheme());

const route = useRoute();
const countryParam = computed<string>(
  () => route.params.country.toString().toUpperCase() ?? '',
);
const countryMap = computed<string | undefined>(
  () => am5geodata_data_countries2[countryParam.value].maps[1],
);

onMounted(() => {
  if (chartdiv.value) {
    // Create the Root
    let root = am5.Root.new(chartdiv.value);

    // Setup the MapChart
    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'translateX',
        maxPanOut: 0.5,
        centerMapOnZoomOut: false,
      }),
    );

    // Setup Animations
    root.setThemes([am5themes_Animated.new(root)]);

    // Create MapPolygons
    let polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {}),
    );

    am5.net
      .load(
        'https://cdn.amcharts.com/lib/5/geodata/json/' +
          countryMap.value +
          '.json',
        chart,
      )
      .then((result) => {
        let geodata = am5.JSONParser.parse(result.response ?? '');
        polygonSeries.setAll({
          geoJSON: geodata,
        });
      });

    // Setup MapPolygon Styling
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: '{name}',
      templateField: 'polygonSettings',
      fill: am5.color(themeColors.value['background_secondary']),
      stroke: am5.color(themeColors.value['text-secondary']),
      strokeWidth: 1,
    });

    // Setup MapPolygon Hover Styling
    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(themeColors.value.primary),
      stroke: am5.color(themeColors.value['text-primary']),
      strokeWidth: 4,
    });

    polygonSeries.mapPolygons.template.events.on('click', function (event) {
      console.log('Clicked: ', event.target.dataItem?.dataContext);
      if (event.target.dataItem) {
        polygonSeries.zoomToDataItem(event.target.dataItem);
      }
    });
  }
});

onUnmounted(() => {
  if (root) {
    root.dispose();
  }
});
</script>

<template>
  <div class="testClass" ref="chartdiv"></div>
</template>

<style scoped lang="scss">
.testClass {
  width: 100vw;
  height: 100vh;
  border: 1px solid $accent;
}
</style>
