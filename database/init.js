const path = require('path');
require(path.join(__dirname, '../server/node_modules/dotenv')).config({ path: path.join(__dirname, '../server/.env') });
const { Pool } = require(path.join(__dirname, '../server/node_modules/pg'));
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error creating database schema:', error.message);
  } finally {
    await pool.end();
  }
}

initDatabase();
