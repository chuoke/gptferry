<template>
  <q-input
    v-model="message"
    counter
    dense
    clearable
    standout
    type="textarea"
    :rows="1"
    autogrow
    class="message-input"
    @keydown.enter.exact.prevent
    @keyup.enter.exact="toSend"
    @keydown.tab.exact="toTab($event)"
  >
    <template #prepend>
      <q-icon name="message" />
    </template>
    <template #append>
      <q-icon name="send" class="cursor-pointer" @click="toSend" />
    </template>
    <template #after>
      <q-btn round dense flat icon="info" size="sm">
        <q-menu>
          <q-card style="width: 200px">
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <kbd>Enter</kbd>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-item-label caption>{{
                    $t("message_input.kbd_send")
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator inset />

              <q-item>
                <q-item-section>
                  <q-item-label>
                    <kbd>Shift</kbd> + <kbd>Enter</kbd>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-item-label caption>{{
                    $t("message_input.kbd_newline")
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-menu>
      </q-btn>
    </template>
  </q-input>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);
const emits = defineEmits(["update:modelValue", "send"]);
const message = ref("");

function toSend() {
  if (props.loading) {
    return;
  }

  emits("send", message.value);
  message.value = "";
}

function toTab(event: KeyboardEvent) {
  event.preventDefault();
  const tabSize = 4;

  const target = event.target as HTMLTextAreaElement;
  if (!target) {
    return;
  }

  const value = target.value as string;
  const positionStart = target.selectionStart;
  const positionEnd = target.selectionEnd;

  message.value =
    value.substring(0, positionStart) +
    " ".repeat(tabSize) +
    value.substring(positionStart);

  nextTick(() => {
    target.selectionStart = positionStart + tabSize;
    target.selectionEnd = positionEnd + tabSize;
  });
}
</script>

<style lang="scss">
.message-input {
  & textarea {
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>