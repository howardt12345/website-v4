<script setup lang="ts">
import type { PhotoItem } from '~/types/photos';
import type { LightboxEntry } from '~/types/ui';

interface Props {
  photos: PhotoItem[];
  selectedTags: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ toggleTag: [tag: string] }>();

const route = useRoute();
const router = useRouter();

const lightboxPhotos = computed<LightboxEntry[]>(() =>
  props.photos.map((photo) => ({
    src: photo.url,
    large: photo.largeUrl,
    alt: photo.alt ?? photo.title,
    title: photo.title,
    caption: photo.caption,
    tags: photo.tags,
  })),
);

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
  const stem = props.photos[index]?.stem;
  // Push an entry so browser/Android Back closes the lightbox instead of leaving the page.
  if (stem && route.query.photo !== stem) {
    router.push({ query: { ...route.query, photo: stem } });
  }
}

function closeLightbox() {
  lightboxOpen.value = false;
  // Strip only the photo param (replace, not back) so tag edits made while viewing survive the close.
  if (route.query.photo != null) {
    router.replace({ query: { ...route.query, photo: undefined } });
  }
}

function syncLightboxToQuery(stem: string | undefined) {
  if (stem) {
    const idx = props.photos.findIndex((p) => p.stem === stem);
    if (idx >= 0) {
      lightboxIndex.value = idx;
      lightboxOpen.value = true;
    }
  } else if (lightboxOpen.value) {
    lightboxOpen.value = false;
  }
}

watch(() => route.query.photo as string | undefined, syncLightboxToQuery);
onMounted(() => syncLightboxToQuery(route.query.photo as string | undefined));

const redrawMasonry = inject<(id?: string) => void>('redrawVueMasonry');

if (import.meta.dev && !redrawMasonry) {
  console.warn('[PhotosGallery] "redrawVueMasonry" inject not found — masonry will not reflow on photo changes.');
}

watch(
  () => props.photos,
  async () => {
    await nextTick();
    redrawMasonry?.();
  },
);
</script>

<template>
  <div
    v-masonry
    class="masonry-grid"
    item-selector=".masonry-item"
    column-width=".masonry-sizer"
    percent-position="true"
  >
    <div class="masonry-sizer" />
    <div
      v-for="(photo, index) in photos"
      :key="photo.stem"
      v-masonry-tile
      class="masonry-item"
    >
      <PhotosCard
        :photo="photo"
        :selected-tags="selectedTags"
        @select="openLightbox(index)"
        @toggle-tag="emit('toggleTag', $event)"
      />
    </div>
  </div>

  <CommonPhotoLightbox
    :model-value="lightboxOpen"
    :photos="lightboxPhotos"
    :start-index="lightboxIndex"
    :selected-tags="selectedTags"
    @update:model-value="(open) => { if (!open) closeLightbox(); }"
    @toggle-tag="emit('toggleTag', $event)"
  />
</template>

<style scoped lang="scss">
.masonry-grid {
  width: 100%;
}

.masonry-sizer,
.masonry-item {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;

  @media (min-width: 540px) {
    width: 50%;
  }

  @media (min-width: 800px) {
    width: 33.333%;
  }

  @media (min-width: 1280px) {
    width: 25%;
  }
}
</style>
