const mysql = require('mysql2/promise');

async function createDb() {
  try {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root'
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS bookx_db');
    console.log('Database created or already exists.');
    await connection.end();
  } catch (err) {
    console.error('Failed to create DB:', err);
    process.exit(1);
  }
}

createDb();
