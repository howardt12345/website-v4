<template>
  <v-footer color="background">
    <CommonLanguagePicker />
    <NavSocialLinks />
    <CommonThemeToggle />
    <span class="copyright">
      © {{ new Date().getFullYear() }} Howard Tseng
    </span>
  </v-footer>
</template>

<style scoped lang="scss">
.v-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(8);
  margin-bottom: rem(16);
}
.copyright {
  font-size: rem(14);
  color: $text-secondary;
}
</style>
