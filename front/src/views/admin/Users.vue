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
import NewItemButton from "@/components/NewItemButton.vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const router = useRouter();

const users = ref([]);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const userToEdit = ref(null);
const userToDelete = ref(null);

const userFields = [
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
  {
    name: "role",
    label: "Rôle",
    type: "select",
    options: [
      { value: "admin", label: "Administrateur" },
      { value: "teacher", label: "Intervenant" },
      { value: "student", label: "Élève" },
    ],
    required: true,
  },
];

const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    users.value = response.data.data.map((user) => ({
      ...user,
      role: getRoleLabel(user.role),
    }));
    totalPages.value = response.data.totalPages;
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des utilisateurs.",
      type: "error",
    });
    console.error(error);
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "teacher":
      return "Intervenant";
    case "student":
      return "Élève";
    case "admin":
      return "Administrateur";
    default:
      return "Inconnu";
  }
};

const openEditModal = (userItem) => {
  userToEdit.value = {
    ...userItem,
    classId: userItem.classId || null,
    role: mapRoleToValue(userItem.role),
  };

  isModalVisible.value = true;
};

const openCreateModal = () => {
  userToEdit.value = null;
  isModalVisible.value = true;
};


const mapRoleToValue = (roleLabel) => {
  switch (roleLabel) {
    case "Administrateur":
      return "admin";
    case "Intervenant":
      return "teacher";
    case "Élève":
      return "student";
    default:
      return null;
  }
}

const openDeleteModal = (userItem) => {
  userToDelete.value = userItem;
  isDeleteModalVisible.value = true;
};

const updateUser = async (formData) => {
  try {
    if (formData._id) {
      // existed user
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = users.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        users.value[index] = {
          ...formData,
          role: getRoleLabel(formData.role),
        };
      }

      showToast({
        message: "Utilisateur mis à jour avec succès.",
        type: "success",
      });
    } else {
      // new user
      const response = await axiosInstance.post("/api/notifications/create-user", formData);
      users.value.push({
        ...response.data.data,
        role: getRoleLabel(response.data.data.role),
      });
      showToast({
        message: "Nouvel utilisateur créé avec succès. Un email a été envoyé.",
        type: "success",
      });
    }
    isModalVisible.value = false;
  } catch (error) {
    showToast({
      message: "Erreur lors de la sauvegarde de l'utilisateur.",
      type: "error",
    });
    console.error(error);
  }
};


const deleteUser = async () => {
  try {
    await axiosInstance.delete(`/api/users/${userToDelete.value._id}`);
    users.value = users.value.filter((u) => u._id !== userToDelete.value._id);
    isDeleteModalVisible.value = false;
    showToast({
      message: "Utilisateur supprimé avec succès.",
      type: "success",
    });
  } catch (error) {
    showToast({
      message: "Erreur lors de la suppression de l'utilisateur.",
      type: "error",
    });
    console.error(error);
  }
};

onMounted(async () => {
  await fetchUsers();
});

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchUsers();
};
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6 pb-3">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Utilisateurs" />
        <NewItemButton @click="openCreateModal" text="Nouvel Utilisateur" />
      </div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rôle', formatter: getRoleLabel },
        ]"
        :data="users"
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
        :title="userToEdit ? 'Modifier un utilisateur' : 'Créer un utilisateur'"
        :fields="userFields"
        :onSubmit="updateUser"
        :submitText="userToEdit ? 'Mettre à jour' : 'Créer'"
        :entityData="userToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un utilisateur"
        :message="'Êtes-vous sûr de vouloir supprimer cet utilisateur ?'"
        :onConfirm="deleteUser"
      />
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="handlePageChange"
    />
  </LayoutAuthenticated>
</template>
