<template>
    <div>
      <h1>Liste des Professeurs</h1>
      <ul>
        <li v-for="professor in professors" :key="professor._id">
          {{ professor.name }} - Matière : {{ professor.subject }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Professors',
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
  </style>
  