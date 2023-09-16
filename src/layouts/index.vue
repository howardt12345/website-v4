<script setup lang="ts"></script>

<template>
  <div>
    <v-alert
      text="This is the latest development site for howardt12345.com. It is currently under construction."
      color="warning"
      icon="$info"
      :closable="true"
    ></v-alert>
    <slot />
    <NavFooter />
  </div>
</template>

<style scoped lang="scss">
.app-bar {
  padding: rem(12);
}
</style>
