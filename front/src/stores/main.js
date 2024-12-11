import { defineStore } from "pinia";
import axiosInstance from "../utils/axiosInstance";

export const useMainStore = defineStore("main", {
	state: () => {
		const user = JSON.parse(localStorage.getItem("user") || "{}");
		const currentGame = null;
		return {
			currentUser: { ...user, response: null },
		};
	},
	getters: {
		getUser() {
			return this.currentUser;
		}
	},
	actions: {
		async setUser(payload) {
			for (const key of Object.keys(payload)) {
				this.currentUser[key] = payload[key];
			}
		}
	},
});