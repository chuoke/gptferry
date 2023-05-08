import type { App } from "vue";

import { Quasar, AppFullscreen, Dialog, Notify } from "quasar";
// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
// Import Quasar css
import "quasar/src/css/index.sass";
import "./quasar.scss";

import langZhCN from "quasar/lang/zh-CN";

export const useQuasar = (app: App) => {
  app.use(Quasar, {
    plugins: {
      AppFullscreen,
      Dialog,
      Notify,
    },
    config: {
      framework: {
        cssAddon: true,
      },
      brand: {
        // primary: '#e46262',
        // ... or all other brand colors
      },
      notify: {
        position: "top",
      },
    },
    lang: langZhCN,
  });
};
