import type { PhotoItem } from '~/types/photos';

interface RawPhoto {
  stem: string;
  title?: string;
  caption?: string;
  alt?: string;
  date?: string;
  featured?: boolean;
  tags?: string[];
  aspectRatio?: number;
  ext?: string;
}

interface RawPhotoFolder {
  stem: string;
  tripId?: string;
  placeSlug?: string;
  date?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
}

export function usePhotoItems() {
  const { data: rawPhotoFolders, pending: foldersPending } = useAsyncData(
    'photo-folders',
    () => queryCollection('photoFolders').all(),
  );
  const { data: rawPhotos, pending: photosPending } = useAsyncData(
    'photos',
    () => queryCollection('photos').order('stem', 'ASC').all(),
  );

  const pending = computed(() => foldersPending.value || photosPending.value);

  const folderMap = computed(
    () =>
      new Map(
        (rawPhotoFolders.value as unknown as RawPhotoFolder[] ?? []).map((f) => [
          f.stem.replace(/\/index$/, ''),
          f,
        ]),
      ),
  );

  const allPhotos = computed<PhotoItem[]>(() =>
    (rawPhotos.value as unknown as RawPhoto[] ?? []).map((raw) => {
      const folderPath = raw.stem.split('/').slice(0, -1).join('/');
      const folder = folderMap.value.get(folderPath);
      return {
        stem: raw.stem,
        url: `/${raw.stem}.${raw.ext ?? 'jpg'}`,
        title: raw.title,
        caption: raw.caption,
        alt: raw.alt,
        date: raw.date ?? folder?.date,
        featured: raw.featured ?? false,
        tags: [...new Set([...(raw.tags ?? []), ...(folder?.tags ?? [])])],
        category: folder?.category,
        subcategory: folder?.subcategory,
        aspectRatio: raw.aspectRatio ?? 1.5,
        tripId: folder?.tripId,
        placeSlug: folder?.placeSlug,
      };
    }),
  );

  return { allPhotos, pending };
}
