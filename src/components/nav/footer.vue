<template>
  <v-footer color="background">
    <CommonLanguagePicker />
    <NavSocialLinks />
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
}
.copyright {
  margin: rem(16);
  font-size: rem(14);
  color: $text-secondary;
}
</style>
