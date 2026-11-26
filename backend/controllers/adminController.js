const db = require('../config/db');
const XLSX = require('xlsx');

async function getDashboardOverview(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
         WHERE r.name = 'student' AND u.status = 'active') AS total_students,
        (SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
         WHERE r.name = 'teacher' AND u.status = 'active') AS total_teachers,
        (SELECT COUNT(*) FROM departments) AS total_departments,
        (SELECT COUNT(*) FROM students WHERE verification_status = 'pending') AS pending_verifications,
        (SELECT COUNT(*) FROM assessments) AS total_assessments,
        (SELECT COUNT(*) FROM student_metrics sm
         JOIN users u ON u.id = sm.student_id
         JOIN roles r ON r.id = u.role_id
         WHERE r.name = 'student' AND u.status = 'active' AND sm.assessment_attempts > 0) AS students_with_metrics,
        (SELECT COUNT(*) FROM student_metrics sm
         JOIN users u ON u.id = sm.student_id
         JOIN roles r ON r.id = u.role_id
         WHERE r.name = 'student' AND u.status = 'active'
           AND sm.assessment_attempts > 0 AND sm.placement_ready_score >= 60) AS placement_ready_students
    `);
    const stats = rows[0] || {};
    const studentsWithMetrics = Number(stats.students_with_metrics || 0);
    const placementReadyStudents = Number(stats.placement_ready_students || 0);
    const pendingVerifications = Number(stats.pending_verifications || 0);
    const totalAssessments = Number(stats.total_assessments || 0);
    const alerts = [];

    if (pendingVerifications > 0) {
      alerts.push(`${pendingVerifications} student verification${pendingVerifications === 1 ? '' : 's'} pending review.`);
    }
    if (totalAssessments === 0) {
      alerts.push('No assessments have been created yet.');
    }

    return res.json({
      success: true,
      data: {
        summary: {
          totalStudents: Number(stats.total_students || 0),
          totalTeachers: Number(stats.total_teachers || 0),
          totalDepartments: Number(stats.total_departments || 0),
          pendingVerifications,
          totalAssessments,
          studentsWithMetrics,
          placementReadyStudents,
          placementReadyPct: studentsWithMetrics > 0
            ? Number((placementReadyStudents / studentsWithMetrics * 100).toFixed(2))
            : null
        },
        alerts,
        role: req.user?.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard overview.'
    });
  }
}

async function getRecentAudits(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at,
             COALESCE(u.full_name, 'System') AS actor
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get recent audits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit history.' });
  }
}

// User Management
async function getAllUsers(req, res) {
  try {
    const { role, status, limit = 50, offset = 0 } = req.query;
    const [registered] = await db.query(
      `SELECT u.id, u.email, u.full_name, u.user_id_number, u.phone_number,
              u.status, r.name AS role, d.name AS department, b.name AS batch,
              'registered' AS record_status
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN teachers t ON t.user_id = u.id
       LEFT JOIN departments d ON d.id = COALESCE(s.department_id, t.department_id)
       LEFT JOIN batches b ON b.id = s.batch_id`
    );
    const [preauthorized] = await db.query(
      `SELECT CONCAT('identity-', i.id) AS id, i.email, i.full_name, i.user_id_number,
              NULL AS phone_number, d.name AS department, b.name AS batch,
              'preauthorized' AS status, i.role_name AS role,
              'preauthorized' AS record_status
       FROM institutional_identity_records i
       LEFT JOIN departments d ON d.id = i.department_id
       LEFT JOIN batches b ON b.id = i.batch_id
       WHERE i.consumed_user_id IS NULL`
    );
    const users = [...registered, ...preauthorized]
      .filter(user => !role || user.role === role)
      .filter(user => !status || user.status === status)
      .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    return res.json({
      success: true,
      data: users,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
}

async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      'SELECT u.id, u.email, u.full_name, u.phone_number, u.status, r.name AS role, u.user_id_number FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user.'
    });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['pending', 'active', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.'
      });
    }

    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.json({
      success: true,
      message: 'User status updated successfully.'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status.'
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.'
    });
  }
}

// Student Management
async function getAllStudents(req, res) {
  try {
    const { verification_status, limit = 50, offset = 0 } = req.query;
    let query = `SELECT s.id, s.enrollment_number, u.full_name, u.email, d.name AS department,
                        s.verification_status, s.cgpa, s.created_at
                 FROM students s
                 INNER JOIN users u ON u.id = s.user_id
                 INNER JOIN departments d ON d.id = s.department_id
                 WHERE 1=1`;
    const params = [];

    if (verification_status) {
      query += ' AND s.verification_status = ?';
      params.push(verification_status);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await db.query(query, params);

    return res.json({
      success: true,
      data: students,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students.'
    });
  }
}

async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(
      `SELECT s.id, s.enrollment_number, u.full_name, u.email, d.name AS department,
              s.verification_status, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       WHERE s.id = ?`,
      [studentId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student.'
    });
  }
}

async function updateStudentVerification(req, res) {
  try {
    const { studentId } = req.params;
    const { verification_status } = req.body;

    if (!['not_started', 'pending', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status provided.'
      });
    }

    const [result] = await db.query(
      'UPDATE students SET verification_status = ? WHERE id = ?',
      [verification_status, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Student verification status updated successfully.'
    });
  } catch (error) {
    console.error('Update student verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student verification status.'
    });
  }
}

// Department Management
async function getAllDepartments(req, res) {
  try {
    const [departments] = await db.query('SELECT id, name, code, head_user_id, created_at FROM departments ORDER BY name');

    return res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments.'
    });
  }
}

async function getDepartmentBatches(req, res) {
  const departmentId = Number(req.query.departmentId);
  if (!Number.isSafeInteger(departmentId) || departmentId <= 0) {
    return res.status(400).json({ success: false, message: 'A valid department is required.' });
  }

  try {
    const [batches] = await db.query(
      'SELECT id, name, department_id FROM batches WHERE department_id = ? ORDER BY name, id',
      [departmentId]
    );
    return res.json({ success: true, data: batches });
  } catch (error) {
    console.error('Get department batches error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve department batches.' });
  }
}

async function getDepartmentById(req, res) {
  try {
    const { deptId } = req.params;
    const [rows] = await db.query(
      'SELECT id, name, code, head_user_id, created_at FROM departments WHERE id = ?',
      [deptId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve department.'
    });
  }
}

async function createDepartment(req, res) {
  try {
    const { name, code, head_user_id } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO departments (name, code, head_user_id) VALUES (?, ?, ?)',
      [name, code, head_user_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { id: result.insertId, name, code, head_user_id: head_user_id || null }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A department with this name or code already exists.'
      });
    }

    console.error('Create department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create department.'
    });
  }
}

async function updateDepartment(req, res) {
  try {
    const { deptId } = req.params;
    const { name, code, head_user_id } = req.body;

    let query = 'UPDATE departments SET ';
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code) {
      updates.push('code = ?');
      params.push(code);
    }
    if (head_user_id !== undefined) {
      updates.push('head_user_id = ?');
      params.push(head_user_id || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(deptId);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Department updated successfully.'
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update department.'
    });
  }
}

function provisioningError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function provisionIdentityRecord(record, adminUserId) {
  const fullName = typeof record.fullName === 'string' ? record.fullName.trim() : '';
  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : '';
  const userIdNumber = typeof record.userIdNumber === 'string' ? record.userIdNumber.trim() : '';
  const role = typeof record.role === 'string' ? record.role.trim().toLowerCase() : 'student';
  const departmentId = Number(record.departmentId);
  const departmentName = typeof record.department === 'string' ? record.department.trim() : '';
  const batchId = Number(record.batchId);
  const batchName = typeof record.batch === 'string' ? record.batch.trim() : '';

  if (!fullName || fullName.length > 255 || !email || email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !userIdNumber || userIdNumber.length > 100) {
    throw provisioningError('Enter a valid full name, official email, and university ID.');
  }
  if (!['student', 'teacher'].includes(role)) {
    throw provisioningError('Only student and teacher identity records can be provisioned here.');
  }
  if ((!Number.isSafeInteger(departmentId) || departmentId <= 0) && !departmentName) {
    throw provisioningError('Select a valid department.');
  }
  if (role === 'student' && ((!Number.isSafeInteger(batchId) || batchId <= 0) && !batchName)) {
    throw provisioningError('Select a batch for the student.');
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      `SELECT id FROM users
       WHERE LOWER(email) = ? OR LOWER(user_id_number) = ?
       LIMIT 1`,
      [email, userIdNumber.toLowerCase()]
    );
    if (existingUsers.length) {
      throw provisioningError('An account already exists with this email or university ID.', 409);
    }

    const [existingIdentities] = await connection.query(
      `SELECT id FROM institutional_identity_records
       WHERE LOWER(email) = ? OR LOWER(user_id_number) = ?
       LIMIT 1`,
      [email, userIdNumber.toLowerCase()]
    );
    if (existingIdentities.length) {
      throw provisioningError('An institutional identity already exists with this email or university ID.', 409);
    }

    const [departments] = Number.isSafeInteger(departmentId) && departmentId > 0
      ? await connection.query('SELECT id, name FROM departments WHERE id = ?', [departmentId])
      : await connection.query('SELECT id, name FROM departments WHERE LOWER(name) = LOWER(?)', [departmentName]);
    if (!departments.length) {
      throw provisioningError('The selected department does not exist.');
    }
    const department = departments[0];

    let batch = null;
    if (role === 'student') {
      const [batches] = Number.isSafeInteger(batchId) && batchId > 0
        ? await connection.query(
          'SELECT id, name FROM batches WHERE id = ? AND department_id = ?',
          [batchId, department.id]
        )
        : await connection.query(
          'SELECT id, name FROM batches WHERE LOWER(name) = LOWER(?) AND department_id = ?',
          [batchName, department.id]
        );
      if (!batches.length) {
        throw provisioningError('The selected batch does not belong to the selected department.');
      }
      batch = batches[0];
    }

    const [result] = await connection.query(
      `INSERT INTO institutional_identity_records
       (email, user_id_number, full_name, role_name, department_id, batch_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, userIdNumber, fullName, role, department.id, batch?.id || null]
    );
    await connection.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata_json)
       VALUES (?, 'identity_record_provisioned', 'institutional_identity_record', ?, ?)`,
      [adminUserId, result.insertId, JSON.stringify({
        role,
        department_id: department.id,
        batch_id: batch?.id || null
      })]
    );
    await connection.commit();
    return {
      id: result.insertId,
      fullName,
      email,
      userIdNumber,
      role,
      department: department.name,
      batch: batch?.name || null,
      status: 'preauthorized'
    };
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Identity provisioning rollback error:', rollbackError);
      }
    }
    if (error.code === 'ER_DUP_ENTRY') {
      error.status = 409;
      error.message = 'An institutional identity already exists with this email or university ID.';
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function createUser(req, res) {
  try {
    const identity = await provisionIdentityRecord(req.body || {}, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Official identity record created. The user can now complete email OTP registration.',
      data: identity
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Create identity record error:', error);
    return res.status(500).json({
      success: false, message: 'Failed to create the institutional identity record.'
    });
  }
}

async function bulkImportUsers(req, res) {
  try {
    let users = req.body?.users;
    if (req.file) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      users = XLSX.utils.sheet_to_json(sheet, { defval: '' }).map(row => ({
        fullName: row['Full Name'] || row.fullName || row['Full Name*'],
        email: row['Official Email'] || row.email,
        userIdNumber: row['University User ID'] || row.userIdNumber || row['University ID'],
        role: row.Role || row.role || 'student',
        department: row.Department || row.department || '',
        batch: row.Batch || row.batch || ''
      }));
    }
    if (!Array.isArray(users) || !users.length || users.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Provide between 1 and 500 identity records for bulk import.'
      });
    }

    let imported = 0;
    const rejected = [];

    for (const [index, user] of users.entries()) {
      try {
        await provisionIdentityRecord(user, req.user.id);
        imported++;
      } catch (error) {
        if (error.status === 400 || error.status === 409 || error.code === 'ER_DUP_ENTRY') {
          rejected.push({ row: index + 2, reason: error.message });
          continue;
        }
        console.error(`Bulk identity import failed at row ${index + 2}:`, error);
        return res.status(500).json({
          success: false,
          message: `Bulk import stopped after ${imported} records were created. Review those records before retrying.`,
          importedCount: imported,
          rejected
        });
      }
    }

    return res.json({
      success: true,
      message: `Created ${imported} institutional identity records.`,
      importedCount: imported,
      rejected
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete bulk import.'
    });
  }
}

module.exports = {
  getDashboardOverview,
  getRecentAudits,
  getAllUsers,
  getUserById,
  createUser,
  bulkImportUsers,
  updateUserStatus,
  deleteUser,
  getAllStudents,
  getStudentById,
  updateStudentVerification,
  getAllDepartments,
  getDepartmentBatches,
  getDepartmentById,
  createDepartment,
  updateDepartment
};
