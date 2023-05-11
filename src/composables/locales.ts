import { useStorage, type RemovableRef } from "@vueuse/core";

const locales = [
  {
    value: "zh-CN",
    label: "中文",
  },
  {
    value: "en",
    label: "English",
  },
];

export const useLocales = (): {
  locale: RemovableRef<string>;
  locales: {
    value: string;
    label: string;
  }[];
  setLocale: (locale: string) => void;
} => {
  const locale = useStorage<string>("locale", "");

  function setLocale(val: string) {
    locale.value = val;
  }

  return {
    locale,
    locales,
    setLocale,
  };
};
