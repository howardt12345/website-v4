<script setup lang="ts">
import { PhotoCategory } from '@/types/photos';

interface Props {
  categories: PhotoCategory[];
}

const props = defineProps<Props>();
const { isMobile } = useMediaQueries();
</script>

<template>
  <v-row dense>
    <v-col
      v-for="category in categories"
      :key="`category-${category.category}`"
      cols="12"
    >
      <v-card
        nuxt
        :to="`/photography/${category.category}`"
        class="category-item"
      >
        <v-img
          :src="category.url"
          :aspect-ratio="isMobile ? 1 : 2"
          cover
          class="align-end"
          gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.3)"
        >
          <v-card-title
            class="text-white"
            v-text="category.category"
          ></v-card-title
        ></v-img>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.category-item {
  cursor: pointer;
  opacity: 0.8;

  &:hover,
  &:focus {
    opacity: 1;
  }
}
</style>
