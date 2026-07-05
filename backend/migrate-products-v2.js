require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        console.log("Connecting to database to upgrade products table...");
        
        // Add SKU
        try {
            await db.query(`ALTER TABLE products ADD COLUMN sku VARCHAR(100)`);
            console.log("Added sku column.");
        } catch (e) {
            console.log("sku column might already exist.");
        }
        
        // Add Category
        try {
            await db.query(`ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'Uncategorized'`);
            console.log("Added category column.");
        } catch (e) {
            console.log("category column might already exist.");
        }
        
        // Add Stock Quantity
        try {
            await db.query(`ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0`);
            console.log("Added stock_quantity column.");
        } catch (e) {
            console.log("stock_quantity column might already exist.");
        }
        
        // Add Variants
        try {
            await db.query(`ALTER TABLE products ADD COLUMN variants JSON`);
            console.log("Added variants column.");
        } catch (e) {
            console.log("variants column might already exist.");
        }
        
        console.log("Products table upgraded successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
