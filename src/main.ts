import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/index.postcss";
import { usePinia } from "./plugins/pinia";
import { useQuasar } from "./plugins/quasar";
import { useHead } from "./plugins/head";
import "./css/app.scss";

const app = createApp(App);

usePinia(app);
useHead(app);
useQuasar(app);

app.use(router);
app.mount("#app");
