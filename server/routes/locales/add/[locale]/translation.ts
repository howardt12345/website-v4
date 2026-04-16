import fs from 'fs';

export default defineEventHandler(async (event) => {
  const locale = event.context.params?.locale?.split('-')[0];
  const body = await readBody(event);

  const filePath = `public/locales/${locale}/translation.json`;
  const translationJSON = fs.readFileSync(filePath, 'utf8');
  const translation = JSON.parse(translationJSON);

  const newTranslation = { ...translation, ...body };
  const newTranslationJSON = JSON.stringify(newTranslation, null, 2);

  fs.writeFileSync(filePath, newTranslationJSON, 'utf8');

  console.log(`Added translation to ${locale}`);

  return new Response(newTranslationJSON, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
});
