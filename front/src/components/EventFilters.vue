<template>
	<div
		class="filters border border-gray-200 p-8 w-full rounded rounded-md bg-white"
	>
		<div class="flex w-full items-center text-sm text-gray-600">
			<select
				id="teacherFilter"
				v-model="selectedTeacher"
				@change="applyFilters"
				class="p-3 border rounded"
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
				class="ml-2 p-3 border rounded"
			>
				<option value="">Toutes les salles</option>
				<option v-for="room in classRooms" :key="room._id" :value="room._id">
					{{ room.name }}
				</option>
			</select>

			<select
				id="classFilter"
				v-model="selectedClass"
				@change="applyFilters"
				class="ml-2 p-3 border rounded"
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
				class="ml-2 p-3 border rounded"
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
				class="ml-4 px-5 py-3 bg-gray-500 text-white hover:bg-gray-700 text-sm rounded rounded-xs"
			>
				Réinitialiser
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
const emit = defineEmits(["filter"]);

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