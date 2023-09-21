<template>
  <v-footer color="background">
    <CommonLanguagePicker />
    <NavSocialLinks />
    <CommonThemeToggle />
    <a
      class="copyright"
      href="https://github.com/howardt12345/website-v4"
      target="_blank"
      rel="nofollow noopener noreferrer"
    >
      © {{ new Date().getFullYear() }} Howard Tseng
    </a>
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
  text-decoration: none;
}
</style>
