<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const props = defineProps({
	events: {
		type: Array,
		required: true,
	},
	weekends: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits([
	"select",
	"eventClick",
	"eventDrop",
	"eventResize",
	"createEvent",
]);

const calendarOptions = ref({
	plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
	initialView: "dayGridMonth",
	headerToolbar: {
		left: "prev,next today",
		center: "title",
		right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
	},
	buttonText: {
		today: "Aujourd'hui",
		month: "Mois",
		week: "Semaine",
		day: "Jour",
		list: "Liste",
	},
	weekends: props.weekends,
	editable: true,
	selectable: true,
	droppable: true,
	events: props.events,
	handleWindowResize: true,
  locale: "fr", // Set locale to French
  firstDay: 1, // Set the first day of the week to Monday
  eventContent: (arg) => {
		return { html: arg.event.title };
	},
	select: (arg) => {
		// emit("createEvent", {
		// 	start: arg.startStr,
		// 	end: arg.endStr,
		// 	allDay: arg.allDay,
		// });
	},
	eventClick: (arg) => emit("eventClick", arg.event),
	eventDrop: (arg) => emit("eventDrop", "fromCalendar", arg.event),
	eventResize: (arg) => emit("eventResize", arg.event),
	drop: (info) => {
		const startDate = new Date(info.date);
		const eventData = JSON.parse(info.draggedEl.dataset.event);
		// Capture the new start and end date from the dropped event
		const newStart = info.date;
		const newEnd = info.allDay ? info.date : newStart; // Adjust this if you need a specific end time

		emit("eventDrop", "fromList", {
			...eventData,
			start: newStart,
			end: newEnd,
		});
	},
});

// Watch for changes in events and update the calendar accordingly
watch(
	() => props.events,
	(newEvents) => {
		calendarOptions.value.events = newEvents;
	},
	{ deep: true }
);
</script>

<template>
	<div>
		<FullCalendar :options="calendarOptions" ref="calendar" />
	</div>
</template>

<style scoped></style>
