require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create campaigns table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                template_name VARCHAR(255) NOT NULL,
                audience_target VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Running',
                total_sent INT DEFAULT 0,
                total_read INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("Campaigns table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
