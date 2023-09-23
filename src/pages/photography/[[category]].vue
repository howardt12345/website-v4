<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const { photos, categories } = storeToRefs(usePhotosStore());

const route = useRoute();

const category = computed<string>(() => route.params.category.toString() ?? '');
const categoryPhotos = computed(() =>
  photos.value.filter(
    (photo) => !category.value || photo.category === category.value,
  ),
);
const availableTags = computed(() => {
  const tags = new Set<string>();
  categoryPhotos.value.forEach((photo) => {
    photo.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
});

const tags = ref<string[]>([]);

onMounted(() => {
  tags.value = Array.isArray(route.query.tags)
    ? (route.query.tags as string[])
    : route.query.tags
    ? [route.query.tags]
    : [];
});

const visiblePhotos = computed(() =>
  photos.value
    .filter(
      (photo) =>
        !category.value ||
        photo.category.toLowerCase() === category.value.toLowerCase(),
    )
    .filter(
      (photo) =>
        !tags.value.length ||
        tags.value.some((tag: string) => photo.tags.includes(tag)),
    ),
);

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

const showCategoriesView = ref<boolean>(false);
const toggleCategoriesView = () =>
  (showCategoriesView.value = !showCategoriesView.value);
</script>

<template>
  <div class="title-container">
    <h1 class="section-title">{{ $t('Photos') }}</h1>
    <v-btn
      @click="toggleCategoriesView"
      :text="!showCategoriesView ? $t('Show Categories') : $t('Show Photos')"
      :prepend-icon="
        !showCategoriesView ? 'fas fa-layer-group' : 'fas fa-image'
      "
    ></v-btn>
  </div>
  <v-breadcrumbs
    v-if="category"
    class="breadcrumbs"
    :items="breadcrumbItems"
    icon="far fa-images"
  ></v-breadcrumbs>
  <v-chip-group
    v-if="availableTags.length && !showCategoriesView"
    v-model="tags"
    multiple
    filter
    color="primary"
  >
    <v-chip v-for="tag in availableTags" :key="tag" :value="tag">{{
      tag
    }}</v-chip>
  </v-chip-group>

  <v-row v-if="!showCategoriesView" v-masonry dense>
    <v-col
      v-for="(photo, index) in visiblePhotos"
      v-masonry-tile
      :key="`photo-${index}`"
      cols="12"
      sm="12"
      md="6"
      lg="4"
    >
      <PhotosCard :photo="photo" />
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col
      v-for="category in categories"
      :key="`category-${category.category}`"
      cols="12"
    >
      <v-card variant="plain" nuxt :to="`/photography/${category.category}`">
        <v-img
          :src="category.url"
          :aspect-ratio="2 / 1"
          cover
          class="align-end"
          gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.3)"
        >
          <v-card-title
            class="text-white"
            v-text="category.category"
          ></v-card-title
        ></v-img>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumbs {
  text-transform: capitalize;
}
</style>
