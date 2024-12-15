<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Gestion des Indisponibilités" />
        <NewItemButton @click="openModal" text="Ajouter une indisponibilité" />
      </div>
      <DynamicTable
        :columns="tableColumns"
        :data="unavailabilities"
        :hasActions="false"
        class="table-auto w-full border-collapse text-sm text-gray-600"
      >
        <template #default="{ row }">
          <tr class="hover:bg-gray-100">
            <td class="px-4 py-2 border-b text-left">{{ row.startTime }}</td>
            <td class="px-4 py-2 border-b text-left">{{ row.endTime }}</td>
            <td v-if="role === 'admin'" class="px-4 py-2 border-b text-left">
              {{ row.teacher || "Inconnu" }}
            </td>
          </tr>
        </template>
      </DynamicTable>

      <Modal
        v-model:visible="isModalVisible"
        title="Ajouter une Indisponibilité"
        :fields="modalFieldsDynamic"
        :onSubmit="handleSubmit"
        submitText="Confirmer"
      />

      <Pagination
        class="mt-8"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="handlePageChange"
      />
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

import NewItemButton from "@/components/NewItemButton.vue";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const teacherId = ref("");
const unavailabilities = ref([]);
const teachersList = ref([]);
const role = ref(null);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const isModalVisible = ref(false);

const tableColumns = computed(() => {
  const baseColumns = [
    { key: "startTime", label: "Début" },
    { key: "endTime", label: "Fin" },
  ];

  if (role.value === "admin") {
    baseColumns.push({ key: "teacher", label: "Intervenant" });
  }

  return baseColumns;
});

const modalFieldsDynamic = computed(() => {
  const fields = [
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

  if (role.value === "admin") {
    fields.push({
      name: "teacher",
      label: "Intervenant",
      type: "select",
      options: teachersList.value,
      required: true,
    });
  }

  return fields;
});

const openModal = () => {
  if (role.value === "admin") {
    fetchTeachers();
  }
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
      const user = response.data.data.find((user) => user.email === email);

      teacherId.value = user._id;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      showToast({
        message: "Veuillez vous connecter pour accéder à cette page",
        type: "error",
      });
    }
  }
};

const fetchUnavailabilities = async () => {
  try {
    const formatDateWithA = (dateString) => {
      const date = new Date(dateString);
      const optionsDate = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const optionsTime = {
        hour: "2-digit",
        minute: "2-digit",
      };

      const formattedDate = new Intl.DateTimeFormat(
        "fr-FR",
        optionsDate
      ).format(date);
      const formattedTime = new Intl.DateTimeFormat(
        "fr-FR",
        optionsTime
      ).format(date);

      return `${formattedDate} à ${formattedTime}`;
    };

    let response;
    const params = {
      page: currentPage.value,
      limit: itemsPerPage,
    };

    if (role.value === "teacher") {
      console.log("teacherId===", teacherId);

      response = await axiosInstance.get(
        `/api/unavailabilities/${teacherId._value}`,
        { params }
      );
    } else if (role.value === "admin") {
      response = await axiosInstance.get(`/api/unavailabilities`, {
        params,
      });
    }

    unavailabilities.value = response.data.data.map((item) => ({
      startTime: formatDateWithA(item.startTime),
      endTime: formatDateWithA(item.endTime),
      teacher:
        `${item.teacher.firstname} ${item.teacher.lastname}` || "Inconnu",
    }));

    totalPages.value = response.data.totalPages; 
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des indisponibilités.",
      type: "error",
    });
    console.error(error);
  }
};

const fetchTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/users?role=teacher");
    teachersList.value = response.data.data.map((teacher) => ({
      value: teacher._id,
      label: `${teacher.firstname} ${teacher.lastname}`,
    }));
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des intervenants.",
      type: "error",
    });
    console.error(error);
  }
};

const handleSubmit = async (formData) => {
  const submissionData = {
    startTime: formData.startTime,
    endTime: formData.endTime,
  };

  if (role.value === "teacher") {
    submissionData.teacher = teacherId.value;
  } else if (role.value === "admin") {
    submissionData.teacher = formData.teacher;
  }

  if (new Date(submissionData.endTime) <= new Date(submissionData.startTime)) {
    showToast({
      message: "L'heure de fin doit être après l'heure de début",
      type: "error",
    });
    return;
  }

  try {
    const response = await axiosInstance.post(
      "/api/unavailabilities",
      submissionData
    );

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

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchUnavailabilities();
};

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    role.value = parsedUser.role;
  }
  await fetchTeacherId();
  await fetchUnavailabilities();
});
</script>
