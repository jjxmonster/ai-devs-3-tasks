import data from "./data.json";
import OpenAI from "openai";

async function solveQuestionWithOpenAI(question: string): Promise<string> {
	const openai = new OpenAI();

	const prompt = `
    You are a helpful assistant that can answer questions.
    Answer the following question as short as possible, if possible only with one word: ${question}
    `;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt }],
		});

		const answer = completion.choices[0].message.content;
		return answer || "";
	} catch (error) {
		return "";
	}
}

const dataToMap = data["test-data"];

const calculate = (operation: string) => {
	const [left, right] = operation.split("+");
	return parseInt(left) + parseInt(right);
};

const proceedData = await Promise.all(
	dataToMap.map(async item => {
		if (item.test) {
			const answer = await solveQuestionWithOpenAI(item.test.q);
			return {
				...item,
				test: {
					...item.test,
					a: answer,
				},
			};
		}

		return {
			...item,
			answer: calculate(item.question),
		};
	})
);

console.log(proceedData);
