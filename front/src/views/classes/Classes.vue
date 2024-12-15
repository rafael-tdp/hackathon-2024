<script setup>
import { ref, onMounted } from "vue";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";

import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";

import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import PageTitle from "../../components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const classes = ref([]);
const classToEdit = ref(null);
const classToDelete = ref(null);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const isEditing = ref(false); 

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

const fetchClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/schoolclasses", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    classes.value = response.data.data.map((classItem) => {
      const { graduating } = classItem;

      return {
        name: classItem.name,
        nbStudents: classItem.nbStudents,
        year: classItem.year,
        studyField: graduating?.studyField || "",
        level: graduating?.level || "",
        id: classItem._id,
      };
    });

    totalPages.value = Math.ceil(classes.value.length / itemsPerPage);
  } catch (error) {
    showToast("Erreur lors du chargement des classes", "error");
    console.error("Erreur fetchClasses:", error);
  }
};

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchClasses();
};

const openCreateModal = () => {
  classToEdit.value = null;
  isModalVisible.value = true;
};

const openEditModal = async (classItem) => {
  classToEdit.value = { ...classItem };

  isModalVisible.value = true;
};

const deleteClass = async () => {
  try {
    await axiosInstance.delete(`/api/schoolClasses/${classToDelete.value._id}`);
    classes.value = classes.value.filter(
      (c) => c._id !== classToDelete.value._id
    );
    showToast("Classe supprimée avec succès", "success");
    isDeleteModalVisible.value = false;
  } catch (error) {
    showToast("Erreur lors de la suppression de la classe", "error");
    console.error(error);
  }
};

const openDeleteModal = (classId) => {
  classToDelete.value = classId;
  isDeleteModalVisible.value = true;
};


const updateClass = async (formData) => {
  try {
    let response;
    if (formData.id) {
      // Classe existante
      response = await axiosInstance.put(`/api/schoolClasses/${formData.id}`, formData);
      const index = classes.value.findIndex((c) => c._id === formData.id);
      if (index !== -1) {
        classes.value[index] = response.data.data;
      }

      showToast({
        message: "Classe mise à jour avec succès.",
        type: "success",
      });
    } else {
      // Nouvelle classe
      response = await axiosInstance.post("/api/schoolClasses", formData);
      classes.value.push(response.data.data);

      showToast({
        message: "Nouvelle classe ajoutée avec succès.",
        type: "success",
      });
    }

    await fetchClasses();

    isModalVisible.value = false;
  } catch (error) {
    showToast({
      message: "Erreur lors de la mise à jour de la classe.",
      type: "error",
    });
    console.error(error);
  }
};


onMounted(async () => {
  await fetchClasses();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Classes" />
        <NewItemButton @click="openCreateModal" text="Nouvelle classe" />
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
        :title="classToEdit ? 'Modifier une classe' : 'Nouvelle classe'"
        :fields="classFields"
        :onSubmit="updateClass"
        :submitText="classToEdit ? 'Mettre à jour' : 'Créer'"
        :entityData="classToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer une classe"
        :message="'Êtes-vous sûr de vouloir supprimer cette classe ?'"
        :onConfirm="deleteClass"
      />
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="handlePageChange"
    />
  </LayoutAuthenticated>
</template>
