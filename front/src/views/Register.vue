<template>
    <div>
      <h1>Inscription</h1>
      <form @submit.prevent="handleRegister">
        <input v-model="name" type="text" placeholder="Nom" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Mot de passe" required />
        <button type="submit">S'inscrire</button>
      </form>
      <p>
        Déjà un compte ?
        <router-link to="/login">Connectez-vous</router-link>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        name: '',
        email: '',
        password: '',
      };
    },
    methods: {
      handleRegister() {
        console.log(`Nom : ${this.name}, Email : ${this.email}, Password : ${this.password}`);
        // Intégrez votre logique d'inscription ici
      },
    },
  };
  </script>
  