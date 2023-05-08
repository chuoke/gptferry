<template>
  <q-list>
    <template v-for="(prompt, index) of prompts" :key="index">
      <q-item>
        <q-item-section>
          <q-item-label>{{ prompt.act }}</q-item-label>
          <q-item-label caption lines="3">
            {{ prompt.prompt }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced inset />
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { usePrompts } from "@/composables/prompts";

const { prompts } = usePrompts();
</script>
