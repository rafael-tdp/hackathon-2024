<script setup>
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline"; // Exemple d'icône pour le logo
</script>

<template>
	<LayoutAuthenticated>
		<div class="home h-screen flex flex-col items-center justify-center">
			<div class="w-full max-w-4xl mx-auto text-center mb-8">
				<h1 class="text-4xl font-bold text-gray-800 mb-4">Bienvenue</h1>
				<p class="text-lg text-gray-600">Planifiez et organisez efficacement les emplois du temps de D.Code</p>
			</div>

			<div class="stats grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl text-center mb-8">
				<div class="stat bg-white shadow-md p-6 rounded-lg">
					<h2 class="text-2xl font-bold text-gray-800">250</h2>
					<p class="text-gray-600">Cours planifiés</p>
				</div>
				<div class="stat bg-white shadow-md p-6 rounded-lg">
					<h2 class="text-2xl font-bold text-gray-800">30</h2>
					<p class="text-gray-600">Enseignants actifs</p>
				</div>
				<div class="stat bg-white shadow-md p-6 rounded-lg">
					<h2 class="text-2xl font-bold text-gray-800">500</h2>
					<p class="text-gray-600">Étudiants inscrits</p>
				</div>
			</div>

			<div class="actions flex gap-4">
				<!-- Bouton avec logo, police et styles -->
				<button class="px-6 py-3 font-bold text-green-700 flex items-center gap-2 rounded-lg shadow-md hover:bg-primary/20">
					<CalendarIcon class="h-5 w-5 text-gray-900" /> <!-- Icône -->
					Créer un emploi du temps
				</button>
				<button class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300">
					Consulter les cours
				</button>
			</div>
		</div>
	</LayoutAuthenticated>
</template>
