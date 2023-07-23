<template>
  <q-layout
    ref="messagePageRef"
    view="hHh lpR fFr"
    container
    style="height: calc(100vh - 24px)"
    class="message-view bg-first text-first"
  >
    <q-header class="shadow-1 bg-first text-first">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          class="lt-sm"
          @click="toOpenLeftDrawer"
        />

        <q-toolbar-title class="q-ml-sm">
          # {{ chat?.name || $t("chat.name_fill_empty") }}

          <small class="text-caption">-- {{ chat.system_prompt }}</small>
        </q-toolbar-title>

        <q-btn
          dense
          flat
          icon="clear_all"
          :title="$t('message.clear')"
          @click="toClearMessages"
        ></q-btn>
        <q-btn
          dense
          flat
          round
          :icon="rightDrawerOpen ? 'close' : 'menu'"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      class="bg-second"
      :width="385"
      :breakpoint="100"
    >
      <MessageSearcher :chat="chat" />
    </q-drawer>
    <q-page-container>
      <q-page>
        <div
          ref="messageContainerRef"
          class="message-list-container"
          @scroll="handleScroll"
        >
          <q-chat-message
            v-for="message of messages"
            :key="message.key"
            :text="[message.conent]"
            :sent="message.role === 'user'"
          >
            <template #avatar>
              <q-avatar
                v-if="message.role !== 'user'"
                class="q-message-avatar q-message-avatar--received"
              >
                <img :src="chat.avatar || currentServer?.avatar" />
              </q-avatar>
              <q-avatar v-else class="q-message-avatar q-message-avatar--sent">
                <img
                  v-if="userProfile.avatar"
                  :src="userProfile.avatar"
                  :alt="userProfile.name"
                />
                <q-icon v-else name="account_circle"></q-icon>
              </q-avatar>
            </template>

            <div style="min-width: 50px; min-height: 10px">
              <markdown-message
                :text="message.content"
                :loading="message.key === loadingMsgKey"
              ></markdown-message>
            </div>

            <template #stamp>
              <div class="row absolute-bottom-right">
                <q-space></q-space>

                <q-icon
                  size="xs"
                  name="more_horiz"
                  class="q-pa-none text-caption text-weight-light cursor-pointer"
                  style="opacity: 0.8; font-size: 14px"
                >
                  <q-menu>
                    <q-list dense style="min-width: 150px" class="q-pa-sm">
                      <q-item
                        v-close-popup
                        clickable
                        class="rounded q-px-xs"
                        @click="toCopyContent(message.content)"
                      >
                        <q-item-section>
                          {{ $t("message.copy") }}
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="content_copy" size="xs"></q-icon>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-close-popup
                        clickable
                        class="rounded q-px-xs"
                        @click="favorite(message)"
                      >
                        <q-item-section>
                          {{
                            message.favorited
                              ? $t("message.unfavorite")
                              : $t("message.favorite")
                          }}
                        </q-item-section>
                        <q-item-section side>
                          <q-icon
                            :name="
                              message.favorited ? 'favorite' : 'favorite_border'
                            "
                            :color="message.favorited ? 'red-7' : ''"
                            size="xs"
                          ></q-icon>
                        </q-item-section>
                      </q-item>
                      <q-separator></q-separator>
                      <q-item
                        v-close-popup
                        clickable
                        class="rounded q-px-xs"
                        @click="toDeleteMessage(message)"
                      >
                        <q-item-section>
                          {{ $t("message.delete") }}
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="delete_forever" size="xs"></q-icon>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </div>
            </template>
          </q-chat-message>
        </div>
      </q-page>
    </q-page-container>

    <q-footer class="q-px-sm q-px-md-lg bg-transparent">
      <div class="q-mb-xs text-weight-light">
        <q-icon
          name="replay"
          size="xs"
          color="secondary"
          class="cursor-pointer q-mr-sm"
          style="opacity: 0.6"
          @click="retry"
        ></q-icon>
        <q-icon
          v-show="loadingMsgKey"
          name="power_settings_new"
          size="xs"
          color="red"
          class="cursor-pointer q-mr-sm"
          style="opacity: 0.6"
          @click="stopReceiveMessage"
        ></q-icon>
      </div>
      <MessageInput
        :loading="loadingMsgKey.length > 0"
        @send="sendMessage"
      ></MessageInput>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import type { IChat } from "@/composables/chats";
