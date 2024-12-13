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
import { Draggable } from "@fullcalendar/interaction";

const BASE_URL = import.meta.env.VITE_API_URL;

// Déclaration de l'état global
const state = reactive({
	isModalVisible: false,
	selectedEvent: null,
	courses: [], // Liste des événements
	showWeekends: true,
	teachers: [],
	classRooms: [],
	schoolClasses: [],
	status: [],
	selectedFilters: {},
	generatedCourses: [],
	coursesToReplace: [],
});

// Variables réactives pour les filtres
const teachers = ref([]);
const classRooms = ref([]);
const schoolClasses = ref([]);
const status = ref([]);
const subjects = ref([]);
const isValidationModalVisible = ref(false);
const isLoading = ref(false);
const isListVisible = ref(false);
const showList = ref(localStorage.getItem("showList") === "true");
const eventsToReplace = ref([]);

const validateGeneratedCourses = async () => {
	try {
		await axios.post(
			`${BASE_URL}/api/courses/validation`,
			state.generatedCourses
		);
		alert("Les cours générés ont été validés avec succès !");
		isValidationModalVisible.value = false;
		state.generatedCourses = [];
		fetchCourses();
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

watch(
	() => showList.value,
	(newValue) => {
		localStorage.setItem("showList", newValue);
	}
);

// surveiller les changements dans les filtres
watch(
	() => state.selectedFilters,
	() => {
		fetchCourses().then(() => fetchCoursesToReplace());
	},
	{ deep: true }
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
			state.courses.map((event) => event.status)
		);
		status.value = Array.from(uniqueStatuses);
	} catch (error) {
		console.error("Erreur lors de la récupération des filtres :", error);
	}
};

