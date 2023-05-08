<template>
  <q-tab :name="server.key" :title="server.name" class="mb-2">
    <q-avatar>
      <q-img v-if="server.avatar" :src="server.avatar" />
      <span v-else> {{ server.name }} </span>
    </q-avatar>
  </q-tab>
</template>

<script setup lang="ts">
import type { IServer } from "@/composables/servers";

defineProps<{
  server: IServer;
}>();
</script>
