<template>
	<div class="flex justify-center mt-6">
		<button
			@click="handleClick"
			type="button"
			class="px-6 py-3 font-semibold rounded-sm bg-secondary text-white w-full sm:w-auto text-sm hover:bg-secondary/90"
		>
			{{ text }}
		</button>
	</div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
	defaultData: {
		type: Object,
		default: () => ({}),
	},
	text: {
		type: String,
		default: "New Item",
	},
});

const emit = defineEmits(["open-edit-modal"]);

const handleClick = () => {
	emit("open-edit-modal", defaultData);
};
</script>
