<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Gestion des Préférences de Créneaux" />
        <NewItemButton @click="openModal" text="Ajouter une Préférence" />
      </div>

      <DynamicTable
        :columns="tableColumns"
        :data="preferences"
        :hasActions="role === 'admin'"
        class="table-auto w-full border-collapse text-sm text-gray-600"
      >
      <template #actions="{ row }">
          <button
            v-if="role === 'admin'"
            @click="openEditModal(row)"
            class="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon class="h-5 w-5" />
          </button>
          <button
            v-if="role === 'admin'"
            @click="openDeleteModal(row)"
            class="text-red-600 hover:text-red-800"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
          </template>
      </DynamicTable>

   
      <Modal
        v-model:visible="isModalVisible"
        title="Modifier une préférence de crénéau"
        :fields="modalFieldsDynamic"
        :onSubmit="updatePreference"
        :submitText="'Mettre à jour'"
        :entityData="studentToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer une préférence"
        :message="'Êtes-vous sûr de vouloir supprimer cette préférence de créneau ?'"
        :onConfirm="deletePreference"
      />

      <Pagination
        class="mt-8"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="handlePageChange"
      />
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";

import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

import NewItemButton from "@/components/NewItemButton.vue";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const teacherId = ref("");
const preferences = ref([]);
const role = ref(null);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;
const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const preferenceToDelete = ref(null);


const tableColumns = computed(() => {
  const baseColumns = [
    { key: "startTime", label: "Début" },
    { key: "endTime", label: "Fin" },
  ];

  if (role.value === "admin") {
    baseColumns.push({ key: "teacher", label: "Intervenant" });
  }

  return baseColumns;
});

const modalFieldsDynamic  = [
    {
      name: "startTime",
      label: "Date et Heure de Début",
      type: "date",
      required: true,
    },
    {
      name: "endTime",
      label: "Date et Heure de Fin",
      type: "date",
      required: true,
    },
  ];
  if (role.value === "admin") {
    modalFieldsDynamic.push({
      name: "teacher",
      label: "Intervenant",
      type: "select",
      options: [],
      required: true,
    });
  }


const openModal = () => {
  isModalVisible.value = true;
};


const openDeleteModal = (preferenceItem) => {
  preferenceToDelete.value = preferenceItem;
  isDeleteModalVisible.value = true;
};
 
const fetchPreferences = async () => {
  try {
    const response = await axiosInstance.get("/api/slotPreferences", {
      params: { page: currentPage.value, limit: itemsPerPage },
    });

    preferences.value = response.data.data.map((item) => ({
      teacher: `${item.teacher.firstname} ${item.teacher.lastname}`,
      startTime: "2024-12-19 10:00", 
      endTime: "2024-12-19 12:00",
    }));

    totalPages.value = 1;
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des préférences.",
      type: "error",
    });
    console.error(error);
  }
};

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchPreferences();
};

const updatePreference = async (formData) => {
  try {
    // if (formData._id) {
    //   await axiosInstance.put(`/api/users/${formData._id}`, formData);
    //   const index = students.value.findIndex((u) => u._id === formData._id);
    //   if (index !== -1) {
    //     students.value[index] = { ...formData, roleLabel: "Élève" };
    //   }
    //   showToast({ message: "Élève mis à jour avec succès.", type: "success" });
    // } else {
    //   const response = await axiosInstance.post("/api/users", formData);
    //   students.value.push({ ...response.data.data, roleLabel: "Élève" });
    //   showToast("Nouvel élève ajouté avec succès", "success");
    // }
    isModalVisible.value = false;
  } catch (error) {
    showToast({
      message: "Erreur lors de la sauvegarde de l'élève.",
      type: "error",
    });
    console.error(error);
  }
};

const deletePreference = async () => {
  try {
    // await axiosInstance.delete(`/api/users/${studentToDelete.value._id}`);
    // students.value = students.value.filter(
    //   (u) => u._id !== studentToDelete.value._id
    // );
    // isDeleteModalVisible.value = false;
    showToast({ message: "Élève supprimé avec succès.", type: "success" });
  } catch (error) {
    showToast({
      message: "Erreur lors de la suppression de l'élève.",
      type: "error",
    });
    console.error(error);
  }
};

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    role.value = parsedUser.role;
  }
  await fetchPreferences();
});
</script>
