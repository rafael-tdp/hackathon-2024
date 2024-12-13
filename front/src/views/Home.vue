<script setup>
import { ref, onMounted } from "vue"; // Importer Vue
import axios from "axios"; // Pour les appels HTTP
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline"; // Icône
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, PieController } from "chart.js"; // Importation de Chart.js

// Enregistrement des composants nécessaires de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, PieController); // Ajout de PieController

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

// Données fictives pour le graphique en camembert
const pieData = {
  labels: ["1ère année", "2ème année", "3ème année", "4ème année", "5ème année"],
  datasets: [
    {
      label: "Répartition des étudiants",
      data: [120, 200, 150, 180, 220], // Données fictives
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

// Référence du canvas pour initialiser Chart.js
const chartCanvas = ref(null);

// Crée et affiche le graphique en camembert après le montage
onMounted(() => {
  if (chartCanvas.value) {
    new ChartJS(chartCanvas.value, {
      type: "pie", // Type de graphique : Camembert
      data: pieData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw} étudiants`;
              },
            },
          },
        },
      },
    });
  }
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="home h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-6">
      <!-- Titre et description -->
      <div class="w-full max-w-4xl mx-auto text-center mb-10">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-4 text-center">Bienvenue à D.Code</h1> <!-- Centré -->
        <p class="text-xl text-gray-600 text-center">
          Planifiez et organisez efficacement les emplois du temps des étudiants et enseignants.
        </p>
      </div>

      <!-- Section des statistiques -->
      <div class="stats grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800 text-center">{{ stats.coursPlanifies }}</h2> <!-- Centré -->
          <p class="text-lg text-gray-600 text-center">Cours planifiés</p> <!-- Centré -->
        </div>
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800 text-center">{{ stats.enseignantsActifs }}</h2> <!-- Centré -->
          <p class="text-lg text-gray-600 text-center">Enseignants actifs</p> <!-- Centré -->
        </div>
        <div class="stat bg-white shadow-lg rounded-lg p-8 transition-transform transform hover:scale-105">
          <h2 class="text-4xl font-bold text-gray-800 text-center">{{ stats.etudiantsInscrits }}</h2> <!-- Centré -->
          <p class="text-lg text-gray-600 text-center">Étudiants inscrits</p> <!-- Centré -->
        </div>
      </div>

      <!-- Graphique en Camembert avec des données fictives -->
      <div class="pie-chart bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl mb-10">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Répartition des étudiants par année</h2> <!-- Centré -->
        <!-- Canvas pour Chart.js avec une taille réduite -->
        <canvas ref="chartCanvas" class="w-64 h-64 mx-auto"></canvas> <!-- Taille réduite à 250px x 250px -->
      </div>

      <!-- Boutons d'action -->
      <div class="actions flex gap-6 mt-8 justify-center">
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
