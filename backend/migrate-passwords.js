require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
    try {
        console.log("Connecting to database to add password_hash to agents...");
        
        try {
            await db.query("ALTER TABLE agents ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL;");
            console.log("Added password_hash column");
        } catch(e) {
            if(e.code === 'ER_DUP_FIELDNAME') console.log("password_hash column already exists");
            else throw e;
        }

        // Generate a hash for the default admin user (password: 'password')
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password', salt);

        await db.query("UPDATE agents SET password_hash = ? WHERE email = 'admin@helvica.com'", [hash]);
        console.log("Updated default admin user with secure password hash");

        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
