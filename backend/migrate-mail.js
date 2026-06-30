require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to create emails table...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS emails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_email VARCHAR(255) NOT NULL,
                sender_name VARCHAR(255),
                recipient_email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                body_html TEXT,
                body_text TEXT,
                folder ENUM('inbox', 'sent', 'draft', 'trash') DEFAULT 'inbox',
                is_unread BOOLEAN DEFAULT TRUE,
                timestamp BIGINT NOT NULL
            );
        `);
        
        console.log("Successfully created emails table.");

        // Insert a dummy email for demonstration
        const [rows] = await db.query('SELECT * FROM emails');
        if (rows.length === 0) {
             await db.query(`
                 INSERT INTO emails (sender_email, sender_name, recipient_email, subject, body_html, body_text, folder, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             `, [
                 'admin@helvicaconnect.com', 
                 'Helvica Admin', 
                 'agent@helvicaconnect.com', 
                 'Welcome to Helvica Mail!', 
                 '<p>This is your new <b>internal inbox</b>. You can use it to communicate with other agents or customers directly.</p>', 
                 'This is your new internal inbox. You can use it to communicate with other agents or customers directly.',
                 'inbox', 
                 Date.now()
             ]);
             console.log("Inserted dummy welcome email.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
