<script setup>
import axios from "axios";
import { ref, reactive } from "vue";
import { z } from "zod";
import { useRouter } from "vue-router";
// import axiosInstance from "@/utils/axiosInstance";
import { showToast } from "@/utils/toast";

const router = useRouter();

const emailSchema = z
    .string()
    .min(5, { message: "5 caractères minimum" })
    .max(30, { message: "30 caractères maximum" })
    .email({ message: "Email invalide" });

const passwordSchema = z
    .string()
    .regex(/[a-z]/, { message: "Lettre minuscule manquante" })
    .regex(/[A-Z]/, { message: "Lettre majuscule manquante" })
    .regex(/\d/, { message: "Chiffre manquant" })
    .regex(/[^a-zA-Z0-9]/, { message: "Symbole manquant" })
    .min(12, { message: "13 caractères minimum" });

const state = reactive({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    emailAddress: ref(""),
    password: ref(""),
    errors: {},
});

const register = async () => {
    const parsedEmail = emailSchema.safeParse(state.emailAddress);
    if (!parsedEmail.success) {
        state.errors.emailAddress = parsedEmail.error.issues[0].message;
    }

    // Validation du mot de passe
    const parsedPassword = passwordSchema.safeParse(state.password);
    if (!parsedPassword.success) {
        state.errors.password = parsedPassword.error.issues[0].message;
    }

    if (
        !state.lastName ||
        !state.firstName ||
        !state.dateOfBirth ||
        !state.emailAddress ||
        !state.password
    ) {
        state.errors.message = "Tous les champs sont obligatoires.";
        return;
    }

    // Vérifications supplémentaires
    if (!validateName(state.firstName) || !validateName(state.lastName)) {
        state.errors.message =
            "Le nom et le prénom ne doivent pas contenir de chiffres ou de caractères spéciaux.";
        return;
    }

    try {
        // const response = await axiosInstance.post(`/auth/register`, state);
        // router.push("/login");
        showToast(
            "Votre compte a été crée avec succès, veuillez consulter votre email pour activer votre compte "
        );
    } catch (e) {
        console.error(
            "Erreur lors de la création de l'utilisateur:",
            e.response.data
        );
        state.errors.message =
            "Une erreur est survenue lors de la création de l'utilisateur.";
    }
};

const validateName = (name) => {
    // Vérifier que le nom et le prénom ne contiennent pas de chiffres ou de caractères spéciaux
    const regex = /^[a-zA-Z]+$/;
    return regex.test(name);
};
</script>

<style scoped>
.error {
    color: red;
    display: block;
    padding-left: 20px;
}

</style>

<template>
    <div class="flex flex-col md:flex-row min-h-screen bg-white">
        <!-- Section Image -->
        <div class="hidden md:block w-1/2 bg-black">
            <img src="../assets/login.png" alt="Image de connexion" class="object-cover w-full h-full" />
        </div>
      
        <!-- Section Formulaire -->
        <div class="w-full flex items-center justify-center bg-gray-100 py-12 px-6">
            <div class="w-full sm:w-4/5 md:w-1/2 lg:w-1/3 max-w-md p-6 rounded-md bg-white shadow-xl relative z-10 min-w-[435px]">
                <div class="mb-8 text-center">
                    <h1 class="my-3 text-4xl font-bold">Inscription</h1>
                    <p class="text-sm text-gray-500">Inscrivez-vous pour accéder à notre site</p>
                </div>
                <form novalidate class="space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label for="firstName" class="block mb-2 text-sm text-gray-700">Nom</label>
                            <input
                                v-model="state.firstName"
                                type="text"
                                name="firstName"
                                id="firstName"
                                placeholder="Votre nom"
                                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label for="lastName" class="block mb-2 text-sm text-gray-700">Prénom</label>
                            <input
                                v-model="state.lastName"
                                type="text"
                                name="lastName"
                                id="lastName"
                                placeholder="Votre prénom"
                                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label for="dateOfBirth" class="block mb-2 text-sm text-gray-700">Date de naissance</label>
                            <input
                                v-model="state.dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                id="dateOfBirth"
                                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label for="email" class="block mb-2 text-sm text-gray-700">Adresse email</label>
                            <input
                                v-model="state.emailAddress"
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Votre adresse email"
                                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
                            />
                            <small v-if="state.errors.emailAddress" class="error">{{ state.errors.emailAddress }}</small>
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm text-gray-700">Mot de passe</label>
                            <input
                                v-model="state.password"
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Votre mot de passe"
                                class="w-full px-4 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700"
                            />
                            <small v-if="state.errors.password" class="error">{{ state.errors.password }}</small>
                        </div>
                    </div>
                    <div class="space-y-2 bg-black">
                        <button
                            @click.prevent="register"
                            class="w-full px-8 py-3 font-semibold rounded-md border-4 border-black bg-black text-white"
                        >
                            Inscription
                        </button>
                    </div>
                    <p class="px-6 text-sm text-center text-gray-500">
                        Vous avez déjà un compte ?
                        <a href="/login" class="hover:underline text-black">Connectez-vous</a>.
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>
