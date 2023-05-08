<template>
  <q-card style="width: 500px">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ isEdit ? "编辑" : "新增" }}聊天</div>
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
          label="称呼"
          placeholder="给TA取个名儿"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          v-model="modelValue.system_prompt"
          outlined
          dense
          autogrow
          label="系统提示词"
          hint="设定系统提示词，用于设定角色，可以更好的获取答案"
        />

        <q-input
          v-model="modelValue.carried_message_count"
          outlined
          dense
          type="number"
          label="携带历史消息条数"
          hint="不宜设置过大，默认值为 10"
        />

        <q-input
          v-model="modelValue.probability_mass"
          outlined
          dense
          type="number"
          label="概率质量"
          :step="0.1"
          :max="1"
          :min="0"
          hint="0~1，值越大结果越随机"
        />

        <q-select
          v-model="modelValue.model"
          :options="models"
          outlined
          dense
          clearable
          emit-value
          label="模型"
          hint="不选则使用服务默认模型"
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
      </q-form>
    </q-card-section>

    <q-card-actions align="right" class="bg-second q-px-xl">
      <q-btn flat label="取消" @click="cancel" />
      <q-btn label="保存" color="primary" @click="save" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useAvatars } from "@/composables/avatars";
import { type IChat } from "@/composables/chats";
import type { IProviderModel } from "@/composables/providers";

const props = defineProps<{
  models: IProviderModel[];
  chat?: IChat | null;
}>();
const emits = defineEmits(["save", "cancel"]);
const modelValue = ref<Partial<IChat>>({});

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
      modelValue.value.system_prompt = "作为私人助理解决所提出的问题";
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
