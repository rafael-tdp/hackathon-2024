<template>
	<h2 class="text-2xl font-semibold text-secondary">{{ text }}</h2>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
	text: {
		type: String,
		default: "Title",
	},
});
</script>
