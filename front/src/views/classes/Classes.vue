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
const subjects = ref([]);
const classToEdit = ref(null);
const classToDelete = ref(null);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);

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
  {
    name: "subjects",
    label: "Matières",
    type: "select",
    options: subjects.value,
    required: false,
  },
];

const fetchClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses/populated", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    const classesData = response.data.data.map((classes) => {
      const { studyField, level } = parseClassName(classes.schoolClass.name);

      return {
        name: classes.schoolClass.name,
        nbStudents: classes.schoolClass.nbStudents,
        year: classes.schoolClass.year,
        studyField,
        level,
        subjects: classes.subject.name,
        id: classes.schoolClass._id,
      };
    });

    classes.value = classesData;
    totalPages.value = response.data.data.length;
  } catch (error) {
    showToast("Erreur lors du chargement des classes", "error");
    console.error("Erreur fetchClasses:", error);
  }
};


const fetchSubjects = async (subjectsIds) => {
  try {
    if (!Array.isArray(subjectsIds)) {
      throw new Error("subjectsIds doit être un tableau");
    }
    const promises = subjectsIds.map((id) =>
      axiosInstance.get(`/api/subjects/${id}`)
    );
    const responses = await Promise.all(promises);
    return responses.map((response) => response.data.data.name);
  } catch (error) {
    showToast("Erreur lors du chargement des matières", "error");
    console.error(error);
    return [];
  }
};

const openEditModal = async (classItem) => {
  classToEdit.value = { ...classItem };

  if (classItem.graduating) {
    const graduatingInfo = await fetchGraduatingInfo(classItem.graduating);
    classToEdit.value.studyField = graduatingInfo.studyField;
    classToEdit.value.level = graduatingInfo.level;
  }

  const subjectsInfo = await fetchSubjects(classItem.subjects);
  classToEdit.value.subjects = subjectsInfo;

  isModalVisible.value = true;
};


const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchClasses();
};

const parseClassName = (name) => {
  if (!name) return { studyField: "", level: "" };

  const parts = name.split(" ");
  const studyField = parts[0] || "";
  const level = parts[1] || "";

  return { studyField, level };
};

const fetchGraduatingInfo = async (graduatingId) => {
  try {
    const response = await axiosInstance.get(
      `/api/graduatings/${graduatingId}`
    );
    return response.data.data;
  } catch (error) {
    showToast(
      "Erreur lors du chargement des informations de formation",
      "error"
    );
    console.error(error);
  }
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
    const response = formData._id
      ? await axiosInstance.put(`/api/schoolClasses/${formData._id}`, formData)
      : await axiosInstance.post("/api/schoolClasses", formData);

    if (formData._id) {
      const index = classes.value.findIndex((c) => c._id === formData._id);
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
          { key: 'subjects', label: 'Matières' },
        ]"
        :data="classes"
        :hasActions="true"
      >
        <template #subjects="{ row }">
          <ul class="list-disc pl-6">
            <li v-for="subject in row.subjects" :key="subject">
              {{ subject }}
            </li>
          </ul>
        </template>

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
    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="handlePageChange"
    />
  </LayoutAuthenticated>
</template>
