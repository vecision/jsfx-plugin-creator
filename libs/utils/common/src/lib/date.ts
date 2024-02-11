const FALLBACK_LOCALE = 'en-US';

export const toLocaleString = (date: string | Date) => {
  if (date instanceof Date) {
    return date.toLocaleDateString(process.env.LOCALE || FALLBACK_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return new Date(date).toLocaleDateString(process.env.LOCALE || FALLBACK_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
