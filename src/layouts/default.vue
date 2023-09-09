<template>
  <div>
    <v-footer class="app-bar" elevation="0" color="background">
      <v-app-bar-title>
        <v-btn variant="plain" size="x-large" to="/" nuxt>Howard Tseng</v-btn>
      </v-app-bar-title>
      <NavLinks />
      <CommonThemeToggle />
    </v-footer>
    <slot />
    <NavFooter />
  </div>
</template>

<style scoped lang="scss">
.app-bar {
  padding: rem(12);
}
</style>
