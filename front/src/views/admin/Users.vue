<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "@/components/NewItemButton.vue";
import PageTitle from "@/components/PageTitle.vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

const router = useRouter();

const users = ref([]);
const classesMap = ref({});

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
    options: ["admin", "teacher", "student"],
    required: true,
  },
  {
    name: "classId",
    label: "Classe",
    type: "select",
    options: Object.entries(classesMap.value).map(([id, name]) => ({ id, name })),
    required: true,
  },
];

const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users");
    users.value = response.data.data.map((user) => ({
      ...user,
      className: classesMap.value[user.classId] || "-",
      roleLabel: getRoleLabel(user.role),
    }));
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des utilisateurs.",
      type: "error",
    });
    console.error(error);
  }
};

const fetchClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/schoolClasses");
    classesMap.value = response.data.data.reduce((map, cls) => {
      map[cls._id] = cls.name;
      return map;
    }, {});
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des classes.",
      type: "error",
    });
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
  };
  isModalVisible.value = true;
};

const openDeleteModal = (userItem) => {
  userToDelete.value = userItem;
  isDeleteModalVisible.value = true;
};

const updateUser = async (formData) => {
  try {
    if (formData._id) {
      await axiosInstance.put(`/api/users/${formData._id}`, formData);
      const index = users.value.findIndex((u) => u._id === formData._id);
      if (index !== -1) {
        users.value[index] = {
          ...formData,
          className: classesMap.value[formData.classId] || "Non attribuée",
          roleLabel: getRoleLabel(formData.role),
        };
      }
      showToast({
      message: "Utilisateur mis à jour avec succès.",
      type: "success",
    });
    } else {
      const response = await axiosInstance.post("/api/users", formData);
      users.value.push({
        ...response.data.data,
        className: classesMap.value[response.data.data.classId] || "Non attribuée",
        roleLabel: getRoleLabel(response.data.data.role),
      });
      showToast("Nouvel utilisateur ajouté avec succès", "success");
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
        message: "Uilisateur supprimé avec succès.",
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
  await fetchClasses();
  await fetchUsers();
});
</script>

<template>
	<LayoutAuthenticated>
		<div class="min-h-screen py-12 px-6">
			<div class="flex justify-between items-center mb-8">
				<PageTitle text="Utilisateurs" />
				<NewItemButton
					@click="openEditModal"
					text="Nouvel Utilisateur"
				/>
			</div>

      <DynamicTable
        :columns="[
          { key: 'firstname', label: 'Prénom' },
          { key: 'lastname', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Rôle' },
          { key: 'className', label: 'Classe' },
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
        title="Modifier un utilisateur"
        :fields="userFields"
        :onSubmit="updateUser"
        :submitText="'Mettre à jour'"
        :entityData="userToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un utilisateur"
        :message="'Êtes-vous sûr de vouloir supprimer cet utilisateur ?'"
        :onConfirm="deleteUser"
      />
    </div>
  </LayoutAuthenticated>
</template>
