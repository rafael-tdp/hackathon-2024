<script setup>
import { ref, onMounted } from "vue";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import PageTitle from "../../components/PageTitle.vue";
import axiosInstance from "@/utils/axiosInstance"; // Axios configuré avec une base URL
import { showToast } from "@/utils/toast"; // Notifications Toast

const classes = ref([]);
const classToEdit = ref(null);
const classToDelete = ref(null); // Stocker la classe sélectionnée pour suppression

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false); // État de la modal de suppression

const classFields = [
  {
    name: "name",
    label: "Nom de la classe",
    type: "text",
    placeholder: "Nom de la classe",
    required: true,
  },
  {
    name: "nbStudents",
    label: "Nombre d'étudiants",
    type: "text",
    placeholder: "Nombre d'étudiants",
    required: true,
  },
  {
    name: "year",
    label: "Année",
    type: "text",
    placeholder: "Année",
    required: true,
  },
  {
    name: "studyField",
    label: "Formation",
    type: "text",
    placeholder: "Formation",
    required: false,
  },
  {
    name: "level",
    label: "Niveau",
    type: "text",
    placeholder: "Niveau",
    required: false,
  },
];

// Fonction utilitaire pour extraire `studyField` et `level` depuis `name`
const parseClassName = (name) => {
  if (!name) return { studyField: "", level: "" };

  const parts = name.split(" ");
  const studyField = parts[0] || ""; // Première partie pour `studyField`
  const level = parts[1] || ""; // Deuxième partie pour `level`

  return { studyField, level };
};

// Récupérer les classes
const fetchClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses/populated");

    const classesData = response.data.data.map((classes) => {
      const { studyField, level } = parseClassName(classes.schoolClass.name);

      return {
        name: classes.schoolClass.name,
        nbStudents: classes.schoolClass.nbStudents,
        year: classes.schoolClass.year,
        studyField, // Extraire depuis le nom de la classe
        level, // Extraire depuis le nom de la classe
        id: classes.schoolClass._id,
      };
    });

    classes.value = classesData;
  } catch (error) {
    showToast("Erreur lors du chargement des classes", "error");
    console.error(error);
  }
};

// Ouvrir la modal pour modifier une classe
const openEditModal = (classItem) => {
  classToEdit.value = { ...classItem };
  isModalVisible.value = true;
};

// Ouvrir la modal de suppression
const openDeleteModal = (classItem) => {
  classToDelete.value = classItem; // Stocker la classe sélectionnée
  isDeleteModalVisible.value = true; // Afficher la modal de suppression
};

// Supprimer une classe
const deleteClass = async () => {
  try {
    await axiosInstance.delete(`/api/schoolClasses/${classToDelete.value.id}`);
    classes.value = classes.value.filter(
      (c) => c.id !== classToDelete.value.id
    );
    showToast("Classe supprimée avec succès", "success");
    isDeleteModalVisible.value = false; // Fermer la modal de suppression
  } catch (error) {
    showToast("Erreur lors de la suppression de la classe", "error");
    console.error(error);
  }
};

// Ajouter ou mettre à jour une classe
const updateClass = async (formData) => {
  try {
    const response = formData.id
      ? await axiosInstance.put(`/api/schoolClasses/${formData.id}`, formData)
      : await axiosInstance.post("/api/schoolClasses", formData);

    if (formData.id) {
      const index = classes.value.findIndex((c) => c.id === formData.id);
      if (index !== -1) {
        classes.value[index] = response.data.data;
      }
      showToast("Classe mise à jour avec succès", "success");
    } else {
      classes.value.push(response.data.data);
      showToast("Nouvelle classe ajoutée avec succès", "success");
    }
    isModalVisible.value = false;
  } catch (error) {
    showToast("Erreur lors de la mise à jour de la classe", "error");
    console.error(error);
  }
};

// Charger les classes au montage du composant
onMounted(async () => {
  await fetchClasses();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Classes" />
        <NewItemButton @click="openEditModal" text="Nouvelle classe" />
      </div>

      <DynamicTable
        :columns="[
          { key: 'name', label: 'Nom de la classe' },
          { key: 'nbStudents', label: 'Nombre d\'étudiants' },
          { key: 'year', label: 'Année' },
          { key: 'studyField', label: 'Formation' },
          { key: 'level', label: 'Niveau' },
        ]"
        :data="classes"
        :hasActions="true"
      >
        <template #actions="{ row }">
          <button
            @click="openEditModal(row)"
            class="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon class="h-5 w-5" />
          </button>
          <button
            @click="openDeleteModal(row)"
            class="text-red-600 hover:text-red-800"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </template>
      </DynamicTable>

      <Modal
        v-model:visible="isModalVisible"
        title="Modifier une classe"
        :fields="classFields"
        :onSubmit="updateClass"
        :submitText="'Mettre à jour'"
        :entityData="classToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer une classe"
        :message="'Êtes-vous sûr de vouloir supprimer cette classe ?'"
        :onConfirm="deleteClass"
      />
    </div>
  </LayoutAuthenticated>
</template>
