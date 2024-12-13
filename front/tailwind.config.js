/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				transparent: "transparent",
				primary: "#b8c130",
				secondary: "#4b866b",
			},
		},
	},
	plugins: [],
};
