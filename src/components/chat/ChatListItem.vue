<template>
  <q-item v-ripple clickable :active="active">
    <q-item-section avatar class="q-pr-sm">
      <q-avatar>
        <q-img v-if="chat.avatar" :src="chat.avatar"></q-img>
        <q-icon name="smart_toy"></q-icon>
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1">
        {{ chat.name || $t("chat.name_fill_empty") }}
      </q-item-label>
      <q-item-label caption lines="2">
        <span class="text-weight-bold">{{ chat.model }}</span>
        : {{ chat.system_prompt }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <slot name="menus" :chat="chat"></slot>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { IChat } from "@/composables/chats";

withDefaults(defineProps<{ chat: IChat; active?: boolean }>(), {
  active: false,
});
</script>
