// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  // Base JS recommendations
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        // Додаємо глобальні змінні проєкту
        __APP_VERSION__: "readonly",
        __BUILD_TIME__: "readonly",
      },
    },

    rules: {
      // ===== Best Practices =====
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "no-let": "off", // дозволяємо let
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-else-return": "warn",
      "no-return-assign": "warn",
      "no-useless-return": "warn",

      // ===== Code Style =====
      semi: ["error", "always"],
      quotes: [
        "warn",
        "single",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      indent: "off", // Prettier керує відступами
      "comma-dangle": ["warn", "always-multiline"],
      "no-trailing-spaces": "warn",
      "eol-last": "warn",
      "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 0 }],

      // ===== Functions =====
      "arrow-body-style": ["warn", "as-needed"],
      "arrow-parens": ["warn", "always"],
      "prefer-arrow-callback": "warn",
      "func-style": ["warn", "declaration", { allowArrowFunctions: true }],

      // ===== Objects & Arrays =====
      "object-curly-spacing": ["warn", "always"],
      "array-bracket-spacing": ["warn", "never"],
      "no-array-constructor": "warn",

      // ===== Import/Export =====
      "sort-imports": [
        "warn",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
        },
      ],

      // ===== JSDoc =====
      "valid-jsdoc": "off", // Використовуйте eslint-plugin-jsdoc для кращої підтримки
    },
  },

  {
    // Специфічні правила для тестів
    files: ["tests/**/*.js"],
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "prefer-arrow-callback": "off",
    },
  },

  {
    // Специфічні правила для конфігів
    files: ["**/*.config.js", "vite.config.js"],
    rules: {
      "no-console": "off",
    },
  },

  {
    // Ігнорування
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.min.js",
      "public/**",
    ],
  },
];
