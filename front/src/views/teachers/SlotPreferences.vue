<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
      <div class="flex justify-between items-center mb-8">
        <PageTitle text="Gestion des Préférences de Créneaux" />
        <NewItemButton @click="openModal" text="Ajouter une Préférence" />
      </div>

      <DynamicTable
        :columns="tableColumns"
        :data="preferences"
        :hasActions="false"
        class="table-auto w-full border-collapse text-sm text-gray-600"
      >
        <template #default="{ row }">
          <tr class="hover:bg-gray-100">
            <td class="px-4 py-2 border-b text-left">
              {{ row.startTime }} - {{ row.endTime }}
            </td>
            <td v-if="role === 'admin'" class="px-4 py-2 border-b text-left">
              {{ row.teacher || "Inconnu" }}
            </td>
          </tr>
        </template>
      </DynamicTable>

      <Modal
        v-model:visible="isModalVisible"
        title="Ajouter une Préférence de Créneau"
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
const preferences = ref([]);
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
      required: true,
    },
    {
      name: "endTime",
      label: "Date et Heure de Fin",
      type: "date",
      required: true,
    },
  ];

  if (role.value === "admin") {
    fields.push({
      name: "teacher",
      label: "Intervenant",
      type: "select",
      options: [],
      required: true,
    });
  }

  return fields;
});

const openModal = () => {
  isModalVisible.value = true;
};

const fetchPreferences = async () => {
  try {
    const response = await axiosInstance.get("/api/slotPreferences", {
      params: { page: currentPage.value, limit: itemsPerPage },
    });

    preferences.value = response.data.data.map((item) => ({
      teacher: `${item.teacher.firstname} ${item.teacher.lastname}`,
      startTime: "2024-12-19 10:00", 
      endTime: "2024-12-19 12:00",
    }));

    totalPages.value = Math.ceil(response.data.total / itemsPerPage);
  } catch (error) {
    showToast({
      message: "Erreur lors du chargement des préférences.",
      type: "error",
    });
    console.error(error);
  }
};

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchPreferences();
};

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    role.value = parsedUser.role;
  }
  await fetchPreferences();
});
</script>
