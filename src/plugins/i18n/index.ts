import type { App } from "vue";
import { createI18n } from "vue-i18n";

export const useI18n = (app: App, messages: { [key: string]: any }) => {
  const i18n = createI18n({
    legacy: false,
    locale: "zh-CN",
    globalInjection: true,
    fallbackLocale: "en",
    availableLocales: ["en", "zh-CN"],
    messages: messages,
  });

  app.use(i18n);
};
