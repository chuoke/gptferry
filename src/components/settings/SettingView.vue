<template>
  <q-layout
    view="lHh lpR lFf"
    container
    style="height: 800px; max-height: 100%"
    class="setting-page"
  >
    <q-header style="background: transparent" class="text-second">
      <q-toolbar>
        <q-toolbar-title> </q-toolbar-title>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      :breakpoint="0"
      :width="150"
      class="bg-second"
    >
      <q-toolbar>
        <q-toolbar-title> </q-toolbar-title>
      </q-toolbar>

      <q-list class="q-pa-sm">
        <setting-item
          :label="$t('setting.profile')"
          :active="activeSettingTab === 'profile'"
          @click="changeTab('profile')"
        ></setting-item>
        <setting-item
          :label="$t('setting.general')"
          :active="activeSettingTab === 'general'"
          @click="changeTab('general')"
        ></setting-item>
        <setting-item
          :label="$t('setting.about')"
          :active="activeSettingTab === 'about'"
          @click="changeTab('about')"
        ></setting-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page>
        <q-tab-panels
          v-model="activeSettingTab"
          animated
          style="min-height: inherit"
        >
          <q-tab-panel name="profile">
            <UserProfile />
          </q-tab-panel>

          <q-tab-panel name="general" style="min-height: 100%">
            <GeneralSetting />
          </q-tab-panel>

          <q-tab-panel name="about" style="min-height: 100%">
            <AboutSite />
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import SettingItem from "@/components/settings/SettingItem.vue";
import AboutSite from "@/components/settings/items/AboutSite.vue";
import UserProfile from "@/components/settings/items/UserProfile.vue";
import GeneralSetting from "@/components/settings/items/GeneralSetting.vue";
import { useSettingDialog } from "@/composables/setting-dialog";

const leftDrawerOpen = ref(true);

const { activeSettingTab } = useSettingDialog();

function changeTab(key: string) {
  activeSettingTab.value = key;
}
</script>

<style lang="scss">
.setting-page {
  .q-panel .scroll {
    min-height: 100%;
  }
}
</style>
