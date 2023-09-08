<script setup lang="ts">
import { useNavLinks } from '@/composables/nav';
const links = useNavLinks();
</script>

<template>
  <div class="nav-links">
    <v-btn
      v-for="link in links"
      :key="link.name"
      :to="link.path"
      variant="plain"
      nuxt
      >{{ $t(link.name) }}
    </v-btn>
  </div>
</template>

<style scoped lang="scss">
.nav-links {
  display: flex;
  flex-direction: row;
}
</style>
