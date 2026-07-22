import fs from 'fs';

const LOCALE_PATTERN = /^[a-z]{2,3}$/;

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 });

  const locale = event.context.params?.locale?.split('-')[0];
  const filePath = `public/locales/${locale}/translation.json`;
  if (!locale || !LOCALE_PATTERN.test(locale) || !fs.existsSync(filePath)) {
    throw createError({ statusCode: 404 });
  }

  const body = await readBody(event);
  const isFlatStringMap =
    !!body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.values(body).every((value) => typeof value === 'string');
  if (!isFlatStringMap) throw createError({ statusCode: 400, statusMessage: 'Expected a flat string map' });

  try {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const merged = { ...existing, ...body };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Failed to write translation' });
  }
});
