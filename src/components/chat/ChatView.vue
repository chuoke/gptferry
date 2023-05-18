<template>
  <q-layout
    container
    view="lHh lpR lFr"
    style="height: calc(100vh - 24px)"
    class="bg-tertiary overflow-hidden"
  >
    <q-drawer
      v-model="chatMenuDrawerOpen"
      show-if-above
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
        <transition-group
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <template v-if="chats.length">
            <message-view
              v-for="chat of chats"
              v-show="chat.key == activeChatKey"
              :key="chat.key"
              :chat="chat"
              @open-drawer="openLeftDrawer"
            ></message-view>
          </template>

          <MessageEmptyView
            v-show="!activeChatKey || 0 >= chats.length"
            key="empty"
          />
        </transition-group>

        <q-dialog v-model="chatFormDialogOpen">
          <chat-form
            :chat="chatModel"
            :models="models"
            @save="saveChat"
            @cancel="closeChatForm"
          ></chat-form>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useChats, type IChat, type IChatNew } from "@/composables/chats";
import ChatList from "@/components/chat/ChatList.vue";
import MessageView from "@/components/message/MessageView.vue";
import { useQuasar } from "quasar";
import ChatForm from "@/components/chat/ChatForm.vue";
import type { IServer } from "@/composables/servers";
import { useProviders } from "@/composables/providers";
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

const { find: findProvider } = useProviders();
const provider = computed(() => {
  return findProvider(props.server.provider_key);
});
const models = computed(() => {
  return provider.value ? provider.value.models : [];
});

const {
  chats,
  activeChatKey,
  add: addChat,
  update: updateChat,
  remove: removeChat,
  clear: clearChat,
  active: activeChat,
} = useChats(props.server.key);

const {
  chatFormDialogOpen,
  close: closeChatForm,
  open: openChatForm,
  chatModel,
} = useChatFormDialog();

function toAddChat() {
  openChatForm();
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

async function saveChat(val: Partial<IChat>) {
  console.log({ val });
  if ("key" in val && val.key) {
    await updateChat(val as IChat);
  } else {
    const chat = await addChat({
      ...(val as IChatNew),
    });

    activeChat(chat);
  }

  closeChatForm();
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
.chat-view-list {
  .q-scrollarea__content {
    max-width: 100%;
  }
}
</style>
