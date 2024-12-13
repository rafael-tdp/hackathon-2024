<script setup>
import { ref, onMounted } from "vue"; // Importer Vue
import axios from "axios"; // Pour les appels HTTP
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline"; // Icône

// Crée un état réactif pour stocker les statistiques
const stats = ref({
  coursPlanifies: 0,
  enseignantsActifs: 0,
  etudiantsInscrits: 0,
});

// Fonction pour charger les statistiques depuis l'API
const loadStats = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/stats"); // URL de l'API backend
    stats.value = response.data; // Met à jour l'état réactif avec les données de l'API
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error);
  }
};

// Charge les statistiques après le montage du composant
onMounted(loadStats);
</script>

<template>
  <LayoutAuthenticated>
    <div class="home h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-6">
      <!-- Titre et description -->
      <div class="w-full max-w-4xl mx-auto text-center mb-10">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-4">Bienvenue à D.Code</h1>
        <p class="text-xl text-gray-600">
          Planifiez et organisez efficacement les emplois du temps des étudiants et enseignants.
        </p>
      </div>

      <!-- Section des statistiques -->
      <div class="stats grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800">{{ stats.coursPlanifies }}</h2>
          <p class="text-lg text-gray-600">Cours planifiés</p>
        </div>
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800">{{ stats.enseignantsActifs }}</h2>
          <p class="text-lg text-gray-600">Enseignants actifs</p>
        </div>
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800">{{ stats.etudiantsInscrits }}</h2>
          <p class="text-lg text-gray-600">Étudiants inscrits</p>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="actions flex gap-6 mt-8">
        <button
          class="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-3"
        >
          <CalendarIcon class="h-6 w-6" />
          Créer un emploi du temps
        </button>
        <button
          class="px-8 py-4 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Consulter les cours
        </button>
      </div>
    </div>
  </LayoutAuthenticated>
</template>