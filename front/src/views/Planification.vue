<template>
  <LayoutAuthenticated>
    <div class="min-h-screen py-12 px-6">
			<div class="flex justify-between items-center mb-8">
        <!-- <h1 class="text-2xl font-bold text-gray-700">Planification Académique</h1> -->
        <PageTitle text="Planification Académique" />
        <!-- <button
          @click="addEvent"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter un cours
        </button> -->
        <NewItemButton
          @click="addEvent"
          text="Nouveau Cours"
        />
      </div>
  
      <!-- Calendrier -->
      <AdvancedCalendar
        :events="events"
        :weekends="showWeekends"
        @select="handleSelect"
        @eventClick="handleEventClick"
        @eventDrop="updateEvent"
        @eventResize="updateEvent"
      />
  
      <!-- Modal -->
      <ScheduleModal
        v-if="isModalVisible"
        :visible="isModalVisible"
        :session="selectedEvent"
        @close="isModalVisible = false"
        @update="updateEvent"
      />
    </div>
    </LayoutAuthenticated>
  </template>
  
  
  <script>
  import { ref } from "vue";
  import AdvancedCalendar from "../components/Calendar.vue";
  import ScheduleModal from "../components/ScheduleModal.vue";
  import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
  import NewItemButton from "../components/NewItemButton.vue";
  import PageTitle from "../components/PageTitle.vue";
  
  export default {
    name: "Planification",
    components: {
      AdvancedCalendar,
      ScheduleModal,
      LayoutAuthenticated,
      NewItemButton,
      PageTitle,
    },
    setup() {
      const isModalVisible = ref(false);
      const selectedEvent = ref(null);
      const events = ref([
        { id: 1, title: "Cours de Mathématiques", start: "2024-12-10T10:00", end: "2024-12-10T12:00" },
        { id: 2, title: "Cours de Physique", start: "2024-12-12T14:00", end: "2024-12-12T16:00" },
      ]);
      const showWeekends = ref(true);
  
      const addEvent = () => {
        const title = prompt("Titre de l'événement :");
        if (title) {
          events.value.push({
            id: Date.now(),
            title,
            start: new Date().toISOString().split("T")[0],
          });
        }
      };
  
      const handleSelect = (arg) => {
        const title = prompt("Titre de l'événement :");
        if (title) {
          events.value.push({
            id: Date.now(),
            title,
            start: arg.startStr,
            end: arg.endStr,
            allDay: arg.allDay,
          });
        }
      };
  
      const handleEventClick = (event) => {
        selectedEvent.value = {
          id: event.id,
          title: event.title,
          start: event.start.toISOString().slice(0, 16),
          end: event.end?.toISOString().slice(0, 16),
        };
        isModalVisible.value = true;
      };
  
      const updateEvent = (updatedEvent) => {
        const index = events.value.findIndex((e) => e.id === updatedEvent.id);
        if (index !== -1) {
          events.value[index] = { ...events.value[index], ...updatedEvent };
        }
        isModalVisible.value = false;
      };
  
      return {
        isModalVisible,
        selectedEvent,
        events,
        showWeekends,
        addEvent,
        handleSelect,
        handleEventClick,
        updateEvent,
      };
    },
  };
  </script>
  