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
		"subject": "", The ID of the subject being taught (e.g., "675cb61c377025cb6c72b803").
		"teacher": "", The ID of the teacher assigned to this course (e.g., "675cb61d377025cb6c72b888").
		"startTime": "", The starting date and time of the course, in ISO 8601 format (e.g., "2024-12-26T16:00:00.000Z").
		"endTime": "", The ending date and time of the course, in ISO 8601 format (e.g., "2024-12-26T18:00:00.000Z").
		"classRoom": "", The ID of the classroom where the course takes place (e.g., "675cb61c377025cb6c72b844").
		"schoolClass": "", The ID of the school class for which the course is planned (e.g., "675cb61c377025cb6c72b85d").
		"status": "", The ID of the school class for which the course is planned. Can be "pending", "accepted", "cancelled" (e.g., "675cb61c377025cb6c72b85d").
      },
      {
        "subject": "", The ID of the subject being taught (e.g., "675cb61c377025cb6c72b803").
		"teacher": "", The ID of the teacher assigned to this course (e.g., "675cb61d377025cb6c72b888").
		"startTime": "", The starting date and time of the course, in ISO 8601 format (e.g., "2024-12-26T16:00:00.000Z").
		"endTime": "", The ending date and time of the course, in ISO 8601 format (e.g., "2024-12-26T18:00:00.000Z").
		"classRoom": "", The ID of the classroom where the course takes place (e.g., "675cb61c377025cb6c72b844").
		"schoolClass": "", The ID of the school class for which the course is planned (e.g., "675cb61c377025cb6c72b85d").
		"status": "", The ID of the school class for which the course is planned. Can be "pending", "accepted", "cancelled" (e.g., "675cb61c377025cb6c72b85d").
      },
      ...
  ]
}

### Input Data:
- **classId**: The ID of the class for whom potential work hours are being generated.
- **listOfUnavailabilities**: A list of time periods during which specific teachers are unavailable.
 [{
	"startTime": "", The starting date and time of the unavailability, in ISO 8601 format (e.g., "2024-12-25T07:27:43.311Z").
	"endTime": "", The ending date and time of the unavailability, in ISO 8601 format (e.g., "2024-12-25T10:27:43.311Z").
	"teacher": "" The ID of the teacher who is unavailable during this period (e.g., "675cb61d377025cb6c72b888").
}, ...]
- **listOfSchoolClassesDays**: A list of dates. Each date corresponds to a specific day when school classes are scheduled to occur.
[   
 	"2024-12-24T23:00:00.000Z",
	"2024-12-25T23:00:00.000Z",
	"2024-12-26T23:00:00.000Z"
]
- **listOfSubjectsToPlan**: An array of objects specifying the required number of hours for each subject of the teacher's school classes.
[{
	"subject": "", The name of the subject (e.g., "HTML").
	"hoursToPlan": , The total number of hours to be scheduled for this subject (e.g., 40 hours).
	"teachers": [] A list of IDs representing the teachers eligible to teach this subject.
}, ...]
- **listOfPlannedCourses**: A list of already planned courses. Each course contains the following information: 
[{
	"_id": "", A unique identifier for the planned course (e.g., "675cb620377025cb6c72bb38").
	"subject": "", The ID of the subject being taught (e.g., "675cb61c377025cb6c72b803").
	"teacher": "", The ID of the teacher assigned to this course (e.g., "675cb61d377025cb6c72b888").
	"startTime": "", The starting date and time of the course, in ISO 8601 format (e.g., "2024-12-26T16:00:00.000Z").
	"endTime": "", The ending date and time of the course, in ISO 8601 format (e.g., "2024-12-26T18:00:00.000Z").
	"classRoom": "", The ID of the classroom where the course takes place (e.g., "675cb61c377025cb6c72b844").
	"schoolClass": "", The ID of the school class for which the course is planned (e.g., "675cb61c377025cb6c72b85d").
	"status": "", The ID of the school class for which the course is planned. Can be "pending", "accepted", "cancelled" (e.g., "675cb61c377025cb6c72b85d").
	"__v": 0
}, ...]

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
   - Make sure that \`potentialWorkHours\` are only generated during the teacher's available hours (excluding periods in \`listOfUnavailabilities\`).

### Example Scenario:
- A teacher is available from 10:00 to 18:00 on weekdays (Monday to Friday).
- A subject requires 20 hours of teaching, divided into sessions lasting 1.5–3 hours each.
- Teachers are unavailable for certain time slots, and the classroom can only be used during specified school days.
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
