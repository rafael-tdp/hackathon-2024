<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
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

const router = useRouter();

const teachers = ref([]);
const teacherToEdit = ref(null);
const teacherToDelete = ref(null);
const role = ref(null);

const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);

const teacherFields = [
  {
    name: "firstname",
    label: "Prénom",
    type: "text",
    placeholder: "Prénom",
    required: true,
  },
  {
    name: "lastname",
    label: "Nom",
    type: "text",
    placeholder: "Nom",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Email",
    required: true,
  },
];

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchTeachers();
};

const fetchTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/users", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    const filteredTeachers = response.data.data.filter(
      (user) => user.role === "teacher"
    );

    teachers.value = filteredTeachers.map((user) => ({
      ...user,
      roleLabel: "Intervenant",
    }));

    const totalItems = filteredTeachers.length;
    totalPages.value = Math.ceil(totalItems / itemsPerPage);
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des enseignants.",
      type: "error",
    });
    console.error(error);
  }
};

const openEditModal = (teacherItem) => {
  teacherToEdit.value = {
    ...teacherItem,
  };
  isModalVisible.value = true;
};

const openDeleteModal = (teacherItem) => {
  teacherToDelete.value = teacherItem;
  isDeleteModalVisible.value = true;
};

const updateTeacher = async (formData) => {
  try {
    if (formData._id) {
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = teachers.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        teachers.value[index] = {
          ...formData,
          roleLabel: "Intervenant",
        };
      }
      showToast({
        message: "Intervenant mis à jour avec succès.",
        type: "success",
      });
    } else {
      const response = await axiosInstance.post("/api/users", formData);
      teachers.value.push({
        ...response.data.data,
        roleLabel: "Intervenant",
      });
      showToast("Nouvel intervenant ajouté avec succès", "success");
    }
    isModalVisible.value = false;
  } catch (error) {
    showToast({
      message: "Erreur lors de la sauvegarde de l'enseignant.",
      type: "error",
    });
    console.error(error);
  }
};

const deleteTeacher = async () => {
  try {
    await axiosInstance.delete(`/api/users/${teacherToDelete.value._id}`);
    teachers.value = teachers.value.filter(
      (u) => u._id !== teacherToDelete.value._id
    );
    isDeleteModalVisible.value = false;
    showToast({
      message: "Intervenant supprimé avec succès.",
      type: "success",
    });
  } catch (error) {
    showToast({
      message: "Erreur lors de la suppression de l'intervenant.",
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
  await fetchTeachers();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6 pb-3">
      <div class="flex justify-center items-center mb-16">
        <PageTitle text="Intervenants" />
      </div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Rôle' },
        ]"
        :data="teachers"
        :hasActions="role === 'admin'"
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
        title="Modifier un intervenant"
        :fields="teacherFields"
        :onSubmit="updateTeacher"
        :submitText="'Mettre à jour'"
        :entityData="teacherToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un intervenant"
        :message="'Êtes-vous sûr de vouloir supprimer cet intervenant ?'"
        :onConfirm="deleteTeacher"
      />
    </div>
    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="handlePageChange"
    />
  </LayoutAuthenticated>
</template>
