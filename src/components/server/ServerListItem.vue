<template>
  <q-tab :name="server.key" class="mb-2">
    <q-avatar class="transition-all duration-500 ease-in-out">
      <q-img v-if="server.avatar" :src="server.avatar" />
      <span v-else> {{ server.name }} </span>
    </q-avatar>
    <q-tooltip anchor="center right" self="center start" :offset="[10, 10]">
      {{ server.name }}
    </q-tooltip>
  </q-tab>
</template>

<script setup lang="ts">
import type { IServer } from "@/composables/servers";

defineProps<{
  server: IServer;
}>();
</script>

<style lang="scss" scoped>
.q-tab--inactive {
  .q-avatar {
    &:hover {
      border-radius: 30%;
    }
  }
}

.q-tab--active {
  & .q-avatar {
    border-radius: 25%;
  }
}
</style>
