<script setup>
import { ref, reactive, onMounted } from "vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

// États réactifs pour les données des classes et le formulaire
const classes = ref([]);
const formState = reactive({
  name: "",
  nbStudents: 0,
  year: new Date().getFullYear(),
  studyFieldId: "",
  subjects: [],
  errors: {},
});
const studyFields = ref([]);
const subjects = ref([]);

// Charger les données lors de l'initialisation du composant
onMounted(async () => {
  await fetchClasses();
  await fetchStudyFields();
  await fetchSubjects();
});

// Récupère les classes depuis l'API
const fetchClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/classes");
    classes.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des classes:", error);
    showToast("Impossible de charger les classes.", "error");
  }
};

// Récupère les domaines d'étude
const fetchStudyFields = async () => {
  try {
    const response = await axiosInstance.get("/api/study-fields");
    studyFields.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des domaines d'étude:", error);
  }
};

// Récupère les matières disponibles
const fetchSubjects = async () => {
  try {
    const response = await axiosInstance.get("/api/subjects");
    subjects.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des matières:", error);
  }
};

// Ajouter une nouvelle classe
const addClass = async () => {
  try {
    await axiosInstance.post("/api/classes", formState);
    showToast("Classe ajoutée avec succès.", "success");
    await fetchClasses(); // Met à jour la liste
  } catch (error) {
    console.error("Erreur lors de l'ajout de la classe:", error);
    formState.errors.message = error.response?.data?.message || "Erreur inconnue";
  }
};

// Supprimer une classe
const deleteClass = async (id) => {
  try {
    await axiosInstance.delete(`/api/classes/${id}`);
    showToast("Classe supprimée avec succès.", "success");
    await fetchClasses(); // Met à jour la liste
  } catch (error) {
    console.error("Erreur lors de la suppression de la classe:", error);
    showToast("Impossible de supprimer la classe.", "error");
  }
};
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
      <div class="w-full max-w-[500px] p-6 rounded-md bg-white shadow-lg">
        <h1 class="text-2xl font-bold mb-4 text-center">Gérer les Classes</h1>
        <form class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium">Nom de la Classe</label>
            <input type="text" class="w-full p-2 border rounded-md" placeholder="Nom de la classe" />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium">Nombre d'étudiants</label>
            <input type="number" class="w-full p-2 border rounded-md" placeholder="Nombre d'étudiants" />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium">Année</label>
            <input type="number" class="w-full p-2 border rounded-md" placeholder="Année" />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium">Champs d'Étude</label>
            <select class="w-full p-2 border rounded-md">
              <option value="">Sélectionnez un champ</option>
            </select>
          </div>


          <div class="flex justify-end bg-black text-text-rgba">
              <button
                type="button"
                class="w-full px-8 py-3 font-semibold rounded-md border-4 border-black bg-black text-white"
              >
                Modifier
              </button>
            </div>

        </form>
      </div>
    </div>
  </template>
  

