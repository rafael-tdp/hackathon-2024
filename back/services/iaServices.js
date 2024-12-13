const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.NEW_API_KEY
});

const sendRequest = async (
	prompt,
	model = "gpt-4o-mini-2024-07-18",
	maxTokens = 100,
	temperature = 0.1
) => {
	try {
		console.log("API KEY", process.env.NEW_API_KEY);
		const response = await openai.chat.completions.create({
			model,
			messages: [
				{ role: "system", content: `
Based on the input data, generate a JSON object strictly in the following format. Do not include any text before or after the JSON object.

### Expected JSON Output Format:
{
  "potentialWorkHours": [
      {
        "startTime": "",
        "endTime": "",
        "classRoom": Object('id'),
        "schoolClass": Object('id'),
        "teacher": Object('id'),
        "subject": Object('id'),
        "status": "pending"
      }
  ]
}

### Input Data:
- **teacherId**: The ID of the teacher for whom potential work hours are being generated.
- **unavailabilityHours**: A list of time slots during which the teacher is unavailable. Each unavailability entry is an object containing a \`beginDate\` and \`endDate\`.
- **schoolWeekClass**: An array of objects defining the school working week for each of the teacher's school classes.
- **subjectClass**: An array of objects specifying the required number of hours for each subject of the teacher's school classes (identified by their \`_id\`).
- **plannedCourses**: A list of already planned courses. Each course contains the following information: \`subject\`, \`teacher\`, \`startTime\`, \`endTime\`, \`classRoom\`, \`schoolClass\`, and \`status\`.

### Constraints:
1. **No overlap**: A teacher cannot teach two classes at the same time, and a classroom cannot be used for more than one class at the same time.
2. **Respect required hours**: Ensure that the total number of hours scheduled for each subject per class matches the required number of hours specified in \`subjectClass\`.
3. **Respect school weeks**: \`potentialWorkHours\` must only be scheduled during the weeks defined in \`schoolWeekClass\`.
4. **No weekends**: \`potentialWorkHours\` cannot be scheduled on Saturdays or Sundays.
5. **Teacher availability**: Ensure that \`potentialWorkHours\` are only generated during the teacher's available hours (excluding \`unavailabilityHours\`).

### Example Scenario:
- A teacher is available from 10:00 to 18:00 on weekdays. 
- The school operates only on these available hours. 
- Based on the input data, generate \`potentialWorkHours\` that adhere to these constraints.
`},
				{ role: "user", content: prompt },
			],
			max_tokens: 100,
			temperature,
		});
		return response.choices[0].message.content;
	} catch (error) {
		console.error("Une erreur s'est produite :", error);
		return "Une erreur s'est produite";
	}
};

module.exports = { sendRequest };
