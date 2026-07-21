// Vue's server renderer crashes on an unresolved directive, but vue-masonry
// (masonry-layout) touches `window` at import and can't load server-side — so
// stub the directives for SSR; the client plugin does the real reflow.
export default defineNuxtPlugin((nuxtApp) => {
  const ssrNoop = { getSSRProps: () => ({}) };
  nuxtApp.vueApp.directive('masonry', ssrNoop);
  nuxtApp.vueApp.directive('masonry-tile', ssrNoop);
});
