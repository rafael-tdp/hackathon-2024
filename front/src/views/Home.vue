<script setup>
import { ref, onMounted } from "vue"; // Références réactives et cycle de vie de Vue
import axios from "axios"; // Pour récupérer les données depuis l'API
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue"; // Mise en page principale
import { CalendarIcon } from "@heroicons/vue/24/outline"; // Icône utilisée dans les boutons

// Import de Chart.js avec les composants nécessaires
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  PieController,
  LineController,
  BarController,
  DoughnutController
} from "chart.js";

// Enregistrement des composants pour les graphiques
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  PieController,
  LineController,
  BarController,
  DoughnutController
);

// Références pour les graphiques
const levelChartRef = ref(null); // Référence pour le graphique des étudiants par niveau
const fieldChartRef = ref(null); // Référence pour le graphique des étudiants par domaine
const statusChartRef = ref(null); // Référence pour le graphique Doughnut des statuts

// Stockage des statistiques
const stats = ref({
  studentsByLevel: [], // Étudiants par niveau
  studentsByField: [], // Étudiants par domaine
  coursesStatus: [],  // Statuts des cours
});

// Fonction pour charger les statistiques depuis l'API
const loadStats = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/stats");
    stats.value = response.data.data;  // Assurez-vous d'accéder à 'data' dans la réponse

    // Une fois les données chargées, on dessine les graphiques
    renderLevelChart();
    renderFieldChart();
    renderStatusChart();  // Ajouter l'appel pour le Doughnut
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error);
  }
};

// Fonction pour dessiner le graphique des étudiants par niveau (barres)
const renderLevelChart = () => {
  if (levelChartRef.value) {
    const colors = [
      "rgba(75, 192, 192, 0.6)",   // Teal
      "rgba(255, 99, 132, 0.6)",   // Rouge
      "rgba(54, 162, 235, 0.6)",   // Bleu
      "rgba(255, 206, 86, 0.6)",   // Jaune
      "rgba(153, 102, 255, 0.6)",  // Violet
      "rgba(255, 159, 64, 0.6)",   // Orange
      "rgba(255, 99, 71, 0.6)",    // Tomato
      "rgba(0, 255, 255, 0.6)",    // Cyan
      "rgba(255, 165, 0, 0.6)",    // Orange foncé
    ];

    new ChartJS(levelChartRef.value, {
      type: "bar", // Type du graphique changé en "bar"
      data: {
        labels: stats.value.studentsByLevel.map((item) => item.level), // Niveaux
        datasets: [
          {
            label: "Étudiants par niveau", // Légende
            data: stats.value.studentsByLevel.map((item) => item.count), // Nombre d'étudiants
            backgroundColor: stats.value.studentsByLevel.map((_, index) => colors[index % colors.length]), // Cycle à travers le tableau de couleurs
            borderColor: stats.value.studentsByLevel.map((_, index) => colors[index % colors.length].replace('0.6', '1')), // Bordures de couleur plus foncée
            borderWidth: 1, // Largeur des bordures
          },
        ],
      },
      options: {
        responsive: true, // Adaptation aux écrans
        plugins: {
          legend: { position: "top" }, // Position de la légende
        },
        scales: {
          x: { title: { display: true, text: "Niveaux" } }, // Légende de l'axe X
          y: { title: { display: true, text: "Nombre d'étudiants" } }, // Légende de l'axe Y
        },
      },
    });
  }
};

// Fonction pour dessiner le graphique des étudiants par domaine (camembert)
const renderFieldChart = () => {
  if (fieldChartRef.value) {
    new ChartJS(fieldChartRef.value, {
      type: "pie",  // Type de graphique : camembert
      data: {
        labels: stats.value.studentsByField.map((item) => item.field), // Domaines d'études
        datasets: [
          {
            label: "Étudiants par domaine", // Légende du graphique
            data: stats.value.studentsByField.map((item) => item.count), // Nombre d'étudiants par domaine
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ], // Couleurs du camembert
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ], // Bordures des segments
            borderWidth: 1,  // Épaisseur des bordures
          },
        ],
      },
      options: {
        responsive: true,  // Adaptation aux écrans
        plugins: {
          legend: { position: "top" },  // Position de la légende
        },
        cutout: "60%",  // Réduit la taille du camembert pour un effet doughnut
      },
    });
  }
};

