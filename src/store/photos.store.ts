import { PhotoItem } from '@/types/photos';

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<PhotoItem[]>([]);
  const categories = ref<string[]>([]);
  const getPhotos = async () => {
    const { data } = await useSupabaseClient().from('photos').select();
    const { data: categoriesData } = await useSupabaseClient()
      .from('distinct_categories')
      .select();
    photos.value = <PhotoItem[]>data;
    categories.value = categoriesData?.map((item: any) => item.category) ?? [];
  };

  return {
    photos,
    categories,
    getPhotos,
  };
});
