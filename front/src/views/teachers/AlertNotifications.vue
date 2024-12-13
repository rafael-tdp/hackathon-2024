<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Toutes les alertes" />
      </div>

      <DynamicTable
        v-if="role"
        :columns="tableColumns"
        :data="notifications"
        :hasActions="false"
      />
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosInstance from "@/utils/axiosInstance";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import DynamicTable from "@/components/DynamicTable.vue";
import PageTitle from "../../components/PageTitle.vue";
import { showToast } from "@/utils/toast";

const notifications = ref([]);
const role = ref(null);
const teacherId = ref("");

// Colonnes du tableau
const tableColumns = computed(() => {
  const baseColumns = [
    { key: "courseName", label: "Cours" },
    { key: "teacherName", label: "Enseignant", show: role.value !== "teacher" },
    { key: "message", label: "Message" },
    { key: "status", label: "Statut" },
  ];
  return baseColumns.filter((col) => col.show !== false);
});

const fetchNotifications = async () => {
  try {
    if (role.value === "teacher") {
      const response = await axiosInstance.get(
        `/api/notifications/${teacherId.value}`
      );
      notifications.value = response.data.data.map((notification) => ({
        courseName: notification.course?.name || "Inconnu",
        teacher: notification.teacher || null,
        message: notification.message,
        status: "Ouvert",
      }));
    } else if (role.value === "admin") {
      const response = await axiosInstance.get("/api/notifications");

      notifications.value = response.data.data.map((notification) => ({
        courseName: notification.course?.name || "Inconnu",
        teacher: notification.teacher || null,
        message: notification.message,
        status: "Délivré",
      }));
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    showToast({
      message:
        "Impossible de récupérer les notifications. Réessayez plus tard.",
      type: "error",
    });
  }
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
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      showToast({
        message: "Veuillez vous connecter pour accéder à cette page",
        type: "error",
      });
    }
  }
};

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    role.value = parsedUser.role;
  }
  await fetchTeacherId();
  await fetchNotifications();
});
</script>
