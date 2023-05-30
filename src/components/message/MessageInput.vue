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
    @keydown.enter.exact.prevent
    @keyup.enter.exact="toSend"
    @keydown.shift.enter.exact.prevent
    @keyup.shift.enter.exact="newline"
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
            <q-list dense bordered>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <kbd>Enter</kbd>
                  </q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-item-label caption>{{ $t('message_input.kbd_send') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                  </q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-item-label caption>{{ $t('message_input.kbd_newline') }}</q-item-label>
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
const emits = defineEmits(["update:modelValue", "send"]);
const message = ref("");

function newline() {
  if (message.value) {
    // message.value += "\n";
    message.value += String.fromCharCode(13, 10);
  }
}

function toSend() {
  emits("send", message.value);
  message.value = "";
}
</script>
