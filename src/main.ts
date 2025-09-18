import { createApp } from "vue";
import { createPinia } from "pinia";
// @ts-ignore
import naive from "naive-ui";
import App from "./App.vue";
import "@/style/common.css";

const app = createApp(App);
app.use(createPinia());
app.use(naive);
app.mount("#app");
