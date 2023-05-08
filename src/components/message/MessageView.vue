<template>
  <q-layout
    ref="messagePageRef"
    view="hHh lpR fFr"
    container
    style="height: calc(100vh - 24px)"
    class="bg-first text-first"
  >
    <q-header bordered class="shadow-sm bg-first text-first">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          class="lt-sm"
          @click="openLeftDrawer()"
        />

        <q-toolbar-title class="q-ml-sm">
          # {{ chat?.name || "未命名" }}

          <small class="text-caption">-- {{ chat.system_prompt }}</small>
        </q-toolbar-title>

        <q-btn
          dense
          flat
          icon="clear_all"
          title="清除所有聊天记录"
          @click="toClearMessages"
        ></q-btn>
        <q-btn dense flat round icon="menu" />
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      side="right"
      class="bg-second"
    >
      <q-item-label header>Prompt Tips</q-item-label>
      <prompt-tips></prompt-tips>
    </q-drawer> -->
    <q-page-container>
      <q-page>
        <q-scroll-area
          ref="scrollAreaRef"
          style="height: calc(100vh - 24px - 50px - 65px); width: 100%"
          :thumb-style="{
            right: '2px',
            borderRadius: '5px',
            backgroundColor: 'rgb(231 208 249/0.4)',
            width: '5px',
            opacity: '0.75',
          }"
          class="message-scrollarea"
        >
          <div
            ref="messageContainerRef"
            class="q-pa-sm q-pa-lg-lg row justify-center"
          >
            <div style="width: 100%">
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
                    <img :src="chat.avatar" />
                  </q-avatar>
                  <q-avatar
                    v-else
                    class="q-message-avatar q-message-avatar--sent"
                  >
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

                  <q-btn
                    size="xs"
                    icon="more_vert"
                    flat
                    round
                    class="q-pa-none absolute-bottom-right"
                    style="opacity: 0.7"
                  >
                    <q-menu>
                      <q-list dense style="min-width: 150px" class="q-pa-sm">
                        <q-item
                          v-close-popup
                          clickable
                          class="rounded q-px-xs"
                          @click="toCopyContent(message.content)"
                        >
                          <q-item-section>复制</q-item-section>
                          <q-item-section side>
                            <q-icon name="content_copy" size="xs"></q-icon>
                          </q-item-section>
                        </q-item>
                        <q-item
                          v-close-popup
                          clickable
                          class="rounded q-px-xs"
                          @click="toDeleteMessage(message)"
                        >
                          <q-item-section>删除</q-item-section>
                          <q-item-section side>
                            <q-icon name="delete_forever" size="xs"></q-icon>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-chat-message>
            </div>
          </div>
        </q-scroll-area>
      </q-page>
    </q-page-container>

    <q-footer class="px-2 bg-transparent">
      <q-input
        v-model="inputMessage"
        counter
        dense
        clearable
        standout
        type="textarea"
        :rows="1"
        autogrow
        @keydown.enter.exact.prevent
        @keyup.enter.exact="toSendMessage"
        @keydown.shift.enter.exact.prevent
        @keyup.shift.enter.exact="newline"
      >
        <template #prepend>
          <q-icon name="message" />
        </template>
        <template #append>
          <q-icon name="send" class="cursor-pointer" @click="toSendMessage" />
        </template>
      </q-input>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import type { IChat } from "@/composables/chats";
import { useMessages, type IMessage } from "@/composables/messages";
import { useServers, type IServer } from "@/composables/servers";
import { useQuasar, copyToClipboard, QScrollArea, throttle } from "quasar";
// import PromptTips from "@/components/prompt/prompt-tips.vue";
import { useAI } from "@/ai";
import { nanoid } from "nanoid";
import MarkdownMessage from "@/components/message/MarkdownMessage.vue";
import { useServerFormDialog } from "@/composables/server-form-dialog";
import {
  useElementVisibility,
  type MaybeComputedElementRef,
} from "@vueuse/core";
import { useUserProfile } from "@/composables/user";
import { useLeftDrawer } from "@/composables/left-drawer";

const props = defineProps<{
  chat: IChat;
}>();

const $q = useQuasar();
const { open: openLeftDrawer } = useLeftDrawer();

// const rightDrawerOpen = ref(true);
const inputMessage = ref("");
const scrollAreaRef = ref<QScrollArea | null>(null);
const messageContainerRef = ref<Element | null>(null);

