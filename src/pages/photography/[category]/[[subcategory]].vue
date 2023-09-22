<template>
  <h1 class="section-title">Photos - Category</h1>
  <v-breadcrumbs
    :items="[
      'Photos',
      $route.params.category,
      ...($route.params.subcategory ? [$route.params.subcategory] : []),
    ]"
  ></v-breadcrumbs>
</template>
