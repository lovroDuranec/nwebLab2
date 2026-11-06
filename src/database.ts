import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_URL) {
    throw new Error('nije dobar url');
}
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: {rejectUnauthorized: false}
})


//neka baza random podataka o korisnicima za testiranje sql injectiona i lose autentifikacije
export async function initializeDatabase() {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS lab2_accounts (
            id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            information VARCHAR(255) NOT NULL,
            place VARCHAR(255) NOT NULL,
        );
    `);

    console.log('baza je dobra');
}

export async function getInformationBasedOnUsernameAndPassword(username: string, password: string){
    const result = await pool.query(`
        SELECT username, information, place FROM passes WHERE username = $1 AND password = $2
    `, [username, password]);

    return result.rows[0];
}

export async function createUser(username: string, password: string, place: string, information: string){
    const result = await pool.query(`
        INSERT INTO passes (username, password, information, place) VALUES ($1, $2, $3, $4)
    `,
    [username, password, information, place]);
    return "uspjesan unos";
}