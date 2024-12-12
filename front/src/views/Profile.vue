<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6 flex items-center justify-center">
      <div
        class="bg-white rounded-lg w-full max-w-md p-8 shadow-xl transition-all duration-300"
      >
        <div class="flex justify-center items-center h-16 mb-6">
          <h2 class="text-3xl font-semibold text-gray-800">Mes informations</h2>
        </div>

        <div class="space-y-6">
          <div v-for="(value, label) in userInfo" :key="label">
            <label :for="label" class="block text-sm font-medium text-gray-700">
              {{ label }}
            </label>
            <p :id="label" class="mt-1 text-gray-900">{{ value }}</p>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <NewItemButton @click="openEditModal" text="Modifier" />
        </div>
      </div>
    </div>

    <Modal
      v-model:visible="isModalVisible"
      title="Modifier mon profil"
      :fields="profileFields"
      :onSubmit="updateProfile"
      :submitText="'Mettre à jour'"
      :entityData="user"
      class="modal-transition"
    />
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import Modal from "@/components/Modal.vue";
import NewItemButton from "@/components/NewItemButton.vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

const user = ref({});
const userId = ref("");

onMounted(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    user.value = {
      firstname: parsedUser.firstname || "",
      lastname: parsedUser.lastname || "",
      email: parsedUser.email || "",
    };
    userId.value = parsedUser.id || "";
  }

  userInfo.value = {
    Prénom: user.value.firstname,
    Nom: user.value.lastname,
    Email: user.value.email,
  };
});

const profileFields = [
  { name: "firstname", label: "Prénom", type: "text", required: true },
  { name: "lastname", label: "Nom", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
];

const userInfo = ref({
  Prénom: "",
  Nom: "",
  Email: "",
});

const isModalVisible = ref(false);

const openEditModal = () => {
  isModalVisible.value = true;
};

const updateProfile = async (formData) => {
  try {
    const userInfoResponse = await axiosInstance.get(`/api/users?email=${formData.email}`);
    
    if (!userInfoResponse.data.data || userInfoResponse.data.data.length === 0) {
      showToast({
        message: "Utilisateur non trouvé.",
        type: "error",
      });
      return;
    }

    const userInfo = userInfoResponse.data.data[0]; 
    const updatedUserData = { ...formData, id: userInfo._id };

    const response = await axiosInstance.put(`/api/users/${updatedUserData.id}`, updatedUserData);

    if (response.status === 200) {
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      user.value = { ...updatedUserData };

      userInfo.value = {
        Prénom: user.value.firstname,
        Nom: user.value.lastname,
        Email: user.value.email,
      };

      isModalVisible.value = false;

      showToast({
        message: "Profil mis à jour avec succès.",
        type: "success",
      });
    } else {
      showToast({
        message: "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.",
        type: "error",
      });
    }
  } catch (error) {
    showToast({
      message: "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.",
      type: "error",
    });
    console.error("Erreur lors de la mise à jour du profil", error);
  }
};

</script>
