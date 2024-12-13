<template>
	<div class="filters w-full flex justify-between items-center">
		<div class="flex w-full items-center text-xs text-gray-600 space-x-4">
			<select
				id="teacherFilter"
				v-model="selectedTeacher"
				@change="applyFilters"
				class="p-2 border rounded border-1 shadow-sm rounded-md custom-select"
			>
				<option value="">Tous les professeurs</option>
				<option
					v-for="teacher in teachers"
					:key="teacher._id"
					:value="teacher._id"
				>
					{{ teacher.firstname }} {{ teacher.lastname }}
				</option>
			</select>

			<select
				id="classRoomFilter"
				v-model="selectedClassRoom"
				@change="applyFilters"
				class="p-2 border rounded border-1 shadow-sm rounded-md custom-select"
			>
				<option value="">Toutes les salles</option>
				<option
					v-for="room in classRooms"
					:key="room._id"
					:value="room._id"
				>
					{{ room.name }}
				</option>
			</select>

			<select
				id="classFilter"
				v-model="selectedClass"
				@change="applyFilters"
				class="p-2 border rounded border-1 shadow-sm rounded-md custom-select"
			>
				<option value="">Toutes les classes</option>
				<option v-for="cls in classes" :key="cls._id" :value="cls._id">
					{{ cls.name }}
				</option>
			</select>

			<select
				id="statusFilter"
				v-model="selectedStatus"
				@change="applyFilters"
				class="p-2 border rounded border-1 shadow-sm rounded-md custom-select"
			>
				<option value="">Tous les statuts</option>
				<option
					v-for="status in statusList"
					:key="status"
					:value="status"
				>
					{{ status }}
				</option>
			</select>

			<button
				@click="resetFilters"
				class="px-4 py-2 bg-transparent rounded rounded-md text-gray-600 border border-gray-200 hover:bg-gray-100 border-dashed"
			>
				Réinitialiser
			</button>
			<button
				@click="generateCourses"
				class="ml-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 px-4 py-2 bg-primary rounded rounded-md text-white text-xs"
				:disabled="!selectedTeacher"
				:title="
					!selectedTeacher
						? 'Veuillez sélectionner un professeur pour générer les cours'
						: ''
				"
			>
				Générer les cours
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";

// Props
const props = defineProps({
	teachers: Array,
	classRooms: Array,
	classes: Array,
	statusList: Array,
});

// Emits
const emit = defineEmits(["filter", "generateCourses"]);

// Reactive variables
const selectedTeacher = ref("");
const selectedClassRoom = ref("");
const selectedClass = ref("");
const selectedStatus = ref("");

// Apply filters
const applyFilters = () => {
	emit("filter", {
		teacherId: selectedTeacher.value,
		classRoom: selectedClassRoom.value,
		classId: selectedClass.value,
		status: selectedStatus.value,
	});
};

const generateCourses = () => {
	emit("generateCourses");
};

// Reset filters
const resetFilters = () => {
	selectedTeacher.value = "";
	selectedClassRoom.value = "";
	selectedClass.value = "";
	selectedStatus.value = "";
	applyFilters(); // Apply the reset filter
};

// Watchers
watch(
	[selectedTeacher, selectedClassRoom, selectedClass, selectedStatus],
	applyFilters
);
</script>

<style scoped>
.custom-select {
	padding-right: 2rem; /* Ajustez la valeur pour plus d'espace */
	background: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"%3E%3Cpolyline points="6 9 12 15 18 9"%3E%3C/polyline%3E%3C/svg%3E')
		no-repeat;
	background-position: right 0.5rem center;
	background-size: 1rem; /* Taille de la flèche */
	appearance: none; /* Supprime l'apparence par défaut */
}
</style>
