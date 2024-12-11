import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt";

const openai = new OpenAI();

const LABS = ["correct.txt", "incorrect.txt", "verify.txt"];

const getLabs = async () => {
	let labs: Record<string, string> = {};
	LABS.forEach(async lab => {
		const labContent = fs.readFileSync(
			path.join(__dirname, `./labs/${lab}`),
			"utf8"
		);
		labs[lab.split(".")[0]] = labContent;
	});
	return labs;
};

const processLabs = async () => {
	const labs = await getLabs();
	const system = SYSTEM_PROMPT;

	const content = `
    You are provided with three datasets: “original”, “counterfeit”, and “to_verify”. Each dataset contains sets of numbers. Your tasks are:
	1.	Analyze the “original” and “counterfeit” datasets to determine how the numbers are being counterfeited.
	2.	Using your findings, check each set in the “to_verify” dataset to determine which sets are not counterfeited.
	3.	Return the IDs of the sets from “to_verify” that are not counterfeited.

    Original set:
    ${labs.correct}

    Counterfeit set:
    ${labs.incorrect}

    To verify set:
    ${labs.verify}

    Please analyze the datasets and provide the IDs of the sets from “to_verify” that are not counterfeited.

Notes:
	•	Ensure the AI understands that it needs to find a pattern or method used in counterfeiting between the “original” and “counterfeit” datasets.
	•	The AI should apply this pattern to the “to_verify” dataset to identify which sets do not fit the counterfeit pattern.
	•	By requesting the IDs, you guide the AI to present a clear and concise answer.

Return the IDs of the sets from “to_verify” that are not counterfeited. Id is prefix for the set.
    `;

	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: system },
			{ role: "user", content },
		],
	});

	console.log(response.choices[0].message.content);
};

processLabs();
