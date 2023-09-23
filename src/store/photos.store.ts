import { PhotoCategory, PhotoItem } from '@/types/photos';

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<PhotoItem[]>([]);
  const categories = ref<PhotoCategory[]>([]);
  const getPhotos = async () => {
    const { data: photosData } = await useSupabaseClient()
      .from('photos')
      .select();
    const { data: categoriesData } = await useSupabaseClient()
      .from('categories')
      .select();
    photos.value = <PhotoItem[]>photosData;
    categories.value = <PhotoCategory[]>categoriesData;
  };

  return {
    photos,
    categories,
    getPhotos,
  };
});
