require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runPhase8Schema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'EduPredict',
    multipleStatements: true
  });

  console.log('Connected to EduPredict database');
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema-phase8.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await connection.query(schema);
  console.log('Phase 8 schema executed successfully!');
  
  const [tables] = await connection.query("SHOW TABLES LIKE 'coding%'");
  console.log('Created coding tables:', tables);
  
  await connection.end();
}

runPhase8Schema().catch(e => { console.error('Phase 8 schema error:', e); process.exit(1); });
