<template>
    <div>
      <!-- Ajout de la Navbar -->
      <Navbar />
      
      <!-- Contenu principal -->
      <h1>Liste des Professeurs</h1>
      <ul>
        <li v-for="professor in professors" :key="professor._id">
          {{ professor.name }} - Matière : {{ professor.subject }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  // Importation du composant Navbar
  import Navbar from '@/components/Navbar.vue';
  
  export default {
    name: 'Professors',
    components: {
      Navbar // Déclaration du composant Navbar ici
    },
    data() {
      return {
        professors: [
          { _id: 1, name: "Prof. Dupont", subject: "Mathématiques" },
          { _id: 2, name: "Prof. Martin", subject: "Histoire" }
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  /* Ajouter des styles si nécessaire pour la page des professeurs */
  </style>
  