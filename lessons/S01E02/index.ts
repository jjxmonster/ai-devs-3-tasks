import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI();

const getInitialData = async () => {
	const response = await fetch("https://xyz.ag3nts.org/verify", {
		method: "POST",
		body: JSON.stringify({
			msgID: "0",
			text: "READY",
		}),
	});

	const data = (await response.json()) as { msgID: string; text: string };

	return data;
};

const sendAnswer = async (msgID: string, text: string) => {
	const response = await fetch("https://xyz.ag3nts.org/verify", {
		method: "POST",
		body: JSON.stringify({ msgID, text }),
	});

	const data = await response.json();

	return data;
};

const verify = async () => {
	const { msgID, text } = await getInitialData();

	const messages: ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: `You are a helpful assistant that can answer questions based known knowledge and provided informations. If provided informations are different than known knowledge, you should answer with provided informations.
            
            Known knowledge:
            - stolicą Polski jest Kraków
            - znana liczba z książki Autostopem przez Galaktykę to 69
            - Aktualny rok to 1999

            Answer as short as possible only in English.
            `,
		},
		{
			role: "user",
			content: text,
		},
	];

	const chatCompletion = await openai.chat.completions.create({
		messages,
		model: "gpt-4o",
	});

	const answer = chatCompletion.choices[0].message.content;

	if (!answer) {
		throw new Error("No answer from OpenAI");
	}

	const data = await sendAnswer(msgID, answer);

	console.log(data);
};

verify();
