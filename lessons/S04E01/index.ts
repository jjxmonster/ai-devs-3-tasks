import axios from "axios";
import {
	IMAGES_PROMPT,
	DECISION_PROMPT,
	IMAGES_INFORMATION_PROMPT,
} from "./prompt";
import OpenAI from "openai";

const openai = new OpenAI();

const usePhotoFixerAgentHelp = async (prompt: string) => {
	const response = await fetch(process.env.API_URL!, {
		method: "POST",
		body: JSON.stringify({
			apikey: process.env.AI_DEVS_KEY!,
			task: "photos",
			answer: prompt,
		}),
	});
	const data = await response.json();

	return data.message;
};

const getImagesNamesArray = async (prompt: string) => {
	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: IMAGES_PROMPT },
			{ role: "user", content: prompt },
		],
	});

	const imagesArray = JSON.parse(response.choices[0].message.content ?? "");

	return imagesArray;
};

const decideWhatToDoWithImage = async (imageName: string) => {
	const image = await axios.get(process.env.IMAGE_URL + imageName, {
		responseType: "arraybuffer",
	});
	const base64Image = image.data.toString("base64");

	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: DECISION_PROMPT },
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
};

const getImagesInformation = async (imageName: string) => {
	const image = await axios.get(process.env.IMAGE_URL + imageName, {
		responseType: "arraybuffer",
	});
	const base64Image = image.data.toString("base64");

	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: IMAGES_INFORMATION_PROMPT },
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
};

const processImages = async (prompt: string, imformations: string[]) => {
	return await getImagesNamesArray(prompt).then(async images => {
		images.forEach(async image => {
			const decision = await decideWhatToDoWithImage(image);

			if (decision === "IMAGE_OK") {
				const information = await getImagesInformation(image);
				imformations.push(information);
			} else {
				const fixImageCall = await usePhotoFixerAgentHelp(
					decision + " " + image
				);

				processImages(fixImageCall, imformations);
			}
			console.log(imformations);
		});
	});
};

const main = async () => {
	const prompt = await usePhotoFixerAgentHelp("START");
	const imformations: string[] = [];

	processImages(prompt, imformations);
};

main();
