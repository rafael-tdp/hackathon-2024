<template>
    <div v-if="visible" class="modal-container">
      <div class="modal-content">
        <fieldset>
          <legend>Détails de la Session</legend>
          <b>Titre :</b> {{ session.title }} <br />
          <b>Début :</b> {{ session.start }} <br />
          <b>Fin :</b> {{ session.end }} <br />
          <b>ID :</b> {{ session.id }} <br />
        </fieldset>
  
        <fieldset>
          <legend>Modifier la Session</legend>
          <input
            type="text"
            v-model="title"
            placeholder="Titre de la session"
            class="input"
          />
          <input type="datetime-local" v-model="start" class="input" />
          <input type="datetime-local" v-model="end" class="input" />
          <div class="actions">
            <button @click="updateSession" class="btn btn-save">Enregistrer</button>
            <button @click="closeModal" class="btn btn-cancel">Annuler</button>
          </div>
        </fieldset>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  
  export default {
    name: "ScheduleModal",
    props: {
      visible: Boolean, // Contrôle la visibilité
      session: Object, // Détails de la session
    },
    emits: ["close", "update"], // Déclare les événements émis
    setup(props, { emit }) {
      const title = ref("");
      const start = ref("");
      const end = ref("");
  
      // Initialiser les champs lors du montage
      onMounted(() => {
        title.value = props.session.title || "";
        start.value = formatDateTime(props.session.start);
        end.value = formatDateTime(props.session.end);
      });
  
      // Mettre à jour la session
      const updateSession = () => {
        if (!title.value || !start.value || !end.value) {
          alert("Tous les champs sont requis !");
          return;
        }
        emit("update", {
          id: props.session.id,
          title: title.value,
          start: start.value,
          end: end.value,
        });
      };
  
      // Fermer le modal
      const closeModal = () => {
        emit("close");
      };
  
      return {
        title,
        start,
        end,
        updateSession,
        closeModal,
      };
    },
  };
  
  function formatDateTime(date) {
    if (!date) return "";
    const isoString = new Date(date).toISOString();
    return isoString.slice(0, 16); // Format YYYY-MM-DDTHH:mm
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
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .input {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  
  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-save {
    background-color: #4caf50;
    color: white;
  }
  
  .btn-cancel {
    background-color: #f44336;
    color: white;
  }
  </style>
  