const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const db = require('../config/db');

async function getStudentDashboard(req, res) {
  try {
    const { id: userId } = req.user;

    const [studentRows] = await db.query(
      `SELECT s.id, u.full_name, u.email, d.name AS department, b.name AS batch,
              s.enrollment_number, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.verification_status
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!studentRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const student = studentRows[0];

    const [portfolioRows] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM skill_proficiency WHERE student_id = ?) AS skill_count,
         (SELECT COUNT(*) FROM student_portfolio_items WHERE student_id = ? AND item_type = 'project') AS project_count,
         (SELECT COUNT(*) FROM student_portfolio_items WHERE student_id = ? AND item_type = 'certification') AS certification_count,
         (SELECT COUNT(*) FROM student_portfolio_items WHERE student_id = ? AND item_type = 'internship') AS internship_count`,
      [userId, userId, userId, userId]
    );
    const portfolioCounts = portfolioRows[0] || {};
    const profileCompletionItems = [
      student.full_name,
      student.email,
      student.enrollment_number,
      student.department,
      student.batch,
      student.cgpa,
      student.tenth_percentage,
      student.twelfth_percentage,
      student.graduation_percentage,
      Number(portfolioCounts.skill_count) > 0,
      Number(portfolioCounts.project_count) > 0,
      Number(portfolioCounts.certification_count) > 0,
      Number(portfolioCounts.internship_count) > 0
    ];
    const profileCompletionCompleted = profileCompletionItems.filter((value) =>
      typeof value === 'boolean'
        ? value
        : value !== null && value !== undefined && String(value).trim() !== ''
    ).length;
    const profileCompletionTotal = profileCompletionItems.length;
    const profileCompletion = Math.round((profileCompletionCompleted / profileCompletionTotal) * 100);

    // Get verified documents count
    const [docsRows] = await db.query(
      'SELECT COUNT(*) AS verified_count FROM documents WHERE user_id = ? AND verification_status = "verified"',
      [userId]
    );

    // Get next assessment
    const [assessmentRows] = await db.query(
      `SELECT id, title, assessment_type FROM assessments
       WHERE published_at IS NOT NULL
       ORDER BY published_at DESC LIMIT 1`
    );

    const summary = {
      cgpa: student.cgpa ?? '—',
      profileCompletion,
      profileCompletionCompleted,
      profileCompletionTotal,
      verifiedDocs: docsRows[0]?.verified_count || 0,
      nextAssessment: assessmentRows.length > 0 ? '2 Days' : 'No upcoming'
    };

    return res.json({
      success: true,
      data: {
        student,
        summary,
        upcoming: [
          'Academic performance review this Friday',
          'Upload internship certificate for verification',
          'Complete aptitude mock assessment'
        ]
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard.'
    });
  }
}

async function getStudentProfile(req, res) {
  try {
    const { id: userId } = req.user;

    const [rows] = await db.query(
      `SELECT s.id, u.full_name, u.email, u.phone_number, d.name AS department, b.name AS batch,
              s.enrollment_number, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.verification_status, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
}

async function updateStudentProfile(req, res) {
  return res.status(400).json({
    success: false,
    message: 'Academic values must be submitted with their supporting documents from the Academic Records page.'
  });
}

async function updateAcademicRecords(req, res) {
  const userId = req.user.id;
  const uploadedFiles = Object.values(req.files || {}).flat();
  const stagedPaths = uploadedFiles.map((file) => file.path);
  const movedPaths = [];
  let connection;

  const cleanupFiles = async (filePaths) => {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') console.error('Academic record upload cleanup error:', error);
      }
    }
  };

  try {
    const fields = [
      { key: 'cgpa', fileKey: 'cgpa_document', documentType: 'Academic Record - Cumulative GPA', max: 10 },
      { key: 'tenth_percentage', fileKey: 'tenth_document', documentType: 'Academic Record - 10th Percentage', max: 100 },
      { key: 'twelfth_percentage', fileKey: 'twelfth_document', documentType: 'Academic Record - 12th Percentage', max: 100 },
      { key: 'graduation_percentage', fileKey: 'graduation_document', documentType: 'Academic Record - Graduation Percentage', max: 100 }
    ];
    const updates = [];

    for (const field of fields) {
      const rawValue = req.body?.[field.key];
      const file = req.files?.[field.fileKey]?.[0];
      if (rawValue === undefined && !file) continue;

      const textValue = String(rawValue ?? '').trim();
      if (!textValue || !file) {
        await cleanupFiles(stagedPaths);
        return res.status(400).json({
          success: false,
          message: `Enter ${field.key.replace(/_/g, ' ')} and upload its supporting document together.`
        });
      }

      if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(textValue)) {
        await cleanupFiles(stagedPaths);
        return res.status(400).json({ success: false, message: `${field.key.replace(/_/g, ' ')} must be a number with up to two decimal places.` });
      }

      const value = Number(textValue);
      if (!Number.isFinite(value) || value < 0 || value > field.max) {
        await cleanupFiles(stagedPaths);
        return res.status(400).json({ success: false, message: `${field.key.replace(/_/g, ' ')} must be between 0 and ${field.max}.` });
      }

      const bytes = await fs.readFile(file.path);
      const validFile =
        (file.mimetype === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-') ||
        (file.mimetype === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8) ||
        (file.mimetype === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
      if (!validFile) {
        await cleanupFiles(stagedPaths);
        return res.status(400).json({ success: false, message: `The ${field.key.replace(/_/g, ' ')} file does not match its declared type.` });
      }

      updates.push({ ...field, file, value });
    }

    if (!updates.length) {
      await cleanupFiles(stagedPaths);
      return res.status(400).json({ success: false, message: 'Enter at least one academic value and attach its supporting document.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [studentRows] = await connection.query(
      'SELECT id FROM students WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    if (!studentRows.length) {
      await connection.rollback();
      await cleanupFiles(stagedPaths);
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const updateSql = updates.map(({ key }) => `${key} = ?`).join(', ');
    await connection.query(
      `UPDATE students SET ${updateSql}, verification_status = 'pending' WHERE user_id = ?`,
      [...updates.map(({ value }) => value), userId]
    );

    const userRoot = path.resolve(__dirname, '../uploads', String(userId));
    await fs.mkdir(userRoot, { recursive: true });
    const documents = [];
    for (const update of updates) {
      const extension = update.file.mimetype === 'application/pdf' ? '.pdf' : update.file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
      const safeName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`;
      const finalPath = path.join(userRoot, safeName);
      await fs.rename(update.file.path, finalPath);
      movedPaths.push(finalPath);

      const storedPath = path.relative(path.resolve(__dirname, '..'), finalPath).replace(/\\/g, '/');
      const [result] = await connection.query(
        `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, update.documentType, update.file.originalname, storedPath, update.file.mimetype]
      );
      documents.push({
        id: result.insertId,
        document_type: update.documentType,
        file_name: update.file.originalname,
        verification_status: 'pending'
      });
    }

    await connection.commit();
    return res.json({
      success: true,
      message: 'Academic values and supporting documents submitted for verification.',
      data: {
        values: Object.fromEntries(updates.map(({ key, value }) => [key, value])),
        documents
      }
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Academic record transaction rollback error:', rollbackError);
      }
    }
    await cleanupFiles([...stagedPaths, ...movedPaths]);
    console.error('Update academic records error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save academic values and documents.' });
  } finally {
    if (connection) connection.release();
  }
}

async function uploadDocument(req, res) {
  try {
    const { id: userId } = req.user;
    const { document_type } = req.body;

    if (!document_type || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document type and a supported document file are required.'
      });
    }

    const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
    if (!allowedTypes.has(req.file.mimetype)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: 'Only PDF, JPEG, and PNG documents are allowed.' });
    }

    const bytes = await fs.readFile(req.file.path);
    const isPdf = req.file.mimetype === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-';
    const isJpeg = req.file.mimetype === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = req.file.mimetype === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPdf && !isJpeg && !isPng) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: 'The uploaded content does not match its declared file type.' });
    }

    const userRoot = path.resolve(__dirname, '../uploads', String(userId));
    await fs.mkdir(userRoot, { recursive: true });
    const safeName = `${Date.now()}-${require('crypto').randomBytes(12).toString('hex')}${path.extname(req.file.originalname).toLowerCase()}`;
    const finalPath = path.join(userRoot, safeName);
    await fs.rename(req.file.path, finalPath);
    const stored_path = path.relative(path.resolve(__dirname, '..'), finalPath).replace(/\\/g, '/');

    const [result] = await db.query(
      `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, document_type, req.file.originalname, stored_path, req.file.mimetype]
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: {
        id: result.insertId,
        document_type,
        file_name: req.file.originalname,
        stored_path
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document.'
    });
  }

}

async function downloadDocument(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT file_name, stored_path FROM documents WHERE id = ? AND user_id = ?`,
      [req.params.documentId, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Document not found.' });
    const root = path.resolve(__dirname, '..');
    const filePath = path.resolve(root, rows[0].stored_path);
    if (!filePath.startsWith(`${root}${path.sep}`)) return res.status(400).json({ success: false, message: 'Invalid document path.' });
    await fs.access(filePath);
    return res.download(filePath, rows[0].file_name);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ success: false, message: 'Document file is unavailable.' });
    console.error('Download document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve document.' });
  }
}

async function getStudentDocuments(req, res) {
  try {
    const { id: userId } = req.user;

    const [documents] = await db.query(
      `SELECT id, document_type, file_name, verification_status, created_at
       FROM documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents.'
    });
  }
}

