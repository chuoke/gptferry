<template>
  <q-list class="rounded-borders q-px-sm">
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
        class="rounded q-px-xs q-mb-sm"
        @click="handleClick(chat)"
      >
        <template #menus>
          <q-icon name="more_vert" size="xs" style="font-size: 14px">
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 150px" dense class="q-pa-sm">
                <q-item
                  v-close-popup
                  clickable
                  class="rounded-borders"
                  @click="toEditChat(chat)"
                >
                  <q-item-section>{{ $t("chat.edit") }}</q-item-section>
                </q-item>

                <!-- <q-item v-close-popup clickable class="rounded-borders">
                  <q-item-section>
                    {{ $t("message.clear") }}
                  </q-item-section>
                </q-item> -->

                <q-separator spaced />

                <q-separator spaced />

                <q-item
                  v-close-popup
                  clickable
                  class="rounded-borders"
                  @click="toDeleteChat(chat)"
                >
                  <q-item-section>{{ $t("chat.delete") }}</q-item-section>
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
import { useI18n } from "vue-i18n";

defineProps<{ chats: IChat[]; actvieKey: string }>();
const emits = defineEmits(["clicked", "deleted"]);

const $q = useQuasar();
const { t: translate } = useI18n();

function handleClick(chat: IChat) {
  emits("clicked", chat);
}

const { open: openChatForm } = useChatFormDialog();

function toEditChat(chat: IChat) {
  openChatForm(chat);
}

function toDeleteChat(chat: IChat) {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("chat.delete_confirm"),
    cancel: true,
  }).onOk(() => {
    emits("deleted", chat);
  });
}
</script>
