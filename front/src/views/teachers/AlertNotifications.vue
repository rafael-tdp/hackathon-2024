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
    let response;
    if (role.value === "teacher") {
      response = await axiosInstance.get(`/api/notifications/${teacherId.value}`);
    } else if (role.value === "admin") {
      response = await axiosInstance.get("/api/notifications");
    }

    notifications.value = await Promise.all(
      response.data.data.map(async (notification) => {
        let courseName = "Inconnu";

        if (notification.course) {
          try {
            let courseResponse;
            if(role.value === "teacher"){
                courseResponse= await axiosInstance.get(`/api/courses/${notification.course}`);
            }else{
                courseResponse = await axiosInstance.get(`/api/courses/${notification.course._id}`);
            }
            const subjectId = courseResponse.data.data.subject;
            if (subjectId) {
              const subject = await axiosInstance.get(`/api/subjects/${subjectId}`);
              courseName = subject.data.data.name;
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération du cours: ${notification.course}`, error);
          }
        }

        const teacherName = notification.teacher
          ? `${notification.teacher.firstname} ${notification.teacher.lastname}`
          : "Inconnu";

        return {
          courseName,
          teacherName, // Nom complet de l'enseignant
          message: notification.message,
          status: role.value === "teacher" ? "Ouvert" : "Délivré", // Statut basé sur le rôle
        };
      })
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    showToast({
      message: "Impossible de récupérer les notifications. Réessayez plus tard.",
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
