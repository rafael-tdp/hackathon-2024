<script setup>
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue"; // Import du layout
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const messages = ref([]);
const error = ref(null);
const router = useRouter();
const userId = '675aba2fd62687635aec577d'; // Remplacer par l'ID de l'utilisateur connecté

// Fonction pour récupérer les messages depuis l'API
const fetchMessages = async () => {
  try {
    const response = await axios.get(`/api/emails/inbox/${userId}`);
    console.log(response.data); // Vérifie la réponse de l'API
    messages.value = response.data.data; // Stocker les messages dans la variable
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de récupération des messages';
    console.error(err); // Afficher l'erreur dans la console pour le debug
  }
};

onMounted(() => {
  fetchMessages();
});

// Fonction pour afficher les détails d'un message
const viewMessage = (messageId) => {
  router.push(`/messages/${messageId}`);
};
</script>

<template>
  <LayoutAuthenticated>
    <div class="inbox flex justify-center items-center min-h-screen bg-gray-100 py-6">
      <div class="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4 text-center">Boîte de réception</h2>
        
        <!-- Affichage des erreurs -->
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
        
        <!-- Tableau des messages -->
        <table class="min-w-full table-auto bg-white border-collapse">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="message in messages" :key="message._id" @click="viewMessage(message._id)" class="cursor-pointer hover:bg-gray-100 border-b">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ message.subject }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ message.content.slice(0, 50) }}...</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(message.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Bouton pour envoyer un message -->
        <button @click="router.push('/new-message')" class="mt-6 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 w-full">
          Envoyer un message
        </button>
      </div>
    </div>
  </LayoutAuthenticated>
</template>

<style scoped>
.inbox {
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
th {
  background-color: #f3f4f6;
  color: #4b5563;
}
tr:hover {
  background-color: #f9fafb;
}
button {
  margin-top: 20px;
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
