<script setup lang="ts">
import am5geodata_data_countries2 from '@amcharts/amcharts5-geodata/data/countries2';

const route = useRoute();
const countryCode = computed<string>(
  () => route.params.country.toString().toUpperCase() ?? '',
);
const countryName = computed<string>(
  () => am5geodata_data_countries2[countryCode.value].country,
);

useSeoMeta({
  title: `Travel - ${countryName.value}`,
  ogTitle: `Travel - ${countryName.value}`,
  description: `Travel photos and timeline of ${countryName.value}`,
  ogDescription: `Travel photos and timeline of ${countryName.value}`,
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <div class="container">
    <div class="travel-content">
      <h1 class="section-title">{{ countryName }}</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ut nibh
        sed quam eleifend euismod. Nam et consequat odio. Aenean et leo porta
        mauris volutpat tincidunt a ut erat. Suspendisse id enim rhoncus,
        viverra nisi non, pulvinar metus. Fusce eget elit sed metus pulvinar
        feugiat. Praesent urna purus, porta et ligula sit amet, molestie
        tincidunt odio. Mauris sollicitudin ligula eget mi euismod, vel eleifend
        ligula elementum. Aenean a sollicitudin purus, id vestibulum lacus.
        Maecenas sed tortor nunc. Sed sed hendrerit urna. Morbi rutrum molestie
        urna nec sollicitudin. Cras eget eros eu orci pharetra consequat a ut
        mauris. Pellentesque auctor tortor sit amet tellus convallis, eget
        fermentum purus dapibus. Nam egestas tristique lacinia. Curabitur vitae
        massa et mauris blandit luctus. Cras at sodales mauris, sit amet
        porttitor ex. Curabitur nec lectus nec nibh elementum eleifend. Nulla eu
        lacus sed sem fringilla egestas a vel lectus. Aenean facilisis fermentum
        velit eu convallis. Praesent eget mauris vel mi tempus feugiat.
        Vestibulum mollis nec justo ut semper. Nulla vitae sapien in risus
        sollicitudin mollis. Nullam pulvinar rutrum ipsum eu iaculis.
      </p>
    </div>
    <TravelMap
      :countryCode="countryCode"
      :visitedStates="[
        'JP-40',
        'JP-42',
        'JP-43',
        'JP-35',
        'JP-34',
        'JP-38',
        'JP-27',
        'JP-29',
        'JP-28',
        'JP-26',
        'JP-23',
        'JP-17',
        'JP-22',
        'JP-19',
        'JP-13',
      ]"
    />
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.travel-content {
  width: 100%;
}
</style>
