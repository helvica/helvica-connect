require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to update agents table...");
        
        await db.query(`
            ALTER TABLE agents 
            ADD COLUMN mail_access_status ENUM('none', 'requested', 'approved') DEFAULT 'none',
            ADD COLUMN mail_address VARCHAR(255) DEFAULT NULL
        `);
        
        console.log("Successfully added mail_access_status and mail_address to agents table.");

        // For testing purposes, grant the admin user approved access
        await db.query(`
            UPDATE agents SET mail_access_status = 'approved', mail_address = 'admin@helvicaconnect.com' WHERE id = 1
        `);
        console.log("Granted default mail access to admin (id=1).");

        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist, migration skipped.");
            process.exit(0);
        } else {
            console.error("Migration failed:", err);
            process.exit(1);
        }
    }
}

migrate();
