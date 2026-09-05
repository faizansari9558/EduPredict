const pool = require('../config/db');

async function initPhase19() {
  console.log('Initializing Phase 19 Job Drives & Applications...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_drives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      job_title VARCHAR(255) NOT NULL,
      job_role VARCHAR(150) NOT NULL,
      package_lpa DECIMAL(5,2) NOT NULL DEFAULT 6.00,
      min_cgpa DECIMAL(3,2) NOT NULL DEFAULT 6.50,
      min_aptitude_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
      min_coding_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
      required_skills JSON NULL,
      job_description TEXT NULL,
      status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_drive_id INT NOT NULL,
      student_id INT NOT NULL,
      ml_match_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      status ENUM('applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected') NOT NULL DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_student_drive UNIQUE (job_drive_id, student_id)
    )
  `);

  // Clear existing
  await pool.query('DELETE FROM job_applications');
  await pool.query('DELETE FROM job_drives');

  // Seed sample company drives
  const sampleDrives = [
    {
      company_name: 'Microsoft',
      job_title: 'Software Engineer - Campus Graduate',
      job_role: 'Full-Stack / Cloud Engineering',
      package_lpa: 18.5,
      min_cgpa: 8.0,
      min_aptitude_score: 75.0,
      min_coding_score: 80.0,
      required_skills: JSON.stringify(['C++', 'Python', 'Data Structures', 'Algorithms', 'Azure']),
      job_description: 'Join the Azure and Developer Division building scalable cloud backends and developer tools.',
      created_by: 1
    },
    {
      company_name: 'Amazon',
      job_title: 'Software Development Engineer (SDE-1)',
      job_role: 'Backend Systems & Distributed Services',
      package_lpa: 16.0,
      min_cgpa: 7.5,
      min_aptitude_score: 70.0,
      min_coding_score: 75.0,
      required_skills: JSON.stringify(['Java', 'Python', 'AWS', 'System Design', 'DBMS']),
      job_description: 'Build high-throughput transaction processing systems serving millions of global users.',
      created_by: 1
    },
    {
      company_name: 'Infosys Tech',
      job_title: 'Specialist Programmer & Systems Engineer',
      job_role: 'Full-Stack Web Development',
      package_lpa: 9.5,
      min_cgpa: 6.5,
      min_aptitude_score: 60.0,
      min_coding_score: 65.0,
      required_skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'SQL', 'Git']),
      job_description: 'Develop enterprise digital transformation products and modern web applications.',
      created_by: 1
    }
  ];

  for (const d of sampleDrives) {
    const [res] = await pool.query(`
      INSERT INTO job_drives 
      (company_name, job_title, job_role, package_lpa, min_cgpa, min_aptitude_score, min_coding_score, required_skills, job_description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [d.company_name, d.job_title, d.job_role, d.package_lpa, d.min_cgpa, d.min_aptitude_score, d.min_coding_score, d.required_skills, d.job_description, d.created_by]);

    // Add student (id: 5) application to drive 1
    if (d.company_name === 'Microsoft') {
      await pool.query(`
        INSERT INTO job_applications (job_drive_id, student_id, ml_match_score, status)
        VALUES (?, 5, 94.5, 'shortlisted')
      `, [res.insertId]);
    }
  }

  console.log('Phase 19 job drives and seed data initialized successfully.');
  process.exit(0);
}

initPhase19().catch(e => {
  console.error('Phase 19 init error:', e);
  process.exit(1);
});
