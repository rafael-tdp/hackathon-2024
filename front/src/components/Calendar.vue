<script>
import { ref, watch } from "vue";
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
  emits: ["select", "eventClick", "eventDrop", "eventResize", "createEvent"],
  setup(props, { emit }) {
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
      events: props.events,
      eventContent: (arg) => {
        return { html: arg.event.title };
      },
      select: (arg) => {
        emit("createEvent", {
          start: arg.startStr,
          end: arg.endStr,
          allDay: arg.allDay,
        });
      },
      eventClick: (arg) => emit("eventClick", arg.event),
      eventDrop: (arg) => emit("eventDrop", arg.event),
      eventResize: (arg) => emit("eventResize", arg.event),
    });

    watch(
      () => props.events,
      (newEvents) => {
        calendarOptions.value.events = newEvents;
      },
      { deep: true }
    );

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
</style>
