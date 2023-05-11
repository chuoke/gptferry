import { useStorage, type RemovableRef } from "@vueuse/core";
import { useQuasar } from "quasar";

export type ThomeModeValue = "auto" | "light" | "dark";

const themeMode = useStorage<ThomeModeValue>("theme-mode", null);

export const useThemeMode = (): {
  themeMode: RemovableRef<ThomeModeValue>;
  icon: RemovableRef<string>;
} => {
  const $q = useQuasar();

  watch(
    () => themeMode.value,
    (val) => {
      console.log({ thome_mode: val });
      //   if (val === null) {
      //     $q.dark.set("auto");
      //   } else {
      //     $q.dark.set(val === true);
      //   }
      $q.dark.set(val === "auto" ? val : val === "dark");
    },
    {
      immediate: true,
    }
  );

  const icon = computed(() => {
    return themeMode.value === "auto"
      ? "wb_twilight"
      : themeMode.value === "light"
      ? "light_mode"
      : "dark_mode";
  });

  return {
    themeMode,
    icon,
  };
};
