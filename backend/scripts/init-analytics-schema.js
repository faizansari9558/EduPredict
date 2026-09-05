#!/usr/bin/env node

/**
 * Database Schema Initialization Script
 * Applies Phase 9 Analytics schema to the EduPredict database
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Split SQL by DELIMITER changes
function splitSQLStatements(sql) {
  const statements = [];
  let current = '';
  let inDelimiter = false;
  let delimiter = ';';
  const lines = sql.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();

    // Skip comments and empty lines
    if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*') || trimmedLine === '') {
      current += line + '\n';
      continue;
    }

    // Handle DELIMITER changes
    if (trimmedLine.startsWith('DELIMITER')) {
      if (current.trim()) {
        statements.push({ sql: current.trim(), delimiter: delimiter });
        current = '';
      }
      delimiter = trimmedLine.replace('DELIMITER', '').trim();
      inDelimiter = true;
      continue;
    }

    current += line + '\n';

    // Check if statement is complete
    if (trimmedLine.endsWith(delimiter)) {
      if (delimiter !== ';' || !inDelimiter) {
        statements.push({ sql: current.trim(), delimiter: delimiter });
        current = '';
        if (delimiter !== ';') inDelimiter = false;
        delimiter = ';';
      }
    }
  }

  if (current.trim()) {
    statements.push({ sql: current.trim(), delimiter: delimiter });
  }

  return statements;
}

async function initializeAnalyticsSchema() {
  let connection;

  try {
    // Create connection to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'EduPredict',
      multipleStatements: false
    });

    console.log('✓ Connected to EduPredict database');

    // Read Phase 9 schema file
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema-phase9.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    console.log('✓ Schema file loaded');
    console.log('→ Applying Phase 9 Analytics schema...\n');

    // Split and execute statements
    const statements = splitSQLStatements(schemaContent);
    let successCount = 0;
    let skipCount = 0;

    for (const stmt of statements) {
      if (!stmt.sql || stmt.sql.length === 0) continue;

      // Remove the delimiter from the end if present
      let cleanSQL = stmt.sql;
      if (stmt.delimiter !== ';' && cleanSQL.endsWith(stmt.delimiter)) {
        cleanSQL = cleanSQL.slice(0, -stmt.delimiter.length).trim();
      } else if (cleanSQL.endsWith(';')) {
        cleanSQL = cleanSQL.slice(0, -1).trim();
      }

      try {
        // Skip comment blocks
        if (cleanSQL.startsWith('/*') && cleanSQL.endsWith('*/')) {
          skipCount++;
          continue;
        }

        await connection.query(cleanSQL);
        successCount++;
      } catch (err) {
        // Log errors but continue
        if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
          console.error(`⚠ Warning on statement: ${err.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`✓ Executed ${successCount} SQL statements\n`);

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'EduPredict' 
      AND TABLE_NAME IN (
        'student_metrics', 
        'skill_proficiency', 
        'at_risk_students',
        'assessment_question_analytics',
        'department_metrics',
        'batch_metrics'
      )
      ORDER BY TABLE_NAME
    `);

    if (tables.length > 0) {
      console.log('✓ Analytics Tables Created:');
      tables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    // Verify views were created
    const [views] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = 'EduPredict' 
      AND TABLE_NAME LIKE 'vw_%'
      ORDER BY TABLE_NAME
    `);

    if (views.length > 0) {
      console.log('\n✓ Analytics Views Created:');
      views.forEach(view => {
        console.log(`  - ${view.TABLE_NAME}`);
      });
    }

    // Verify procedures were created
    const [procedures] = await connection.query(`
      SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'EduPredict' 
      AND ROUTINE_NAME LIKE 'sp_%'
      ORDER BY ROUTINE_NAME
    `);

    if (procedures.length > 0) {
      console.log('\n✓ Stored Procedures Created:');
      procedures.forEach(proc => {
        console.log(`  - ${proc.ROUTINE_NAME}`);
      });
    }

    console.log('\n✅ Phase 9 Analytics Schema Initialization Complete!');
    console.log('\nNext Steps:');
    console.log('1. Start backend server: npm start or node server.js');
    console.log('2. Create analytics API endpoints');
    console.log('3. Build analytics dashboards in frontend');
    console.log('4. Test analytics functionality');

  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Check database credentials (DB_USER, DB_PASSWORD)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   → Database does not exist. Run setup script first.');
    } else if (error.sqlState) {
      console.error(`   → SQL Error [${error.sqlState}]: ${error.sqlMessage}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
initializeAnalyticsSchema().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
