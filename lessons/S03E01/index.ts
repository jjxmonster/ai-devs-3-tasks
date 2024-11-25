import fsPromise from "fs/promises";
import path from "path";
import OpenAI from "openai";
import {
	FACT_FILES_DIR,
	FACTS_TO_SUMARIZE,
	SUMMARIZE_FACT_PROMPT,
	SUMMARIZED_FACTS,
	REPORTS_TO_GENERATE_KEYWORDS,
	GENERATE_KEYWORDS_PROMPT,
} from "./utils";

const openai = new OpenAI();

const getSummarizedFacts = async () => {
	let factsSummary = "";
	await Promise.all(
		SUMMARIZED_FACTS.map(async fact => {
			const text = await fsPromise.readFile(
				path.join(FACT_FILES_DIR, fact),
				"utf-8"
			);

			factsSummary += text;
		})
	);

	return factsSummary;
};

const processReports = async () => {
	let keywords = {};
	await Promise.all(
		REPORTS_TO_GENERATE_KEYWORDS.map(async report => {
			const reportText = await fsPromise.readFile(report, "utf-8");
			const generatedKeywords = await generateKeywords(reportText);

			keywords = {
				...keywords,
				[report.replace("pliki_z_fabryki/", "")]: generatedKeywords,
			};
		})
	);

	console.log(JSON.stringify(keywords));
};

const generateKeywords = async (report: string) => {
	const summarizedFacts = await getSummarizedFacts();

	const content = `<text_to_generate_keywords>${report}</text_to_generate_keywords>

    <additional_data>${summarizedFacts}</additional_data>`;

	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: GENERATE_KEYWORDS_PROMPT },
			{ role: "user", content },
		],
		model: "gpt-4o-mini",
	});

	return response.choices[0].message.content!;
};

const processFacts = async () => {
	for (const fact of FACTS_TO_SUMARIZE) {
		const text = await fsPromise.readFile(
			path.join(FACT_FILES_DIR, fact),
			"utf-8"
		);
		if (!text.includes("entry deleted")) {
			const summary = await summarizeFact(text);

			await fsPromise.writeFile(
				path.join(__dirname, `${fact}.txt`),
				summary
			);
		}
	}
};

const summarizeFact = async (text: string) => {
	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: SUMMARIZE_FACT_PROMPT },
			{ role: "user", content: text },
		],
		model: "gpt-4o-mini",
	});

	return response.choices[0].message.content!;
};

const main = async () => {
	await processReports();
	await processFacts();
};

main();
