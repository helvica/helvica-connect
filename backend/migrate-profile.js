require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create company_profile table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS company_profile (
                id INT AUTO_INCREMENT PRIMARY KEY,
                display_name VARCHAR(255) DEFAULT 'Helvica',
                category VARCHAR(100) DEFAULT 'Medical and health',
                description TEXT,
                address VARCHAR(255),
                email VARCHAR(255),
                website1 VARCHAR(255),
                website2 VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        
        // Insert a default row if it doesn't exist
        const [rows] = await db.query('SELECT * FROM company_profile');
        if (rows.length === 0) {
             await db.query(`
                 INSERT INTO company_profile (display_name, category, description, address, email, website1)
                 VALUES (
                     'Helvica',
                     'Medical and health',
                     'Helvica is a pharmaceutical and healthcare company focused on providing high-quality medicines.',
                     '123 Pharma Way, Health City',
                     'contact@helvicapharma.com',
                     'https://www.helvicapharma.com/'
                 )
             `);
        }
        
        console.log("company_profile table created and seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
