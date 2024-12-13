<script setup>
import { reactive, onMounted, ref, watch } from "vue";
import axios from "axios";
import AdvancedCalendar from "../components/Calendar.vue";
import ScheduleModal from "../components/ScheduleModal.vue";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import EventFilters from "../components/EventFilters.vue";
import NewItemButton from "../components/NewItemButton.vue";
import PageTitle from "../components/PageTitle.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import DraggableEvents from "../components/DraggableEvents.vue";

const BASE_URL = import.meta.env.VITE_API_URL;

// Déclaration de l'état global
const state = reactive({
	isModalVisible: false,
	selectedEvent: null,
	events: [],
	showWeekends: true,
	teachers: [],
	classRooms: [],
	schoolClasses: [],
	status: [],
	selectedFilters: {},
	generatedCourses: [],
});

// Variables réactives pour les filtres
const teachers = ref([]);
const classRooms = ref([]);
const schoolClasses = ref([]);
const status = ref([]);
const subjects = ref([]);
const isValidationModalVisible = ref(false);
const isLoading = ref(false);

const validateGeneratedCourses = async () => {
	try {
		await axios.post(
			`${BASE_URL}/api/courses/validation`,
			state.generatedCourses
		);
		alert("Les cours générés ont été validés avec succès !");
		isValidationModalVisible.value = false;
		state.generatedCourses = []; // Optionnel : Réinitialiser les cours générés après validation
	} catch (error) {
		console.error("Erreur lors de la validation des cours :", error);
		alert("Une erreur s'est produite lors de la validation.");
	}
};

// Surveillez les changements dans les cours générés
watch(
	() => state.generatedCourses,
	(newVal) => {
		if (newVal.length > 0) {
			isValidationModalVisible.value = true;
		}
	}
);

const fetchFilters = async () => {
	try {
		const [
			usersResponse,
			classRoomsResponse,
			schoolClassesResponse,
			subjectsResponse,
		] = await Promise.all([
			axios.get(`${BASE_URL}/api/users`),
			axios.get(`${BASE_URL}/api/rooms`),
			axios.get(`${BASE_URL}/api/schoolClasses`),
			axios.get(`${BASE_URL}/api/subjects`),
		]);

		teachers.value = usersResponse.data.data.filter(
			(user) => user.role === "teacher"
		);
		classRooms.value = classRoomsResponse.data.data;
		schoolClasses.value = schoolClassesResponse.data.data;
		subjects.value = subjectsResponse.data.data;

		const uniqueStatuses = new Set(
			state.events.map((event) => event.status)
		);
		status.value = Array.from(uniqueStatuses);
	} catch (error) {
		console.error("Erreur lors de la récupération des filtres :", error);
	}
};

