/**
 * Job Drive & Placement Cell Controller
 * Handles company drive listings, student eligibility matching, one-click applications, and candidate shortlisting.
 */

const pool = require('../config/db');

/**
 * GET /api/job-drives
 * Lists all active placement drives with eligibility computation for current student
 */
exports.getJobDrives = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch all active drives
    const [drives] = await pool.query(`
      SELECT 
        jd.id, jd.company_name, jd.job_title, jd.job_role, jd.package_lpa,
        jd.min_cgpa, jd.min_aptitude_score, jd.min_coding_score,
        jd.required_skills, jd.job_description, jd.status, jd.created_at,
        COUNT(ja.id) AS total_applicants
      FROM job_drives jd
      LEFT JOIN job_applications ja ON jd.id = ja.job_drive_id
      WHERE jd.status = 'active'
      GROUP BY jd.id
      ORDER BY jd.package_lpa DESC
    `);

    // If student, check eligibility & application status
    let studentProfile = null;
    let applicationsMap = {};

    if (userRole === 'student') {
      const [stuRows] = await pool.query(`
        SELECT s.cgpa, sm.aptitude_score, sm.coding_score, sm.placement_ready_score
        FROM students s
        LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
        WHERE s.user_id = ?
      `, [userId]);

      if (stuRows.length > 0) {
        studentProfile = {
          cgpa: stuRows[0].cgpa === null ? null : Number(stuRows[0].cgpa),
          aptitude_score: stuRows[0].aptitude_score === null ? null : Number(stuRows[0].aptitude_score),
          coding_score: stuRows[0].coding_score === null ? null : Number(stuRows[0].coding_score),
          placement_ready_score: stuRows[0].placement_ready_score === null ? null : Number(stuRows[0].placement_ready_score)
        };
      }
      const [skills] = await pool.query(
        `SELECT skill_name FROM skill_proficiency WHERE student_id = ?`,
        [userId]
      );
      if (studentProfile) studentProfile.skills = new Set(skills.map(skill => skill.skill_name.toLowerCase()));

      const [apps] = await pool.query(
        'SELECT job_drive_id, status, ml_match_score FROM job_applications WHERE student_id = ?',
        [userId]
      );
      apps.forEach(a => {
        applicationsMap[a.job_drive_id] = {
          status: a.status,
          ml_match_score: a.ml_match_score
        };
      });
    }

    const formattedDrives = drives.map(d => {
      let isEligible = true;
      let eligibilityDetails = {
        cgpa_eligible: true,
        aptitude_eligible: true,
        coding_eligible: true
      };

      if (studentProfile) {
        eligibilityDetails.cgpa_eligible = studentProfile.cgpa !== null && studentProfile.cgpa >= Number(d.min_cgpa);
        eligibilityDetails.aptitude_eligible = studentProfile.aptitude_score !== null && studentProfile.aptitude_score >= Number(d.min_aptitude_score);
        eligibilityDetails.coding_eligible = studentProfile.coding_score !== null && studentProfile.coding_score >= Number(d.min_coding_score);
        const requiredSkills = typeof d.required_skills === 'string' ? JSON.parse(d.required_skills || '[]') : (d.required_skills || []);
        eligibilityDetails.skills_eligible = requiredSkills.every(skill => studentProfile.skills.has(String(skill).toLowerCase()));
        isEligible = eligibilityDetails.cgpa_eligible && eligibilityDetails.aptitude_eligible &&
          eligibilityDetails.coding_eligible && eligibilityDetails.skills_eligible;
      } else if (userRole === 'student') {
        isEligible = false;
        eligibilityDetails = {
          cgpa_eligible: false,
          aptitude_eligible: false,
          coding_eligible: false,
          skills_eligible: false
        };
      }

      return {
        ...d,
        required_skills: typeof d.required_skills === 'string' ? JSON.parse(d.required_skills) : (d.required_skills || []),
        is_eligible: isEligible,
        eligibility_details: eligibilityDetails,
        application_status: applicationsMap[d.id]?.status || null,
        my_match_score: applicationsMap[d.id]?.ml_match_score || null
      };
    });

    res.json({
      success: true,
      data: formattedDrives
    });
  } catch (error) {
    console.error('Fetch job drives error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/job-drives
 * Create a new campus placement drive (Admin/Teacher only)
 */
exports.createJobDrive = async (req, res) => {
  try {
    const {
      company_name,
      job_title,
      job_role,
      package_lpa,
      min_cgpa,
      min_aptitude_score,
      min_coding_score,
      required_skills,
      job_description
    } = req.body;

    if (!company_name || !job_title) {
      return res.status(400).json({ success: false, message: 'Company name and job title are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO job_drives 
      (company_name, job_title, job_role, package_lpa, min_cgpa, min_aptitude_score, min_coding_score, required_skills, job_description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company_name,
      job_title,
      job_role || 'Engineering',
      Number(package_lpa) || 6.0,
      Number(min_cgpa) || 6.5,
      Number(min_aptitude_score) || 60.0,
      Number(min_coding_score) || 60.0,
      JSON.stringify(required_skills || []),
      job_description || '',
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      drive_id: result.insertId
    });
  } catch (error) {
    console.error('Create job drive error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/job-drives/:id/apply
 * Student applies for a placement drive
 */
exports.applyToJobDrive = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id: driveId } = req.params;

    // Check drive exists
    const [drives] = await pool.query('SELECT * FROM job_drives WHERE id = ?', [driveId]);
    if (drives.length === 0) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }
    const drive = drives[0];

    // Check student metrics
    const [stuRows] = await pool.query(`
      SELECT s.cgpa, sm.aptitude_score, sm.coding_score, sm.placement_ready_score
      FROM students s
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      WHERE s.user_id = ?
    `, [studentId]);

    if (!stuRows.length || [stuRows[0].cgpa, stuRows[0].aptitude_score, stuRows[0].coding_score].some(value => value === null)) {
      return res.status(422).json({ success: false, message: 'Verified CGPA and assessment scores are required before applying.' });
    }
    const cgpa = Number(stuRows[0].cgpa);
    const apt = Number(stuRows[0].aptitude_score);
    const code = Number(stuRows[0].coding_score);
    const [skills] = await pool.query('SELECT skill_name FROM skill_proficiency WHERE student_id = ?', [studentId]);
    const availableSkills = new Set(skills.map(skill => skill.skill_name.toLowerCase()));
    const requiredSkills = typeof drive.required_skills === 'string' ? JSON.parse(drive.required_skills || '[]') : (drive.required_skills || []);
    if (cgpa < Number(drive.min_cgpa) || apt < Number(drive.min_aptitude_score) ||
        code < Number(drive.min_coding_score) ||
        !requiredSkills.every(skill => availableSkills.has(String(skill).toLowerCase()))) {
      return res.status(403).json({ success: false, message: 'You do not meet all verified eligibility requirements for this drive.' });
    }
    const matchScore = Math.min(Math.round(((cgpa * 10 * 0.3) + (apt * 0.35) + (code * 0.35))), 99);

    const [existing] = await pool.query(
      'SELECT id FROM job_applications WHERE job_drive_id = ? AND student_id = ?',
      [driveId, studentId]
    );
    if (existing.length) return res.status(409).json({ success: false, message: 'You have already applied to this drive.' });

    await pool.query(`
      INSERT INTO job_applications (job_drive_id, student_id, ml_match_score, status)
      VALUES (?, ?, ?, 'applied')
    `, [driveId, studentId, matchScore]);

    res.json({
      success: true,
      message: `Successfully applied to ${drive.company_name} (${drive.job_title})!`,
      ml_match_score: matchScore
    });
  } catch (error) {
    console.error('Apply job drive error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/job-drives/:id/candidates
 * View applicant pool sorted by ML placement match score
 */
exports.getDriveCandidates = async (req, res) => {
  try {
    const { id: driveId } = req.params;

    const [candidates] = await pool.query(`
      SELECT 
        ja.id AS application_id,
        ja.student_id,
        ja.ml_match_score,
        ja.status AS application_status,
        ja.applied_at,
        u.full_name,
        u.email,
        s.enrollment_number,
        s.cgpa,
        d.name AS department_name,
        sm.aptitude_score,
        sm.coding_score,
        sm.placement_ready_score
      FROM job_applications ja
      JOIN users u ON ja.student_id = u.id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN student_metrics sm ON u.id = sm.student_id
      WHERE ja.job_drive_id = ?
      ORDER BY ja.ml_match_score DESC
    `, [driveId]);

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Get drive candidates error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/job-drives/applications/:applicationId/status
 * Update candidate status (shortlisted / interview_scheduled / selected / rejected)
 */
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    if (!['shortlisted', 'interview_scheduled', 'selected', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status.' });
    }

    const ownershipQuery = req.user.role === 'admin'
      ? 'SELECT id FROM job_applications WHERE id = ?'
      : `SELECT ja.id FROM job_applications ja
         JOIN job_drives jd ON jd.id = ja.job_drive_id
         JOIN teachers t ON t.department_id = (SELECT department_id FROM students WHERE user_id = ja.student_id)
         WHERE ja.id = ? AND t.user_id = ?`;
    const [owned] = await pool.query(ownershipQuery, req.user.role === 'admin' ? [applicationId] : [applicationId, req.user.id]);
    if (!owned.length) return res.status(403).json({ success: false, message: 'You cannot update this application.' });
    await pool.query(
      'UPDATE job_applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    res.json({
      success: true,
      message: `Candidate application status updated to ${status}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
