<template>
	<div
		class="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-md max-w-5xl mx-auto"
	>
		<table class="min-w-full text-sm">
			<thead class="bg-gray-800 text-white text-sm font-semibold">
				<tr>
					<!-- Colonnes dynamiques -->
					<th
						v-for="col in columns"
						:key="col.key"
						class="px-6 py-4 text-left"
					>
						{{ col.label }}
					</th>
					<!-- Colonne pour les actions, si nécessaire -->
					<th class="px-6 py-4 text-left" v-if="hasActions">
						Action
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(row, rowIndex) in data"
					:key="rowIndex"
					class="border-b hover:bg-gray-50 hover:text-primary h-14"
					@mouseenter="hoveredRowIndex = rowIndex"
					@mouseleave="hoveredRowIndex = null"
				>
					<!-- Affichage des cellules -->
					<td v-for="col in columns" :key="col.key" class="px-6 py-4">
						<div v-if="col.slotName">
							<!-- Utiliser un slot pour un contenu personnalisé -->
							<slot
								:name="col.slotName"
								:data="row[col.key]"
								:row="row"
							/>
						</div>
						<div v-else>{{ row[col.key] || "N/A" }}</div>
					</td>
					<!-- Affichage des actions uniquement si la ligne est survolée -->
					<td v-if="hasActions" class="px-6 py-2">
						<div v-if="hoveredRowIndex === rowIndex">
							<slot name="actions" :row="row" />
						</div>
						<div v-else>
							<EllipsisHorizontalIcon
								class="h-5 w-5 text-gray-500"
							/>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";
import { ref } from "vue";

// Props
defineProps({
	columns: {
		type: Array,
		required: true,
	},
	data: {
		type: Array,
		required: true,
	},
	hasActions: {
		type: Boolean,
		default: false,
	},
});

// Index de la ligne survolée
const hoveredRowIndex = ref(null);
</script>
