import { PhotoItem } from '@/types/photos';

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<PhotoItem[]>([]);
  const getPhotos = async () => {
    const { data } = await useSupabaseClient().from('photos').select();
    photos.value = <PhotoItem[]>data;
  };

  return {
    photos,
    getPhotos,
  };
});
