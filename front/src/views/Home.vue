<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline";
import axiosInstance from "@/utils/axiosInstance";

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
  DoughnutController,
} from "chart.js";

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

const levelChartRef = ref(null);
const fieldChartRef = ref(null);
const statusChartRef = ref(null);

const stats = ref({
  studentsByLevel: [],
  studentsByField: [],
  coursesStatus: [],
});

const loadStats = async () => {
  try {
    const response = await axiosInstance.get("/api/stats");
    stats.value = response.data.data;

    renderLevelChart();
    renderFieldChart();
    renderStatusChart();
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error);
  }
};



// Stats students by domaine
const renderFieldChart = () => {
  if (fieldChartRef.value) {
    new ChartJS(fieldChartRef.value, {
      type: "pie",
      data: {
        labels: stats.value.studentsByField.map((item) => item.field),
        datasets: [
          {
            label: "Étudiants par domaine",
            data: stats.value.studentsByField.map((item) => item.count),
            backgroundColor: [
              "rgba(184, 193, 48, 0.6)",
              "rgba(75, 134, 107, 0.6)",
              "rgba(54, 162, 235, 0.6)",
            ],
            borderColor: [
              "rgba(184, 193, 48, 1)",
              "rgba(75, 134, 107, 1)",
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        cutout: "60%",
      },
    });
  }
};

// Stats students by level
const renderLevelChart = () => {
  if (levelChartRef.value) {
    const colors = [
      "rgba(184, 193, 48, 0.6)",
      "rgba(75, 134, 107, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(164, 173, 48, 0.6)",
    ];

    new ChartJS(levelChartRef.value, {
      type: "bar",
      data: {
        labels: stats.value.studentsByLevel.map((item) => item.level),
        datasets: [
          {
            label: "Étudiants par niveau",
            data: stats.value.studentsByLevel.map((item) => item.count),
            backgroundColor: stats.value.studentsByLevel.map(
              (_, index) => colors[index % colors.length]
            ),
            borderColor: stats.value.studentsByLevel.map((_, index) =>
              colors[index % colors.length].replace("0.6", "1")
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { title: { display: true, text: "Niveaux" } },
          y: { title: { display: true, text: "Nombre d'étudiants" } },
        },
      },
    });
  }
};

const statusMapper = {
  accepted: "Accepté",
  pending: "En attente",
  cancelled: "Annulé",
};

// Stats of courses
const renderStatusChart = () => {
  if (statusChartRef.value) {
    const statusData = stats.value.coursesStatus;

    const translatedLabels = statusData.map(
      (item) => statusMapper[item._id] || item._id
    );

    new ChartJS(statusChartRef.value, {
      type: "doughnut",
      data: {
        labels: translatedLabels,
        datasets: [
          {
            label: "Statut des cours",
            data: statusData.map((item) => item.count),
            backgroundColor: [
              "rgba(184, 193, 48, 0.6)",
              "rgba(75, 134, 107, 0.6)",
              "rgba(255, 206, 86, 0.6)",
            ],
            borderColor: [
              "rgba(184, 193, 48, 1)",
              "rgba(75, 134, 107, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        cutout: "50%",
      },
    });
  }
};

onMounted(loadStats);
</script>

<template>
  <LayoutAuthenticated>
    <div class="home h-screen flex flex-col items-center justify-center">
      <div class="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Bienvenue 👋</h1>
        <p class="text-lg text-gray-600">
          Planifiez et organisez efficacement les emplois du temps de D.Code 📝
        </p>
      </div>

      <div
        class="stats grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl text-center mb-8"
      >
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
        <div class="stat bg-white shadow-md p-6 rounded-lg">
          <h2 class="text-2xl font-bold text-green-700">
            {{ stats.totalSubjects }}
          </h2>
          <p class="text-gray-600">Matières enseignées</p>
        </div>
      </div>

      <div
        class="charts grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl"
      >
        <div
          class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto"
        >
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            Répartition par domaine
          </h2>
          <canvas ref="fieldChartRef" width="250" height="250"></canvas>
        </div>

        <div
          class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto"
        >
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            Étudiants par niveau
          </h2>
          <canvas ref="levelChartRef" width="250" height="250"></canvas>
        </div>

        <div
          class="chart bg-white shadow-md rounded-lg p-4 max-w-[400px] mx-auto"
        >
          <h2 class="text-xl font-bold text-gray-800 mb-4">Statut des cours</h2>
          <canvas ref="statusChartRef" width="250" height="250"></canvas>
        </div>
      </div>

      <div class="actions flex gap-4 mt-8">
        <router-link to="/planification">
          <button
            class="px-6 py-3 font-bold text-green-700 flex items-center gap-2 rounded-lg shadow-md hover:bg-primary/20"
          >
            <CalendarIcon class="h-5 w-5 text-gray-900" />
            Créer un emploi du temps
          </button>
        </router-link>
      </div>
    </div>
  </LayoutAuthenticated>
</template>
