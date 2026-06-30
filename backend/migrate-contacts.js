require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create contacts table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(255) UNIQUE NOT NULL,
                dob VARCHAR(50) DEFAULT NULL,
                tags JSON DEFAULT NULL,
                source VARCHAR(100) DEFAULT 'Manual',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("Contacts table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
