<template>
    <LayoutAuthenticated>
      <div class="min-h-screen py-12 px-6">
        <div class="flex justify-between items-center mb-8">
          <PageTitle text="Toutes les alertes" />
        </div>
  
        <!-- Tableau dynamique des alertes -->
        <DynamicTable
          :columns="[
            { key: 'courseName', label: 'Cours' },
            { key: 'teacherName', label: 'Enseignant' },
            { key: 'message', label: 'Message' },
            { key: 'status', label: 'Statut' }
          ]"
          :data="notifications"
          :hasActions="false"
        >
          <!-- Slot pour le statut avec codage couleur -->
          <template #status="{ row }">
            <button
              :class="{
                'bg-red-600 text-white': row.status === 'Envoyé',
                'bg-green-600 text-white': row.status === 'Ouvert'
              }"
              class="px-4 py-2 rounded-md"
            >
              {{ row.status }}
            </button>
          </template>
  
          <!-- Slot pour le nom du cours et de l'enseignant -->
          <template #courseName="{ row }">
            {{ row.course ? row.course.name : 'Inconnu' }}
          </template>
          <template #teacherName="{ row }">
            {{ row.teacher ? `${row.teacher.firstname} ${row.teacher.lastname}` : 'Inconnu' }}
          </template>
        </DynamicTable>
      </div>
    </LayoutAuthenticated>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import DynamicTable from "@/components/DynamicTable.vue";
  import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
  import PageTitle from "../../components/PageTitle.vue";
  import axiosInstance from "@/utils/axiosInstance";
  import { showToast } from "@/utils/toast";
  
  const notifications = ref([]);
  
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/api/notifications");
      const notificationsData = response.data.data.map((notification) => ({
        ...notification,
        status: 'Ouvert',
        teacherName: notification.teacher.firstname + " " + notification.teacher.lastname,
      }));

      notifications.value = notificationsData;
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error);
      showToast({
        message: "Impossible de récupérer les notifications. Réessayez plus tard.",
        type: "error",
      });
    }
  };
  
  onMounted(() => {
    fetchNotifications();
  });
  </script>
  