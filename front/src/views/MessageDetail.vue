<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const message = ref(null);
const error = ref(null);
const route = useRoute();

// Récupérer le message en fonction de l'ID passé dans l'URL
const fetchMessage = async () => {
  try {
    const response = await axios.get(`/api/emails/${route.params.id}`);
    message.value = response.data.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de récupération du message';
  }
};

onMounted(() => {
  fetchMessage();
});
</script>

<template>
  <div class="message-detail">
    <h2>Message</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="message">
      <p><strong>De :</strong> {{ message.sender.firstname }} {{ message.sender.lastname }}</p>
      <p><strong>Sujet :</strong> {{ message.subject }}</p>
      <p><strong>Contenu :</strong> {{ message.content }}</p>
      <p><strong>Date :</strong> {{ new Date(message.createdAt).toLocaleString() }}</p>
    </div>
  </div>
</template>

<style scoped>
.message-detail {
  padding: 20px;
}
.error {
  color: red;
}
</style>
