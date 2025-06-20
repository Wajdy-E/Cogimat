const { Pool } = require("pg");

const pool = new Pool({
	connectionString: process.env.SUPABASE_CONNECTION_STRING,
});

async function query(text, params = []) {
	const client = await pool.connect();
	try {
		const res = await client.query(text, params);
		return res.rows;
	} finally {
		client.release();
	}
}

module.exports = { query };
