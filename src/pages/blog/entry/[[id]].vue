<script setup lang="ts">
const route = useRoute();

const id = computed<string>(() => route.params.id.toString() ?? '');

const state = reactive({
  blog: '',
});

onMounted(async () => {
  const { data } = await useFetch(`/api/notion/blog/${id.value}`);
  state.blog = data?.value?.body.mdString ?? '';
  console.log(state.blog);
});
</script>

<template>
  <div class="content-container">
    <div v-if="id">
      {{ id }}
    </div>
    <ContentSlot  v-if="state.blog" :use="state.blog" />
  </div>
</template>
