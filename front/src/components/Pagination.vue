<template>
  <div class="flex justify-center space-x-1 mr-8">
    <button
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
      class="mb-2 px-1 py-1 bg-secondary text-white rounded-md hover:bg-primary-dark"
    >
      <ChevronLeftIcon class="h-4 w-4" />
    </button>

    <div class="flex items-center justify-center space-x-2">
      <span class="text-sm px-4 py-2 font-light">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>
    </div>

    <button
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
      class="mb-2 px-1 py-1 bg-secondary text-white rounded-md hover:bg-primary-dark"
    >
      <ChevronRightIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup>
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:currentPage"]);

const goToPage = (page) => {
  emit("update:currentPage", page);
};
</script>
