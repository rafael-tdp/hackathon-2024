<script setup>
import { reactive, onMounted, ref } from "vue";
import axios from "axios";
import AdvancedCalendar from "../components/Calendar.vue";
import ScheduleModal from "../components/ScheduleModal.vue";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated.vue";
import EventFilters from "../components/EventFilters.vue";
import NewItemButton from "../components/NewItemButton.vue";
import PageTitle from "../components/PageTitle.vue";

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
	try {
		const response = await axios.get(
			`${BASE_URL}/api/planning/${state.selectedFilters.teacherId}`
		);
		const rawGeneratedCourses = response.data.data.potentialWorkHours;

		// Enrichir les données des cours générés
		state.generatedCourses = rawGeneratedCourses.map(enrichGeneratedCourse);

		for(const course of state.generatedCourses) {
			const event = {
				id: 'to-be-generated',
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
				id: 'to-be-generated',
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

			<div
				class="flex justify-center items-center mb-10 mt-20 w-full text-sm"
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
				/>
			</div>

			<button
				@click="generateCourses"
				class="px-5 py-3 bg-blue-500 text-white hover:bg-blue-700 text-sm rounded rounded-xs"
			>
				Générer les cours
			</button>

			<AdvancedCalendar
				:events="state.events"
				:weekends="state.showWeekends"
				@select="handleSelect"
				@eventClick="handleEventClick"
				@eventDrop="updateEvent"
				@eventResize="updateEvent"
			/>

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
	</LayoutAuthenticated>
</template>
