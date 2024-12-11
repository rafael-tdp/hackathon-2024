<template>
  <div class="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-md max-w-5xl mx-auto">
    <table class="min-w-full text-sm">
      <thead class="bg-black text-white text-sm font-semibold">
        <tr>
          <!-- Colonnes dynamiques -->
          <th v-for="col in columns" :key="col.key" class="px-6 py-4 text-left">
            {{ col.label }}
          </th>
          <!-- Colonne pour les actions, si nécessaire -->
          <th class="px-6 py-4 text-left" v-if="hasActions">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          class="border-b hover:bg-gray-50 transition duration-200 ease-in-out"
        >
          <!-- Affichage des cellules -->
          <td v-for="col in columns" :key="col.key" class="px-6 py-4">
            <div v-if="col.slotName">
              <!-- Utiliser un slot pour un contenu personnalisé -->
              <slot :name="col.slotName" :data="row[col.key]" :row="row" />
            </div>
            <div v-else>{{ row[col.key] || "N/A" }}</div>
          </td>
          <!-- Affichage des actions -->
          <td v-if="hasActions" class="px-6 py-4">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
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
</script>
