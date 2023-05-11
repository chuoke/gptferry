<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { useStorage } from "@vueuse/core";
import { useLocales } from "@/composables/locales";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { locales, locale: settedLocale } = useLocales();
const { locale } = useI18n({ inheriteLocale: true, useScope: "global" });

onMounted(() => {
  if (!settedLocale.value) {
    const userLocale = $q.lang.getLocale();

    if (locales.map((item) => item.value).includes(userLocale)) {
      locale.value = userLocale;
    } else {
      locale.value = "en";
    }
  } else {
    locale.value = settedLocale.value;
  }

  console.log({
    settedLocale: settedLocale.value,
    userLocale: $q.lang.getLocale(),
    locale: locale.value,
  });
});
</script>
