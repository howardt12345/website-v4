<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldHigh from '@amcharts/amcharts5-geodata/worldHigh';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ref, onMounted, onUnmounted } from 'vue';

const chartdiv = ref<HTMLElement | null>();
var root!: am5.Root;

onMounted(() => {
  if (chartdiv.value) {
    // Create the Root
    var root = am5.Root.new(chartdiv.value);

    // Setup the MapChart
    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: 'rotateY',
        projection: am5map.geoOrthographic(),
        centerMapOnZoomOut: false,
      }),
    );

    // Setup Animations
    root.setThemes([am5themes_Animated.new(root)]);

    // Create MapPolygons
    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldHigh,
      }),
    );

    // Setup MapPolygon Styling
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: '{name}',
      fill: am5.color('#909090'),
    });

    // Setup MapPolygon Hover Styling
    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color('#FF0000'),
      stroke: am5.color('#00FF00'),
      strokeWidth: 2,
    });

    polygonSeries.mapPolygons.template.events.on('click', function (event) {
      //console.log("Clicked: {0}", event.target);
    });

    // Setup Background
    var backgroundSeries = chart.series.unshift(
      am5map.MapPolygonSeries.new(root, {}),
    );

    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(0x2c84d0),
      stroke: am5.color(0x2c84d0),
    });

    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180),
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

<style scoped>
.testClass {
  width: 50vw;
  height: 50vh;
}
</style>
