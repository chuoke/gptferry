<template>
  <q-card flat>
    <q-card-section style="max-height: 70vh" class="scroll q-py-xl q-px-xl">
      <q-form class="q-gutter-md">
        <q-select
          v-model="modelValue"
          :options="locales"
          outlined
          dense
          emit-value
          map-options
        >
        </q-select>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { useLocales } from "@/composables/locales";
import { useI18n } from "vue-i18n";

const { locale } = useI18n({ inheriteLocale: true, useScope: "global" });
const { locales, setLocale } = useLocales();

const modelValue = ref(locale.value);

watch(
  () => modelValue.value as string,
  (val) => {
    locale.value = val;
    setLocale(val);
  }
);
</script>
