import { Pool } from 'pg';

const pool = new Pool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER,
	password: process.env.DB_PSWD,
	database: process.env.DB_DB,
	max: 10,
	idleTimeoutMillis: 30000,
});

export default pool;
