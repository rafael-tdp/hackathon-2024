const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.NEW_API_KEY
});

const sendRequest = async (
	prompt
) => {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini-2024-07-18",
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
      },
      {
        "startTime": "",
        "endTime": "",
        "classRoom": Object('id'),
        "schoolClass": Object('id'),
        "teacher": Object('id'),
        "subject": Object('id'),
        "status": "pending"
      },
      ...
  ]
}

### Input Data:
- **teacherId**: The ID of the teacher for whom potential work hours are being generated.
- **unavailabilityHours**: A list of time slots during which the teacher is unavailable. Each unavailability entry is an object containing a \`beginDate\` and \`endDate\`.
- **schoolWeekClass**: An array of objects defining the school working week for each of the teacher's school classes (e.g., days and hours).
- **subjectClass**: An array of objects specifying the required number of hours for each subject of the teacher's school classes (identified by their \`_id\`).
- **plannedCourses**: A list of already planned courses. Each course contains the following information: \`subject\`, \`teacher\`, \`startTime\`, \`endTime\`, \`classRoom\`, \`schoolClass\`, and \`status\`.

### Constraints:
1. **No overlap**:
   - A teacher cannot teach two classes at the same time.
   - A classroom cannot be used by multiple classes simultaneously.
   - The new scheduled hours must not overlap with existing planned courses for the same teacher or classroom.
   
2. **Respect required hours**:
   - Ensure the total number of hours scheduled for each subject per class matches the required hours as specified in \`subjectClass\`.
   
3. **Respect school weeks**:
   - Schedule \`potentialWorkHours\` only within the days and hours defined in \`schoolWeekClass\` (do not schedule outside these periods).
   - Spread the potential work hours across multiple days based on the available days within the \`schoolWeekClass\`, ensuring that courses are not all generated for the same day.
   
4. **Variable duration**:
   - Do not generate only 1-hour slots. Ensure the generated \`potentialWorkHours\` have a variable duration based on the subject's needs, respecting the time slots available for the teacher.
   
5. **No weekends**:
   - Ensure \`potentialWorkHours\` are not scheduled on Saturdays or Sundays.
   
6. **Teacher availability**:
   - Make sure that \`potentialWorkHours\` are only generated during the teacher's available hours (excluding periods in \`unavailabilityHours\`).

### Example Scenario:
- A teacher is available from 10:00 to 18:00 on weekdays (Monday to Friday).
- The school operates only during these available hours.
- Based on the input data, generate multiple \`potentialWorkHours\` that respect the constraints, distribute them across several days as indicated in \`schoolWeekClass\`, and ensure no conflicts with existing courses or teacher availability.

`},
				{ role: "user", content: prompt },
			],
			temperature: 0.1,
			frequency_penalty: 0,
			presence_penalty: 0,
			n: 1,
		});
		return response.choices[0].message.content;
	} catch (error) {
		console.error("Une erreur s'est produite :", error);
		return "Une erreur s'est produite";
	}
};

module.exports = { sendRequest };