const fetchEvents = async () => {
	try {
		const filters = {};

		if (
			state.selectedFilters.teacherId &&
			state.selectedFilters.teacherId !== ""
		) {
			filters.teacherId = state.selectedFilters.teacherId;
		}
		if (
			state.selectedFilters.classRoom &&
			state.selectedFilters.classRoom !== ""
		) {
			filters.classRoomId = state.selectedFilters.classRoom;
		}
		if (
			state.selectedFilters.classId &&
			state.selectedFilters.classId !== ""
		) {
			filters.schoolClassId = state.selectedFilters.classId;
		}
		if (
			state.selectedFilters.status &&
			state.selectedFilters.status !== ""
		) {
			filters.status = state.selectedFilters.status;
		}

		const response = await axios.get(`${BASE_URL}/api/courses/populated`, {
			params: filters,
		});

		const courses = response.data.data;

		state.events = courses.map((course) => {
			return {
				id: course._id,
				title: `Classe: ${
					course.schoolClass?.name || "Inconnue"
				}<br>Cours: ${course.subject?.name || "Inconnu"}<br>Prof: ${
					course.teacher?.firstname || "Professeur inconnu"
				} ${course.teacher?.lastname || ""}<br>Salle: ${
					course.classRoom?.name || "Non attribuée"
				}`,
				start: course.startTime,
				end: course.endTime,
				classRoom: course.classRoom,
				teacher: course.teacher,
				subject: course.subject,
				schoolClass: course.schoolClass,
				status: course.status,
				backgroundColor:
					course.status === "cancelled" ? "red" : "#4b866b",
				display: {
					backgroundColor:
						course.status === "cancelled" ? "red" : "green",
				},
			};
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des événements :", error);
	}
};

const enrichGeneratedCourse = (course) => {
	const schoolClass = schoolClasses.value.find(
		(c) => c._id === course.schoolClass.id
	);

	console.log(classRooms.value, course.classRoom);
	const classRoom = classRooms.value.find(
		(r) => r._id === course.classRoom.id
	);
	const teacher = teachers.value.find((t) => t._id === course.teacher.id);
	const subject = subjects.value.find((s) => s._id === course.subject.id);

	return {
		...course,
		schoolClass,
		classRoom,
		teacher,
		subject,
	};
};

const generateCourses = async () => {
	isLoading.value = true;
	try {
		const response = await axios.get(
			`${BASE_URL}/api/planning/${state.selectedFilters.teacherId}`
		);
		const rawGeneratedCourses = response.data.data.potentialWorkHours;

		// Enrichir les données des cours générés
		state.generatedCourses = rawGeneratedCourses.map(enrichGeneratedCourse);

		for (const course of state.generatedCourses) {
			const event = {
				id: "to-be-generated",
				title: `Classe: ${
					course.schoolClass?.name || "Inconnue"
				}<br>Cours: ${course.subject?.name || "Inconnu"}<br>Prof: ${
					course.teacher?.firstname || "Professeur inconnu"
				} ${course.teacher?.lastname || ""}<br>Salle: ${
					course.classRoom?.name || "Non attribuée"
				}`,
				start: course.startTime,
				end: course.endTime,
				classRoom: course.classRoom,
				teacher: course.teacher,
				subject: course.subject,
				schoolClass: course.schoolClass,
				status: course.status,
			};
			console.log(event);
		}

		// Ajouter les cours générés à la liste des événements
		state.events = [
			...state.events,
			...state.generatedCourses.map((course) => ({
				id: `generated-${Math.random().toString(36).substring(2)}`,
				title: `Classe: ${
					course.schoolClass?.name || "Inconnue"
				}<br>Cours: ${course.subject?.name || "Inconnu"}<br>Prof: ${
					course.teacher?.firstname || "Professeur inconnu"
				} ${course.teacher?.lastname || ""}<br>Salle: ${
					course.classRoom?.name || "Non attribuée"
				}`,
				start: course.startTime,
				end: course.endTime,
				classRoom: course.classRoom,
				teacher: course.teacher,
				subject: course.subject,
				schoolClass: course.schoolClass,
				status: course.status,
				backgroundColor:
					course.status === "cancelled" ? "red" : "#b8c130",
				display: {
					backgroundColor:
						course.status === "cancelled" ? "red" : "green",
				},
			})),
		];
	} catch (error) {
		console.error("Erreur lors de la génération des cours :", error);
		alert("Une erreur s'est produite lors de la génération des cours.");
	} finally {
		isLoading.value = false;
	}
};

const addEvent = () => {
	const title = prompt("Titre de cours :");
	if (title) {
		state.events.push({
			id: Date.now(),
			title,
			start: new Date().toISOString().split("T")[0],
		});
	}
};

const handleSelect = (arg) => {
	const title = prompt("Titre du cours :");
	if (title) {
		state.events.push({
			id: Date.now(),
			title,
			start: arg.startStr,
			end: arg.endStr,
			allDay: arg.allDay,
		});
	}
};

const handleEventClick = (event) => {
	state.selectedEvent = {
		id: event.id,
		title: event.title,
		start: event.start.toISOString().slice(0, 16),
		end: event.end?.toISOString().slice(0, 16),
		classRoom: event.classRoom,
		teacher: event.teacher,
		className: event.className,
	};
	state.isModalVisible = true;
};

const updateEvent = (updatedEvent) => {
	const index = state.events.findIndex((e) => e.id === updatedEvent._id);
	if (index !== -1) {
		state.events[index] = { ...state.events[index], ...updatedEvent };
	}
	state.isModalVisible = false;
};

const handleDeleteEvent = (sessionId) => {
	state.events = state.events.filter((event) => event.id !== sessionId);
};


onMounted(() => {
	fetchEvents().then(() => fetchFilters());
});
</script>

<template>
	<LayoutAuthenticated>
		<div class="min-h-screen py-12 px-6">
			<div class="flex justify-between items-center mb-8">
				<PageTitle text="Planification Académique" />
				<NewItemButton @click="addEvent" text="Ajouter un cours" />
			</div>
			<div class="mt-12 mb-10">
				<div
					class="flex justify-center items-center w-full text-sm text-gray-600 space-x-4"
				>
					<EventFilters
						:teachers="teachers"
						:classRooms="classRooms"
						:classes="schoolClasses"
						:statusList="status"
						@filter="
							(filters) => {
								state.selectedFilters = filters;
								fetchEvents();
							}
						"
						@generateCourses="generateCourses"
					/>
				</div>
				<small class="text-gray-500 mt-2 block">
					* Selectionnez un professeur pour générer des cours
				</small>
			</div>
			<button
				@click="generateCourses"
				class="px-5 py-3 bg-blue-500 text-white hover:bg-blue-700 text-sm rounded rounded-xs"
			>
				Générer les cours
			</button>

			<div class="flex flex space-x-4">

			<!-- Composant des événements externes -->
			    <div class="w-1/4 p-4 ">
					<DraggableEvents
						:schoolClasses="schoolClasses"
						:classRooms="classRooms"
						:teachers="teachers"
						:subjects="subjects"
					/>
				</div>
                
				<div class="w-3/4 p-4">
					<AdvancedCalendar
						:events="state.events"
						:weekends="state.showWeekends"
						@select="handleSelect"
						@eventClick="handleEventClick"
						@eventDrop="updateEvent"
						@eventResize="updateEvent"
						@createEvent="handleCreateEvent"
					/>
			   </div>
		    </div>

		   <LoadingSpinner :isVisible="isLoading" />
		   
			<ScheduleModal
				v-if="state.isModalVisible"
				:visible="state.isModalVisible"
				:session="state.selectedEvent"
				:teachers="teachers"
				:classRooms="classRooms"
				:classes="schoolClasses"
				:subjects="subjects"
				@close="state.isModalVisible = false"
				@update="updateEvent"
				@delete="handleDeleteEvent"
			/>
		</div>
		<div
			v-if="isValidationModalVisible"
			class="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-md border border-gray-300 z-50"
		>
			<p class="text-gray-800">
				Des cours ont été générés. Voulez-vous les valider ?
			</p>
			<div class="flex justify-end mt-4">
				<button
					@click="isValidationModalVisible = false"
					class="bg-gray-300 text-white py-1 px-4 rounded ml-2 hover:bg-gray-400 transition mr-2"
				>
					Annuler
				</button>
				<button
					@click="validateGeneratedCourses"
					class="bg-primary text-white py-1 px-4 rounded hover:bg-primary/80 transition"
				>
					Valider
				</button>
			</div>
		</div>
	</LayoutAuthenticated>
</template>

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
