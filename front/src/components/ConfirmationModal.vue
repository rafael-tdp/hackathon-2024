<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-70 z-50 backdrop-blur-lg transition-all duration-300"
  >
    <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl transform transition-all duration-300 scale-95 opacity-0" :class="{ 'scale-100 opacity-100': visible }">
      <!-- Header avec le titre et le bouton "X" -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800">{{ title }}</h3>
        <button
          @click="closeModal"
          class="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="text-center mb-6">
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
  props.onConfirm();
  closeModal();
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.backdrop-blur-lg {
  backdrop-filter: blur(8px); /* Augmenter le flou */
}

/* Ombre foncée autour de la modal */
.shadow-2xl {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
