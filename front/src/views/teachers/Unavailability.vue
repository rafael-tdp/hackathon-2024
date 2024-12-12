<template>
  <LayoutAuthenticated>
    <div class="flex justify-center items-center min-h-screen">
      <div class="w-full max-w-lg p-6 bg-white">
        <h2 class="text-2xl font-semibold mb-4">Définir une Indisponibilité</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label
              for="startTime"
              class="block text-sm font-medium text-gray-700"
              >Date et Heure de Début</label
            >
            <input
              id="startTime"
              type="datetime-local"
              v-model="form.startTime"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="endTime" class="block text-sm font-medium text-gray-700"
              >Date et Heure de Fin</label
            >
            <input
              id="endTime"
              type="datetime-local"
              v-model="form.endTime"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex justify-center mt-6">
            <NewItemButton
              @click="handleSubmit"
              text="Ajouter l'Indisponibilité"
            />
          </div>
        </form>
        <p v-if="message" :class="messageClass" class="mt-4">{{ message }}</p>
      </div>
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from "@/utils/axiosInstance";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import { showToast } from "@/utils/toast";

const form = ref({
  startTime: "",
  endTime: "",
});

const message = ref("");
const messageClass = ref("");
const teacherId = ref("");

// Getting user infos from localStorage
const getUserData = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.email) {
    return user.email;
  }
  return null;
};

const fetchTeacherId = async () => {
  const email = getUserData();
  if (email) {
    try {
      const response = await axiosInstance.get(`/api/users?email=${email}`);
      teacherId.value = response.data.data[0]._id;
    } catch (error) {
      showToast({
        message: "Veuillez vous connecter pour accéder à cette page",
        type: "error",
      });
      console.error(
        "Une erreur est survenue lors de la récupération des infos du user connecté"
      );
    }
  }
};

const handleSubmit = async () => {
  if (!teacherId.value) {
    showToast({
        message: "Une erreur est survenue, veuillez réeassyer plus tard",
        type: "error",
      });
    return;
  }

  if (new Date(form.value.endTime) <= new Date(form.value.startTime)) {
    showToast({
        message: "L'heure de fin doit être après l'heure de début",
        type: "error",
      });
    return;
  }

  try {
    const response = await axiosInstance.post("/api/unavailabilities", {
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      teacher: teacherId.value,
    });

    showToast({
        message: "Indisponibilité ajoutée avec succès",
        type: "success",
      });

    form.value.startTime = "";
    form.value.endTime = "";
  } catch (error) {    
    showToast({
        message: "Une erreur est survenue. Veuillez réessayer plus tard.",
        type: "error",
      });
  }
};

onMounted(async () => {
  await fetchTeacherId();
});
</script>
