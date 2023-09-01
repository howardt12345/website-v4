import fs from 'fs';

export default defineEventHandler(async (event) => {
  const locale = event.context.params?.locale;
  const body = await readBody(event);

  const translationJSON = fs.readFileSync(`src/public/locales/${locale}/translation.json`, 'utf8');
  const translation = JSON.parse(translationJSON);

  const newTranslation = { ...translation, ...body };
  const newTranslationJSON = JSON.stringify(newTranslation, null, 2);

  fs.writeFileSync(`src/public/locales/${locale}/translation.json`, newTranslationJSON, 'utf8');

  console.log(`Added translation to ${locale}`);

  return new Response(newTranslationJSON, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
});
