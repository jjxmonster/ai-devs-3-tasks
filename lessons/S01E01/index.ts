import puppeteer from "puppeteer";
import OpenAI from "openai";

async function automateAnswer(): Promise<string> {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto("https://xyz.ag3nts.org/");
	await page.type('input[name="username"]', "tester");
	await page.type('input[name="password"]', "574e112a");

	const questionElement = await page.$("#human-question");
	const question = await page.evaluate(
		el => el.textContent?.trim(),
		questionElement
	);

	const answer = await solveQuestionWithOpenAI(question);

	await page.type('input[name="answer"]', answer);

	await page.click('button[type="submit"]');
	await page.waitForNavigation();

	const content = await page.content();
	console.log("Page:", content);

	await browser.close();

	return content;
}

async function solveQuestionWithOpenAI(question: string): Promise<string> {
	const openai = new OpenAI();

	const prompt = `
    You are a helpful assistant that can answer questions about dates.
    Answer the following question with only the year and noting else: ${question}
    `;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt }],
		});

		const answer = completion.choices[0].message.content;
		return answer || "000";
	} catch (error) {
		return "0000";
	}
}

automateAnswer();
