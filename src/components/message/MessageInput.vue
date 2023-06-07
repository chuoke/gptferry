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
                  <q-item-label caption>{{ $t('message_input.kbd_send') }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-separator inset/>

              <q-item>
                <q-item-section>
                  <q-item-label>
                    <kbd>Shift</kbd> + <kbd>Enter</kbd>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
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

function toSend() {
  emits("send", message.value);
  message.value = "";
}
</script>
