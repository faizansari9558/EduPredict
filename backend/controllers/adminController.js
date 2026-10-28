const db = require('../config/db');
const { hashPassword } = require('../utils/password');

async function getDashboardOverview(req, res) {
  const overview = {
    summary: {
      totalStudents: 1284,
      totalTeachers: 118,
      totalDepartments: 12,
      pendingVerifications: 23
    },
    alerts: [
      'Student document verification pending for 8 records.',
      'Assessment results for Batch 2025-A are ready to publish.',
      '2 teacher assignments need department approval.'
    ],
    role: req.user?.role || 'admin'
  };

  const payload = {
    success: true,
    data: overview
  };

  if (res && typeof res.json === 'function') {
    return res.json(payload);
  }

  return payload;
}

// User Management
async function getAllUsers(req, res) {
  try {
    const { role, status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT u.id, u.email, u.full_name, u.phone_number, u.status, r.name AS role FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND r.name = ?';
      params.push(role);
    }
    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);

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

async function createUser(req, res) {
  try {
    const { fullName, email, userIdNumber, role = 'student', department, phoneNumber, status = 'active' } = req.body;
    if (!fullName || !email || !userIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and user ID number are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = userIdNumber.trim();
    const cleanRole = role.toLowerCase();

    const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ?', [cleanRole]);
    const roleId = roleRows.length ? roleRows[0].id : (cleanRole === 'admin' ? 1 : cleanRole === 'teacher' ? 2 : 3);

    const defaultPassHash = await hashPassword('password123');

    const [result] = await db.query(
      `INSERT INTO users (role_id, email, password_hash, user_id_number, full_name, phone_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), user_id_number = VALUES(user_id_number), status = VALUES(status)`,
      [roleId, cleanEmail, defaultPassHash, cleanId, fullName.trim(), phoneNumber || null, status]
    );

    if (cleanRole === 'student') {
      try {
        const [deptRows] = await db.query('SELECT id FROM departments WHERE name LIKE ? LIMIT 1', [`%${department || 'Computer'}%`]);
        const deptId = deptRows.length ? deptRows[0].id : 1;
        await db.query(
          `INSERT IGNORE INTO students (user_id, roll_number, department_id, batch_id, academic_year_id)
           VALUES (?, ?, ?, 1, 1)`,
          [result.insertId || 1, cleanId, deptId]
        );
      } catch (err) {
        console.warn('Student detail insert warning:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User record provisioned successfully.',
      data: {
        id: result.insertId,
        email: cleanEmail,
        fullName: fullName.trim(),
        userIdNumber: cleanId,
        role: cleanRole,
        status
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user.'
    });
  }
}

async function bulkImportUsers(req, res) {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || !users.length) {
      return res.status(400).json({
        success: false,
        message: 'A list of user records is required for bulk import.'
      });
    }

    const defaultPassHash = await hashPassword('password123');
    let imported = 0;

    for (const u of users) {
      if (!u.email || !u.userIdNumber || !u.fullName) continue;
      const cleanEmail = u.email.trim().toLowerCase();
      const cleanId = u.userIdNumber.trim();
      const cleanRole = (u.role || 'student').toLowerCase();
      const cleanStatus = u.status || 'active';

      const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ?', [cleanRole]);
      const roleId = roleRows.length ? roleRows[0].id : (cleanRole === 'admin' ? 1 : cleanRole === 'teacher' ? 2 : 3);

      await db.query(
        `INSERT INTO users (role_id, email, password_hash, user_id_number, full_name, phone_number, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), user_id_number = VALUES(user_id_number), status = VALUES(status)`,
        [roleId, cleanEmail, defaultPassHash, cleanId, u.fullName.trim(), u.phoneNumber || null, cleanStatus]
      );
      imported++;
    }

    return res.json({
      success: true,
      message: `Successfully imported ${imported} user records.`,
      importedCount: imported
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
  getDepartmentById,
  createDepartment,
  updateDepartment
};
