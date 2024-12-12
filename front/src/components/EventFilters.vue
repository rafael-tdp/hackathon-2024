<template>
    <div class="filters">
      <select id="teacherFilter" v-model="selectedTeacher" @change="applyFilters" class="p-2 border rounded">
        <option value="">Tous les professeurs</option>
        <option v-for="teacher in teachers" :key="teacher._id" :value="teacher._id">{{ teacher.firstname }} {{ teacher.lastname }}</option>
      </select>
  
      <select id="classRoomFilter" v-model="selectedClassRoom" @change="applyFilters" class="ml-2 p-2 border rounded">
        <option value="">Toutes les salles</option>
        <option v-for="room in classRooms" :key="room" :value="room">{{ room }}</option>
      </select>
  
      <select id="classFilter" v-model="selectedClass" @change="applyFilters" class="ml-2 p-2 border rounded">
        <option value="">Toutes les classes</option>
        <option v-for="cls in classes" :key="cls._id" :value="cls._id">{{ cls.name }}</option>
      </select>
  
      <select id="statusFilter" v-model="selectedStatus" @change="applyFilters" class="ml-2 p-2 border rounded">
        <option value="">Tous les statuts</option>
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>
  </template>
  
  <script>
  import { ref, watch } from "vue";
  
  export default {
    name: "EventFilters",
    props: {
      teachers: Array,
      classRooms: Array,
      classes: Array,
      statuses: Array,
    },
    emits: ["filter"],
    setup(props, { emit }) {
      const selectedTeacher = ref("");
      const selectedClassRoom = ref("");
      const selectedClass = ref("");
      const selectedStatus = ref("");
  
      const applyFilters = () => {
        emit("filter", {
          teacherId: selectedTeacher.value,
          classRoom: selectedClassRoom.value,
          classId: selectedClass.value,
          status: selectedStatus.value,
        });
      };
  
      watch([selectedTeacher, selectedClassRoom, selectedClass, selectedStatus], applyFilters);
  
      return {
        selectedTeacher,
        selectedClassRoom,
        selectedClass,
        selectedStatus,
        applyFilters,
      };
    },
  };
  </script>
  
  <style scoped>
  .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .filters select {
    margin-right: 16px;
    margin-bottom: 8px;
  }
  </style>
  