<template>
    <div>
      <h1>Liste des Classes</h1>
      <ul>
        <li v-for="classe in classes" :key="classe.id">
          {{ classe.name }} - Professeur: {{ classe.professor }} - Horaire: {{ classe.schedule }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "Classes",
    data() {
      return {
        classes: [] 
      };
    },
    mounted() {
      fetch('http://localhost:3000/api/classes')
        .then(response => response.json())
        .then(data => {
          this.classes = data;
        })
        .catch(error => {
          console.error('Erreur:', error);
        });
    }
  };
  </script>
  
  <style scoped>
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    padding: 10px;
    background-color: #f1f1f1;
    margin-bottom: 10px;
    border-radius: 4px;
  }
  
  li:hover {
    background-color: #ff6347;
    color: white;
  }
  </style>
  