<script setup lang="ts">
import type { PhotoCategory, PhotoItem } from '~/types/photos';
import { usePhotoItems } from '~/composables/photos';
import { usei18n } from '~/store/i18n.store';

definePageMeta({ layout: 'default' });

const router = useRouter();
const route = useRoute();

const category = computed<string>(() => route.params.category?.toString() ?? '');

const { allPhotos, pending, error, refresh } = usePhotoItems();
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

const showCategoriesView = ref(false);
const toggleCategoriesView = () => (showCategoriesView.value = !showCategoriesView.value);

// Prerendered pages carry no query, so gate the URL read until after hydration to keep server and client markup identical.
const mounted = ref(false);
onMounted(() => (mounted.value = true));

const selectedTags = computed<string[]>({
  get: () => {
    if (!mounted.value) return [];
    const raw = route.query.tags;
    if (Array.isArray(raw)) return raw.filter((tag): tag is string => !!tag);
    return typeof raw === 'string' && raw ? raw.split(',') : [];
  },
  set: (value) => {
    router.replace({
      query: { ...route.query, tags: value.length ? value.join(',') : undefined },
    });
  },
});

watch(category, () => {
  showCategoriesView.value = false;
  if (route.query.tags) selectedTags.value = [];
});

const toggleTag = (tag: string) => {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((t) => t !== tag)
    : [...selectedTags.value, tag];
};

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
  { title: category.value, disabled: true },
]);
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
    <CommonRetryPanel v-if="error" @retry="refresh" />
    <div v-else-if="pending" class="photos-skeleton" aria-hidden="true">
      <v-skeleton-loader v-for="n in 9" :key="n" type="image" />
    </div>
    <PhotosCategories v-else-if="!pending && showCategoriesView" :categories="categories" />
    <PhotosGallery
      v-else-if="!pending && visiblePhotos.length"
      :photos="visiblePhotos"
      :selected-tags="selectedTags"
      @toggle-tag="toggleTag"
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
.section-title {
  text-transform: capitalize;
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

.photos-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(rem(220), 1fr));
  gap: rem(12);

  :deep(.v-skeleton-loader__image) {
    height: rem(220);
  }
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
