import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import { createWriteStream } from "fs";
import { JSDOM } from "jsdom";

const url = "https://centrala.ag3nts.org/dane/arxiv-draft.html";
const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const openai = new OpenAI();

// Function to extract webpage HTML using Firecrawl
async function extractWebpageHtml(url: string) {
	const response = await app.scrapeUrl(url, { formats: ["html"] });

	return response;
}

async function describeImage(imageUrl: string) {
	const image = await axios.get(imageUrl, { responseType: "arraybuffer" });
	const base64Image = image.data.toString("base64");

	const prompt = `Opisz to zdjęcie w języku polskim:`;
	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: prompt },
			{
				role: "user",
				content: [
					{
						type: "image_url",
						image_url: {
							url: `data:image/jpeg;base64,${base64Image}`,
						},
					},
				],
			},
		],
		model: "gpt-4o-mini",
	});
	return response.choices[0].message.content?.trim()!;
}

// Function to transcribe an MP3 file
async function transcribeMp3(mp3Url: string) {
	const response = await axios.get(mp3Url, { responseType: "stream" });
	const tempFilePath = "./temp.mp3";

	// Save MP3 file temporarily
	const writer = createWriteStream(tempFilePath);
	response.data.pipe(writer);

	await new Promise((resolve, reject) => {
		writer.on("finish", resolve);
		writer.on("error", reject);
	});

	// Transcribe using OpenAI Whisper
	const transcriptionResponse = await openai.audio.transcriptions.create({
		file: fs.createReadStream(tempFilePath),
		model: "whisper-1",
	});

	// Clean up temporary file
	fs.unlinkSync(tempFilePath);
	return transcriptionResponse.text;
}

// Function to process the HTML and convert it to plain text
async function processHtmlToPlainText(html: string) {
	const dom = new JSDOM(html);
	const document = dom.window.document;

	let plainText = "";

	// NodeList
	const elements = document.body.querySelectorAll("*");

	for (const element of elements) {
		if (
			element.tagName === "P" ||
			element.tagName === "DIV" ||
			element.tagName === "SPAN" ||
			element.tagName === "H1" ||
			element.tagName === "H2" ||
			element.tagName === "H3" ||
			element.tagName === "H4" ||
			element.tagName === "H5" ||
			element.tagName === "H6"
		) {
			plainText += element.textContent?.trim() + "\n";
		} else if (element.tagName === "IMG") {
			const imageUrl = element.src;
			const description = await describeImage(
				"https://centrala.ag3nts.org/dane/" + imageUrl
			);
			plainText += `Opis obrazka: ${description}\n`;
		} else if (element.tagName === "AUDIO" && element.src) {
			const mp3Url = element.src;
			const transcription = await transcribeMp3(
				"https://centrala.ag3nts.org/dane/" + mp3Url
			);
			plainText += `Transkrypcja audio: ${transcription}\n`;
		} else if (element.tagName === "FIGURE") {
			const imageUrl = element.querySelector("img")?.src;
			const description = await describeImage(
				"https://centrala.ag3nts.org/dane/" + imageUrl
			);
			plainText += `Opis obrazka: ${description}\n`;
		}
	}

	return plainText;
}

// Main function to process webpage
async function processWebpage() {
	try {
		const html = await extractWebpageHtml(url);

		if (html.success) {
			const plainText = await processHtmlToPlainText(html.html!);
			return plainText;
		}
	} catch (error) {
		console.error("Error processing webpage:", error);
		throw error;
	}
}

// Execute and print the plain text output
processWebpage()
	.then(plainText => {
		console.log("Plain text content:\n", plainText);
	})
	.catch(error => {
		console.error("Failed to process webpage:", error);
	});
