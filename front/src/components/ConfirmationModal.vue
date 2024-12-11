<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50"
  >
    <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800">{{ title }}</h3>
        <p class="text-sm text-gray-500 mt-2">{{ message }}</p>
      </div>
      <div class="flex justify-center space-x-4">
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
        >
          Annuler
        </button>
        <button
          @click="confirmAction"
          class="px-8 py-3 font-semibold rounded-full bg-black text-white w-full sm:w-auto"
        >
          Oui
        </button>
      
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  onConfirm: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

const closeModal = () => {
  emit("update:visible", false);
};

const confirmAction = () => {
  props.onConfirm(); // Appel de la fonction onConfirm passée en prop
  closeModal();
};
</script>

<style scoped>
/* Ajoutez des styles personnalisés pour la modal si nécessaire */
</style>
