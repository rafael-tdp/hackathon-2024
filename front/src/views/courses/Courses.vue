<template>
	<LayoutAuthenticated>
		<div class="min-h-screen py-12 px-6">
			<div class="flex justify-between items-center mb-8">
				<PageTitle text="Cours" />

				<!-- Button to open the modal for adding a new course -->
				<NewItemButton
					@open-edit-modal="openEditModal"
					text="Nouveau cours"
				/>
			</div>

			<!-- Dynamic Table -->
			<DynamicTable
				:columns="[
					{ key: 'subject', label: 'Cours' },
					{ key: 'teacher', label: 'Intervenant' },
					{ key: 'startTime', label: 'Date de début' },
					{ key: 'endTime', label: 'Date de fin' },
					{ key: 'classRoom', label: 'Classe' },
					{ key: 'status', label: 'Statut' },
				]"
				:data="courses"
				:hasActions="true"
			>
				<!-- Slot for actions (edit, delete) -->
				<template #actions="{ row }">
					<button
						@click="openEditModal(row)"
						class="text-primary hover:text-primary/90"
					>
						<PencilIcon class="h-5 w-5" />
					</button>
					<button
						@click="openDeleteModal(row)"
						class="text-red-600 hover:text-red-800"
					>
						<TrashIcon class="h-5 w-5" />
					</button>
				</template>

				<!-- Slot for status with color-coding -->
				<template #status="{ row }">
					<button
						:class="{
							'bg-red-600 text-white': row.status === 'Annulé',
							'bg-green-600 text-white': row.status === 'Passé',
							'bg-blue-600 text-white': row.status === 'En cours',
						}"
						class="px-4 py-2 rounded-md"
					>
						{{ row.status }}
					</button>
				</template>
			</DynamicTable>

			<!-- Modal for editing a course -->
			<Modal
				v-model:visible="isModalVisible"
				:title="
					courseToEdit._id ? 'Modifier le cours' : 'Nouveau cours'
				"
				:fields="courseFields"
				:entityData="courseToEdit"
				:onSubmit="handleSubmit"
				:submitText="courseToEdit._id ? 'Mettre à jour' : 'Créer'"
			/>

			<!-- Confirmation Modal for deleting a course -->
			<ConfirmationModal
				v-model:visible="isDeleteModalVisible"
				title="Supprimer un cours"
				:message="'Souhaitez-vous supprimer ce cours?'"
				:onConfirm="deleteCourse"
			/>
		</div>
	</LayoutAuthenticated>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { TrashIcon, PencilIcon } from "@heroicons/vue/24/outline";
import DynamicTable from "@/components/DynamicTable.vue";
import Modal from "@/components/Modal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import LayoutAuthenticated from "../../layouts/LayoutAuthenticated.vue";
import NewItemButton from "../../components/NewItemButton.vue";
import PageTitle from "../../components/PageTitle.vue";

const router = useRouter();

// Données simulées pour les cours
const courses = ref([
	{
		_id: "1",
		subject: "Mathematics",
		teacher: "Mr. Smith",
		startTime: "2024-01-15T08:00:00Z",
		endTime: "2024-01-15T10:00:00Z",
		classRoom: "Room 101",
		status: "En cours",
		classId: "1",
	},
	{
		_id: "2",
		subject: "Physics",
		teacher: "Mrs. Johnson",
		startTime: "2024-01-16T08:00:00Z",
		endTime: "2024-01-16T10:00:00Z",
		classRoom: "Room 102",
		status: "Annulé",
		classId: "2",
	},
]);

// Définitions des champs pour le formulaire
const courseFields = [
	{
		name: "subject",
		label: "Cours",
		type: "text",
		placeholder: "Nom de cours",
		required: true,
	},
	{
		name: "teacher",
		label: "Intervenant",
		type: "text",
		placeholder: "Intervenant",
		required: true,
	},
	{
		name: "startTime",
		label: "Date de début",
		type: "datetime-local",
		required: true,
	},
	{
		name: "endTime",
		label: "Date de fin",
		type: "datetime-local",
		required: true,
	},
	{
		name: "classRoom",
		label: "Classe",
		type: "text",
		placeholder: "Classroom",
		required: true,
	},
	{
		name: "status",
		label: "Statut",
		type: "select",
		options: ["Passé", "Annulé", "En cours"],
		required: true,
	},
];

const isModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const courseToEdit = ref({}); // Cours à modifier ou créer
const courseToDelete = ref(null); // Cours à supprimer

// Fonction pour ouvrir le modal d'édition
const openEditModal = (courseItem) => {
	courseToEdit.value = { ...courseItem }; // Pré-remplir les données du formulaire
	isModalVisible.value = true;
};

// Fonction pour ouvrir le modal de suppression
const openDeleteModal = (courseItem) => {
	courseToDelete.value = courseItem; // Enregistrer le cours à supprimer
	isDeleteModalVisible.value = true;
};

// Fonction pour mettre à jour un cours
const handleSubmit = (formData) => {
	if (formData._id) {
		// Mise à jour d'un cours existant
		const index = courses.value.findIndex((c) => c._id === formData._id);
		if (index !== -1) {
			courses.value[index] = { ...formData };
		}
	} else {
		// Ajout d'un nouveau cours
		const newCourse = {
			...formData,
			_id: String(courses.value.length + 1),
		};
		courses.value.push(newCourse);
	}
	isModalVisible.value = false; // Fermer le modal après mise à jour
};

// Fonction pour supprimer un cours
const deleteCourse = () => {
	if (courseToDelete.value) {
		courses.value = courses.value.filter(
			(c) => c._id !== courseToDelete.value._id
		);
		isDeleteModalVisible.value = false;
	}
};
</script>
