<script setup lang="ts">
import { useHead } from "@vueuse/head";
import ServerList from "@/components/server/ServerList.vue";
import ChatView from "@/components/chat/ChatView.vue";
import { useThemeMode } from "@/composables/theme-mode";
import { useServers, type IServer } from "@/composables/servers";
import ServerForm from "@/components/server/ServerForm.vue";
import ChatForm from "@/components/chat/ChatForm.vue";
import { useServerFormDialog } from "@/composables/server-form-dialog";
import { useSettingDialog } from "@/composables/setting-dialog";
import SettingView from "@/components/settings/SettingView.vue";
import { useLeftDrawer } from "@/composables/left-drawer";
import { useChatFormDialog } from "@/composables/chat-form-dialog";

// useRoute, useHead, and HelloWorld are automatically imported. See vite.config.ts for details.
const route = useRoute();

useHead({
  title: route.meta.title,
  meta: [
    {
      property: "og:title",
      content: route.meta.title,
    },
    {
      name: "twitter:title",
      content: route.meta.title,
    },
  ],
});

const { serverMenuDrawerOpen } = useLeftDrawer();

const { themeMode, icon: themeModeIcon } = useThemeMode();
const { servers, activeServerKey, remove: removeServer } = useServers();
const {
  serverFormDialogOpen,
  close: closeServerForm,
  open: openServerForm,
  serverModel,
} = useServerFormDialog();
const { chatFormDialogOpen } = useChatFormDialog();

function toAddServer() {
  openServerForm();
}
function serverAdded() {
  closeServerForm();
}
function serverAddCancelled() {
  closeServerForm();
}

function handleServerDeleted(server: IServer) {
  removeServer(server);
}

const { settingDialogOpen, open: openSettingDialog } = useSettingDialog();
</script>

<template>
  <q-layout
    view="hHh lpR fFf"
    container
    style="height: 100vh"
    class="main-page q-mx-auto"
  >
    <q-header>
      <q-bar class="bg-tertiary text-tertiary" dense>
        <!-- <q-icon name="laptop_chromebook" /> -->
        <q-avatar size="xs">
          <q-img src="/logo.png"></q-img>
        </q-avatar>
        <div class="font-bold">GPT Ferry</div>

        <q-space />

        <q-toggle
          v-model="themeMode"
          :icon="themeModeIcon"
          toggle-indeterminate
          indeterminate-value="auto"
          true-value="dark"
          false-value="light"
          size="xs"
          class="q-mr-sm"
        />

        <q-btn
          dense
          flat
          icon="settings"
          class="q-mr-sm"
          @click="openSettingDialog('')"
        />

        <q-btn
          dense
          flat
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'crop_square'"
          :title="
            $q.fullscreen.isActive
              ? $t('common.exit_fullscreen')
              : $t('common.fullscreen')
          "
          @click="$q.fullscreen.toggle()"
        />
      </q-bar>
    </q-header>

    <q-drawer
      v-model="serverMenuDrawerOpen"
      show-if-above
      side="left"
      mini
      :mini-width="80"
      :width="80"
      :breakpoint="600"
      no-swipe-backdrop
      class="hide-scrollbar bg-tertiary"
    >
      <server-list v-model="activeServerKey" :servers="servers">
        <template #tail>
          <q-separator spaced inset></q-separator>

          <div class="text-center">
            <q-btn
              icon="add"
              color="white"
              text-color="primary"
              round
              unelevated
              size="16px"
              class="mb-2"
              @click.stop.prevent="toAddServer"
            >
              <q-tooltip
                anchor="center right"
                self="center start"
                :offset="[10, 10]"
              >
                {{ $t("server.new") }}
              </q-tooltip>
            </q-btn>
          </div>
        </template>
      </server-list>
      <q-dialog v-model="serverFormDialogOpen">
        <server-form
          :server="serverModel"
          @cancelled="serverAddCancelled"
          @saved="serverAdded"
        ></server-form>
      </q-dialog>

      <q-dialog v-model="settingDialogOpen">
        <q-card
          style="height: 800px; max-height: 70vh; width: 800px; max-width: 90vh"
        >
          <setting-view></setting-view>
        </q-card>
      </q-dialog>
    </q-drawer>

    <q-page-container class="overflow-hidden">
      <q-page class="">
        <q-tab-panels
          v-model="activeServerKey"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="chat-views"
        >
          <q-tab-panel
            v-for="server of servers"
            :key="server.key"
            :name="server.key"
          >
            <chat-view
              :server="server"
              @deleted="handleServerDeleted"
            ></chat-view>
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
    <q-dialog v-model="chatFormDialogOpen">
      <chat-form></chat-form>
    </q-dialog>
  </q-layout>
</template>

<style lang="scss">
::-webkit-scrollbar {
  width: 0.375rem;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(231 208 249/0.4) !important;
  border-radius: 0.25rem !important;
}

.main-page {
  overflow: hidden !important;

  > .absolute-full {
    overflow: hidden !important;
    right: 0px !important;

    > .scroll {
      overflow: hidden !important;
      right: 0px !important;
      width: 100% !important;
    }
  }
}

.chat-views {
  .q-tab-panel {
    padding: 0;
  }
}
</style>
