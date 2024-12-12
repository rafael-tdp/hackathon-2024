<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import PageTitle from "../../components/PageTitle.vue";
import axiosInstance from "@/utils/axiosInstance"; // Axios configuré avec une base URL
import { showToast } from "@/utils/toast"; // Notifications Toast

const router = useRouter();

// Liste des élèves
const students = ref([]);

const isModalVisible = ref(false); // Contrôle du modal d'édition
const isDeleteModalVisible = ref(false); // Contrôle du modal de suppression
const studentToEdit = ref(null); // Élève en cours d'édition
const studentToDelete = ref(null); // Élève à supprimer

// Champs du formulaire d'élève
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
    const response = await axiosInstance.get("/api/users");
    students.value = response.data.data
      .filter(user => user.role === 'student') 
      .map((user) => ({
        ...user,
        roleLabel: "Étudiant",
      }));
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des étudiants.",
      type: "error",
    });
    console.error(error);
  }
};

// Ouvrir le modal pour éditer un élève
const openEditModal = (studentItem) => {
  studentToEdit.value = {
    ...studentItem,
  };
  isModalVisible.value = true;
};

// Ouvrir le modal de suppression pour un élève
const openDeleteModal = (studentItem) => {
  studentToDelete.value = studentItem;
  isDeleteModalVisible.value = true;
};

// Mettre à jour ou ajouter un élève
const updateStudent = async (formData) => {
  try {
    if (formData._id) {
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = students.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        students.value[index] = {
          ...formData,
          roleLabel: "Élève", // Assigner le label de rôle
        };
      }
      showToast({
        message: "Élève mis à jour avec succès.",
        type: "success",
      });
    } else {
      // Ajouter un nouvel élève
      const response = await axiosInstance.post("/api/users", formData);
      students.value.push({
        ...response.data.data,
        roleLabel: "Élève", // Assigner le label de rôle
      });
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

// Supprimer un élève
const deleteStudent = async () => {
  try {
    await axiosInstance.delete(`/api/users/${studentToDelete.value._id}`);
    students.value = students.value.filter((u) => u._id !== studentToDelete.value._id);
    isDeleteModalVisible.value = false;
    showToast({
      message: "Élève supprimé avec succès.",
      type: "success",
    });
  } catch (error) {
    showToast({
      message: "Erreur lors de la suppression de l'élève.",
      type: "error",
    });
    console.error(error);
  }
};

// Initialisation des données au montage
onMounted(async () => {
  await fetchStudents();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Étudiants" />
        <NewItemButton
          @click="openEditModal"
          text="Nouvel Élève"
        />
      </div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Rôle' }
        ]"
        :data="students"
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
    </div>
  </LayoutAuthenticated>
</template>
