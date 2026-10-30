// @ts-check
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  // Static site: the sheet is read once per build, never by visitors' browsers.
  output: "static",
  env: {
    schema: {
      GOOGLE_SHEET_ID: envField.string({ context: "server", access: "secret" }),
      GOOGLE_SHEET_TAB: envField.string({ context: "server", access: "secret", default: "Product Sheet" }),
      // Local builds: path to the key file. Cloudflare builds: the key's JSON content.
      GOOGLE_SERVICE_ACCOUNT_KEY_FILE: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_SERVICE_ACCOUNT_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
