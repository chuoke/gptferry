import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { version as pkgVersion } from "./package.json";
import { VitePWA } from "vite-plugin-pwa";
import manifest from "./manifest";

process.env.VITE_APP_VERSION = pkgVersion;
if (process.env.NODE_ENV === "production") {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString();
}

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/head",
        "pinia",
        {
          "@/store": ["useStore"],
        },
      ],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
    quasar({
      sassVariables: "src/plugins/quasar/variables.sass",
    }),
    VueI18nPlugin({
      //
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: manifest,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "vue-i18n": "vue-i18n/dist/vue-i18n.runtime.esm-bundler.js",
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
