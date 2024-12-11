<template>
  <div id="app">
    <header>
      <nav>
        <ul class="nav-list">
          <li class="nav-item"><router-link to="/" class="nav-link">Dashboard</router-link></li>
          <li class="nav-item"><router-link to="/classes" class="nav-link">Classes</router-link></li>
          <li class="nav-item"><router-link to="/professors" class="nav-link">Professeurs</router-link></li>
          <li class="nav-item"><router-link to="/students" class="nav-link">Étudiants</router-link></li>
          <li class="nav-item"><router-link to="/rooms" class="nav-link">Salles de classe</router-link></li>
        </ul>
      </nav>
    </header>

    <main>
      <!-- Afficher le composant Dashboard ici -->
      <router-view />
    </main>
  </div>
</template>

<script>
import Login from "./views/Login.vue";
import { RouterView } from "vue-router";

export default {
  components: {
      Login,
  }
};
</script>

<style scoped>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Montserrat", sans-serif;
  background: #ffffff;
}

#page-wrap {
  margin: auto;
  max-width: 800px;
}
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Mise en page générale */
#app {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Styles du header et du menu de navigation */
header {
  background-color: #333;
  padding: 1rem;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
}

.nav-list {
  list-style-type: none;
  display: flex;
  justify-content: space-around;
}

.nav-item {
  padding: 0.5rem 1rem;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #00bcd4;
}

/* Style pour le contenu principal */
main {
  flex-grow: 1;
  padding: 2rem;
  background-color: #fff;
}

/* Adaptation mobile */
@media (max-width: 768px) {
  .nav-list {
    flex-direction: column;
    align-items: center;
  }

  .nav-item {
    margin-bottom: 1rem;
  }
}

@media screen and (max-width: 800px) {
  html {
      font-size: 14px;
  }
  .body img {
      width: 90%;
  }
}

button {
  background-color: black;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  outline: 0;
  padding: 16px;
}
</style>