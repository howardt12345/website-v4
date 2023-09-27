import { PhotoCategory, PhotoItem } from '@/types/photos';

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<PhotoItem[]>([]);
  const categories = ref<PhotoCategory[]>([]);
  const getPhotos = async () => {
    const { data: photosData } = await useSupabaseClient()
      .from('photos')
      .select()
      .order('date', {
        ascending: false,
      });
    const { data: categoriesData } = await useSupabaseClient()
      .from('categories')
      .select()
      .order('category', {
        ascending: true,
      });
    photos.value = <PhotoItem[]>photosData;
    categories.value = <PhotoCategory[]>categoriesData;

    photos.value.forEach((photo) => {
      photo.tags = photo.tags.map((tag) => tag.toLowerCase());
    });
  };

  return {
    photos,
    categories,
    getPhotos,
  };
});
