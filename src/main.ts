import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/index.postcss";
import { usePinia } from "./plugins/pinia";
import { useQuasar } from "./plugins/quasar";
import { useHead } from "./plugins/head";
import { useI18n } from "./plugins/i18n";
import "./css/app.scss";

import langs from "@/langs";

const app = createApp(App);

usePinia(app);
useHead(app);
useQuasar(app);
useI18n(app, langs);

app.use(router);
app.mount("#app");