async function getPortfolioItems(req, res) {
      const allowedTypes = new Set(['project', 'certification', 'internship']);
      const itemType = req.params.itemType;
      if (!allowedTypes.has(itemType)) return res.status(400).json({ success: false, message: 'Invalid portfolio item type.' });
      try {
        const [rows] = await db.query(
          `SELECT id, payload_json, verification_status, review_notes, created_at, updated_at
           FROM student_portfolio_items WHERE student_id = ? AND item_type = ? ORDER BY created_at DESC`,
          [req.user.id, itemType]
        );
        return res.json({
          success: true,
          data: rows.map(row => ({ id: row.id, ...JSON.parse(row.payload_json), status: row.verification_status, review_notes: row.review_notes, created_at: row.created_at, updated_at: row.updated_at }))
        });
      } catch (error) {
        console.error('Get portfolio items error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve portfolio items.' });
      }
}

function isValidPortfolioDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

function parsePortfolioUrl(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.trim().length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function parsePortfolioList(value) {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value !== 'string') return null;
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (items.length > 20 || items.some((item) => item.length > 50)) return null;
  return items;
}

async function createPortfolioItem(req, res) {
  const allowedTypes = new Set(['project', 'certification', 'internship']);
  const itemType = req.params.itemType;
  const uploadedFile = req.file;
  let connection;
  let finalPath;

  const cleanupFiles = async () => {
    for (const filePath of [uploadedFile?.path, finalPath]) {
      if (!filePath) continue;
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') console.error('Portfolio upload cleanup error:', error);
      }
    }
  };
  const invalidRequest = async (message) => {
    await cleanupFiles();
    return res.status(400).json({ success: false, message });
  };

  if (!allowedTypes.has(itemType) || !req.body || typeof req.body !== 'object') {
    return invalidRequest('Invalid portfolio item.');
  }

  let payload;
  if (itemType === 'project') {
    if (uploadedFile) return invalidRequest('Project submissions cannot include a certificate file.');

    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const role = typeof req.body.role === 'string' ? req.body.role.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const technologies = req.body.technologies === undefined ? [] : req.body.technologies;
    const githubUrl = parsePortfolioUrl(req.body.githubUrl);
    const liveUrl = parsePortfolioUrl(req.body.liveUrl);

    if (
      !title ||
      title.length > 150 ||
      role.length > 120 ||
      description.length > 2000 ||
      !Array.isArray(technologies) ||
      technologies.length > 20 ||
      technologies.some((technology) =>
        typeof technology !== 'string' || !technology.trim() || technology.trim().length > 50
      ) ||
      githubUrl === null ||
      liveUrl === null
    ) {
      return invalidRequest('Enter valid project details and HTTP(S) links.');
    }

    payload = {
      title,
      role: role || 'Contributor',
      description,
      technologies: technologies.map((technology) => technology.trim()),
      githubUrl,
      liveUrl
    };
  } else {
    if (!uploadedFile) {
      return invalidRequest('Attach a PDF, JPG, or PNG certificate file.');
    }

    const skills = parsePortfolioList(req.body.skills);
    if (skills === null) return invalidRequest('Enter up to 20 skills, with no more than 50 characters each.');

    if (itemType === 'certification') {
      const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
      const issuer = typeof req.body.issuer === 'string' ? req.body.issuer.trim() : '';
      const credentialId = typeof req.body.credentialId === 'string' ? req.body.credentialId.trim() : '';
      const issueDate = typeof req.body.issueDate === 'string' ? req.body.issueDate : '';
      const expiryDate = typeof req.body.expiryDate === 'string' ? req.body.expiryDate : '';
      const url = parsePortfolioUrl(req.body.url);

      if (
        !title || title.length > 150 ||
        !issuer || issuer.length > 150 ||
        credentialId.length > 150 ||
        (issueDate && !isValidPortfolioDate(issueDate)) ||
        (expiryDate && !isValidPortfolioDate(expiryDate)) ||
        (issueDate && expiryDate && expiryDate < issueDate) ||
        url === null
      ) {
        return invalidRequest('Enter valid certification details, dates, and an HTTP(S) verification link.');
      }

      payload = { title, issuer, credentialId, issueDate, expiryDate, skills, url };
    } else {
      const company = typeof req.body.company === 'string' ? req.body.company.trim() : '';
      const role = typeof req.body.role === 'string' ? req.body.role.trim() : '';
      const location = typeof req.body.location === 'string' ? req.body.location.trim() : '';
      const duration = typeof req.body.duration === 'string' ? req.body.duration.trim() : '';
      const type = typeof req.body.type === 'string' ? req.body.type.trim() : '';
      const stipend = typeof req.body.stipend === 'string' ? req.body.stipend.trim() : '';
      const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
      const startDate = typeof req.body.startDate === 'string' ? req.body.startDate : '';
      const endDate = typeof req.body.endDate === 'string' ? req.body.endDate : '';

      if (
        !company || company.length > 150 ||
        !role || role.length > 150 ||
        location.length > 150 ||
        duration.length > 80 ||
        !type || type.length > 100 ||
        stipend.length > 80 ||
        description.length > 2000 ||
        !isValidPortfolioDate(startDate) ||
        (endDate && !isValidPortfolioDate(endDate)) ||
        (endDate && endDate < startDate)
      ) {
        return invalidRequest('Enter valid internship details and a valid date range.');
      }

      payload = { company, role, location, duration, type, stipend, description, skills, startDate, endDate };
    }
  }

  try {
    if (uploadedFile) {
      const bytes = await fs.readFile(uploadedFile.path);
      const validFile =
        (uploadedFile.mimetype === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-') ||
        (uploadedFile.mimetype === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8) ||
        (uploadedFile.mimetype === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
      if (!validFile) return await invalidRequest('The uploaded certificate does not match its declared file type.');
    }

    if (uploadedFile) {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const extension = uploadedFile.mimetype === 'application/pdf'
        ? '.pdf'
        : uploadedFile.mimetype === 'image/jpeg' ? '.jpg' : '.png';
      const userRoot = path.resolve(__dirname, '../uploads', String(req.user.id));
      await fs.mkdir(userRoot, { recursive: true });
      finalPath = path.join(userRoot, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`);
      await fs.rename(uploadedFile.path, finalPath);
      const storedPath = path.relative(path.resolve(__dirname, '..'), finalPath).replace(/\\/g, '/');
      const fileName = path.basename(String(uploadedFile.originalname || '').replace(/\\/g, '/')).slice(0, 255);
      const documentType = itemType === 'certification' ? 'Certification Certificate' : 'Internship Certificate';
      const [documentResult] = await connection.query(
        `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, documentType, fileName || `certificate${extension}`, storedPath, uploadedFile.mimetype]
      );

      payload.certificateDocumentId = documentResult.insertId;
      payload.certificateFileName = fileName || `certificate${extension}`;
      const [portfolioResult] = await connection.query(
        `INSERT INTO student_portfolio_items (student_id, item_type, payload_json)
         VALUES (?, ?, ?)`,
        [req.user.id, itemType, JSON.stringify(payload)]
      );
      await connection.commit();
      return res.status(201).json({
        success: true,
        data: { id: portfolioResult.insertId, ...payload, status: 'pending' }
      });
    }

    const [result] = await db.query(
      `INSERT INTO student_portfolio_items (student_id, item_type, payload_json)
       VALUES (?, ?, ?)`,
      [req.user.id, itemType, JSON.stringify(payload)]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, ...payload, status: 'pending' } });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Portfolio submission rollback error:', rollbackError);
      }
    }
    await cleanupFiles();
    console.error('Create portfolio item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save portfolio item.' });
  } finally {
    if (connection) connection.release();
  }
}

