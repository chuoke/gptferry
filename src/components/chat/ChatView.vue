<template>
  <q-layout
    container
    view="lHh lpR lFr"
    style="height: calc(100vh - 24px)"
    class="chat-view bg-tertiary overflow-hidden"
  >
    <q-drawer
      v-model="chatMenuDrawerOpen"
      show-if-above
      persistent
      :breakpoint="600"
      side="left"
      class="rounded-tl-lg bg-second"
    >
      <q-layout container view="hHh lpR fFf" style="height: calc(100vh - 24px)">
        <q-header class="bg-second text-second shadow-1">
          <q-toolbar>
            <q-btn
              dense
              flat
              round
              icon="menu"
              class="lt-sm"
              @click="openLeftDrawer('server')"
            />
            <!-- <q-toolbar-title>
              <q-avatar size="32">
                <q-img v-if="server?.avatar" :src="server.avatar"></q-img>
              </q-avatar>
              {{ server?.name }}
            </q-toolbar-title> -->
            <q-item dense class="q-px-xs q-ml-sm">
              <q-item-section avatar>
                <q-avatar size="32">
                  <q-img v-if="server?.avatar" :src="server.avatar"></q-img>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ server?.name }}
                </q-item-label>
                <q-item-label
                  v-if="server.provider?.name !== server?.name"
                  caption
                >
                  {{ server.provider?.name }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-space></q-space>
            <q-btn-dropdown rounded dense flat>
              <q-list dense style="min-width: 200px" class="p-3">
                <q-item
                  v-close-popup
                  clickable
                  class="rounded"
                  @click="openServerForm(server)"
                >
                  <q-item-section>
                    <q-item-label>{{ $t("server.setting") }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="settings" size="xs" />
                  </q-item-section>
                </q-item>

                <q-item
                  v-close-popup
                  clickable
                  class="rounded"
                  @click="toAddChat"
                >
                  <q-item-section>
                    <q-item-label>{{ $t("chat.new") }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="add_comment" size="xs" />
                  </q-item-section>
                </q-item>

                <q-separator spaced></q-separator>

                <q-item
                  v-close-popup
                  clickable
                  class="rounded text-red"
                  @click="toDeleteServer"
                >
                  <q-item-section>
                    <q-item-label>{{ $t("server.delete") }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="delete" size="xs" color="negative"></q-icon>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page class="chat-view-list">
            <q-scroll-area
              style="height: calc(100vh - 24px - 50px - 50px - 20px)"
              :thumb-style="{
                right: '2px',
                borderRadius: '5px',
                backgroundColor: 'rgb(235 215 243 / 67%)',
                width: '5px',
                opacity: '0.75',
              }"
            >
              <q-list>
                <q-item>
                  <q-item-section side>
                    <a
                      :href="server.provider?.homepage"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <q-avatar icon="launch" size="sm"></q-avatar>
                    </a>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>
                      {{ server.provider?.homepage }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <q-separator spaced inset></q-separator>

              <chat-list
                :chats="chats"
                :server="server"
                :actvie-key="activeChatKey"
                @clicked="handleChatClicked"
                @deleted="handleChatDeleted"
              ></chat-list>
            </q-scroll-area>
          </q-page>
        </q-page-container>

        <q-footer class="bg-second-alt text-second-alt">
          <q-toolbar class="bg-second-alt text-second-alt">
            <q-btn flat color="negative" icon="clear_all" @click="toClearChat">
              <q-tooltip>
                {{ $t("chat.clear_all") }}
              </q-tooltip>
            </q-btn>

            <q-space></q-space>
            <q-btn
              icon="add"
              outline
              color="primary"
              :label="$t('chat.new')"
              @click="toAddChat"
            >
            </q-btn>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-drawer>

    <q-page-container>
      <q-page>
        <q-tab-panels
          v-model="activeChatKey"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="chat-views"
        >
          <q-tab-panel v-for="chat of chats" :key="chat.key" :name="chat.key">
            <message-view
              :chat="chat"
              @open-drawer="openLeftDrawer"
            ></message-view>
          </q-tab-panel>
        </q-tab-panels>

        <q-tab-panel name="empty">
          <MessageEmptyView
            v-show="!activeChatKey || 0 >= chats.length"
            key="empty"
          />
        </q-tab-panel>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useChats, type IChat } from "@/composables/chats";
import ChatList from "@/components/chat/ChatList.vue";
import MessageView from "@/components/message/MessageView.vue";
import { useQuasar } from "quasar";
import type { IServer } from "@/composables/servers";
import { useServerFormDialog } from "@/composables/server-form-dialog";
import { useChatFormDialog } from "@/composables/chat-form-dialog";
import MessageEmptyView from "@/components/message/MessageEmptyView.vue";
import { useLeftDrawer } from "@/composables/left-drawer";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  server: IServer;
}>();
const emits = defineEmits(["deleted"]);

const { chatMenuDrawerOpen, open: openLeftDrawer } = useLeftDrawer();

const $q = useQuasar();
const { t: translate } = useI18n();

const {
  chats,
  activeChatKey,
  remove: removeChat,
  clear: clearChat,
  active: activeChat,
} = useChats(props.server.key);

const { open: openChatForm } = useChatFormDialog();

function toAddChat() {
  openChatForm({
    server_key: props.server.key,
    provider_key: props.server.provider_key,
    model: "",
    system_prompt: "",
  });
}

function toDeleteServer() {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("server.delete_confirm"),
    cancel: true,
  }).onOk(() => {
    emits("deleted", props.server);
  });
}

function toClearChat() {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("chat.clear_all_confirm"),
    cancel: true,
  }).onOk(() => {
    clearChat();
  });
}

function handleChatClicked(chat: IChat) {
  console.log({ chat });
  activeChat(chat);
}

function handleChatDeleted(chat: IChat) {
  removeChat(chat.key);
}

const { open: openServerForm } = useServerFormDialog();
</script>

<style lang="scss">
.chat-view {
  & .scroll {
    overflow: hidden;
  }
}

.chat-view-list {
  .q-scrollarea__content {
    max-width: 100%;
  }
}
</style>
