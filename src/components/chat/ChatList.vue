<template>
  <q-list class="rounded-borders px-1">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <chat-list-item
        v-for="chat of chats"
        :key="chat.key"
        :chat="chat"
        :active="chat.key === actvieKey"
        class="rounded q-px-xs"
        @click="handleClick(chat)"
      >
        <template #menus>
          <q-icon name="more_vert" size="xs">
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 150px" dense class="q-pa-sm">
                <q-item
                  v-close-popup
                  clickable
                  class="rounded-borders"
                  @click="toEditChat(chat)"
                >
                  <q-item-section>编辑</q-item-section>
                </q-item>

                <q-item v-close-popup clickable class="rounded-borders">
                  <q-item-section>清空聊天记录</q-item-section>
                </q-item>

                <q-separator spaced />

                <q-item
                  v-close-popup
                  clickable
                  class="rounded-borders"
                  @click="toDeleteChat(chat)"
                >
                  <q-item-section>删除</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-icon>
          <!-- <q-btn icon="more_vert" round size="sm" flat> </q-btn> -->
        </template>
      </chat-list-item>
    </transition-group>
  </q-list>
</template>

<script setup lang="ts">
import ChatListItem from "@/components/chat/ChatListItem.vue";
import { useChatFormDialog } from "@/composables/chat-form-dialog";
import type { IChat } from "@/composables/chats";
import { useQuasar } from "quasar";

defineProps<{ chats: IChat[]; actvieKey: string }>();
const emits = defineEmits(["clicked", "deleted"]);

const $q = useQuasar();

function handleClick(chat: IChat) {
  emits("clicked", chat);
}

const { open: openChatForm } = useChatFormDialog();

function toEditChat(chat: IChat) {
  openChatForm(chat);
}

function toDeleteChat(chat: IChat) {
  $q.dialog({
    title: "确认操作",
    message: "确认要删除该聊天吗？删除后所有聊天记录将被清除且不可恢复。",
    cancel: true,
  }).onOk(() => {
    emits("deleted", chat);
  });
}
</script>