async function getSkills(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, skill_category AS category, skill_name AS name, avg_score AS score,
              attempts,
              CASE WHEN attempts = 0 THEN 'Not assessed'
                   WHEN avg_score >= 80 THEN 'Advanced'
                   WHEN avg_score >= 60 THEN 'Intermediate'
                   ELSE 'Foundational' END AS level
       FROM skill_proficiency WHERE student_id = ? ORDER BY skill_name`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get skills error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
  }
}

async function createSkill(req, res) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const category = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
  if (!category || !name) return res.status(400).json({ success: false, message: 'Skill category and name are required.' });
  if (name.length > 150 || category.length > 100) {
    return res.status(400).json({ success: false, message: 'Skill name must be 150 characters or less and category 100 characters or less.' });
  }

  try {
    const [existing] = await db.query(
      `SELECT id FROM skill_proficiency
       WHERE student_id = ? AND LOWER(skill_category) = LOWER(?) AND LOWER(skill_name) = LOWER(?)`,
      [req.user.id, category, name]
    );
    if (existing.length) return res.status(409).json({ success: false, message: 'This skill is already in your list.' });

    const [result] = await db.query(
      `INSERT INTO skill_proficiency (student_id, skill_category, skill_name)
       VALUES (?, ?, ?)`,
      [req.user.id, category, name]
    );
    const [rows] = await db.query(
      `SELECT id, skill_category AS category, skill_name AS name, avg_score AS score, attempts,
              CASE WHEN attempts = 0 THEN 'Not assessed'
                   WHEN avg_score >= 80 THEN 'Advanced'
                   WHEN avg_score >= 60 THEN 'Intermediate'
                   ELSE 'Foundational' END AS level
       FROM skill_proficiency WHERE id = ? AND student_id = ?`,
      [result.insertId, req.user.id]
    );
    if (!rows.length) throw new Error('Created skill record could not be retrieved.');
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This skill is already in your list.' });
    }
    console.error('Create skill error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save skill.' });
  }
}

async function getStudentResults(req, res) {
  const studentId = req.user.id;
  try {
    const [attemptRows] = await db.query(
      `SELECT aa.id, aa.assessment_id, a.title, a.assessment_type, aa.submitted_at,
              aa.score,
              COALESCE(NULLIF(a.total_marks, 0), (
                SELECT SUM(q.marks) FROM assessment_questions q WHERE q.assessment_id = a.id
              ), 0) AS max_score
       FROM assessment_attempts aa
       JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.student_user_id = ? AND aa.status = 'evaluated'
         AND aa.submitted_at IS NOT NULL AND aa.score IS NOT NULL
       ORDER BY aa.submitted_at DESC, aa.id DESC
       LIMIT 100`,
      [studentId]
    );
    const [codingRows] = await db.query(
      `SELECT cs.id, cs.problem_id, cp.title, cp.difficulty_level, cs.score, cs.submitted_at
       FROM coding_submissions cs
       JOIN coding_problems cp ON cp.id = cs.problem_id
       WHERE cs.student_user_id = ? AND cs.status = 'graded' AND cs.score IS NOT NULL
       ORDER BY cs.submitted_at DESC, cs.id DESC
       LIMIT 100`,
      [studentId]
    );

    const assessmentIds = [...new Set(attemptRows.map((row) => row.assessment_id))];
    const problemIds = [...new Set(codingRows.map((row) => row.problem_id))];
    let assessmentCohortRows = [];
    let codingCohortRows = [];

    if (assessmentIds.length) {
      const placeholders = assessmentIds.map(() => '?').join(', ');
      [assessmentCohortRows] = await db.query(
        `SELECT assessment_id, student_user_id, MAX(score) AS best_score
         FROM assessment_attempts
         WHERE assessment_id IN (${placeholders}) AND status = 'evaluated'
           AND submitted_at IS NOT NULL AND score IS NOT NULL
         GROUP BY assessment_id, student_user_id`,
        assessmentIds
      );
    }
    if (problemIds.length) {
      const placeholders = problemIds.map(() => '?').join(', ');
      [codingCohortRows] = await db.query(
        `SELECT problem_id, student_user_id, MAX(score) AS best_score
         FROM coding_submissions
         WHERE problem_id IN (${placeholders}) AND status = 'graded' AND score IS NOT NULL
         GROUP BY problem_id, student_user_id`,
        problemIds
      );
    }

    const rankFor = (rows, ownScore) => {
      const bestScores = rows.map((row) => Number(row.best_score));
      const cohortSize = bestScores.length;
      if (cohortSize < 2) return { rank: null, cohort_size: cohortSize, percentile: null };
      const rank = 1 + bestScores.filter((score) => score > ownScore).length;
      return {
        rank,
        cohort_size: cohortSize,
        percentile: Math.round(((cohortSize - rank + 1) / cohortSize) * 100)
      };
    };

    const assessmentResults = attemptRows.map((row) => {
      const cohort = assessmentCohortRows.filter((item) => Number(item.assessment_id) === Number(row.assessment_id));
      const studentBest = Math.max(
        Number(row.score),
        ...cohort.filter((item) => Number(item.student_user_id) === Number(studentId)).map((item) => Number(item.best_score))
      );
      const maxScore = Number(row.max_score) > 0 ? Number(row.max_score) : null;
      return {
        id: `assessment-${row.id}`,
        title: row.title,
        type: row.assessment_type,
        submitted_at: row.submitted_at,
        score: Number(row.score),
        max_score: maxScore,
        score_percent: maxScore ? Math.round((Number(row.score) / maxScore) * 10000) / 100 : null,
        ...rankFor(cohort, studentBest)
      };
    });
    const codingResults = codingRows.map((row) => {
      const cohort = codingCohortRows.filter((item) => Number(item.problem_id) === Number(row.problem_id));
      const studentBest = Math.max(
        Number(row.score),
        ...cohort.filter((item) => Number(item.student_user_id) === Number(studentId)).map((item) => Number(item.best_score))
      );
      return {
        id: `coding-${row.id}`,
        title: row.title,
        type: 'Coding Challenge',
        difficulty: row.difficulty_level,
        submitted_at: row.submitted_at,
        score: Number(row.score),
        max_score: 100,
        score_percent: Number(row.score),
        ...rankFor(cohort, studentBest)
      };
    });

    const results = [...assessmentResults, ...codingResults].sort(
      (left, right) => new Date(right.submitted_at).getTime() - new Date(left.submitted_at).getTime()
    );
    const scoredResults = results.filter((result) => result.score_percent !== null);
    const averageScore = scoredResults.length
      ? Math.round((scoredResults.reduce((total, result) => total + result.score_percent, 0) / scoredResults.length) * 100) / 100
      : null;
    const bestScore = scoredResults.length
      ? Math.max(...scoredResults.map((result) => result.score_percent))
      : null;

    return res.json({
      success: true,
      data: {
        results,
        summary: {
          completed_assessments: attemptRows.length,
          coding_submissions: codingRows.length,
          average_score: averageScore,
          best_score: bestScore
        }
      }
    });
  } catch (error) {
    console.error('Get student results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your assessment results.' });
  }
}

async function getAssessmentList(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [assessments] = await db.query(
      `SELECT a.id, a.title, a.description, a.assessment_type, a.published_at,
              a.duration,
              (SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id = a.id) AS question_count,
              (SELECT aa.status
               FROM assessment_attempts aa
               WHERE aa.assessment_id = a.id AND aa.student_user_id = ?
               ORDER BY aa.started_at DESC, aa.id DESC LIMIT 1) AS attempt_status,
              (SELECT aa.score
               FROM assessment_attempts aa
               WHERE aa.assessment_id = a.id AND aa.student_user_id = ?
               ORDER BY aa.started_at DESC, aa.id DESC LIMIT 1) AS attempt_score
       FROM assessments a
       WHERE a.published_at IS NOT NULL
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, parseInt(limit), parseInt(offset)]
    );

    return res.json({
      success: true,
      data: assessments,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get assessment list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessments.'
    });
  }
}

