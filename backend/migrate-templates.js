require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create templates table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS templates (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                category VARCHAR(50),
                language VARCHAR(50),
                status VARCHAR(50) DEFAULT 'PENDING',
                components JSON
            );
        `);
        
        console.log("Templates table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
