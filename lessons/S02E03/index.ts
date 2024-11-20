import OpenAI from "openai";

const openai = new OpenAI();

export const getRobotDescription = async () => {
	const response = await fetch(
		`https://centrala.ag3nts.org/data/${process.env.AI_DEVS_KEY}/robotid.json`
	);
	const data = (await response.json()) as { description: string };

	return data.description;
};

const generateRobotImage = async () => {
	const robotDescription = await getRobotDescription();

	const response = await openai.images.generate({
		model: "dall-e-3",
		prompt: "Create a hyperrealistic image of a robot: " + robotDescription,
	});

	const imageUrl = response.data[0].url;

	return imageUrl;
};

const image = await generateRobotImage();

console.log(image);
