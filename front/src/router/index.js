import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Planification from "../views/Planification.vue";
import Classes from "../views/classes/Classes.vue";
import Courses from "../views/courses/Courses.vue";
import Users from "../views/admin/Users.vue";
import Profile from "../views/Profile.vue";
import Teachers from "../views/admin/Teachers.vue";
import Students from "../views/students/Students.vue";
import Unavailability from "../views/teachers/Unavailability.vue";
import AlertNotifications from "../views/teachers/AlertNotifications.vue";

import Home from "../views/Home.vue";


const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/planification", name: "Planification", component: Planification },
  { path: "/classes", name: "Classes", component: Classes },
  { path: "/courses", name: "Courses", component: Courses },
  { path: "/users", name: "Users", component: Users },
  { path: "/profile", name: "Profil", component: Profile },
  { path: "/intervenants", name: "Teachers", component: Teachers },
  { path: "/etudiants", name: "Students", component: Students },
  {
    path: "/unavailabilities",
    name: "Indisponibilités",
    component: Unavailability,
  },
  { path: "/alertes", name: "Alertes", component: AlertNotifications },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user && !["Login", "Register"].includes(to.name)) {
    next("/login");
  } else {
    next();
  }
});
export default router;
