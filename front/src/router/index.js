import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Planification from "../views/Planification.vue";
import Classes from "../views/classes/Classes.vue";
import Courses from "../views/courses/Courses.vue";
import Users from "../views/admin/Users.vue";

import Home from "../views/Home.vue";

const routes = [
	{ path: "/", name: "Home", component: Home },
	{ path: "/login", name: "Login", component: Login },
	{ path: "/register", name: "Register", component: Register },
	{ path: "/planification", name: "Planification", component: Planification },
	{ path: "/classes", name: "Classes", component: Classes },
	{ path: "/courses", name: "Courses", component: Courses },
  { path: "/users", name: "Users", component: Users },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