// Fonction pour dessiner le graphique des statuts des cours (Doughnut)
const renderStatusChart = () => {
  if (statusChartRef.value) {
    const statusData = stats.value.coursesStatus;  // Récupère les données de statut des cours

    new ChartJS(statusChartRef.value, {
      type: "doughnut",  // Type de graphique : Doughnut
      data: {
        labels: statusData.map((item) => item._id), // Statuts des cours
        datasets: [
          {
            label: "Statut des cours",  // Légende
            data: statusData.map((item) => item.count), // Nombre de cours par statut
            backgroundColor: [
              "rgba(94, 214, 255, 0.6)",  // Bleu clair pastel
              "rgba(255, 99, 132, 0.6)",  // Rose pastel
              "rgba(255, 211, 85, 0.6)",  // Jaune pastel
              "rgba(136, 230, 160, 0.6)", // Vert menthe
              "rgba(255, 182, 193, 0.6)", // Pêche
            ], // Couleurs pour les statuts
            borderColor: [
              "rgba(94, 214, 255, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 211, 85, 1)",
              "rgba(136, 230, 160, 1)",
              "rgba(255, 182, 193, 1)",
            ], // Bordures des segments
            borderWidth: 1,  // Largeur des bordures
          },
        ],
      },
      options: {
        responsive: true,  // Adaptation aux écrans
        plugins: {
          legend: { position: "top" },  // Position de la légende
        },
        cutout: "50%",  // Taille du trou central pour l'effet Doughnut
      },
    });
  }
};

// Charger les statistiques à l'initialisation
onMounted(loadStats);
</script>

<template>
	<LayoutAuthenticated>
	  <div class="home h-screen flex flex-col items-center justify-center">
		<!-- Titre principal -->
		<div class="w-full max-w-4xl mx-auto text-center mb-8">
		  <h1 class="text-4xl font-bold text-gray-800 mb-4">Bienvenue 👋</h1>
		  <p class="text-lg text-gray-600">
			Planifiez et organisez efficacement les emplois du temps de D.Code 📝
		  </p>
		</div>
  
		<!-- Statistiques principales -->
		<div class="stats grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl text-center mb-8">
		  <div class="stat bg-white shadow-md p-6 rounded-lg">
			<h2 class="text-2xl font-bold text-green-700">250</h2>
			<p class="text-gray-600">Cours planifiés</p>
		  </div>
		  <div class="stat bg-white shadow-md p-6 rounded-lg">
			<h2 class="text-2xl font-bold text-green-700">30</h2>
			<p class="text-gray-600">Enseignants actifs</p>
		  </div>
		  <div class="stat bg-white shadow-md p-6 rounded-lg">
			<h2 class="text-2xl font-bold text-green-700">500</h2>
			<p class="text-gray-600">Étudiants inscrits</p>
		  </div>
		  <!-- Ajout de la statistique Total Subjects -->
		  <div class="stat bg-white shadow-md p-6 rounded-lg">
			<h2 class="text-2xl font-bold text-green-700">{{ stats.totalSubjects }}</h2>
			<p class="text-gray-600">Total Subjects</p>
		  </div>
		</div>
  
		<!-- Graphiques côte à côte -->
		<div class="charts grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
		  
		  <!-- Graphique : Étudiants par domaine -->
		  <div class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto">
			<h2 class="text-xl font-bold text-gray-800 mb-4">Répartition par domaine</h2>
			<canvas ref="fieldChartRef" width="250" height="250"></canvas>
		  </div>
  
		  <!-- Graphique : Étudiants par niveau -->
		  <div class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto">
			<h2 class="text-xl font-bold text-gray-800 mb-4">Étudiants par niveau</h2>
			<canvas ref="levelChartRef" width="250" height="250"></canvas>
		  </div>
  
		  <!-- Graphique : Statut des cours (Doughnut) -->
		  <div class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto">
			<h2 class="text-xl font-bold text-gray-800 mb-4">Statut des cours</h2>
			<canvas ref="statusChartRef" width="250" height="250"></canvas>
		  </div>
		  
		</div>
  
		<!-- Boutons d'action -->
		<div class="actions flex gap-4 mt-8">
        <router-link to="/planification">
          <button class="px-6 py-3 font-bold text-green-700 flex items-center gap-2 rounded-lg shadow-md hover:bg-primary/20">
            <CalendarIcon class="h-5 w-5 text-gray-900" />
            Créer un emploi du temps 
          </button>
        </router-link>
      </div>
	  </div>
	</LayoutAuthenticated>
  </template>