// prettier.config.js
// @ts-check

export default {
  // ===== Basic =====
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  trailingComma: 'all',

  // ===== Formatting =====
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  proseWrap: 'preserve',

  // ===== HTML/CSS =====
  htmlWhitespaceSensitivity: 'css',
  cssDeclarationSorter: true,

  // ===== Overrides =====
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
