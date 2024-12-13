<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Draggable } from "@fullcalendar/interaction";

export default {
  name: "DraggableEvents",
  props: {
    schoolClasses: Array,
    classRooms: Array,
    teachers: Array,
    subjects: Array,
  },
  setup(props) {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const events = ref([]);

  const fetchExternalEvents = async () => {
    try {
      const predefinedStatus = "accepted"; // Statut prédéfini
      const response = await axios.get(`${BASE_URL}/api/courses/status/${predefinedStatus}`);
      console.log("Événements récupérés :", response.data.data);

      if (response.data && response.data.data) {
        events.value = response.data.data.map((course) => {
          // Associer les données enrichies à partir des props
          const schoolClass = props.schoolClasses.find((c) => c._id === course.schoolClass);
          const classRoom = props.classRooms.find((r) => r._id === course.classRoom);
          const teacher = props.teachers.find((t) => t._id === course.teacher);
          const subject = props.subjects.find((s) => s._id === course.subject);

          return {
            title: `Classe: ${schoolClass?.name || "Inconnue"}<br>
                    Cours: ${subject?.name || "Inconnu"}<br>
                    Prof: ${teacher?.firstname || "Inconnu"} ${teacher?.lastname || ""}<br>
                    Salle: ${classRoom?.name || "Non attribuée"}`,
            start: course.startTime,
            end: course.endTime,
          };
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements externes :", error);
    }
  };
    // Initialiser le conteneur draggable
    const setupDraggable = () => {
      const container = document.getElementById("draggable-events-container");
      if (container) {
        new Draggable(container, {
          itemSelector: ".fc-event",
          eventData: (eventEl) => JSON.parse(eventEl.getAttribute("data-event")),
        });
      }
    };

    onMounted(async () => {
      await fetchExternalEvents();
      setupDraggable();
    });

    return {
      events,
    };
  },
};
</script>

<template>
  <div id="draggable-events-container" class="draggable-events">
    <div
      v-for="(event, index) in events"
      :key="index"
      class="fc-event"
      :data-event="JSON.stringify(event)"
    >
      <span v-html="event.title"></span>
    </div>
  </div>
</template>

<style scoped>
.draggable-events {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.fc-event {
  background-color: #007bff;
  color: white;
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-align: left;
}
</style>