import { useMessages, type IMessage } from "@/composables/messages";
import { useServers, type IServer } from "@/composables/servers";
import { useQuasar, copyToClipboard, throttle } from "quasar";
import { useAI } from "@/ai";
import MarkdownMessage from "@/components/message/MarkdownMessage.vue";
import { useServerFormDialog } from "@/composables/server-form-dialog";
import { useUserProfile } from "@/composables/user";
import { useI18n } from "vue-i18n";
import MessageInput from "@/components/message/MessageInput.vue";
import MessageSearcher from "@/components/message/MessageSearcher.vue";

const props = defineProps<{
  chat: IChat;
}>();
const emits = defineEmits(["open-drawer"]);

const $q = useQuasar();
const { t: translate } = useI18n();

const rightDrawerOpen = ref(false);
const messageContainerRef = ref<Element | null>(null);

const {
  messages,
  clear: clearMessages,
  remove: removeMessage,
  add: addMessage,
  finish: finishMessage,
  favorite: favoriteMessage,
  loadMore: loadMoreMessages,
} = useMessages(props.chat);
const { open: openServerForm } = useServerFormDialog();
const { servers } = useServers();
const currentServer = computed(() => {
  return servers.value.find(
    (server: IServer) => server.key === props.chat.server_key,
  ) as IServer;
});

const { userProfile } = useUserProfile();

onMounted(async () => {
  console.log("mounted");
  await loadMoreMessages();
});

const currentModel = computed(() => {
  return props.chat.model || currentServer.value?.model;
});

const messagePageRef = ref<Element | null>(null);

function toOpenLeftDrawer() {
  emits("open-drawer");
}

const scollLastPosition = ref(0);
const handleScroll = async (event: Event) => {
  const target = event.target as HTMLElement;
  const position = Math.abs(target.scrollTop);
  if (
    position > scollLastPosition.value &&
    Math.abs(target.scrollTop || 0) / (target.scrollHeight || 1) > 0.7
  ) {
    await loadMoreMessages();
  }

  scollLastPosition.value = position;
};

const messageContainerHeight = ref(0);
const scrollToBottom = throttle(function (force?: boolean) {
  nextTick(() => {
    console.log("Scroll");
    console.log({ messageContener: messageContainerRef.value });
    if (messageContainerRef.value) {
      const containerHeight = messageContainerRef.value?.clientHeight;

      if (force || messageContainerHeight.value !== containerHeight) {
        messageContainerHeight.value = containerHeight;
        messageContainerRef.value.scrollTop = 0;
      }
    }
  });
}, 600);

function toClearMessages() {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("message.clear_confirm"),
    cancel: true,
  }).onOk(() => {
    clearMessages();
  });
}

function toDeleteMessage(message: IMessage) {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("message.delete_confirm"),
    cancel: true,
  }).onOk(() => {
    removeMessage(message.key);
  });
}

function toCopyContent(content: string) {
  copyToClipboard(content)
    .then(() => {
      $q.notify({
        message: translate("message.copy_success"),
        type: "success",
      });
    })
    .catch(() => {
      $q.notify({
        message: translate("message.copy_failed"),
        type: "nagetive",
      });
    });
}

const loadingMsgKey = ref<string>("");
const chatProvider = useAI(currentServer.value?.provider_key as string);

async function sendMessage(inputMessage: string) {
  if (!checkApiKeySetted()) {
    return;
  }

  if (loadingMsgKey.value || !inputMessage) {
    return;
  }

  const sentMessage = await addMessage({
    finished: true,
    role: "user",
    content: inputMessage,
    model: props.chat.model || currentServer.value.model,
  });

  await doSendMessage(sentMessage);
}

