<template>
  <q-card style="width: 500px">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ modelValue.key ? "编辑" : "新建" }}服务</div>
      <q-space />
      <q-btn v-close-popup icon="close" flat round dense @click="cancel" />
    </q-card-section>

    <q-card-section style="height: 50vh" class="scroll q-pa-md q-pa-md-lg">
      <q-tab-panels v-model="step" animated>
        <q-tab-panel :name="1">
          <div v-show="step === 1" class="fit row wrap q-gutter-md">
            <div
              v-for="provider of providers"
              :key="provider.key"
              class="column text-center"
            >
              <q-btn
                :outline="provider.key === selectedProvider?.key"
                :color="provider.key === selectedProvider?.key ? 'primary' : ''"
                class="q-px-sm"
                @click="selectProvider(provider)"
              >
                <q-avatar size="48px">
                  <q-img :src="provider.avatar" />
                </q-avatar>
              </q-btn>
              <span>{{ provider.name }}</span>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel :name="2">
          <q-form
            v-show="step === 2"
            ref="serverForm"
            class="q-gutter-md full-width"
            @submit="toSave"
          >
            <q-btn
              v-if="!modelValue.key"
              flat
              size="xs"
              icon="arrow_back"
              round
              title="重新选择"
              @click="toReselectProvider"
            >
            </q-btn>
            <div
              class="column justify-center items-center q-gutter-sm q-mt-none"
            >
              <q-avatar
                v-if="modelValue.avatar"
                ref="selectedProviderRef"
                size="64px"
                rounded
                class="shadow-1"
              >
                <q-img :src="modelValue.avatar" />
                <!-- <q-badge floating rounded>
                  <q-icon name="edit" size="12px" />
                </q-badge> -->
              </q-avatar>
            </div>

            <q-input v-model="modelValue.name" outlined dense label="名称" />

            <q-select
              v-model="modelValue.model"
              :options="selectedProvider?.models || []"
              outlined
              dense
              clearable
              label="模型"
              emit-value
            >
              <template #option="scope">
                <q-item dense v-bind="scope.itemProps" style="max-width: 500px">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption :lines="2">
                      {{ scope.opt.description }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="modelValue.api_key"
              outlined
              dense
              label="API key"
              :type="showApiKey ? 'text' : 'password'"
              lazy-rules
              :rules="[
                (val) =>
                  (val && val.length > 0) || 'Please type a valid API key',
              ]"
            >
              <template #append>
                <q-icon
                  :name="showApiKey ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  size="xs"
                  @click="showApiKey = !showApiKey"
                />
              </template>
            </q-input>

            <!-- <q-input
              v-model="modelValue.max_tokens"
              outlined
              dense
              label="最大token数"
              type="number"
            /> -->

            <q-input
              v-model="modelValue.api_base_url"
              outlined
              dense
              label="接口地址"
              :type="showApiBaseUrl ? 'text' : 'password'"
              :placeholder="selectedProvider?.api_base_url || ''"
              hint="如果你修改它，应该知道为什么"
            >
              <template #append>
                <q-icon
                  :name="showApiBaseUrl ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  size="xs"
                  @click="showApiBaseUrl = !showApiBaseUrl"
                />
              </template>
            </q-input>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>

    <q-card-actions align="right" class="bg-second q-px-xl">
      <q-btn flat label="取消" @click="cancel" />
      <q-btn label="保存" color="primary" @click="toSave" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useProviders, type IProvider } from "@/composables/providers";
import { useServers, type IServer } from "@/composables/servers";
import type { QForm } from "quasar";

const props = defineProps<{ server?: IServer | null }>();
const emits = defineEmits(["cancelled", "saved"]);
const serverForm = ref<QForm>();
const step = ref(1);
const { providers } = useProviders();
const selectedProvider = ref<IProvider>();
const modelValue = ref<Partial<IServer>>({});
const showApiKey = ref(false);
const showApiBaseUrl = ref(false);

watch(
  () => props.server,
  (val) => {
    if (val) {
      step.value = 2;
      modelValue.value = { ...props.server };
      selectedProvider.value = providers.find(
        (item) => item.key === val.provider_key
      );
    } else {
      step.value = 1;
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => modelValue.value.model,
  (val) => {
    if (val) {
      const model = selectedProvider.value?.models.find(
        (item) => item.value === val
      );
      if (
        model &&
        modelValue.value.max_tokens !== undefined &&
        modelValue.value.max_tokens > model.max_token
      ) {
        modelValue.value.max_tokens = model.max_token;
      }
    }
  }
);

function selectProvider(provider: IProvider) {
  if (!selectedProvider.value || provider.key !== selectedProvider.value.key) {
    modelValue.value.provider_key = provider.key;
    modelValue.value.name = provider.name;
    modelValue.value.avatar = provider.avatar;
    modelValue.value.model = undefined;
  }

  selectedProvider.value = provider;
  step.value = 2;
}

function toReselectProvider() {
  step.value = 1;
}

function cancel() {
  emits("cancelled");
}

const saving = ref<boolean>(false);
async function toSave() {
  if (serverForm.value) {
    if ((await serverForm.value.validate()) !== true) {
      return;
    }
  }

  save();
}

async function save() {
  if (!selectedProvider.value) {
    return;
  }

  if (saving.value) {
    return;
  }

  saving.value = true;

  const { save: saveServer } = useServers();

  await saveServer({
    ...modelValue.value,
    provider_key: selectedProvider.value.key,
    name: modelValue.value.name as string,
    avatar: modelValue.value.avatar as string,
  });

  emits("saved");

  saving.value = false;
}
</script>