const {
  messages,
  clear: clearMessages,
  remove: removeMessage,
} = useMessages(props.chat);
const { open: openServerForm } = useServerFormDialog();
const { servers } = useServers();
const currentServer = computed(() => {
  return servers.value.find(
    (server: IServer) => server.key === props.chat.server_key
  );
});

const { userProfile } = useUserProfile();

onMounted(() => {
  scrollToBottom(true);
});

const messagePageRef = ref<Element | null>(null);
const messagePageIsVisible = useElementVisibility(
  messagePageRef as MaybeComputedElementRef
);
const isScolled = ref(false);

watch(
  () => messagePageIsVisible.value,
  (val) => {
    if (val && !isScolled.value) {
      scrollToBottom(true);
      isScolled.value = true;
    }
  },
  {
    immediate: true,
  }
);

const messageContainerHeight = ref(0);
const scrollToBottom = throttle(function (force?: boolean) {
  nextTick(() => {
    if (messageContainerRef.value) {
      const containerHeight = messageContainerRef.value?.clientHeight;

      if (force || messageContainerHeight.value !== containerHeight) {
        messageContainerHeight.value = containerHeight;
        scrollAreaRef.value?.setScrollPosition(
          "vertical",
          containerHeight,
          force ? 0 : 350
        );
      }
    }
  });
}, 600);

function toClearMessages() {
  $q.dialog({
    title: "确认操作",
    message: "确认要清空聊天记录吗？清除后不可恢复。",
    cancel: true,
  }).onOk(() => {
    clearMessages();
  });
}

function toDeleteMessage(message: IMessage) {
  $q.dialog({
    title: "确认操作",
    message: "确认要删除该条记录吗?",
    cancel: true,
  }).onOk(() => {
    removeMessage(message.key);
  });
}

function toCopyContent(content: string) {
  copyToClipboard(content)
    .then(() => {
      $q.notify({ message: "内容已复制", type: "success" });
    })
    .catch(() => {
      $q.notify({ message: "内容复制失败", type: "nagetive" });
    });
}

const loadingMsgKey = ref<string>("");
const chatProvider = useAI(currentServer.value?.provider_key as string);

async function toSendMessage() {
  if (!currentServer.value?.api_key) {
    $q.notify({ type: "negative", message: "请填写一个 API Key" });
    openServerForm(currentServer.value);
    return;
  }

  if (loadingMsgKey.value || !inputMessage.value) {
    return;
  }

  loadingMsgKey.value = "...";

  const chatOptions = {
    message: inputMessage.value,
    model: currentServer.value.model,
    api_base_url:
      currentServer.value.api_base_url ||
      currentServer.value.provider?.api_base_url ||
      "",
    api_key: currentServer.value.api_key,
    carries: messages.value.slice(-(props.chat.carried_message_count || 10)),
    system_prompt: props.chat.system_prompt,
    probability_mass: props.chat.probability_mass,
    onUpdate: (content: string, options: { done: boolean }) => {
      messages.value[messages.value.length - 1].content += content;
      const { done } = options;
      if (done) {
        loadingMsgKey.value = "";
      }
      scrollToBottom();
    },
  };

  messages.value.push({
    key: nanoid(),
    role: "user",
    content: inputMessage.value,
    chat_key: props.chat.key,
    server_key: props.chat.server_key,
    created_at: Date.now() / 1000,
    model: currentServer.value.model,
  });

  scrollToBottom();

  messages.value.push({
    key: nanoid(),
    role: "assistant",
    content: "",
    chat_key: props.chat.key,
    server_key: props.chat.server_key,
    created_at: Date.now() / 1000,
    model: currentServer.value.model,
  });

  loadingMsgKey.value = messages.value[messages.value.length - 1].key;

  inputMessage.value = "";

  try {
    await chatProvider.chat(chatOptions);
  } catch (err: any) {
    $q.notify({
      message: "message" in err ? err.message : err,
      type: "negative",
    });
    messages.value[messages.value.length - 1].content += " ";
  } finally {
    loadingMsgKey.value = "";
  }
}

function newline() {
  if (inputMessage.value) {
    inputMessage.value += "\n";
  }
}
</script>

<style lang="scss">
.message-scrollarea .q-scrollarea__content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  max-width: 100%;
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
