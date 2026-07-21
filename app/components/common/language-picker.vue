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
          <button
            type="button"
            class="language-btn"
            :aria-pressed="currentLanguage === lng"
            @click="changeLanguage(lng)"
          >
            {{ language.nativeName }}
          </button>
          <span v-if="index < languageEntries.length - 1" aria-hidden="true">&nbsp;|&nbsp;</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.language-btn {
  appearance: none;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: $text-secondary;
  cursor: pointer;

  &[aria-pressed='true'] {
    color: $text;
    text-shadow: 0.4px 0 0 currentColor, -0.4px 0 0 currentColor;
    cursor: default;
  }
}
</style>
