<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6 flex flex-col items-center">
      <PageTitle text="Gestion des Indisponibilités" />

      <div class="flex justify-end w-full max-w-4xl mb-4">
        <NewItemButton @click="openModal" text="Ajouter une indisponibilité" />
      </div>

      <div class="w-full max-w-4xl bg-transparent p-6">
        <DynamicTable
          :columns="[
            { key: 'startTime', label: 'Début' },
            { key: 'endTime', label: 'Fin' },
          ]"
          :data="unavailabilities"
          :hasActions="false"
          class="bg-transparent border-none shadow-none rounded-none"
        />
      </div>

      <Modal
        v-model:visible="isModalVisible"
        title="Ajouter une Indisponibilité"
        :fields="modalFields"
        :onSubmit="handleSubmit"
        submitText="Confirmer"
      />
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from "@/utils/axiosInstance";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import PageTitle from "@/components/PageTitle.vue";
import { showToast } from "@/utils/toast";

const isModalVisible = ref(false);
const teacherId = ref("");
const unavailabilities = ref([]);

const modalFields = [
  {
    name: "startTime",
    label: "Date et Heure de Début",
    type: "date",
    placeholder: "Sélectionner une date et une heure",
    required: true,
  },
  {
    name: "endTime",
    label: "Date et Heure de Fin",
    type: "date",
    placeholder: "Sélectionner une date et une heure",
    required: true,
  },
];

const openModal = () => {
  isModalVisible.value = true;
};

const getUserData = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.email || null;
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
        "Erreur lors de la récupération des infos du user connecté"
      );
    }
  }
};

const fetchUnavailabilities = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/unavailabilities?teacher=${teacherId.value}`
    );

    const formatDateWithA = (dateString) => {
      const date = new Date(dateString);
      const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

      const formattedDate = new Intl.DateTimeFormat('fr-FR', optionsDate).format(date);
      const formattedTime = new Intl.DateTimeFormat('fr-FR', optionsTime).format(date);

      return `${formattedDate} à ${formattedTime}`;
    };

    unavailabilities.value = response.data.data.map((item) => ({
      startTime: formatDateWithA(item.startTime),
      endTime: formatDateWithA(item.endTime),
    }));
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des indisponibilités.",
      type: "error",
    });
    console.error(error);
  }
};

const handleSubmit = async (formData) => {
  if (!teacherId.value) {
    showToast({
      message: "Une erreur est survenue, veuillez réessayer plus tard",
      type: "error",
    });
    return;
  }

  if (new Date(formData.endTime) <= new Date(formData.startTime)) {
    showToast({
      message: "L'heure de fin doit être après l'heure de début",
      type: "error",
    });
    return;
  }

  try {
    const response = await axiosInstance.post("/api/unavailabilities", {
      startTime: formData.startTime,
      endTime: formData.endTime,
      teacher: teacherId.value,
    });

    console.log("response ===", response);

    showToast({
      message: "Indisponibilité ajoutée avec succès",
      type: "success",
    });

    isModalVisible.value = false;
    await fetchUnavailabilities();
  } catch (error) {
    showToast({
      message: "Une erreur est survenue. Veuillez réessayer plus tard.",
      type: "error",
    });
  }
};

onMounted(async () => {
  await fetchTeacherId();
  await fetchUnavailabilities();
});
</script>
