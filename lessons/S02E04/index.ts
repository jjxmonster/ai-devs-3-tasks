import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { IMAGE_REPORT_PROMPT, TEXT_REPORT_PROMPT } from "./prompts";

const openai = new OpenAI();

const TEXT_FILES = [
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-00-sektor_C4.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-01-sektor_A1.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-02-sektor_A3.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-03-sektor_A3.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-04-sektor_B2.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-05-sektor_C1.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-06-sektor_C2.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-07-sektor_C4.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-08-sektor_A1.txt"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-09-sektor_C2.txt"),
];

const AUDIO_FILES = [
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-10-sektor-C1.mp3"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-11-sektor-C2.mp3"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-12-sektor_A1.mp3"),
];

const IMAGE_FILES = [
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-13.png"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-14.png"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-15.png"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-16.png"),
	path.join(__dirname, "pliki_z_fabryki/2024-11-12_report-17.png"),
];

const report: {
	people: string[];
	hardware: string[];
} = {
	people: [],
	hardware: [],
};

const analyzeText = async (text: string, fileName: string) => {
	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: TEXT_REPORT_PROMPT },
			{ role: "user", content: text },
		],
		model: "gpt-4o-mini",
	});

	const data = JSON.parse(response.choices[0].message.content!);

	if (data.people === "1") {
		report.people.push(fileName);
	}

	if (data.hardware === "1") {
		report.hardware.push(fileName);
	}
};

const processTextFiles = async () => {
	for (const file of TEXT_FILES) {
		const text = await fsPromise.readFile(file, "utf-8");
		const fileName = file.split("/").pop()!;

		await analyzeText(text, fileName);
	}
};

const getTranscription = async (path: string) => {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(path),
		model: "whisper-1",
	});

	return transcription.text;
};

const processAudioFiles = async () => {
	for (const file of AUDIO_FILES) {
		const text = await getTranscription(file);
		const fileName = file.split("/").pop()!;

		await analyzeText(text, fileName);
	}
};

const analyzeImage = async (imageBase64: string, fileName: string) => {
	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: IMAGE_REPORT_PROMPT },
			{
				role: "user",
				content: [
					{
						type: "image_url",
						image_url: {
							url: `data:image/jpeg;base64,${imageBase64}`,
						},
					},
				],
			},
		],
		model: "gpt-4o-mini",
	});

	const data = JSON.parse(
		response.choices[0].message.content
			?.replace("```json", "")
			.replace("```", "")!
	);

	if (data.people === "1") {
		report.people.push(fileName);
	}

	if (data.hardware === "1") {
		report.hardware.push(fileName);
	}
};

const processImageFiles = async () => {
	for (const file of IMAGE_FILES) {
		const imageBase64 = fs.readFileSync(file, { encoding: "base64" });
		const fileName = file.split("/").pop()!;

		await analyzeImage(imageBase64, fileName);
	}
};

const processData = async () => {
	return Promise.all([
		processTextFiles(),
		processAudioFiles(),
		processImageFiles(),
	]);
};

processData().then(() => {
	console.log(report);
});
