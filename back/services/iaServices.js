const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const sendRequest = async (
	prompt,
	model = "gpt-3.5-turbo",
	maxTokens = 100,
	temperature = 0.7
) => {
	try {
		const response = await openai.chat.completions.create({
			model,
			messages: [
				{ role: "system", content: "Tu es un assistant qui aide à créer des plannings pour une école" },
				{ role: "user", content: prompt },
			],
			max_tokens: maxTokens,
			temperature,
		});
		return response.choices[0].message.content;
	} catch (error) {
		console.error("Une erreur s'est produite :", error);
		return "Une erreur s'est produite";
	}
};

module.exports = { sendRequest };
