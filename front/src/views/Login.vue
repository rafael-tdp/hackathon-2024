<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
// import { useMainStore } from "@/stores/main";
import { showToast } from "@/utils/toast";

const BASE_URL = "http://localhost:3002";

const form = reactive({
    email: "",
    password: "",
});
const state = reactive({
    error: "",
});

const router = useRouter();

const login = async () => {
    try {
        const response = await axios({
            baseURL: BASE_URL,
            method: "POST",
            url: "/auth/login",
            data: {
                email: form.email,
                password: form.password,
            },
        });
      //  localStorage.setItem("token", response.data.token);
        //useMainStore().setUser(response.data.user);
        router.push("/test");
    } catch (err) {
        console.error("Error during login:", err);
        const errorMessage = err.response?.data?.message || "Erreur inconnue";
        showToast(errorMessage);
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray900">
        <div
            class="w-full max-w-md p-6 rounded-md sm:p-10 bg-gray900 text-gray100"
        >
            <div class="mb-8 text-center">
                <h1 class="my-3 text-4xl font-bold">Se connecter</h1>
                <p class="text-sm text-gray-400">
                    Connectez-vous pour accéder à votre compte
                </p>
            </div>
            <form novalidate="" action="" class="space-y-12">
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block mb-2 text-sm"
                            >Adresse email</label
                        >
                        <input
                            v-model="form.email"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="leroy@jenkins.com"
                            class="w-full px-3 py-2 border rounded-md border-gray700 bg-gray900 text-gray100"
                        />
                    </div>
                    <div>
                        <div class="flex justify-between mb-2">
                            <label for="password" class="text-sm"
                                >Mot de passe</label
                            >
                            <a
                                rel="noopener noreferrer"
                                href="/reset-password"
                                class="text-xs hover:underline text-gray400"
                                >Mot de passe oublié?</a
                            >
                        </div>
                        <input
                            v-model="form.password"
                            type="password"
                            name="password"
                            id="password"
                            placeholder="*****"
                            class="w-full px-3 py-2 border rounded-md border-gray700 bg-gray900 text-gray100"
                        />
                    </div>
                </div>
                <div class="space-y-2">
                    <div>
                        <button
                            @click.prevent="login"
                            type="button"
                            class="w-full px-8 py-3 font-semibold rounded-md bg-purple500 text-gray900"
                        >
                            Connexion
                        </button>
                    </div>
                    <p class="px-6 text-sm text-center text-gray400">
                        Vous n'avez pas de compte?
                        <a
                            rel="noopener noreferrer"
                            href="inscription"
                            class="hover:underline text-purple500"
                            >Inscrivez-vous</a
                        >.
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>