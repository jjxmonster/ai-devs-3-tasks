import neo4j from "neo4j-driver";
import fs from "fs";
import path from "path";

type User = {
	id: string;
	username: string;
	access_level: string;
	is_active: string;
	lastlog: string;
};
type Connection = {
	user1_id: string;
	user2_id: string;
};

const driver = neo4j.driver(
	process.env.NEO4J_URL!,
	neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

const getUsersData = async (): Promise<User[]> => {
	const users = await fs.readFileSync(
		path.join(__dirname, "./users.json"),
		"utf-8"
	);
	return JSON.parse(users);
};

const getConnectionsData = async (): Promise<Connection[]> => {
	const connections = await fs.readFileSync(
		path.join(__dirname, "./connections.json"),
		"utf-8"
	);
	return JSON.parse(connections);
};

const createNode = async (node: User) => {
	const session = driver.session();
	const query = `CREATE (user:User {id: $id, username: $username, access_level: $access_level, is_active: $is_active, lastlog: $lastlog})`;
	const result = await session.run(query, node);
	await session.close();
	return result;
};

const connectNodes = async (connection: Connection) => {
	const session = driver.session();
	const query = `MATCH (user1:User {id: $user1_id}), (user2:User {id: $user2_id}) CREATE (user1)-[:CONNECTED]->(user2)`;
	const result = await session.run(query, connection);
	await session.close();
	return result;
};

const findPath = async (start: string, end: string) => {
	const session = driver.session();
	const query = `
        MATCH (user1:User {username: $start}), (user2:User {username: $end})
        MATCH path = shortestPath((user1)-[:CONNECTED*]-(user2))
        RETURN [node IN nodes(path) | node.username] AS usernames`;
	const result = await session.run(query, { start, end });
	await session.close();

	if (result.records.length > 0) {
		return result.records[0].get("usernames");
	}
	return [];
};

const main = async () => {
	Promise.all([getUsersData(), getConnectionsData()]).then(
		([users, connections]) => {
			users.forEach(async user => {
				await createNode(user);
			});
			connections.forEach(async connection => {
				await connectNodes(connection);
			});
		}
	);

	findPath("Rafał", "Barbara").then(result => {
		console.log(result);
	});
};

main();
