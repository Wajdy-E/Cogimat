import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.CONNECTION_STRING,
});

export async function query(text: string, params?: any[]) {
	const client = await pool.connect();
	try {
		const res = await client.query(text, params);
		return res.rows;
	} finally {
		client.release();
	}
}
