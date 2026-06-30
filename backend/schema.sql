-- Run these commands in your MySQL Database (e.g., via phpMyAdmin on Hostinger)

CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contactName VARCHAR(255),
    contactPhone VARCHAR(50) UNIQUE NOT NULL,
    lastMessage TEXT,
    timestamp BIGINT,
    status VARCHAR(50) DEFAULT 'Open',
    assignedTo VARCHAR(100),
    tags JSON,
    unreadCount INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY, -- Meta provides string IDs (wamid.HBg...)
    chat_id INT NOT NULL,
    text TEXT,
    sender VARCHAR(50) NOT NULL, -- 'agent' or 'contact'
    timestamp BIGINT,
    media_url VARCHAR(255),
    media_type VARCHAR(50),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Insert a test chat so the inbox isn't completely empty
INSERT INTO chats (contactName, contactPhone, lastMessage, timestamp, status, assignedTo, unreadCount)
VALUES ('Demo User', '15551234567', 'Welcome to Helvica Connect!', UNIX_TIMESTAMP() * 1000, 'Open', 'Agent', 0)
ON DUPLICATE KEY UPDATE id=id;
