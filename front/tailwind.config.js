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
			height: {
				"128": "32rem",
				"144": "36rem",
				"160": "40rem",
				"192": "48rem",
			},
			maxHeight: {
				"128": "32rem",
				"144": "36rem",
				"160": "40rem",
				"172": "43rem",
				"176": "44rem",
				"192": "48rem",
			},
		},
	},
	plugins: [],
};
