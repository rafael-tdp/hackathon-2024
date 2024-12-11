/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				transparent: "transparent",

				// Définition des couleurs personnalisées
				purple500: "rgb(167, 139, 250)", // Violet clair
				gris: "#d4d4d8", // Gris clair
				bleu900: "rgb(40, 57, 93)", // Bleu sombre
				bleu200: "rgb(200, 217, 251)", // bleu clair
				gray900: "rgba(17, 24, 39, 1)", // Gris très foncé
				gray800: "rgba(45, 55, 72, 1)", // Gris moyen
				gray100: "rgba(255, 255, 255, 1)", // Blanc pur
				gray400: "rgba(147, 147, 147, 1)", // Gris moyen clair
				violet400: "rgb(127, 93, 208)", // Violet moyen
				gray50: "rgba(249, 250, 251, 1)", // Gris très clair
				purple800: "rgba(94, 53, 177, 1)", // Violet foncé
				green400: "rgba(0, 200, 0, 1)", // Vert vif

				red400: "rgba(255, 0, 0, 0.5)",
				red200: "rgb(185 20 20)", // Rouge transparent
				indigo300: "rgba(75, 0, 130, 0.8)", // Indigo
				"text-rgba": "rgba(255, 255, 255, 0.7)", // Texte semi-transparent blanc

				primary: "#b8c130",
				secondary: "#4b866b",
			},
		},
	},
	plugins: [],
};
