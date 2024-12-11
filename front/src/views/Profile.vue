<template>
    <LayoutAuthenticated>
      <!-- Conteneur principal avec flou si le modal est ouvert -->
      <div style="background-image: url('../assets/login.png');" :class="{'blurred-overlay': isModalVisible}">
        <div
        class="min-h-screen py-12 px-6 flex items-center justify-center">
            <!-- Titre de la section -->
            <div class="bg-white rounded-lg w-full max-w-md p-8 shadow-2xl transform transition-all duration-300">

<div class="flex justify-center items-center h-16 mb-6">
              <h2 class="text-3xl font-semibold text-gray-800">Mes informations</h2>
            </div>
  
            <!-- Informations de l'utilisateur -->
            <div class="space-y-6">
              <div v-for="(value, label) in userInfo" :key="label">
                <label :for="label" class="block text-sm font-medium text-gray-700">
                  {{ label }}
                </label>
                <p :id="label" class="mt-1 text-gray-900">{{ value }}</p>
              </div>
            </div>
  
            <!-- Bouton d'action -->
            <div class="mt-8 flex justify-end">
              <button
                @click="openEditModal"
                class="px-8 py-3 font-semibold rounded-full bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Modifier les informations
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de modification -->
      <Modal
        v-model:visible="isModalVisible"
        title="Modifier mon profil"
        :fields="profileFields"
        :onSubmit="updateProfile"
        :submitText="'Mettre à jour'"
        :entityData="user"
      />
    </LayoutAuthenticated>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
  import Modal from "@/components/Modal.vue";
  
  // Données simulées
  const user = ref({
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    role: "ADMIN",
    className: "Classe A",
  });
  
  // Champs du formulaire pour le modal
  const profileFields = [
    { name: "firstname", label: "Prénom", type: "text", required: true },
    { name: "lastname", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "role", label: "Rôle", type: "select", options: ["ADMIN", "TEACHER"], required: true },
    { name: "className", label: "Classe", type: "select", options: ["Classe A", "Classe B"], required: true },
  ];
  
  const userInfo = ref({
    Prénom: user.value.firstname,
    Nom: user.value.lastname,
    Email: user.value.email,
    Rôle: user.value.role,
    Classe: user.value.className,
  });
  
  // État du modal
  const isModalVisible = ref(false);
  
  // Ouvrir le modal
  const openEditModal = () => {
    isModalVisible.value = true;
  };
  
  // Mise à jour du profil
  const updateProfile = (formData) => {
    user.value = { ...formData };
    userInfo.value = {
      Prénom: user.value.firstname,
      Nom: user.value.lastname,
      Email: user.value.email,
      Rôle: user.value.role,
      Classe: user.value.className,
    };
    isModalVisible.value = false;
  };
  </script>
  
  <style scoped>
  .blurred-overlay {
    filter: blur(0.5px);
    transition: filter 0.3s ease-in-out;
  }
  
  .modal {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .shadow-2xl {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 6px 6px rgba(0, 0, 0, 0.15);
  }
  
  button:hover {
    transition: background-color 0.3s ease-in-out;
  }
  
  button:focus {
    outline: none;
    ring: 2px solid #000;
  }
  </style>