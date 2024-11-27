import OpenAI from "openai";
import { PROMPT_GENERATE_SQL } from "./utils";

const openai = new OpenAI();

const TABLES_TO_PROCESS = ["users", "datacenters", "connections"];

const getTablesStructures = async () => {
	const tableStructures: any[] = [];
	await Promise.all(
		TABLES_TO_PROCESS.map(async table => {
			const response = await fetch(process.env.BANAN_DB_URL!, {
				method: "POST",
				body: JSON.stringify({
					task: "database",
					apikey: process.env.AI_DEVS_KEY,
					query: `show create table ${table}`,
				}),
			});
			const data = await response.json();

			if (data.reply.length === 0) {
				throw new Error(`No data returned for table ${table}`);
			}

			const tableStructure = data.reply[0];

			tableStructures.push(tableStructure);
		})
	);

	return tableStructures;
};

const generateSQL = async (tableStructures: any[]) => {
	const response = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: PROMPT_GENERATE_SQL },
			{
				role: "user",
				content: `
				<tables_structure>
				${JSON.stringify(tableStructures, null, 2)}
				</tables_structure>
				`,
			},
		],
		model: "gpt-4o-mini",
	});

	return response.choices[0].message.content?.trim()!;
};

const main = async () => {
	const tableStructures = await getTablesStructures();
	const sql = await generateSQL(tableStructures);

	console.log(sql);
};

main();
