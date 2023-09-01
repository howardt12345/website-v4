<template>
  <div class="hello">
    <hr />
    <div>
      <div v-if="languages">
        <span v-for="(lng, index) in Object.keys(languages)" :key="lng">
          <a
            v-if="$i18next.resolvedLanguage !== lng"
            v-on:click="$i18next.changeLanguage(lng)"
          >
            {{ languages[lng].nativeName }}
          </a>
          <strong v-if="$i18next.resolvedLanguage === lng">
            {{ languages[lng].nativeName }}
          </strong>
          <span v-if="index < Object.keys(languages).length - 1"
            >&nbsp;|&nbsp;</span
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '@/plugins/i18n';
const languages = SUPPORTED_LANGUAGES;
</script>
