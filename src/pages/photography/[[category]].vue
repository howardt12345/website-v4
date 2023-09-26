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

const selectedTags = ref<string[]>([]);

onMounted(() => {
  selectedTags.value = Array.isArray(route.query.tags)
    ? (route.query.tags as string[])
    : route.query.tags
    ? [route.query.tags]
    : [];
});

watch(
  () => category.value,
  () => {
    selectedTags.value = [];
  },
);

const visiblePhotos = computed(() =>
  photos.value
    .filter(
      (photo) =>
        !category.value ||
        photo.category.toLowerCase() === category.value.toLowerCase(),
    )
    .filter(
      (photo) =>
        !selectedTags.value.length ||
        selectedTags.value.every((tag: string) => photo.tags.includes(tag)),
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

const showTagsFilter = ref<boolean>(false);
const toggleTagsFilter = () => {
  showTagsFilter.value = !showTagsFilter.value;
  if (!showTagsFilter.value) {
    selectedTags.value = [];
  }
};
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
      class="categories-button"
    ></v-btn>
  </div>
  <v-breadcrumbs
    v-if="category"
    class="breadcrumbs"
    :items="breadcrumbItems"
    icon="far fa-images"
  ></v-breadcrumbs>
  <div
    v-if="availableTags.length && !showCategoriesView"
    class="tags-container"
  >
    <v-btn
      @click="toggleTagsFilter"
      :text="!showTagsFilter ? $t('Filter by Tags') : $t('Close Filters')"
      :prepend-icon="!showTagsFilter ? 'fas fa-filter' : 'fas fa-times-circle'"
      size="small"
    ></v-btn>
    <v-chip-group
      v-if="showTagsFilter"
      v-model="selectedTags"
      multiple
      filter
      color="primary"
    >
      <v-chip v-for="tag in availableTags" :key="tag" :value="tag">{{
        tag
      }}</v-chip>
    </v-chip-group>
  </div>
  <PhotosGallery
    v-if="!showCategoriesView"
    :photos="visiblePhotos"
    :selected-tags="selectedTags"
  />
  <PhotosCategories v-else :categories="categories" />
</template>

<style scoped lang="scss">
.title-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
.categories-button {
  margin-bottom: rem(16);
}
.tags-container {
  margin-bottom: rem(16);
}

.breadcrumbs {
  text-transform: capitalize;
}
</style>
