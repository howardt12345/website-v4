<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '@/plugins/03.i18n';
import { usei18n } from '@/store/i18n.store';

const languages = SUPPORTED_LANGUAGES;
const languageKeys = Object.keys(SUPPORTED_LANGUAGES);

const { currentLanguage } = storeToRefs(usei18n());
const { changeLanguage } = usei18n();
</script>

<template>
  <div>
    <div>
      <div v-if="languages">
        <span v-for="(lng, index) in languageKeys" :key="lng">
          <strong v-if="currentLanguage === lng">
            {{ languages[lng].nativeName }}
          </strong>
          <a v-else @click="changeLanguage(lng)" class="language-link">
            {{ languages[lng].nativeName }}
          </a>
          <span v-if="index < languageKeys.length - 1">&nbsp;|&nbsp;</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.language-link {
  cursor: pointer;
  color: $text-secondary;
}
</style>