const fetchCourses = async () => {
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

		state.courses = courses.map((course) => {
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
					course.status === "cancelled" ? "rgb(239 68 68)" : "#4b866b",
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
			`${BASE_URL}/api/planning/${state.selectedFilters.schoolClassId}`
		);
		const rawGeneratedCourses = response.data.data.potentialWorkHours;

		// Enrichir les données des cours générés
		state.generatedCourses = rawGeneratedCourses.map(enrichGeneratedCourse);

		// Ajouter les cours générés à la liste des événements
		state.courses = [
			...state.courses,
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
					course.status === "cancelled" ? "rgb(239 68 68)" : "#b8c130",
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
		state.courses.push({
			id: Date.now(),
			title,
			start: new Date().toISOString().split("T")[0],
		});
	}
};

const handleSelect = (arg) => {
	const title = prompt("Titre du cours :");
	if (title) {
		state.courses.push({
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

const updateEvent = async (updatedEvent) => {
	const event = state.courses.find((e) => e.id === updatedEvent.id);

	event.start = updatedEvent.start;
	event.end = updatedEvent.end;

	axios
		.patch(`${BASE_URL}/api/courses/${updatedEvent.id}`, {
			startTime: updatedEvent.start,
			endTime: updatedEvent.end,
			status: updatedEvent.status,
		})
		.then(() => {
			state.isModalVisible = false;
			fetchCourses();
		})
		.catch((error) => {
			console.error(
				"Erreur lors de la mise à jour de l'événement :",
				error
			);
			alert(
				"Une erreur s'est produite lors de la mise à jour de l'événement."
			);
		});
};

const handleDeleteEvent = (sessionId) => {
	state.courses = state.courses.filter((event) => event.id !== sessionId);
};

const fetchCoursesToReplace = () => {
	try {
		state.coursesToReplace = state.courses.filter(
			(course) => course.status === "cancelled"
		);

		if (state.coursesToReplace) {
			eventsToReplace.value = state.coursesToReplace.map((course) => ({
				id: course.id,
				title: `Classe: ${course.schoolClass.name || "Inconnue"}<br>
		        Cours: ${course.subject.name || "Inconnu"}<br>
		        Prof: ${course.teacher.firstname || "Inconnu"} ${
					course.teacher.lastname || ""
				}<br>
		        Salle: ${course.classRoom.name || "Non attribuée"}`,
				start: course.startTime,
				end: course.endTime,
				classRoom: course.classRoom,
				teacher: course.teacher,
				subject: course.subject,
				schoolClass: course.schoolClass,
				status: course.status,
				backgroundColor: "#b8c130",
				display: {
					backgroundColor:
						course.status === "cancelled" ? "red" : "green",
				},
			}));
		}
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des événements externes :",
			error
		);
	}
};

const setupDraggable = () => {
	// Attendez que les événements soient correctement chargés avant d'initialiser Draggable
	const container = document.getElementById("draggable-events-container");

	if (container) {
		// Attendez que les événements soient rendus avant de les rendre "draggables"
		const events = container.querySelectorAll(".fc-event");

		// Initialisez Draggable pour chaque événement
		new Draggable(container, {
			itemSelector: ".fc-event",
			eventData: (eventEl) => {
				const eventData = eventEl.getAttribute("data-event");
				return eventData ? JSON.parse(eventData) : {}; // Assurez-vous que les données sont bien présentes
			},
		});
	}
};

const handleEventDrop = (from, event) => {
	if (from === "fromCalendar") updateEvent(event);
	else if (from === "fromList") {
		eventsToReplace.value = eventsToReplace.value.filter(
			(e) => e.id !== event.id
		);
		const updatedEvent = {
			...event,
			status: "accepted",
		};
		updateEvent(updatedEvent);
	}
};

onMounted(() => {
	fetchCourses().then(() => {
		fetchFilters();
		fetchCoursesToReplace();
		setupDraggable();
	});
});
</script>

<template>
	<LayoutAuthenticated>
		<div class="min-h-screen py-12 px-6">
			<div class="flex justify-between items-center mb-8">
				<PageTitle text="Planification Académique" />
				<!-- <NewItemButton @click="addEvent" text="Ajouter un cours" /> -->
			</div>
			<div class="mt-12 mb-2">
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
								fetchCourses();
							}
						"
						@generateCourses="generateCourses"
					/>
				</div>
				<small class="text-gray-500 mt-2 block text-xs mb-12">
					* Selectionnez une classe pour générer des cours
				</small>

				<!-- Bouton pour ouvrir les cours à replacer -->
				<button
					@click="showList = !showList"
					class="relative p-2 border rounded border-1 shadow-sm rounded-md bg-primary text-white hover:bg-primary/80 text-xs"
				>
					<div class="flex items-center space-x-2">
						<span v-if="!showList"
							>Afficher les cours à replacer</span
						>
						<span v-else>Masquer les cours à replacer</span>
						<div
							class="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold absolute -top-2 -right-2"
							v-if="state.coursesToReplace.length > 0"
						>
							{{ state.coursesToReplace.length }}
						</div>
					</div>
				</button>
			</div>

			<div class="flex space-x-4">
				<!-- Liste des cours à replacer -->
				<div
					v-show="showList"
					id="draggable-events-container"
					class="mt-5 p-4 bg-gray-100 rounded-md shadow max-h-172 overflow-y-auto mr-5 border border-gray-200"
					style="margin-top: 4rem;"
				>
					<div
						v-for="(event, index) in eventsToReplace"
						:key="index"
						class="text-white px-3 py-2 mb-2 rounded cursor-pointer text-xs bg-red-500 fc-event"
						:data-event="JSON.stringify(event)"
					>
						<span v-html="event.title"></span>
					</div>
					<div
						v-if="eventsToReplace.length === 0"
						class="text-gray-500 text-sm text-center"
					>
						Aucun cours à repositionner
					</div>
				</div>
				<div class="w-full">
					<AdvancedCalendar
						:events="state.courses"
						:weekends="state.showWeekends"
						@eventDrop="handleEventDrop"
						@select="handleSelect"
						@eventClick="handleEventClick"
						@eventResize="updateEvent"
					/>

					<!-- @eventDrop="updateEvent" -->
					<!-- @createEvent="handleCreateEvent"  -->
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
					@click="
						{
							isValidationModalVisible = false;
							state.generatedCourses = [];
						}
					"
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
