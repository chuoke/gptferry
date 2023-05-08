import { createRouter, createWebHistory } from "vue-router";

import home from "@/pages/home.vue";

const routes = [
  {
    path: "/",
    component: home,
    meta: {
      title: "GPT Ferry",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
