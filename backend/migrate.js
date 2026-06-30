require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database...");
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        
        // Split by semicolon, but this is a simple schema so it works
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        
        for (let stmt of statements) {
            console.log("Executing:", stmt.substring(0, 50) + "...");
            await db.query(stmt);
        }
        
        console.log("Database initialized successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
