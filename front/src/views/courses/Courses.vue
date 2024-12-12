<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-gray-800">Courses</h2>
        <!-- Button to open the modal for adding a new course -->
        <div class="flex justify-center mt-6">
          <button
            @click="openEditModal({})"
            type="button"
            class="px-8 py-3 font-semibold rounded-full bg-black text-white w-full sm:w-auto"
          >
            Nouveau cours
          </button>
        </div>
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
        :hasActions="true"
      >
        <!-- Slot for actions (edit, delete) -->
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

        <!-- Slot for status with color-coding -->
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
          <div v-if="true">{{ console.log("Status:", row.status) }}</div>
        </template>
      </DynamicTable>

      <!-- Modal for editing a course -->
      <Modal
        v-model:visible="isModalVisible"
        :title="courseToEdit._id ? 'Modifier le cours' : 'Nouveau cours'"
        :fields="courseFields"
        :entityData="courseToEdit"
        :onSubmit="handleSubmit"
        :submitText="courseToEdit._id ? 'Mettre à jour' : 'Créer'"
      />

      <!-- Confirmation Modal for deleting a course -->
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
import { format } from "date-fns"; // Importer la fonction format
import { fr } from "date-fns/locale"; // Importer la locale française

const router = useRouter();

// Liste des cours / intervenants
const courses = ref([]);
const teachersMap = ref({});
const subjectsMap = ref({});

const formatDate = (dateString) => {
  try {
    console.log(
      format(new Date(dateString), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
    );
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
    type: "datetime-local",
    required: true,
  },
  {
    name: "endTime",
    label: "Date de fin",
    type: "datetime-local",
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

// Gestion des modals
const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const courseToEdit = ref({});
const courseToDelete = ref(null);

// Fetch courses
const fetchCourses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses");
    const coursesData = response.data.map((course) => ({
      ...course,
      startTime: formatDate(course.startTime),
      endTime: formatDate(course.endTime),
      teacherName: teachersMap.value[course.teacherId] || "Inconnu",
      subjectName: subjectsMap.value[course.subjectId] || "Inconnu",
      status: normalizeStatus(course.status),
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

// Fetch teachers
const fetchTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/users");
    const teachers = response.data.filter((user) => user.role === "teacher");
    teachersMap.value = teachers.reduce((map, teacher) => {
      map[teacher._id] = `${teacher.firstname} ${teacher.lastname}`;
      return map;
    }, {});
  } catch (error) {
    console.error("Erreur lors de la récupération des enseignants :", error);
    showToast({
      message: "Impossible de récupérer les enseignants.",
      type: "error",
    });
  }
};

// Fetch subjects
const fetchSubjects = async () => {
  try {
    const response = await axiosInstance.get("/api/subjects");
    subjectsMap.value = response.data.reduce((map, subject) => {
      map[subject._id] = subject.name;
      return map;
    }, {});
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets :", error);
    showToast({
      message: "Impossible de récupérer les sujets.",
      type: "error",
    });
  }
};
// Ouvrir le modal d'édition
const openEditModal = (courseItem) => {
  courseToEdit.value = { ...courseItem,
    teacher: courseItem.teacherName,
    subject: courseItem.subjectName,
    status: courseItem.status
   }; // Pré-remplir les données du formulaire
  
  isModalVisible.value = true;
};

// Ouvrir le modal de suppression
const openDeleteModal = (courseItem) => {
  courseToDelete.value = courseItem; // Enregistrer le cours à supprimer
  isDeleteModalVisible.value = true;
};

// Créer ou mettre à jour un cours
const handleSubmit = async (formData) => {
  try {
    if (formData._id) {
      // Mise à jour d'un cours existant
      await axiosInstance.put(`/api/courses/${formData._id}`, formData);
      const index = courses.value.findIndex((c) => c._id === formData._id);
      if (index !== -1) {
        courses.value[index] = { ...formData };
      }
      showToast({
        message: "Cours mis à jour avec succès.",
        type: "success",
      });
    } else {
      // Création d'un nouveau cours
      const response = await axiosInstance.post("/api/courses", formData);
      courses.value.push(response.data);
      showToast({
        message: "Nouveau cours créé avec succès.",
        type: "success",
      });
    }
    isModalVisible.value = false; // Fermer le modal après mise à jour
  } catch (error) {
    console.error("Erreur lors de la création ou de la mise à jour :", error);
    showToast({
      message: "Une erreur est survenue. Veuillez réessayer.",
      type: "error",
    });
  }
};

// Supprimer un cours
const deleteCourse = async () => {
  try {
    if (courseToDelete.value) {
      await axiosInstance.delete(`/api/courses/${courseToDelete.value._id}`);
      courses.value = courses.value.filter(
        (c) => c._id !== courseToDelete.value._id
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
    completed: "Passé",
    ongoing: "En cours",
  };
  return statusMap[status] || "Inconnu"; // Valeur par défaut si le statut n'est pas mappé
};

// Charger les cours/intervenants
onMounted(async () => {
  await fetchTeachers();
  await fetchSubjects();
  await fetchCourses();
});
</script>
