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

// Liste des enseignants
const teachers = ref([]);

const isModalVisible = ref(false); // Contrôle du modal d'édition
const isDeleteModalVisible = ref(false); // Contrôle du modal de suppression
const teacherToEdit = ref(null); // Enseignant en cours d'édition
const teacherToDelete = ref(null); // Enseignant à supprimer

// Champs du formulaire d'utilisateur
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

// Fonction pour récupérer les enseignants depuis l'API
const fetchTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/users");
    teachers.value = response.data.data
      .filter(user => user.role === 'teacher') // Filtrer pour n'avoir que les enseignants
      .map((user) => ({
        ...user,
        roleLabel: "Intervenant", // Label pour le rôle
      }));
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des enseignants.",
      type: "error",
    });
    console.error(error);
  }
};

// Ouvrir le modal pour éditer un enseignant
const openEditModal = (teacherItem) => {
  teacherToEdit.value = {
    ...teacherItem,
  };
  isModalVisible.value = true;
};

// Ouvrir le modal de suppression pour un enseignant
const openDeleteModal = (teacherItem) => {
  teacherToDelete.value = teacherItem;
  isDeleteModalVisible.value = true;
};

// Mettre à jour ou ajouter un enseignant
const updateTeacher = async (formData) => {
  try {
    if (formData._id) {
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = teachers.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        teachers.value[index] = {
          ...formData,
          roleLabel: "Intervenant", // Assigner le label de rôle
        };
      }
      showToast({
        message: "Enseignant mis à jour avec succès.",
        type: "success",
      });
    } else {
      // Ajouter un nouvel enseignant
      const response = await axiosInstance.post("/api/users", formData);
      teachers.value.push({
        ...response.data.data,
        roleLabel: "Intervenant", // Assigner le label de rôle
      });
      showToast("Nouvel enseignant ajouté avec succès", "success");
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

// Supprimer un enseignant
const deleteTeacher = async () => {
  try {
    await axiosInstance.delete(`/api/users/${teacherToDelete.value._id}`);
    teachers.value = teachers.value.filter((u) => u._id !== teacherToDelete.value._id);
    isDeleteModalVisible.value = false;
    showToast({
      message: "Enseignant supprimé avec succès.",
      type: "success",
    });
  } catch (error) {
    showToast({
      message: "Erreur lors de la suppression de l'enseignant.",
      type: "error",
    });
    console.error(error);
  }
};

// Initialisation des données au montage
onMounted(async () => {
  await fetchTeachers();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Intervenants" />
        <NewItemButton
          @click="openEditModal"
          text="Nouvel Intervenant"
        />
      </div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Rôle' }
        ]"
        :data="teachers"
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
  </LayoutAuthenticated>
</template>
