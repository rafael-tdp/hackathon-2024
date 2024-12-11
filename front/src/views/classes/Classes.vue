<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";

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

// Champs pour le formulaire du modal d'édition
const classFields = [
  { name: "name", label: "Nom de la classe", type: "text", placeholder: "Nom de la classe", required: true },
  { name: "nbStudents", label: "Nombre d'étudiants", type: "text", placeholder: "Nombre d'étudiants", required: true },
  { name: "year", label: "Année", type: "text", placeholder: "Année", required: true },
  { name: "promo", label: "Promo", type: "text", placeholder: "Promo", required: false },
];

const isModalVisible = ref(false); // Contrôle de la visibilité du modal d'édition
const isDeleteModalVisible = ref(false); // Contrôle de la visibilité du modal de suppression
const classToEdit = ref(null); // Classe actuellement en cours d'édition
const classToDelete = ref(null); // Classe à supprimer

const openEditModal = (classItem) => {
  classToEdit.value = { ...classItem }; // Pré-remplir les données du formulaire
  isModalVisible.value = true;
};

const openDeleteModal = (classItem) => {
  classToDelete.value = classItem; // Enregistrer la classe à supprimer
  isDeleteModalVisible.value = true;
};

const updateClass = (formData) => {
  const index = classes.value.findIndex((c) => c._id === formData._id);
  if (index !== -1) {
    classes.value[index] = { ...formData }; // Mettre à jour les données
  }
  isModalVisible.value = false; // Fermer le modal après mise à jour
};

const deleteClass = () => {
  if (classToDelete.value) {
    classes.value = classes.value.filter((c) => c._id !== classToDelete.value._id); // Supprimer la classe
    isDeleteModalVisible.value = false; // Fermer le modal de confirmation
  }
};
</script>

<template>
  <div class="min-h-screen py-12 px-6">
    <div class="flex justify-center mb-8">
      <h2 class="text-4xl font-bold text-gray-800">Classes</h2>
    </div>

    <!-- Tableau dynamique -->
    <DynamicTable :columns="[
        { key: 'name', label: 'Nom de la classe' },
        { key: 'nbStudents', label: 'Nombre d\'étudiants' },
        { key: 'year', label: 'Année' },
        { key: 'promo', label: 'Promo' },
        { key: 'subjects', label: 'Matières', slotName: 'subjects' }
      ]"
      :data="classes"
      :hasActions="true"
    >
      <!-- Slot pour les matières -->
      <template #subjects="{ data, row }">
        <ul class="list-disc pl-6">
          <li v-for="subject in row.subjects" :key="subject._id">
            <button @click="router.push(`/subjects/${subject._id}`)" class="text-blue-600 hover:text-blue-800">
              {{ subject.name }}
            </button>
          </li>
        </ul>
      </template>

      <!-- Slot pour les actions -->
      <template #actions="{ row }">
        <button @click="openEditModal(row)" class="text-blue-600 hover:text-blue-800">
          <PencilIcon class="h-5 w-5" />
        </button>
        <button @click="openDeleteModal(row)" class="text-red-600 hover:text-red-800">
          <TrashIcon class="h-5 w-5" />
        </button>
      </template>
    </DynamicTable>

    <!-- Modal d'édition -->
    <Modal
      v-model:visible="isModalVisible"
      title="Modifier une classe"
      :fields="classFields"
      :onSubmit="updateClass"
      :submitText="'Mettre à jour'"
    />

    <!-- Modal de confirmation de suppression -->
    <ConfirmationModal
      v-model:visible="isDeleteModalVisible"
      title="Supprimer une classe"
      :message="'Êtes-vous sûr de vouloir supprimer cette classe ?'"
      :onConfirm="deleteClass"
    />
  </div>
</template>
