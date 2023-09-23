<script setup lang="ts">
const route = useRoute();

const category = computed(() => route.params.category);
const tags = computed(() => route.query.tags ?? []);

const breadcrumbItems = computed(() => {
  const items = [
    {
      title: 'Photos',
      to: '/photography',
    },
    {
      title: category.value,
      to: `/photography/${category.value}`,
    },
  ];
  return items;
});
</script>

<template>
  <h1 class="section-title">Photos - Category</h1>
  <v-breadcrumbs
    :items="breadcrumbItems"
    icon="fas fa-images"
  ></v-breadcrumbs>
</template>
