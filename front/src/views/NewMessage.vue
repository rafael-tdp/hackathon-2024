<script setup>
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue"; // Import du layout
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const newMessage = ref({
  recipientId: '',
  subject: '',
  content: '',
});
const userId = '675aba2fd62687635aec577d'; // Remplacer par l'ID de l'utilisateur connecté
const error = ref('');
const professors = ref([]); // Liste des professeurs
const router = useRouter();

// Récupérer la liste des professeurs (utilisateurs avec le rôle 'teacher')
const fetchProfessors = async () => {
  try {
    const response = await axios.get('/api/professors'); // Appel à l'API pour récupérer les professeurs
    professors.value = response.data.map((professor) => ({
      _id: professor._id, // L'ID de l'utilisateur
      name: `${professor.firstname} ${professor.lastname}`, // Nom complet du professeur
      email: professor.email, // Ajout de l'email du professeur
    }));
  } catch (err) {
    error.value = 'Erreur lors de la récupération des professeurs';
  }
};

// Fonction pour envoyer le message
const sendMessage = async () => {
  if (!newMessage.value.recipientId) {
    error.value = 'Veuillez sélectionner un destinataire.';
    return;
  }

  try {
    const response = await axios.post('/api/emails/send', {
      senderId: userId,
      recipientId: newMessage.value.recipientId,
      subject: newMessage.value.subject,
      content: newMessage.value.content,
    });
    router.push('/inbox'); // Rediriger vers la boîte de réception après l'envoi
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'envoi du message';
  }
};

// Charger les professeurs au montage
onMounted(fetchProfessors);
</script>

<template>
  <LayoutAuthenticated>
    <div class="new-message p-6">
      <h2 class="text-2xl font-bold mb-4">Envoyer un nouveau message</h2>

      <!-- Affichage des erreurs -->
      <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

      <!-- Formulaire d'envoi de message -->
      <form @submit.prevent="sendMessage">
        <!-- Liste déroulante des destinataires (professeurs) -->
        <div class="mb-4">
          <label for="recipient" class="block text-sm font-medium text-gray-700">Destinataire</label>
          <select 
            v-model="newMessage.recipientId" 
            id="recipient" 
            class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700" 
            required>
            <option value="" disabled selected>Choisissez un professeur</option>
            <option v-for="professor in professors" :key="professor._id" :value="professor._id">
              {{ professor.name }}
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label for="subject" class="block text-sm font-medium text-gray-700">Sujet</label>
          <input v-model="newMessage.subject" type="text" id="subject" placeholder="Sujet" class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700" required />
        </div>

        <div class="mb-4">
          <label for="content" class="block text-sm font-medium text-gray-700">Contenu</label>
          <textarea v-model="newMessage.content" id="content" placeholder="Votre message" class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700" required></textarea>
        </div>

        <button type="submit" class="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700">Envoyer</button>
      </form>
    </div>
  </LayoutAuthenticated>
</template>

<style scoped>
.new-message {
  padding: 20px;
}
.error {
  color: red;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input, textarea, select {
  padding: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
