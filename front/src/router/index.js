import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Planification from "../views/Planification.vue";
import Classes from "../views/classes/Classes.vue";
import Dashboard from '../components/Dashboard.vue'; // Importez votre composant Dashboard
import Classes from '../components/Classes.vue';
import Professors from '../components/Professors.vue';
import Students from '../components/Students.vue';
import Rooms from '../components/Rooms.vue';

const routes = [
  { path: '/', redirect: '/login' }, 
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: "/planification", name: "Planification", component: Planification },
  { path: "/classes", name: "Classes", component: Classes },
  { path: '/', component: Dashboard },
  { path: '/classes', component: Classes },
  { path: '/professors', component: Professors },
  { path: '/students', component: Students },
  { path: '/rooms', component: Rooms },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
