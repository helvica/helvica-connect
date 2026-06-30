require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create ai_settings table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS ai_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                api_key VARCHAR(255),
                system_prompt TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        
        const [rows] = await db.query('SELECT * FROM ai_settings');
        if (rows.length === 0) {
             await db.query(`
                 INSERT INTO ai_settings (api_key, system_prompt)
                 VALUES (
                     '',
                     'You are a helpful customer support agent for Helvica. Keep your answers concise, professional, and friendly.'
                 )
             `);
        }
        
        console.log("ai_settings table created and seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
