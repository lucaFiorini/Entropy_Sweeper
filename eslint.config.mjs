import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

// Sanitize globals to remove any leading or trailing whitespace
const sanitizedGlobals = Object.fromEntries(
	Object.entries({
		...globals.browser,
		...globals.node
	}).map(([key, value]) => [key.trim(), value])
);

export default defineConfig([
	{
		extends: compat.extends("eslint:recommended", "plugin:prettier/recommended"),

		plugins: {
			prettier
		},

		languageOptions: {
			globals: sanitizedGlobals
		},

		rules: {
			"prettier/prettier": [
				"error",
				{
					useTabs: true,
					tabWidth: 4,
					bracketSameLine: true,
					printWidth: 240,
					trailingComma: "none",
					semi: true,
					singleQuote: false,
					arrowParens: "always",
					endOfLine: "lf",
					proseWrap: "preserve"
				}
			],

			"eol-last": ["error", "always"],
			"no-mixed-spaces-and-tabs": "error",
			"no-unused-vars": "warn",
			"no-console": "off",
			"line-comment-position": ["off"]
		}
	},
	{
		files: ["tests/**/*.test.js"],
		languageOptions: {
			globals: {
				...globals.jest
			}
		}
	}
]);
