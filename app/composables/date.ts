import { usei18n } from '~/store/i18n.store';

export const formatDate = (date: Date) => {
  const { currentLanguage } = storeToRefs(usei18n());
  return date.toLocaleDateString(currentLanguage.value, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
  });
};

export const formatMonth = (date: Date) => {
  const { currentLanguage } = storeToRefs(usei18n());
  return date.toLocaleDateString(currentLanguage.value, {
    timeZone: 'UTC',
    month: 'short',
  });
};

export const getDateRangeLabel = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const startLabel = formatDate(start);

  if (!endDate) return `${startLabel} - Present`;

  const end = new Date(endDate);
  const isSameMonthYear =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (isSameMonthYear) return startLabel;

  if (start.getFullYear() === end.getFullYear()) {
    return `${formatMonth(start)} - ${formatDate(end)}`;
  }

  return `${startLabel} - ${formatDate(end)}`;
};
