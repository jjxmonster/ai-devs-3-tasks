import OpenAI from "openai";

const openai = new OpenAI();

const getDataToCensored = async () => {
	const response = await fetch(
		`https://centrala.ag3nts.org/data/${process.env.AI_DEVS_KEY}/cenzura.txt`
	);
	const data = await response.text();
	return data;
};

const fixData = async (data: string) => {
	const system = `
    You are a helpful assistant that can censor data. 
    You should change every sensitive data such as name, address etc. to "CENZURA".
    `;

	const prompt = `
    Fix the following data: ${data}
    `;

	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: prompt },
		],
	});
	return completion.choices[0].message.content;
};

const sendFixedData = async (data: string) => {
	const response = await fetch(`https://centrala.ag3nts.org/report`, {
		method: "POST",
		body: JSON.stringify({
			apikey: process.env.AI_DEVS_KEY,
			task: "CENZURA",
			answer: data,
		}),
	});

	return response.json();
};

const proceedData = async () => {
	const data = await getDataToCensored();
	const censoredData = await fixData(data);

	if (!censoredData) {
		throw new Error("No data to send");
	}

	const response = await sendFixedData(censoredData);
	console.log(response);
};

proceedData();
