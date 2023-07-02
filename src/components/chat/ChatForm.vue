<template>
  <q-card style="width: 500px">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">
        {{ isEdit ? $t("chat.edit") : $t("chat.new") }}
      </div>
      <q-space />
      <q-btn v-close-popup icon="close" flat round dense @click="cancel" />
    </q-card-section>

    <!-- <q-separator /> -->

    <q-card-section
      v-if="modelValue"
      style="max-height: 70vh"
      class="scroll q-py-xl q-px-xl"
    >
      <q-form class="q-gutter-md">
        <div class="text-center">
          <q-avatar class="shadow-1" size="64px">
            <q-img v-if="modelValue.avatar" :src="modelValue.avatar"></q-img>
          </q-avatar>
          <q-btn
            size="xs"
            icon="refresh"
            flat
            round
            @click="changeAvatar"
          ></q-btn>
        </div>

        <q-input
          v-model="modelValue.name"
          outlined
          dense
          :label="$t('chat.name')"
          :placeholder="$t('chat.name_hint')"
        />

        <q-input
          v-model="modelValue.system_prompt"
          outlined
          dense
          autogrow
          :label="$t('chat.system_prompt')"
          :hint="$t('chat.system_prompt_hint')"
        />

        <q-input
          v-model="modelValue.carried_message_count"
          outlined
          dense
          type="number"
          :label="$t('chat.carried_message_count')"
          :hint="$t('chat.carried_message_count_hint')"
        />

        <q-select
          v-model="modelValue.model"
          :options="models"
          outlined
          dense
          clearable
          emit-value
          :label="$t('chat.model')"
          :hint="$t('chat.model_hint')"
        >
          <template #option="scope">
            <q-item v-bind="scope.itemProps" style="max-width: 500px">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          v-model="modelValue.max_tokens"
          outlined
          dense
          type="number"
          :step="1"
          :min="0"
          :label="$t('chat.max_tokens')"
          :hint="$t('chat.max_tokens_hint')"
        />

        <q-input
          v-model="modelValue.probability_mass"
          outlined
          dense
          type="number"
          :step="0.1"
          :max="1"
          :min="0"
          :label="$t('chat.probability_mass')"
          :hint="$t('chat.probability_mass_hint')"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right" class="bg-second q-px-xl">
      <q-btn :label="$t('common.cancel')" flat @click="cancel" />
      <q-btn :label="$t('common.save')" color="primary" @click="save" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useAvatars } from "@/composables/avatars";
import { type IChat } from "@/composables/chats";
import type { IProviderModel } from "@/composables/providers";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  models: IProviderModel[];
  chat?: IChat | null;
}>();
const emits = defineEmits(["save", "cancel"]);
const modelValue = ref<Partial<IChat>>({});

const { t: translate } = useI18n();

watch(
  () => props.chat,
  (val) => {
    if (val) {
      modelValue.value = { ...props.chat };
    } else {
      modelValue.value = {};
    }

    if (
      !modelValue.value.system_prompt &&
      (!("key" in modelValue.value) || !modelValue.value.key)
    ) {
      modelValue.value.system_prompt = translate("chat.system_prompt_default");
    }
  },
  {
    immediate: true,
  }
);

const isEdit = computed(
  () => modelValue.value && "key" in modelValue.value && modelValue.value.key
);

const { avatars } = useAvatars();
function changeAvatar() {
  modelValue.value.avatar = avatars[Math.ceil(Math.random() * avatars.length)];
}
function save() {
  emits("save", modelValue.value);
}

function cancel() {
  emits("cancel");
}
</script>
