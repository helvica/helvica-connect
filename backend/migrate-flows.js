require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create flows table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS flows (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                nodes JSON NOT NULL,
                edges JSON NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        
        console.log("Flows table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
