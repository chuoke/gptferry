<template>
  <q-layout
    view="hHh lpR fFr"
    container
    style="height: calc(100vh - 24px)"
    class="bg-first text-first"
  >
    <q-header bordered class="shadow-sm bg-first text-first">
      <q-toolbar>
        <q-btn dense flat round icon="menu" />

        <q-toolbar-title> </q-toolbar-title>
      </q-toolbar>
    </q-header>

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
          <div ref="messageContainerRef" class="q-pa-md row justify-center">
            <div style="width: 100%; max-width: 100%">
              <div class="column items-center" style="opacity: 0.6">
                <!-- :ratio="16 / 9" -->
                <q-img
                  :src="bg"
                  style="width: 500px; max-width: 80%;"
                  class="q-mb-lg"
                ></q-img>
                <p class="text-subtitle1">
                  创建服务和聊天，开始从AI获取灵感和帮助
                </p>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
const bgs = [
  "/img/illustrations/empty-message-page-bg.png",
  "/img/illustrations/empty-message-page-bg-2.png",
];

const bg = computed(() => {
  return bgs[Math.ceil(Math.random() * bgs.length) - 1];
});
</script>

<style lang="scss">
.message-scrollarea .q-scrollarea__content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.q-message-container > div {
  max-width: 80%;
}

.q-message-text {
  padding-bottom: 1px !important;

  &:last-child {
    min-height: unset !important;
  }
}
</style>
