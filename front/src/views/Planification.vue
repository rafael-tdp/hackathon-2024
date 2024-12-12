<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import AdvancedCalendar from "../components/Calendar.vue";
import ScheduleModal from "../components/ScheduleModal.vue";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import EventFilters from "../components/EventFilters.vue";

const BASE_URL = import.meta.env.VITE_API_URL;

export default {
  name: "Planification",
  components: {
    AdvancedCalendar,
    ScheduleModal,
    LayoutAuthenticated,
    EventFilters,
  },
  setup() {
    const isModalVisible = ref(false);
    const selectedEvent = ref(null);
    const events = ref([]);
    const filteredEvents = ref([]);
    const showWeekends = ref(true);
    const teachers = ref([]);
    const classRooms = ref([]);
    const classes = ref([]);
    const courses = ref([]);
    const statuses = ref([]);
    const selectedFilters = ref({});

    const fetchEvents = async () => {
      try {
        const [coursesResponse, subjectsResponse, usersResponse, classesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/courses`),
          axios.get(`${BASE_URL}/api/subjects`),
          axios.get(`${BASE_URL}/api/users`),
          axios.get(`${BASE_URL}/api/schoolClasses`),
        ]);

        const coursesData = coursesResponse.data;
        const subjects = subjectsResponse.data;
        const users = usersResponse.data.filter((user) => user.role === "teacher");
        const classesData = classesResponse.data;

        const subjectsMap = new Map(subjects.map((subject) => [subject._id, subject.name]));
        const usersMap = new Map(users.map((user) => [user._id, `${user.firstname} ${user.lastname}`]));
        const classesMap = new Map(classesData.map((cls) => [cls._id, cls.name]));

        events.value = coursesData.map((course) => {
          const subjectName = subjectsMap.get(course.subjectId) || "Inconnu";
          const teacherName = usersMap.get(course.teacherId) || "Professeur inconnu";
          const className = classesMap.get(course.classId) || "Classe inconnue";

          return {
            id: course._id,
            title: `Classe: ${className}<br>Cours: ${subjectName}<br>Prof: ${teacherName}<br>Salle: ${course.classRoom}`,
            start: course.startTime,
            end: course.endTime,
            classRoom: course.classRoom,
            teacher: teacherName,
            subject: subjectName,
            className: className,
            status: course.status,
          };
        });

        teachers.value = users;
        classRooms.value = [...new Set(coursesData.map((course) => course.classRoom))];
        statuses.value = [...new Set(coursesData.map((course) => course.status))];
        classes.value = classesData;

        courses.value = subjects.map((subject) => ({
          _id: subject._id.$oid,
          name: subject.name,
        }));

        filterEvents(selectedFilters.value);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    const filterEvents = (filters) => {
      selectedFilters.value = filters;
      filteredEvents.value = events.value.filter((event) => {
        const matchesTeacher = !filters.teacherId || event.teacherId === filters.teacherId;
        const matchesClassRoom = !filters.classRoom || event.classRoom === filters.classRoom;
        const matchesClass = !filters.classId || event.classId === filters.classId;
        const matchesStatus = !filters.status || event.status === filters.status;
        return matchesTeacher && matchesClassRoom && matchesClass && matchesStatus;
      });
    };

    const addEvent = () => {
      const title = prompt("Titre de cours :");
      if (title) {
        events.value.push({
          id: Date.now(),
          title,
          start: new Date().toISOString().split("T")[0],
        });
        filterEvents(selectedFilters.value);
      }
    };

    const handleSelect = (arg) => {
      const title = prompt("Titre du cours :");
      if (title) {
        events.value.push({
          id: Date.now(),
          title,
          start: arg.startStr,
          end: arg.endStr,
          allDay: arg.allDay,
        });
        filterEvents(selectedFilters.value);
      }
    };

    const handleEventClick = (event) => {
      selectedEvent.value = {
        id: event.id,
        title: event.title,
        start: event.start.toISOString().slice(0, 16),
        end: event.end?.toISOString().slice(0, 16),
        classRoom: event.classRoom,
        teacher: event.teacher,
        className: event.className,
      };
      isModalVisible.value = true;
    };

    const updateEvent = (updatedEvent) => {
      const index = events.value.findIndex((e) => e.id === updatedEvent._id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...updatedEvent };
        filterEvents(selectedFilters.value); 
      }
      isModalVisible.value = false;
    };


    const handleDeleteEvent = (sessionId) => {
    events.value = events.value.filter(event => event.id !== sessionId);
    filterEvents(selectedFilters.value);
  };

    onMounted(() => {
      fetchEvents();
    });

    return {
      isModalVisible,
      selectedEvent,
      events,
      filteredEvents,
      showWeekends,
      teachers,
      classRooms,
      classes,
      courses,
      statuses,
      addEvent,
      handleSelect,
      handleEventClick,
      updateEvent,
      filterEvents,
      handleDeleteEvent,
      
    };
  },
};
</script>

<template>
  <LayoutAuthenticated>
    <div class="p-6 bg-gray-100 min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-700">Planification Académique</h1>
        <div class="flex items-center">
          <button
            @click="addEvent"
            class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ajouter un cours
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex justify-center items-center mb-6">
        <EventFilters
          :teachers="teachers"
          :classRooms="classRooms"
          :classes="classes"
          :statuses="statuses"
          @filter="filterEvents"
        />
      </div>

      <!-- Calendar -->
      <AdvancedCalendar
        :events="filteredEvents"
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
        :teachers="teachers"
        :classRooms="classRooms"
        :classes="classes"
        :courses="courses"
        @close="isModalVisible = false"
        @update="updateEvent"
        @delete="handleDeleteEvent"
      />
    </div>
  </LayoutAuthenticated>
</template>
