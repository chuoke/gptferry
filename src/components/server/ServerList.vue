<template>
  <q-tabs
    v-model="activeModel"
    vertical
    switch-indicator
    indicator-color="primary"
    class="py-3"
  >
    <server-list-item
      v-for="server of servers"
      :key="server.name"
      :server="server"
      @click="handleClicked(server)"
    ></server-list-item>

    <slot name="tail"></slot>
  </q-tabs>
</template>

<script setup lang="ts">
import { type IServer } from "@/composables/servers";
import ServerListItem from "@/components/server/ServerListItem.vue";

const props = defineProps<{
  servers: IServer[];
  modelValue: string;
}>();

const activeModel = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => {
    activeModel.value = val;
  }
);

const emits = defineEmits(["update:modelValue"]);

function handleClicked(server: IServer) {
  emits("update:modelValue", server.key);
}
</script>