const abortController = ref<AbortController>();
async function doSendMessage(message: IMessage) {
  try {
    if (!checkApiKeySetted()) {
      return;
    }

    if (loadingMsgKey.value) {
      return;
    }

    loadingMsgKey.value = "...";

    abortController.value = new AbortController();
    const carries = messages
      .slice(1, props.chat.carried_message_count || 10)
      .reverse();

    const receivedMessage = await addMessage({
      finished: false,
      role: "assistant",
      content: "",
      model: props.chat.model || currentServer.value.model,
    });

    scrollToBottom(true);

    loadingMsgKey.value = receivedMessage.key;

    const chatOptions = {
      message: message.content,
      model: currentModel.value as string,
      api_base_url:
        currentServer.value.api_base_url ||
        currentServer.value.provider?.api_base_url ||
        "",
      api_key: currentServer.value.api_key as string,
      max_tokens:
        props.chat.max_tokens || currentServer.value.max_tokens || undefined,
      carries: carries,
      system_prompt: props.chat.system_prompt,
      probability_mass: props.chat.probability_mass,
      controller: abortController.value,
      onProgress: (content: string, options: { done: boolean }) => {
        messages[0].content += content;
        receivedMessage.content += content;

        const { done } = options;
        if (done) {
          loadingMsgKey.value = "";

          if (!receivedMessage.finished) {
            receivedMessage.finished = true;
            finishMessage(receivedMessage);
          }
        }
      },
      onError: (err: any) => {
        handleReceiveError(err);
      },
    };

    await chatProvider.chat(chatOptions);
  } catch (err: any) {
    handleReceiveError(err);
  }
}

function retry() {
  const lastUserIndex = messages.findIndex((item) => item.role === "user");

  if (lastUserIndex > 0) {
    const discardedMessages = messages.slice(0, lastUserIndex);
    discardedMessages.map(async (item) => await removeMessage(item.key));
  }

  if (messages.length > 0) {
    doSendMessage(messages[0]);
  }
}

function handleReceiveError(err: any) {
  console.log({ inmessageview: true, err });
  $q.notify({
    message: "message" in err ? err.message : err,
    type: "negative",
  });

  const receivingMessage = messages.find(
    (message) => message.key === loadingMsgKey.value,
  );
  const isAbortError = !!err.name && err.name === "AbortError";

  if (
    !isAbortError ||
    (receivingMessage && !receivingMessage.content.trim().length)
  ) {
    removeMessage(loadingMsgKey.value);
    abortController.value?.abort();
  }
  loadingMsgKey.value = "";
}

function stopReceiveMessage() {
  if (!abortController.value) {
    return;
  }

  abortController.value.abort();
  loadingMsgKey.value = "";
}

async function favorite(message: IMessage) {
  await favoriteMessage(message);
}

function checkApiKeySetted() {
  if (!currentServer.value?.api_key) {
    $q.notify({
      type: "negative",
      message: translate("server.api_key_empty_notice"),
    });
    openServerForm(currentServer.value);
    return false;
  }

  return true;
}
</script>

<style lang="scss">
.message-list-container {
  height: calc(100vh - 24px - 50px - 85px);
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  // padding: 10px 10px 10px 15px;
  padding-top: 10px;
  padding-bottom: 15px;
  overflow-y: scroll;
  scroll-behavior: smooth;

  &:scrollbar {
    right: "2px";
    border-radius: "5px";
    background-color: "rgb(231 208 249/0.4)";
    width: "5px";
    opacity: "0.75";
  }

  .q-message {
    padding: 5px 5px;
    transition: all 0.5s ease-out;

    &:hover {
      background-color: #c3c5c417;
      filter: brightness(105%);
    }
  }
}

.message-scrollarea .q-scrollarea__content {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  // justify-content: flex-end;
  height: 100%;
  max-width: 100%;
  padding: 10px 10px 10px 15px;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.q-message-container {
  > div {
    max-width: 80%;
  }
}

.q-message-text {
  padding-bottom: 1px !important;

  &:last-child {
    min-height: unset !important;
  }
}
</style>
