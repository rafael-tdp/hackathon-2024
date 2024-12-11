<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const classes = ref([
  {
    _id: "1",
    name: "Classe A",
    nbStudents: 30,
    year: 2023,
    promo: "Promo 1",
    subjects: [
      { _id: "1", name: "Mathematics" },
      { _id: "2", name: "Physics" },
      { _id: "3", name: "Chemistry" },
    ],
  },
  {
    _id: "2",
    name: "Classe B",
    nbStudents: 25,
    year: 2024,
    promo: "Promo 2",
    subjects: [
      { _id: "4", name: "Biology" },
      { _id: "5", name: "Literature" },
      { _id: "6", name: "History" },
    ],
  },
  {
    _id: "3",
    name: "Classe C",
    nbStudents: 28,
    year: 2023,
    promo: "Promo 3",
    subjects: [
      { _id: "7", name: "Geography" },
      { _id: "8", name: "Computer Science" },
    ],
  },
  {
    _id: "4",
    name: "Classe C",
    nbStudents: 28,
    year: 2023,
    promo: "Promo 3",
    subjects: [
      { _id: "7", name: "Geography" },
      { _id: "8", name: "Computer Science" },
    ],
  },
  {
    _id: "5",
    name: "Classe C",
    nbStudents: 28,
    year: 2023,
    promo: "Promo 3",
    subjects: [
      { _id: "7", name: "Geography" },
      { _id: "8", name: "Computer Science" },
    ],
  },
  {
    _id: "6",
    name: "Classe C",
    nbStudents: 28,
    year: 2023,
    promo: "Promo 3",
    subjects: [
      { _id: "7", name: "Geography" },
      { _id: "8", name: "Computer Science" },
    ],
  },
]);

const loading = ref(false);

// Fonction pour supprimer une classe
const deleteClass = async (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
  try {
    // Simuler la suppression (ici il faudrait l'appel à l'API)
    classes.value = classes.value.filter((c) => c._id !== id);
    showToast("Classe supprimée avec succès !");
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
    showToast("Impossible de supprimer la classe.");
  }
};

// Fonction pour rediriger vers la page de la matière
const viewSubject = (subjectId) => {
  router.push(`/subjects/${subjectId}`);
};
</script>

<template>
  <div class="min-h-screen py-12 px-6">
    <!-- Titre centré -->
    <div class="flex justify-center mb-8">
      <h2 class="text-4xl font-bold text-gray-800">Classes</h2>
    </div>

    <!-- Conteneur du tableau avec bordures modernes et ombres -->
    <div
      class="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-md max-w-5xl mx-auto"
    >
      <table class="min-w-full text-sm">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col class="w-24" />
        </colgroup>
        <thead class="bg-bleu200 text-gray-700 text-sm font-semibold">
          <tr>
            <th class="px-6 py-4 text-left">Nom de la classe</th>
            <th class="px-6 py-4 text-left">Nombre d'étudiants</th>
            <th class="px-6 py-4 text-left">Année</th>
            <th class="px-6 py-4 text-left">Promo</th>
            <th class="px-6 py-4 text-left">Matières</th>
            <th class="px-6 py-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- Affichage dynamique des classes -->
          <tr
            v-for="(classItem, index) in classes"
            :key="classItem._id"
            class="border-b hover:bg-gray-50 transition duration-200 ease-in-out"
          >
            <td class="px-6 py-4">{{ classItem.name }}</td>
            <td class="px-6 py-4">{{ classItem.nbStudents }}</td>
            <td class="px-6 py-4">{{ classItem.year }}</td>
            <td class="px-6 py-4 text-right">{{ classItem.promo || "N/A" }}</td>
            <td class="px-6 py-4">
              <!-- Affichage des matières cliquables -->
              <ul class="list-disc pl-6">
                <li v-for="subject in classItem.subjects" :key="subject._id">
                  <button
                    @click="viewSubject(subject._id)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {{ subject.name }}
                  </button>
                </li>
              </ul>
            </td>
            <td class="px-6 py-4 text-right">
              <!-- Icônes pour Modifier et Supprimer avec espacement -->
              <div class="flex space-x-4">
                <!-- Icône de suppression rouge -->
                <button
                  @click="deleteClass(classItem._id)"
                  class="text-red200 hover:text-red200"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
                <!-- Icône de modification verte -->
                <button class="text-black hover:text-black">
                  <PencilIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
