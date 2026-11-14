import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_URL) {
    throw new Error('nije dobar url');
}
export const pool = new Pool({
    connectionString: process.env.DB_URL,
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
            place VARCHAR(255) NOT NULL
        );
    `);

    console.log('baza je dobra');
}

export async function getInformationBasedOnUsernameAndPassword(username: string, password: string){
    const result = await pool.query(`
        SELECT username, information, place FROM lab2_accounts WHERE username = $1 AND password = $2
    `, [username, password]);

    return result.rows[0];
}

export async function createUser(username: string, password: string, location: string, information: string){
    const result = await pool.query(`
        INSERT INTO lab2_accounts (username, password, information, location) VALUES ($1, $2, $3, $4)
    `,
    [username, password, information, location]);
    return "uspjesan unos";
}