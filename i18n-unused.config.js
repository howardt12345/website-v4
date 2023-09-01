module.exports = {
  localesPath: 'src/public/locales',
  srcPath: 'src',
  ignoreComments: true,
  srcExtensions: ["vue"],
  translationKeyMatcher: /(?:[$ .](_|t|tc|i18n))\(.*?\)/gi,
  context: true
};