<script setup lang="ts">
const route = useRoute();

const category = computed(() => route.params.category);
const subcategory = computed(() => route.params.subcategory);

const breadcrumbItems = computed(() => {
  const items = [
    {
      title: 'Photos',
      href: '/photography',
    },
    {
      title: category.value,
      href: `/photography/${category.value}`,
    },
  ];
  if (subcategory.value) {
    items.push({
      title: subcategory.value,
      href: `/photography/${category.value}/${subcategory.value}`,
    });
  }
  return items;
});
</script>

<template>
  <h1 class="section-title">Photos - Category</h1>
  <v-breadcrumbs :items="breadcrumbItems"></v-breadcrumbs>
</template>
