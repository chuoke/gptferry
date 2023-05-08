<template>
  <q-item v-ripple :active="active" clickable dense class="rounded q-mb-sm">
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ label: string; active?: boolean }>(), {
  active: false,
});
</script>
