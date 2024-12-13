<template>
	<div class="loading-spinner" v-if="isVisible">
		<div class="spinner"></div>
	</div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
	isVisible: {
		type: Boolean,
		required: true,
	},
});
</script>

<style scoped>
.loading-spinner {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
}
.spinner {
	width: 50px;
	height: 50px;
	border: 5px solid transparent;
	border-top: 5px solid #b8c130;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
