require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to alter campaigns table...");
        
        await db.query(`
            ALTER TABLE campaigns
            ADD COLUMN IF NOT EXISTS delivered_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS replied_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS failed_count INT DEFAULT 0;
        `);
        
        console.log("Campaigns table altered successfully with new metrics columns!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
