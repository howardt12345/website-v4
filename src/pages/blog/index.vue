<script setup lang="ts">
import { useBlogStore } from '@/store/blog.store';

const { blogEntries } = useBlogStore();


</script>

<template>
  <div>
    <h1>Blog</h1>
    <ul>
      <li v-for="entry in blogEntries" :key="entry.id">
        <nuxt-link :to="`/blog/entry/${entry.id}`">{{ entry.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>