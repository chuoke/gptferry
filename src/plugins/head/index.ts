import type { App } from "vue";
import { createHead } from "@vueuse/head";

export const useHead = (app: App) => {
  app.use(createHead());
};
