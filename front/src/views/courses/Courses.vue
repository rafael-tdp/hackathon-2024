<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import NewItemButton from "@/components/NewItemButton.vue";
import PageTitle from "@/components/PageTitle.vue";
import Pagination from "@/components/Pagination.vue";

const router = useRouter();

const courses = ref([]);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = 10;

const teachersList = ref([]);
const classRoomsList = ref([]);
const schoolClassesList = ref([]);

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const courseToEdit = ref({});
const courseToDelete = ref(null);

const courseFields = computed(() => [
  {
    name: "subject",
    label: "Cours",
    type: "text",
    placeholder: "Nom de cours",
    required: true,
  },
  {
    name: "requiredHours",
    label: "Heures requises",
    type: "text",
    placeholder: "Durée en heures",
    required: true,
  },
  {
    name: "teacher",
    label: "Intervenant",
    type: "select",
    options:
      teachersList.value.length > 0
        ? teachersList.value // Assurez-vous que teachersList contient des objets avec { value: id, label: name }
        : [{ value: "", label: "Chargement..." }],
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
    name: "schoolClass",
    label: "Classe",
    type: "select",
    options:
      schoolClassesList.value.length > 0
        ? schoolClassesList.value // Idem pour schoolClassesList
        : [{ value: "", label: "Chargement..." }],
    required: true,
  },
  {
    name: "classRoom",
    label: "Salle de cours",
    type: "select",
    options:
      classRoomsList.value.length > 0
        ? classRoomsList.value // Idem pour classRoomsList
        : [{ value: "", label: "Chargement..." }],
    required: true,
  },
  {
    name: "status",
    label: "Statut",
    type: "select",
    options: [
      { value: "pending", label: "En attente" },
      { value: "accepted", label: "Passé" },
      { value: "cancelled", label: "Annulé" },
    ],
    required: true,
  },
]);

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
  } catch (error) {
    console.error("Erreur lors du formatage de la date :", error);
    return dateString;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "cancelled":
      return "Annulé";
    case "accepted":
      return "Passé";
    default:
      return "Inconnu";
  }
};

const fetchCourses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses/populated", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
      },
    });

    const coursesData = response.data.data.map((course) => ({
      classRoom: course.classRoom.name,
      rawStartTime: course.startTime,
      rawEndTime: course.endTime,
      startTime: formatDate(course.startTime),
      endTime: formatDate(course.endTime),
      teacher: course.teacher.firstname + " " + course.teacher.lastname, // Nom complet de l'enseignant
      subject: course.subject.name,
      status: getStatusLabel(course.status),
      schoolClass: course.schoolClass.name, // Nom de la classe
      requiredHours: course.subject.requiredHours,
      id: course._id,
    }));

    courses.value = coursesData;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours :", error);
    showToast({
      message: "Impossible de récupérer les cours. Réessayez plus tard.",
      type: "error",
    });
  }
};

const createSubjectAndCourse = async (formData) => {
  try {
    const subjectPayload = {
      name: formData.subject,
      requiredHours: formData.requiredHours || 0,
    };

    const subjectResponse = await axiosInstance.post(
      "/api/subjects",
      subjectPayload
    );
    const subjectId = subjectResponse.data.data._id;

    const coursePayload = {
      teacher: formData.teacher,
      schoolClass: formData.schoolClass,
      classRoom: formData.classRoom,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      status: formData.status,
      subject: subjectId,
    };

    const courseResponse = await axiosInstance.post(
      "/api/courses",
      coursePayload
    );

    const formattedCourse = {
      ...courseResponse.data.data,
      subject: formData.subject,
      status: getStatusLabel(coursePayload.status),
      teacher: teachersList.value.find((t) => t.value === formData.teacher)
        ?.label,
      schoolClass: schoolClassesList.value.find(
        (sc) => sc.value === formData.schoolClass
      )?.label,
      classRoom: classRoomsList.value.find(
        (cr) => cr.value === formData.classRoom
      )?.label,
      startTime: formatDate(courseResponse.data.data.startTime),
      endTime: formatDate(courseResponse.data.data.endTime),
      requiredHours: subjectResponse.data.data.requiredHours || "N/A",
    };

    courses.value.push(formattedCourse);

    showToast({
      message: "Cours et sujet créés avec succès.",
      type: "success",
    });

    isModalVisible.value = false;
  } catch (error) {
    console.error("Erreur lors de la création du cours :", error);
    showToast({
      message: "Une erreur est survenue. Veuillez réessayer.",
      type: "error",
    });
  }
};

