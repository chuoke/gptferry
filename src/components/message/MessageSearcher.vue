<template>
  <q-layout view="lHh lpr lFf" container class="shadow-2 rounded-borders">
    <q-header class="bg-second">
      <q-toolbar>
        <q-input
          v-model="filter.keywords"
          clearable
          dense
          outlined
          class="full-width"
          @keydown.enter="searchNow"
        >
          <template #append>
            <q-icon v-if="!filter.keywords" name="search" />
          </template>
        </q-input>
      </q-toolbar>

      <q-toolbar>
        <q-btn-toggle
          v-model="filter.favorited"
          clearable
          size="sm"
          unelevated
          :options="[{ label: $t('message.favorited'), value: true }]"
        />

        <q-space></q-space>

        <q-btn-toggle
          v-model="filter.sort"
          clearable
          size="sm"
          unelevated
          :options="[
            { label: $t('message.sort_latest'), value: 'latest' },
            { label: $t('message.sort_oldest'), value: 'oldest' },
          ]"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding>
        <q-infinite-scroll
          ref="scrollRef"
          :debounce="500"
          :offset="250"
          @load="loadMore"
        >
          <TransitionGroup>
            <q-chat-message
              v-for="message of results"
              :key="message.key"
              :text="[message.content]"
              :stamp="new Date(message.created_at * 1000).toLocaleString()"
              :sent="message.role === 'user'"
              size="12"
            >
              <template #stamp>
                <div class="flex">
                  <span>
                    {{ new Date(message.created_at * 1000).toLocaleString() }}
                  </span>
                  <q-space></q-space>
                  <q-btn
                    round
                    icon="content_copy"
                    size="xs"
                    @click="copyToClipboard(message.content)"
                  />
                  <q-btn
                    round
                    :icon="message.favorited ? 'favorite' : 'favorite_border'"
                    :text-color="message.favorited ? 'red-7' : ''"
                    size="xs"
                    @click="favorite(message)"
                  />
                  <q-btn
                    round
                    icon="delete_forever"
                    size="xs"
                    @click="toDeleteMessage(message)"
                  />
                </div>
              </template>
            </q-chat-message>
          </TransitionGroup>

          <template #loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import type { IChat } from "@/composables/chats";
import { useDB } from "@/composables/db";
import { useMessages, type IMessage } from "@/composables/messages";
import { isBoolean } from "lodash-es";
import { debounce, useQuasar, copyToClipboard, QInfiniteScroll } from "quasar";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  chat: IChat;
}>();

const $q = useQuasar();
const { t: translate } = useI18n();

const scrollRef = ref<QInfiniteScroll>();
const hasMore = ref(false);
const filter = ref({
  keywords: "",
  sort: "latest",
  favorited: null,
});
watch(
  () => filter.value,
  () => {
    hasMore.value = true;
    results.splice(0, results.length);
    triggerSearch();
  },
  {
    deep: true,
  }
);

const triggerSearch = debounce(() => {
  searchNow();
}, 2000);

const { remove: removeMessage, favorite: favoriteMessage } = useMessages(
  props.chat
);

let results = reactive<IMessage[]>([]);
const searching = ref(false);

const searchNow = () => {
  scrollRef.value?.reset();
  scrollRef.value?.resume();
  scrollRef.value?.trigger();
};

const search = async (params?: any) => {
  params = params || { ...filter.value };
  console.log({ params });

  try {
    if (searching.value || !hasMore.value) {
      return;
    }

    if (
      params.favorited !== true &&
      (!params.keywords || 0 >= params.keywords.trim().length)
    ) {
      hasMore.value = false;
      return;
    }

    searching.value = true;
    triggerSearch.cancel();

    const { db } = useDB();

    let query = db.messages
      .orderBy("created_at")
      .and((item) => item.chat_key === props.chat.key);

    if (!params.sort || params.sort === "latest") {
      query = query.reverse();
    } else if (params.sort === "oldest") {
      // query default direction is asc
    }

    if (isBoolean(params.favorited)) {
      query = query.and((item) => item.favorited === params.favorited);
    }

    const searchText = (params.keywords || "").trim();
    if (searchText.length > 0) {
      query = query.filter((item) => item.content.includes(searchText));
    }

    const data = await query.offset(results.length).limit(10).toArray();
    results.push(...data);

    hasMore.value = data.length >= 10;

    console.log({ results });
  } catch (err: any) {
    $q.notify({ message: err.message || err, type: "nagetive" });
  } finally {
    searching.value = false;
  }
};

async function loadMore(index: number, done: (stop?: boolean) => void) {
  console.log({ index });
  if (hasMore.value) {
    await search();
  }

  done(!hasMore.value);
}

function toDeleteMessage(message: IMessage) {
  $q.dialog({
    title: translate("common.confirm_action"),
    message: translate("message.delete_confirm"),
    cancel: true,
  }).onOk(() => {
    removeMessage(message.key);
    removeFromResults(message);
  });
}

function removeFromResults(message: IMessage) {
  const index = results.findIndex((item) => item.key === message.key);
  if (index >= 0) {
    results.splice(index, 1);
  }
}

async function favorite(message: IMessage) {
  message = await favoriteMessage(message);

  if (filter.value.favorited && !message.favorited) {
    removeFromResults(message);
  }
}
</script>
