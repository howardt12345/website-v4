<script setup lang="ts">
import type { PhotoItem, PhotoCategory } from '~/types/photos';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Photography · Howard Tseng',
  description: 'A gallery of travel and street photography.',
});

const { data: rawPhotoFolders } = await useAsyncData('photo-folders', () =>
  queryCollection('photoFolders').all(),
);

const { data: rawPhotos } = await useAsyncData('photos', () =>
  queryCollection('photos').order('stem', 'ASC').all(),
);

const folderMap = computed(() =>
  new Map((rawPhotoFolders.value ?? []).map((f) => [f.stem.replace(/\/index$/, ''), f])),
);

const allPhotos = computed<PhotoItem[]>(() =>
  (rawPhotos.value ?? []).map((raw) => {
    const folderPath = raw.stem.split('/').slice(0, -1).join('/');
    const folder = folderMap.value.get(folderPath);
    return {
      stem: raw.stem,
      url: `/${raw.stem}.${raw.ext ?? 'jpg'}`,
      title: raw.title,
      caption: raw.caption,
      alt: raw.alt,
      date: raw.date,
      featured: raw.featured ?? false,
      tags: raw.tags ?? folder?.tags ?? [],
      category: folder?.category,
      subcategory: folder?.subcategory,
      aspectRatio: raw.aspectRatio ?? 1.5,
      tripId: folder?.tripId,
      placeSlug: folder?.placeSlug,
    };
  }),
);

const categories = computed<PhotoCategory[]>(() => {
  const categoryMap = new Map<string, { items: PhotoItem[]; cover?: string }>();
  for (const photo of allPhotos.value) {
    if (!photo.category) continue;
    if (!categoryMap.has(photo.category)) categoryMap.set(photo.category, { items: [] });
    const entry = categoryMap.get(photo.category)!;
    entry.items.push(photo);
    if (photo.featured && !entry.cover) entry.cover = photo.url;
  }
  return Array.from(categoryMap.entries())
    .map(([cat, { items, cover }]) => ({
      category: cat,
      count: items.length,
      coverUrl: cover ?? items[0]?.url ?? '',
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
});

const router = useRouter();
const route = useRoute();

const category = computed<string>(() => route.params.category?.toString() ?? '');

const categoryPhotos = computed(() =>
  allPhotos.value.filter(
    (photo) => !category.value || photo.category?.toLowerCase() === category.value.toLowerCase(),
  ),
);

const selectedTags = ref<string[]>([]);

onMounted(() => {
  selectedTags.value = Array.isArray(route.query.tags)
    ? (route.query.tags as string[])
    : route.query.tags
    ? [route.query.tags as string]
    : [];
});

watch(category, () => {
  selectedTags.value = [];
});

watch(selectedTags, () => {
  router.push({ query: { tags: selectedTags.value } });
});

const visiblePhotos = computed(() =>
  categoryPhotos.value.filter(
    (photo) =>
      !selectedTags.value.length ||
      selectedTags.value.every((tag) => photo.tags.includes(tag)),
  ),
);

const availableTags = computed(() => {
  const tags = new Set<string>();
  visiblePhotos.value.forEach((photo) => photo.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
});

const breadcrumbItems = computed(() => [
  { title: 'Photos', to: '/photography' },
  { title: category.value, to: `/photography/${category.value}` },
]);

const showCategoriesView = ref(false);
const toggleCategoriesView = () => (showCategoriesView.value = !showCategoriesView.value);
</script>

<template>
  <div class="content-container">
    <div class="title-container">
      <h1 class="section-title">
        {{ !!category ? category : $t('All Photos') }}
      </h1>
      <v-btn
        :text="!showCategoriesView ? $t('Show Categories') : $t('Show Photos')"
        :prepend-icon="!showCategoriesView ? 'fas fa-layer-group' : 'fas fa-image'"
        class="categories-button"
        @click="toggleCategoriesView"
      />
    </div>
    <v-breadcrumbs
      v-if="category"
      class="breadcrumbs"
      :items="breadcrumbItems"
      icon="far fa-images"
    />
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
