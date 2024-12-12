<template>
  <div v-if="visible" class="modal-container">
    <div class="modal-content">
      <!-- Titre du modal -->
      <div class="modal-header">
        <h2 class="modal-title">Détails et Modification de la Session</h2>
      </div>

      <!-- Contenu du formulaire -->
      <div class="modal-body">
        <div class="form-group">
          <label for="className">Classe</label>
          <select id="className" v-model="className" class="input">
            <option v-for="cls in classes" :key="cls._id" :value="cls.name">{{ cls.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="course">Cours</label>
          <select id="course" v-model="course" class="input">
            <option v-for="c in courses" :key="c._id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>


        <div class="form-group">
          <label for="teacher">Professeur</label>
          <select id="teacher" v-model="teacher" class="input">
            <option v-for="teacher in teachers" :key="teacher._id" :value="`${teacher.firstname} ${teacher.lastname}`">
              {{ teacher.firstname }} {{ teacher.lastname }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="classRoom">Salle de classe</label>
          <select id="classRoom" v-model="classRoom" class="input">
            <option v-for="room in classRooms" :key="room" :value="room">{{ room }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="start">Heure de début</label>
          <input type="datetime-local" id="start" v-model="start" class="input" />
        </div>

        <div class="form-group">
          <label for="end">Heure de fin</label>
          <input type="datetime-local" id="end" v-model="end" class="input" />
        </div>
      </div>

      <!-- Pied de page avec les boutons -->
      <div class="modal-footer">
        <button @click="deleteSession" class="btn btn-delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon-delete">
            <path d="M19 7H5v12a2 2 0 002 2h10a2 2 0 002-2V7z" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M10 11v6M14 11v6M15 4h-6v2h6z" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
          Supprimer
        </button>

        <div class="footer-actions">
          <button @click="closeModal" class="btn btn-cancel">Annuler</button>
          <button @click="updateSession" class="btn btn-save">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;

export default {
  name: "ScheduleModal",
  props: {
    visible: Boolean,
    session: Object,
    teachers: Array,
    classRooms: Array,
    classes: Array,
    courses: Array, // Ajout de la prop courses
  },
  emits: ["close", "update", "delete"],
  setup(props, { emit }) {
    const course = ref("");
    const teacher = ref("");
    const classRoom = ref("");
    const className = ref("");
    const start = ref("");
    const end = ref("");

    watch(
      () => props.session,
      (newSession) => {
        if (newSession) {
          const titleParts = newSession.title.split("<br>");
          className.value = titleParts[0].replace("Classe: ", "") || "";
          course.value = titleParts[1].replace("Cours: ", "") || "";
          teacher.value = titleParts[2].replace("Prof: ", "") || "";
          classRoom.value = titleParts[3].replace("Salle: ", "") || "";
          start.value = formatDateTime(newSession.start);
          end.value = formatDateTime(newSession.end);
        }
      },
      { immediate: true }
    );

    const updateSession = async () => {
      if (!course.value || !teacher.value || !classRoom.value || !className.value || !start.value || !end.value) {
        alert("Tous les champs obligatoires doivent être remplis !");
        return;
      }

      const updatedSession = {
        subjectId: props.courses.find((c) => c.name === course.value)?._id || null,
        teacherId: props.teachers.find((t) => `${t.firstname} ${t.lastname}` === teacher.value)?._id || null,
        classId: props.classes.find((cls) => cls.name === className.value)?._id || null,
        startTime: start.value,
        endTime: end.value,
        classRoom: classRoom.value,
        status: props.session.status, 
      };

      try {
        await axios.put(`${BASE_URL}/api/courses/${props.session.id}`, updatedSession);
        alert("Session mise à jour avec succès !");
        emit("update", props.session.id); // Informer le parent
        closeModal(); // Fermer la modal
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la session :", error);
        alert("Une erreur est survenue lors de la mise à jour de la session.");
      }
  };


    const closeModal = () => {
      emit("close");
    };

    const deleteSession = async () => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
        try {
          await axios.delete(`${BASE_URL}/api/courses/${props.session._id}`);
          emit("delete", props.session._id);
          alert("Session supprimée avec succès !");
          closeModal();
        } catch (error) {
          console.error("Erreur lors de la suppression de la session :", error);
          alert("Une erreur est survenue lors de la suppression de la session.");
        }
      }
    };

    return {
      course,
      teacher,
      classRoom,
      className,
      start,
      end,
      updateSession,
      closeModal,
      deleteSession,
    };
  },
};

function formatDateTime(date) {
  if (!date) return "";
  const isoString = new Date(date).toISOString();
  return isoString.slice(0, 16);
}
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 450px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

.input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background-color: black;
  color: white;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #ccc;
  color: #333;
}

.btn-delete {
  background-color: white;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-delete {
  width: 20px;
  height: 20px;
}
</style>
