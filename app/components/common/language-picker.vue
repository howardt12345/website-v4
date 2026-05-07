<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '~/plugins/03.i18n';
import { usei18n } from '~/store/i18n.store';

const languageEntries = Object.entries(SUPPORTED_LANGUAGES);

const { currentLanguage } = storeToRefs(usei18n());
const { changeLanguage } = usei18n();
</script>

<template>
  <div>
    <div>
      <div>
        <span v-for="([lng, language], index) in languageEntries" :key="lng">
          <strong v-if="currentLanguage === lng">
            {{ language.nativeName }}
          </strong>
          <a v-else class="language-link" @click="changeLanguage(lng)">
            {{ language.nativeName }}
          </a>
          <span v-if="index < languageEntries.length - 1">&nbsp;|&nbsp;</span>
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
