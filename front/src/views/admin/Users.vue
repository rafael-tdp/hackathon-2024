<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";

const router = useRouter();

// Données simulées pour les utilisateurs
const users = ref([
  {
    _id: "1",
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    role: "TEACHER",
    classId: "1",
    className: "Classe A",
  },
  {
    _id: "2",
    firstname: "Jane",
    lastname: "Smith",
    email: "jane.smith@example.com",
    role: "ADMIN",
    classId: "2",
    className: "Classe B",
  },
]);

// Champs du formulaire pour le modal d'édition des utilisateurs
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
    options: ["ADMIN", "TEACHER"],
    required: true,
  },
  {
    name: "classId",
    label: "Classe",
    type: "select",
    options: ["Classe A", "Classe B"],
    required: true,
  },
];

const isModalVisible = ref(false); // Contrôle de la visibilité du modal d'édition
const isDeleteModalVisible = ref(false); // Contrôle de la visibilité du modal de suppression
const userToEdit = ref(null); // Utilisateur en cours d'édition
const userToDelete = ref(null); // Utilisateur à supprimer

// Ouvrir le modal pour éditer un utilisateur
const openEditModal = (userItem) => {
  userToEdit.value = { ...userItem }; // Pré-remplir les données du formulaire
  isModalVisible.value = true;
};

// Ouvrir le modal de suppression pour un utilisateur
const openDeleteModal = (userItem) => {
  userToDelete.value = userItem; // Enregistrer l'utilisateur à supprimer
  isDeleteModalVisible.value = true;
};

// Mettre à jour ou ajouter un utilisateur
const updateUser = (formData) => {
  if (formData._id) {
    // Mise à jour d'un utilisateur existant
    const index = users.value.findIndex((u) => u._id === formData._id);
    if (index !== -1) {
      users.value[index] = { ...formData }; // Mettre à jour les données
    }
  } else {
    // Ajouter un nouvel utilisateur
    const newUser = { ...formData, _id: String(users.value.length + 1) };
    users.value.push(newUser);
  }
  isModalVisible.value = false; // Fermer le modal après mise à jour
};

// Supprimer un utilisateur
const deleteUser = () => {
  if (userToDelete.value) {
    users.value = users.value.filter((u) => u._id !== userToDelete.value._id); // Supprimer l'utilisateur
    isDeleteModalVisible.value = false; // Fermer le modal de confirmation
  }
};
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-gray-800">Utilisateurs</h2>
        <div class="flex justify-center mt-6">
          <button
            @click="openEditModal({})"
            type="button"
            class="px-8 py-3 font-semibold rounded-full bg-black text-white w-full sm:w-auto"
          >
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <!-- Tableau dynamique -->
      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rôle' },
          { key: 'className', label: 'Classe' },
        ]"
        :data="users"
        :hasActions="true"
      >
        <!-- Slot pour les actions -->
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

      <!-- Modal d'édition -->
      <Modal
        v-model:visible="isModalVisible"
        title="Modifier un utilisateur"
        :fields="userFields"
        :onSubmit="updateUser"
        :submitText="'Mettre à jour'"
        :entityData="userToEdit"
      />

      <!-- Modal de confirmation de suppression -->
      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un utilisateur"
        :message="'Êtes-vous sûr de vouloir supprimer cet utilisateur ?'"
        :onConfirm="deleteUser"
      />
    </div>
  </LayoutAuthenticated>
</template>
