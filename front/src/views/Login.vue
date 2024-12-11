<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useMainStore } from "@/stores/main";
import { showToast } from "@/utils/toast";


const form = reactive({
  email: "",
  password: "",
});
const state = reactive({
  error: "",
});

const router = useRouter();
const BASE_URL = import.meta.env.VITE_API_URL;

const login = async () => {
  try {
    const response = await axios({
      baseURL: BASE_URL,
      method: "POST",
      url: "/api/auth/login",
      data: {
        email: form.email,
        password: form.password,
      },
    });
    localStorage.setItem("token", response.data.token);
    useMainStore().setUser(response.data.user);
    router.push("/test");
  } catch (err) {
    console.error("Error during login:", err);
    const errorMessage = err.response?.data?.message || "Erreur inconnue";
    showToast(errorMessage);
  }
};
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-white">
    <!-- Section Image -->
    <div class="hidden md:block w-1/2 bg-black">
      <img
        src="../assets/login.png"
        alt="Image de connexion"
        class="object-cover w-full h-full"
      />
    </div>

    <!-- Section Formulaire -->
    <div class="w-full flex items-center justify-center bg-gray-100 py-12 px-6">
      <div class="w-full sm:w-4/5 md:w-1/2 lg:w-1/3 max-w-md p-6 rounded-md bg-white shadow-xl h-[500px] relative z-10 min-w-[435px]">
        <div class="mb-8 text-center">
          <h1 class="my-3 text-4xl font-bold text-black">Se connecter</h1>
          <p class="text-sm text-gray-500">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        <form novalidate class="space-y-6">
          <div class="space-y-4">
            <div>
              <label for="email" class="block mb-2 text-sm text-gray-700">
                Adresse email
              </label>
              <input
                v-model="form.email"
                type="email"
                name="email"
                id="email"
                placeholder="leroy@jenkins.com"
                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <label for="password" class="text-sm text-gray-700">
                  Mot de passe
                </label>
              </div>
              <input
                v-model="form.password"
                type="password"
                name="password"
                id="password"
                placeholder="*****"
                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          <!-- Centrer le bouton -->
          <div class="flex justify-center mt-6">
            <button
              @click.prevent="login"
              type="button"
              class="px-8 py-3 font-semibold rounded-full bg-black text-white w-full sm:w-auto"
            >
              Connexion
            </button>
          </div>

          <p class="px-6 text-sm text-center text-gray-500">
            Vous n'avez pas de compte ?
            <a
              rel="noopener noreferrer"
              href="/register"
              class="hover:underline text-black"
              >Inscrivez-vous</a
            >.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

  