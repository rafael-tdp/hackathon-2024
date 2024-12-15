<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import PageTitle from "../../components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue"; // Ajout de la pagination
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

const router = useRouter();

const students = ref([]);
const role = ref(null);

const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const studentToEdit = ref(null);
const studentToDelete = ref(null);

// Students columns dashboard
const studentFields = [
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

const fetchStudents = async () => {
  try {
    // On passe les paramètres de page et de limite à l'API
    const response = await axiosInstance.get("/api/users", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    const filteredStudents = response.data.data.filter(
      (user) => user.role === "student"
    );

    students.value = filteredStudents.map((user) => ({
      ...user,
      roleLabel: "Élève",
    }));

    // Calcul du nombre total de pages en fonction du nombre total d'étudiants
    const totalItems = response.data.total; // Assure-toi que ton API renvoie le total des éléments
    totalPages.value = Math.ceil(totalItems / itemsPerPage);
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des étudiants.",
      type: "error",
    });
    console.error(error);
  }
};

// Handle page change
const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchStudents();
};

const openEditModal = (studentItem) => {
  studentToEdit.value = { ...studentItem };
  isModalVisible.value = true;
};

const openDeleteModal = (studentItem) => {
  studentToDelete.value = studentItem;
  isDeleteModalVisible.value = true;
};

const updateStudent = async (formData) => {
  try {
    if (formData._id) {
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = students.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        students.value[index] = { ...formData, roleLabel: "Élève" };
      }
      showToast({ message: "Élève mis à jour avec succès.", type: "success" });
    } else {
      const response = await axiosInstance.post("/api/users", formData);
      students.value.push({ ...response.data.data, roleLabel: "Élève" });
      showToast("Nouvel élève ajouté avec succès", "success");
    }
    isModalVisible.value = false;
  } catch (error) {
    showToast({
      message: "Erreur lors de la sauvegarde de l'élève.",
      type: "error",
    });
    console.error(error);
  }
};

const deleteStudent = async () => {
  try {
    await axiosInstance.delete(`/api/users/${studentToDelete.value._id}`);
    students.value = students.value.filter(
      (u) => u._id !== studentToDelete.value._id
    );
    isDeleteModalVisible.value = false;
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
  await fetchStudents();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-center items-center mb-16">
        <PageTitle text="Étudiants" />
      </div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Rôle' },
        ]"
        :data="students"
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
        title="Modifier un élève"
        :fields="studentFields"
        :onSubmit="updateStudent"
        :submitText="'Mettre à jour'"
        :entityData="studentToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un élève"
        :message="'Êtes-vous sûr de vouloir supprimer cet élève ?'"
        :onConfirm="deleteStudent"
      />

      <!-- Pagination component -->
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="handlePageChange"
      />
    </div>
  </LayoutAuthenticated>
</template>
