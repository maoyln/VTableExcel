/*
 * @Author: maoyl maoyl@glodon.com
 * @Date: 2025-06-27 22:12:11
 * @LastEditors: maoyln maoyl_yx@163.com
 * @LastEditTime: 2025-06-29 22:59:49
 * @FilePath: /vtable-excel/eslint.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import {
  globalIgnores
} from 'eslint/config'

export default tseslint.config([
  // globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^React$'
      }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
])