const fetchTeachersAndClassrooms = async () => {
  try {
    const teachersResponse = await axiosInstance.get("/api/users?role=teacher");
    teachersList.value = teachersResponse.data.data.map((teacher) => ({
      value: teacher._id,
      label: `${teacher.firstname} ${teacher.lastname}`,
    }));

    const classroomsResponse = await axiosInstance.get("/api/rooms");
    classRoomsList.value = classroomsResponse.data.data.map((classRoom) => ({
      value: classRoom._id,
      label: classRoom.name,
    }));

    const schoolClassesResponse = await axiosInstance.get("/api/schoolClasses");
    schoolClassesList.value = schoolClassesResponse.data.data.map(
      (schoolClass) => ({
        value: schoolClass._id,
        label: schoolClass.name,
      })
    );
  } catch (error) {
    console.error(
      "Erreur lors du chargement des enseignants, des salles de classe ou des classes scolaires.",
      error
    );
    showToast({
      message: "Erreur lors du chargement des données.",
      type: "error",
    });
  }
};

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchCourses();
};

const openEditModal = (courseItem) => {
  courseToEdit.value = {
    ...courseItem,
    status: mapStatusToValue(courseItem.status),
    startTime: courseItem.rawStartTime,
    endTime: courseItem.rawEndTime,
    teacher: courseItem.teacher ? courseItem.teacher._id : null,
    schoolClass: courseItem.schoolClass ? courseItem.schoolClass._id : null,
    classRoom: courseItem.classRoom ? courseItem.classRoom._id : null,
  };
  isModalVisible.value = true;
};

const mapStatusToValue = (statusLabel) => {
  switch (statusLabel) {
    case "En attente":
      return "pending";
    case "Passé":
      return "accepted";
    case "Annulé":
      return "cancelled";
    default:
      return null;
  }
};

const openDeleteModal = (courseItem) => {
  courseToDelete.value = courseItem;
  isDeleteModalVisible.value = true;
};

const updateCourse = async (formData) => {

  try {
    if (formData.id) {
      const payload = {
        ...formData,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      // Updating existing course
      await axiosInstance.put(`/api/courses/${formData.id}`, payload);
      const index = courses.value.findIndex((c) => c.id === formData.id);
      if (index !== -1) {
        courses.value[index] = {
          ...formData,
          status: getStatusLabel(formData.status),
        };
      }
      showToast({
        message: "Cours mis à jour avec succès.",
        type: "success",
      });
    } else {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      // Create new course
      const response = await axiosInstance.post(" ", payload);

      courses.value.push({
        ...response.data.data,
        status: getStatusLabel(response.data.data.status),
      });

      showToast({
        message: "Nouveau cours créé avec succès.",
        type: "success",
      });
    }
    isModalVisible.value = false;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours :", error);
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
    console.error("Erreur lors de la suppression du cours :", error);
    showToast({
      message: "Impossible de supprimer le cours. Réessayez plus tard.",
      type: "error",
    });
  }
};

const openCreateModal = () => {
  courseToEdit.value = null;
  isModalVisible.value = true;
};

onMounted(async () => {
  await fetchCourses();
  await fetchTeachersAndClassrooms();
});
</script>

<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6 pb-3">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Cours" />
        <NewItemButton @click="openCreateModal" text="Nouveau cours" />
      </div>

      <DynamicTable
        :columns="[
          { key: 'subject', label: 'Cours' },
          { key: 'teacher', label: 'Intervenant' },
          { key: 'startTime', label: 'Date de début' },
          { key: 'endTime', label: 'Date de fin' },
          { key: 'schoolClass', label: 'Classe' },
          {
            key: 'requiredHours',
            label: 'Heures',
            formatter: (hours) => hours || 'N/A',
          },
          { key: 'classRoom', label: 'Salle' },
          { key: 'status', label: 'Statut', formatter: getStatusLabel },
        ]"
        :data="courses"
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
        :title="courseToEdit ? 'Modifier le cours' : 'Créer un cours'"
        :fields="courseFields"
        :onSubmit="courseToEdit ? updateCourse : createSubjectAndCourse"
        :submitText="courseToEdit ? 'Mettre à jour' : 'Créer'"
        :entityData="courseToEdit"
      />

      <ConfirmationModal
        v-model:visible="isDeleteModalVisible"
        title="Supprimer un cours"
        :message="'Souhaitez-vous supprimer ce cours ?'"
        :onConfirm="deleteCourse"
      />
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="handlePageChange"
    />
  </LayoutAuthenticated>
</template>
