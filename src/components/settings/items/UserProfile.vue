<template>
  <q-card flat>
    <q-card-section style="max-height: 70vh" class="scroll q-py-xl q-px-xl">
      <q-form class="q-gutter-md">
        <div class="text-center">
          <q-avatar class="shadow-1" size="64px">
            <q-img v-if="userProfile.avatar" :src="userProfile.avatar"></q-img>
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
          v-model="userProfile.name"
          outlined
          dense
          placeholder="给自个儿取个名儿"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { useAvatars } from "@/composables/avatars";
import { useUserProfile } from "@/composables/user";

const { userProfile } = useUserProfile();

const { avatars } = useAvatars();
function changeAvatar() {
  userProfile.value.avatar = avatars[Math.ceil(Math.random() * avatars.length)];
}
</script>
