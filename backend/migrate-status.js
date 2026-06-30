require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to add status column...");
        
        try {
            await db.query("ALTER TABLE chats ADD COLUMN status VARCHAR(50) DEFAULT 'Open';");
            console.log("Added status column to chats table");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("status column already exists");
            else throw e;
        }

        console.log("Status migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
