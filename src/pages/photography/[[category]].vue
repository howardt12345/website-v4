<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const { photos, categories } = storeToRefs(usePhotosStore());

const router = useRouter();
const route = useRoute();

const category = computed<string>(() => route.params.category.toString() ?? '');
const categoryPhotos = computed(() =>
  photos.value.filter(
    (photo) =>
      !category.value ||
      photo.category.toLowerCase() === category.value.toLowerCase(),
  ),
);

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

watch(
  () => selectedTags.value,
  () => {
    const query = {
      tags: selectedTags.value,
    };
    router.push({
      query,
    });
  },
);

const visiblePhotos = computed(() =>
  categoryPhotos.value.filter(
    (photo) =>
      !selectedTags.value.length ||
      selectedTags.value.every((tag: string) => photo.tags.includes(tag)),
  ),
);
const availableTags = computed(() => {
  const tags = new Set<string>();
  visiblePhotos.value.forEach((photo) => {
    photo.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
});

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
  <div class="content-container">
    <div class="title-container">
      <h1 class="section-title">
        {{ !!category ? category : $t('All Photos') }}
      </h1>
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
    <CommonFilters
      v-if="availableTags.length && !showCategoriesView"
      v-model:selected-tags="selectedTags"
      :available-tags="availableTags"
      class="tags-container"
    />
  </div>
  <div class="photos-container">
    <PhotosGallery
      v-if="!showCategoriesView"
      :photos="visiblePhotos"
      :selected-tags="selectedTags"
    />
    <PhotosCategories v-else :categories="categories" />
  </div>
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
.breadcrumbs {
  text-transform: capitalize;
}
.tags-container {
  margin-bottom: rem(16);
}

.photos-container {
  width: 80vw;
  margin: 0 auto;
}
</style>
