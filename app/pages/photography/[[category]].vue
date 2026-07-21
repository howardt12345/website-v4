<script setup lang="ts">
import type { PhotoCategory, PhotoItem } from '~/types/photos';
import { usePhotoItems } from '~/composables/photos';
import { usei18n } from '~/store/i18n.store';

definePageMeta({ layout: 'default' });

const router = useRouter();
const route = useRoute();

const category = computed<string>(() => route.params.category?.toString() ?? '');

const { allPhotos, pending } = usePhotoItems();
const { t } = usei18n();

// Await the content so an unknown category can 404 in setup during SSR
// (same keys as usePhotoItems, so this dedupes rather than refetches).
await Promise.all([
  useAsyncData('photos', () => queryCollection('photos').order('stem', 'ASC').all()),
  useAsyncData('photo-folders', () => queryCollection('photoFolders').all()),
]);

if (
  category.value &&
  !allPhotos.value.some((photo) => photo.category?.toLowerCase() === category.value.toLowerCase())
) {
  throw createError({ statusCode: 404, statusMessage: 'Photo category not found', fatal: true });
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

useSeoMeta({
  title: () =>
    category.value
      ? `${capitalize(category.value)} · Photography · Howard Tseng`
      : 'Photography · Howard Tseng',
  description: 'A gallery of travel and street photography.',
});

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
  { title: t('Photos'), to: '/photography' },
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
    <PhotosCategories v-if="!pending && showCategoriesView" :categories="categories" />
    <PhotosGallery
      v-else-if="!pending && visiblePhotos.length"
      :photos="visiblePhotos"
      :selected-tags="selectedTags"
    />
    <div v-else-if="!pending" class="photos-empty">
      <h3>{{ $t('No photos match these filters') }}</h3>
      <p>{{ $t('Try removing a tag or widening the category.') }}</p>
      <v-btn
        v-if="selectedTags.length"
        variant="outlined"
        size="small"
        class="photos-empty__reset"
        @click="selectedTags = []"
      >
        {{ $t('Clear all filters') }}
      </v-btn>
    </div>
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

.photos-empty {
  padding: rem(80) rem(24);
  text-align: center;
  border: 1px dashed $border-color;
  border-radius: rem(14);
  color: $text-secondary;

  h3 {
    font-size: rem(20);
    margin-bottom: rem(8);
    font-weight: 500;
  }

  p {
    margin: 0;
    opacity: 0.75;
  }

  &__reset {
    margin-top: rem(14);
  }
}
</style>
