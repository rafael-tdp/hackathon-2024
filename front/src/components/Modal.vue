<template>
  <div
    v-if="visible"
    class="bg-white fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-70 z-50 backdrop-blur-lg transition-all duration-300"
  >
    <div
      class="bg-white rounded-lg w-full max-w-lg p-8 shadow-2xl transform transition-all duration-300 scale-95 opacity-0"
      :class="{ 'scale-100 opacity-100': visible }"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-semibold text-gray-800">{{ title }}</h3>
        <button
          @click="closeModal"
          class="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
  
      <form @submit.prevent="submitForm">
        <div v-for="(field, index) in fields" :key="index" class="mb-6">
          <label :for="field.name" class="block text-gray-700 font-medium">{{ field.label }}</label>
          <div class="relative mt-2">
            <input
              v-if="field.type === 'text'"
              v-model="formData[field.name]"
              :type="field.type"
              :name="field.name"
              :placeholder="field.placeholder"
              class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              :required="field.required"
            />
            <textarea
              v-if="field.type === 'textarea'"
              v-model="formData[field.name]"
              :name="field.name"
              :placeholder="field.placeholder"
              class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              :required="field.required"
            />
            <select
              v-if="field.type === 'select'"
              v-model="formData[field.name]"
              :name="field.name"
              class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              :required="field.required"
            >
              <option v-for="(option, idx) in field.options" :key="idx" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </div>
  
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="closeModal"
            class="px-6 py-3 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-8 py-3 font-semibold rounded-full bg-black text-white w-full sm:w-auto"
          >
            {{ submitText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// Props passés depuis le parent
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  submitText: {
    type: String,
    default: "Créer",
  },
  onSubmit: {
    type: Function,
    required: true,
  },
  entityData: {
    type: Object,
    default: () => ({})
  },
});

// Emission pour la mise à jour de la visibilité de la modal
const emit = defineEmits(["update:visible"]);

// Données du formulaire
const formData = ref({ ...props.entityData });

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    formData.value = { ...props.entityData }; // Réinitialiser ou pré-remplir les données en fonction de l'entité
  }
});

const closeModal = () => {
  emit("update:visible", false);
};

const submitForm = () => {
  props.onSubmit(formData.value);
  closeModal();
};
</script>

<style scoped>
/* Effet de transition pour la modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Animation du fond avec un flou plus prononcé */
.backdrop-blur-lg {
  backdrop-filter: blur(8px); /* Augmenter le flou */
}

/* Ombre plus forte autour de la modal */
.shadow-2xl {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3), 0 5px 5px rgba(0, 0, 0, 0.1);
}
</style>