async function startAssessment(req, res) {
  try {
    const { assessmentId } = req.params;
    const { id: userId } = req.user;

    // Verify assessment exists and is published
    const [assessmentRows] = await db.query(
      'SELECT id, duration FROM assessments WHERE id = ? AND published_at IS NOT NULL',
      [assessmentId]
    );

    if (!assessmentRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not published.'
      });
    }

    // Create assessment attempt
    const [result] = await db.query(
      `INSERT INTO assessment_attempts (assessment_id, student_user_id, status)
       VALUES (?, ?, 'in_progress')`,
      [assessmentId, userId]
    );

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + Number(assessmentRows[0].duration || 60) * 60 * 1000);
    return res.status(201).json({
      success: true,
      message: 'Assessment started.',
      data: { attempt_id: result.insertId, started_at: startedAt.toISOString(), expires_at: expiresAt.toISOString() }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start assessment.'
    });
  }
}

async function submitAssessmentResponse(req, res) {
  try {
    const { attemptId, questionId, answer_text } = req.body;

    if (!attemptId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID and question ID are required.'
      });
    }

    const [attempts] = await db.query(
      `SELECT aa.id, aa.status, aa.started_at, a.duration
       FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.id = ? AND aa.student_user_id = ?`,
      [attemptId, req.user.id]
    );
    const attempt = attempts[0];
    if (!attempt) return res.status(403).json({ success: false, message: 'Assessment attempt is not yours.' });
    if (attempt.status !== 'in_progress') return res.status(409).json({ success: false, message: 'This assessment attempt is already submitted.' });
    if (Date.now() > new Date(attempt.started_at).getTime() + Number(attempt.duration || 60) * 60 * 1000) {
      return res.status(409).json({ success: false, message: 'The assessment time limit has expired.' });
    }
    const [existing] = await db.query(
      'SELECT id FROM student_assessment_responses WHERE attempt_id = ? AND question_id = ?',
      [attemptId, questionId]
    );
    if (existing.length) {
      await db.query('UPDATE student_assessment_responses SET answer_text = ? WHERE id = ?', [answer_text || null, existing[0].id]);
    } else {
      await db.query(
        'INSERT INTO student_assessment_responses (attempt_id, question_id, answer_text) VALUES (?, ?, ?)',
        [attemptId, questionId, answer_text || null]
      );
    }

    return res.json({
      success: true,
      message: 'Response submitted.'
    });
  } catch (error) {
    console.error('Submit assessment response error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit response.'
    });
  }
}

