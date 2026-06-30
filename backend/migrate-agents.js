require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create agents table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS agents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) DEFAULT 'Agent',
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Insert a default admin if table is empty
        const [rows] = await db.query('SELECT COUNT(*) as count FROM agents');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO agents (name, email, role, status)
                VALUES ('Admin User', 'admin@helvica.com', 'Admin', 'Active')
            `);
            console.log("Inserted default admin user.");
        }
        
        console.log("Agents table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
