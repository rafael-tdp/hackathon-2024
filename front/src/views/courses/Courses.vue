<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Cours" />

        <!-- Affichage du bouton 'Nouveau cours' seulement si l'utilisateur est admin ou teacher -->
        <NewItemButton
          v-if="role === 'admin' || role === 'teacher'"
          @click="openEditModal"
          text="Nouveau cours"
        />
      </div>

      <!-- Dynamic Table -->
      <DynamicTable
        :columns="[
          { key: 'subjectName', label: 'Cours' },
          { key: 'teacherName', label: 'Intervenant' },
          { key: 'startTime', label: 'Date de début' },
          { key: 'endTime', label: 'Date de fin' },
          { key: 'classRoom', label: 'Classe' },
          { key: 'status', label: 'Statut' },
        ]"
        :data="courses"
        :hasActions="role === 'admin' || role === 'teacher'"
      >
        <template #actions="{ row }">
          <!-- Afficher les actions (éditer, supprimer) uniquement si l'utilisateur est admin ou teacher -->
          <button
            v-if="role === 'admin' || role === 'teacher'"
            @click="openEditModal(row)"
            class="text-secondary hover:text-secondary/80"
          >
            <PencilIcon class="h-5 w-5" />
          </button>
          <button
            v-if="role === 'admin' || role === 'teacher'"
            @click="openDeleteModal(row)"
            class="text-red-600 hover:text-red-800"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </template>

        <template #status="{ row }">
          <button
            :class="{
              'bg-red-600 text-white': row.status === 'Annulé',
              'bg-green-600 text-white': row.status === 'Passé',
              'bg-blue-600 text-white': row.status === 'En cours',
              'bg-yellow-500 text-black': row.status === 'pending',
            }"
            class="px-4 py-2 rounded-md"
          >
            {{ row.status === "pending" ? "En attente" : row.status }}
          </button>
        </template>
      </DynamicTable>

      <Modal
        v-model:visible="isModalVisible"
        :title="courseToEdit._id ? 'Modifier le cours' : 'Nouveau cours'"
        :fields="courseFields"
        :entityData="courseToEdit"
        :onSubmit="handleSubmit"
        :submitText="courseToEdit._id ? 'Mettre à jour' : 'Créer'"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un cours"
        :message="'Souhaitez-vous supprimer ce cours?'"
        :onConfirm="deleteCourse"
      />
    </div>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import NewItemButton from "../../components/NewItemButton.vue";
import PageTitle from "../../components/PageTitle.vue";

const router = useRouter();

const courses = ref([]);
const teachersMap = ref({});
const subjectsMap = ref({});
const role = ref(null);

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
  } catch (error) {
    console.error("Erreur lors du formatage de la date :", error);
    return dateString;
  }
};

// Columns
const courseFields = [
  {
    name: "subject",
    label: "Cours",
    type: "text",
    placeholder: "Nom de cours",
    required: true,
  },
  {
    name: "teacher",
    label: "Intervenant",
    type: "text",
    placeholder: "Intervenant",
    required: true,
  },
  {
    name: "startTime",
    label: "Date de début",
    type: "date",
    required: true,
  },
  {
    name: "endTime",
    label: "Date de fin",
    type: "date",
    required: true,
  },
  {
    name: "classRoom",
    label: "Classe",
    type: "text",
    placeholder: "Classroom",
    required: true,
  },
  {
    name: "status",
    label: "Statut",
    type: "select",
    options: ["Passé", "Annulé", "En cours"],
    required: true,
  },
];

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const courseToEdit = ref({});
const courseToDelete = ref(null);

const fetchCourses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses/populated");
    const coursesData = response.data.data.map((course) => ({
      classRoom: course.classRoom.name,
      rawStartTime: course.startTime,
      rawEndTime: course.endTime,
      startTime: formatDate(course.startTime),
      endTime: formatDate(course.endTime),
      teacherName: course.teacher.firstname,
      subjectName: course.subject.name,
      status: normalizeStatus(course.status),
      id: course._id,
    }));

    courses.value = coursesData;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours :", error);
    showToast({
      message: "Impossible de récupérer les cours. Réessayez plus tard.",
      type: "error",
    });
  }
};

const openEditModal = (courseItem) => {
  courseToEdit.value = {
    ...courseItem,
    teacher: courseItem.teacherName,
    subject: courseItem.subjectName,
    startTime: courseItem.rawStartTime,
    endTime: courseItem.rawEndTime,
    status: courseItem.status,
  };

  isModalVisible.value = true;
};

const openDeleteModal = (courseItem) => {
  courseToDelete.value = courseItem;
  isDeleteModalVisible.value = true;
};

const handleSubmit = async (formData) => {
  try {
    const payload = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };

    if (formData._id) {
      await axiosInstance.put(`/api/courses/${formData._id}`, payload);
      const index = courses.value.findIndex((c) => c._id === formData._id);
      if (index !== -1) {
        courses.value[index] = { ...formData };
      }
      showToast({
        message: "Cours mis à jour avec succès.",
        type: "success",
      });
    } else {
      const response = await axiosInstance.post("/api/courses", payload);
      courses.value.push(response.data.data);
      showToast({
        message: "Nouveau cours créé avec succès.",
        type: "success",
      });
    }
    isModalVisible.value = false;
  } catch (error) {
    console.error("Erreur lors de la création ou de la mise à jour :", error);
    showToast({
      message: "Une erreur est survenue. Veuillez réessayer.",
      type: "error",
    });
  }
};

const deleteCourse = async () => {
  try {
    if (courseToDelete.value) {
      await axiosInstance.delete(`/api/courses/${courseToDelete.value.id}`);
      courses.value = courses.value.filter(
        (c) => c.id !== courseToDelete.value.id
      );
      showToast({
        message: "Cours supprimé avec succès.",
        type: "success",
      });
    }
    isDeleteModalVisible.value = false;
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    showToast({
      message: "Impossible de supprimer le cours. Réessayez plus tard.",
      type: "error",
    });
  }
};

const normalizeStatus = (status) => {
  const statusMap = {
    pending: "En attente",
    canceled: "Annulé",
    accepted: "Passé",
  };
  return statusMap[status] || "Inconnu";
};

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    role.value = parsedUser.role;
  }
  await fetchCourses();
});
</script>
