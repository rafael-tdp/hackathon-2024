import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import vSelect from "vue-select";

import "./style.css";

/* Init Pinia */
const pinia = createPinia();

/* Create Vue app */
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");
app.component("VSelect", vSelect);

library.add(faEdit, faTrashAlt);
app.component("FontAwesomeIcon", FontAwesomeIcon);

// const styleStore = useStyleStore(pinia);

/* App style */
// styleStore.setStyle("basic");

/* Default title tag */
const defaultDocumentTitle = "Admin One Vue 3 Tailwind";

/* Set document title from route meta */
router.afterEach((to) => {
    document.title = to.meta?.title
        ? `${to.meta.title} — ${defaultDocumentTitle}`
        : defaultDocumentTitle;
});
