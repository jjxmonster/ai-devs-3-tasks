import express from "express";
import { OpenAI } from "openai";
import cors from "cors";
import { SYSTEM_PROMPT } from "./prompt";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	})
);

const openai = new OpenAI();

app.post("/", async (req, res) => {
	const { instruction } = req.body;

	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: instruction },
		],
	});

	console.log(response.choices[0].message.content);

	res.send(
		JSON.stringify({
			description: response.choices[0].message.content,
		})
	);
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
