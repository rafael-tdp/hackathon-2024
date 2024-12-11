<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import Modal from "@/components/Modal.vue"; // Assurez-vous que le chemin est correct
import ConfirmationModal from "@/components/ConfirmationModal.vue"; // Assurez-vous que le chemin est correct

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
]);

// Pour afficher la modal de modification
const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false); // Modal de confirmation de suppression
const classToDelete = ref(null); // Classe à supprimer
const classToEdit = ref(null); 

// Champs du formulaire pour la modification de classe
const classFields = [
  { name: "name", label: "Nom de la classe", type: "text", placeholder: "Nom de la classe", required: true },
  { name: "nbStudents", label: "Nombre d'étudiants", type: "text", placeholder: "Nombre d'étudiants", required: true },
  { name: "year", label: "Année", type: "text", placeholder: "Année", required: true },
  { name: "promo", label: "Promo", type: "text", placeholder: "Promo", required: false },
];

// Ouvrir la modal pour la modification
const openEditModal = (classItem) => {
  classToEdit.value = { ...classItem };  // Pré-remplir le formulaire avec les données de la classe
  isModalVisible.value = true;
};

// Fonction pour soumettre le formulaire de modification
const updateClass = (formData) => {
  console.log("Classe mise à jour:", formData);
  const index = classes.value.findIndex((item) => item._id === formData._id);
  if (index !== -1) {
    classes.value[index] = { ...formData };
  }
  isModalVisible.value = false;
};

// Fonction pour ouvrir la modal de suppression
const openDeleteModal = (classItem) => {
  classToDelete.value = classItem;  // Classe à supprimer
  isDeleteModalVisible.value = true; // Afficher la modal de confirmation
};

// Supprimer une classe
const deleteClass = () => {
  if (classToDelete.value) {
    classes.value = classes.value.filter((c) => c._id !== classToDelete.value._id);
    showToast("Classe supprimée avec succès !");
    isDeleteModalVisible.value = false; // Fermer la modal après suppression
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
    <div class="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-md max-w-5xl mx-auto">
      <table class="min-w-full text-sm">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col class="w-24" />
        </colgroup>
        <thead class="bg-black text-white text-sm font-semibold">
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
          <tr v-for="(classItem, index) in classes" :key="classItem._id" class="border-b hover:bg-gray-50 transition duration-200 ease-in-out">
            <td class="px-6 py-4">{{ classItem.name }}</td>
            <td class="px-6 py-4">{{ classItem.nbStudents }}</td>
            <td class="px-6 py-4">{{ classItem.year }}</td>
            <td class="px-6 py-4 text-right">{{ classItem.promo || "N/A" }}</td>
            <td class="px-6 py-4">
              <ul class="list-disc pl-6">
                <li v-for="subject in classItem.subjects" :key="subject._id">
                  <button @click="viewSubject(subject._id)" class="text-blue-600 hover:text-blue-800">
                    {{ subject.name }}
                  </button>
                </li>
              </ul>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex space-x-4">
                <!-- Icône de suppression -->
                <button @click="openDeleteModal(classItem)" class="text-red-600 hover:text-red-800">
                  <TrashIcon class="h-5 w-5" />
                </button>
                <!-- Icône de modification -->
                <button @click="openEditModal(classItem)" class="text-blue-600 hover:text-blue-800">
                  <PencilIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmation pour la suppression -->
    <ConfirmationModal
      :visible="isDeleteModalVisible"
      title="Suppression de la classe"
      :message="'Êtes-vous sûr de vouloir supprimer cette classe ?'"
      :onConfirm="deleteClass"
      @update:visible="isDeleteModalVisible = $event"
    />

    <!-- Modal pour modifier une classe -->
    <Modal
      v-model:visible="isModalVisible"
      title="Modifier une classe"
      :fields="classFields"
      submitText="Mettre à jour"
      :onSubmit="updateClass"
    />
  </div>
</template>

  