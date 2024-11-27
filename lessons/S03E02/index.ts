import fs from "fs";
import fsPromise from "fs/promises";
import path from "path";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

const qdrant = new QdrantClient({
	url: process.env.QDRANT_URL,
	apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI();
const COLLECTION_NAME = "weapons_tests";
const query =
	"W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?";

type Document = {
	content: string;
	metadata: {
		date: string;
	};
};

const processDocuments = async () => {
	const documents = fs
		.readdirSync(path.join(__dirname, "weapons_tests"))
		.map(file => {
			const content = fs.readFileSync(
				path.join(__dirname, "weapons_tests", file),
				"utf8"
			);

			return {
				content,
				metadata: {
					date: file.replace(".txt", "").replaceAll("_", "-"),
				},
			};
		});

	const pointsToUpsert = await Promise.all(
		documents.map(async document => {
			const embedding = await embbedDocument(document.content);

			return {
				id: uuidv4(),
				vector: embedding,
				payload: {
					text: document.content,
					...document.metadata,
				},
			};
		})
	);

	const pointsFilePath = path.join(__dirname, "points.json");
	await fsPromise.writeFile(
		pointsFilePath,
		JSON.stringify(pointsToUpsert, null, 2)
	);

	await saveDocument(pointsToUpsert);
};

const saveDocument = async (pointsToUpsert: any) => {
	await qdrant
		.upsert(COLLECTION_NAME, {
			wait: true,
			points: pointsToUpsert,
		})
		.catch(error => {
			console.error("Error details:", error);
		});
};

const embbedDocument = async (content: string) => {
	const response = await openai.embeddings.create({
		model: "text-embedding-3-large",
		input: content,
	});

	return response.data[0].embedding;
};

const search = async (query: string) => {
	const queryEmbedding = await embbedDocument(query);

	const response = await qdrant.search(COLLECTION_NAME, {
		vector: queryEmbedding,
		limit: 1,
	});

	return response;
};

const main = async () => {
	const collections = await qdrant.getCollections();

	if (!collections.collections.some(c => c.name === COLLECTION_NAME)) {
		await qdrant.createCollection(COLLECTION_NAME, {
			vectors: { size: 3072, distance: "Cosine" },
		});
	}

	await processDocuments();
	await search(query);
};

main();
