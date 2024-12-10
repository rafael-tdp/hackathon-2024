<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

export default {
  name: "AdvancedCalendar",
  components: {
    FullCalendar,
  },
  props: {
    events: {
      type: Array,
      required: true, 
    },
    weekends: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["select", "eventClick", "eventDrop", "eventResize"], 
  setup(props, { emit }) {
    const calendarOptions = {
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
      events: props.events,
      select: (arg) => emit("select", arg), 
      eventClick: (arg) => emit("eventClick", arg.event), 
      eventDrop: (arg) => emit("eventDrop", arg.event), 
      eventResize: (arg) => emit("eventResize", arg.event), 
    };

    return {
      calendarOptions,
    };
  },
};
</script>

<template>
  <div>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<style scoped>
/* Ajoutez des styles spécifiques ici */
</style>