// Submit assessment (mark as completed)
async function submitAssessment(req, res) {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id;

    // Verify the attempt belongs to the student
    const [attempt] = await db.query(
      `SELECT aa.id, aa.student_user_id, aa.status, aa.started_at, a.duration
       FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.id = ?`,
      [attemptId]
    );

    if (attempt.length === 0 || attempt[0].student_user_id !== studentId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (attempt[0].status !== 'in_progress') return res.status(409).json({ success: false, error: 'Assessment attempt is already submitted.' });

    const expired = Date.now() > new Date(attempt[0].started_at).getTime() + Number(attempt[0].duration || 60) * 60 * 1000;
    const [answers] = await db.query(
      `SELECT r.id, r.answer_text, q.correct_answer, q.marks
       FROM student_assessment_responses r
       JOIN assessment_questions q ON q.id = r.question_id
       WHERE r.attempt_id = ?`,
      [attemptId]
    );
    let score = 0;
    for (const answer of answers) {
      const correct = answer.correct_answer !== null &&
        String(answer.answer_text || '').trim() === String(answer.correct_answer).trim();
      await db.query('UPDATE student_assessment_responses SET is_correct = ? WHERE id = ?', [correct ? 1 : 0, answer.id]);
      if (correct) score += Number(answer.marks || 0);
    }

    await db.query(
      `UPDATE assessment_attempts 
       SET submitted_at = CURRENT_TIMESTAMP, status = 'evaluated', score = ?
       WHERE id = ?`,
      [score, attemptId]
    );

    res.json({ success: true, data: { id: attemptId, submitted: true, score, expired } });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit assessment' });
  }
}

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  updateAcademicRecords,
  uploadDocument,
  downloadDocument,
  getStudentDocuments,
  getPortfolioItems,
  createPortfolioItem,
  getSkills,
  createSkill,
  getStudentResults,
  getAssessmentList,
  startAssessment,
  submitAssessmentResponse,
  submitAssessment
};
