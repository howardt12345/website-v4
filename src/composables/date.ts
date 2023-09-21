import { usei18n } from '@/store/i18n.store';

export const formatDate = (date: Date) => {
  const { currentLanguage } = storeToRefs(usei18n());
  return date.toLocaleDateString(currentLanguage.value, {
    year: 'numeric',
    month: 'short',
  });
};
