import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI();

const recordings = [
	path.join(__dirname, "recordings/adam.m4a"),
	path.join(__dirname, "recordings/agnieszka.m4a"),
	path.join(__dirname, "recordings/ardian.m4a"),
	path.join(__dirname, "recordings/michal.m4a"),
	path.join(__dirname, "recordings/monika.m4a"),
	path.join(__dirname, "recordings/rafal.m4a"),
];

const getTranscription = async (path: string) => {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(path),
		model: "whisper-1",
	});

	return transcription.text;
};

const getTranscriptions = async () => {
	const transcriptions = await Promise.all(
		recordings.map(recording => getTranscription(recording))
	);

	return transcriptions;
};

const getAnswer = async () => {
	const transcriptions = await getTranscriptions();
	const context = transcriptions.join("\n");

	const system =
		"Znajdź odpowiedź na pytanie, na jakiej ulicy znajduje się uczelnia, na której wykłada Andrzej Maj, jeśli odpowiedź nie jest w treści transkrypcji, użyj wiedzy ogólnej.";

	const answer = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: context },
		],
	});

	console.log(answer.choices[0].message.content);
};

getAnswer();
