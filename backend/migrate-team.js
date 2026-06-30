require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to alter chats table...");
        
        await db.query(`
            ALTER TABLE chats ADD COLUMN assigned_to VARCHAR(255) DEFAULT 'Unassigned';
        `);
        
        console.log("Chats table altered successfully!");
        process.exit(0);
    } catch (e) {
        // Ignore if column already exists
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column assigned_to already exists. Skipping.");
            process.exit(0);
        } else {
            console.error("Migration failed:", e.message);
            process.exit(1);
        }
    }
}

migrate();
