require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to add media columns...");
        
        try {
            await db.query("ALTER TABLE messages ADD COLUMN media_url VARCHAR(255);");
            console.log("Added media_url column");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("media_url already exists");
            else throw e;
        }

        try {
            await db.query("ALTER TABLE messages ADD COLUMN media_type VARCHAR(50);");
            console.log("Added media_type column");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("media_type already exists");
            else throw e;
        }

        console.log("Media migration successful!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
