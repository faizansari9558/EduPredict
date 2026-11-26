const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const db = require('../config/db');
const resumeParser = require('../services/resumeParser');
const resumeService = require('../services/resumeService');

const allowedTargetRoles = new Set([
  'Software Development',
  'Data Science & AI',
  'Web Development',
  'Core Computer Science'
]);
const maximumResumeCharacters = 100000;

function combineResumeText(typedText, extractedText) {
  const typed = typedText.trim();
  const extracted = extractedText.trim();
  if (!typed) return extracted;
  if (!extracted) return typed;

  const normalizedTyped = typed.replace(/\s+/g, ' ').toLowerCase();
  const normalizedExtracted = extracted.replace(/\s+/g, ' ').toLowerCase();
  if (normalizedTyped.includes(normalizedExtracted)) return typed;
  if (normalizedExtracted.includes(normalizedTyped)) return extracted;
  return `${typed}\n${extracted}`;
}

async function storeResumeDocument(studentId, file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const userRoot = path.resolve(__dirname, '../uploads', String(studentId));
  const storedName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`;
  const finalPath = path.join(userRoot, storedName);
  const fileName = path.basename(String(file.originalname || '').replace(/\\/g, '/')).slice(0, 255) || `resume${extension}`;
  let connection;
  let committed = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    await fs.mkdir(userRoot, { recursive: true });
    await fs.writeFile(finalPath, file.buffer, { flag: 'wx' });
    const storedPath = path.relative(path.resolve(__dirname, '..'), finalPath).replace(/\\/g, '/');
    const [result] = await connection.query(
      `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
       VALUES (?, 'Resume', ?, ?, ?)`,
      [studentId, fileName, storedPath, file.mimetype]
    );
    await connection.commit();
    committed = true;
    return { document_id: result.insertId, file_name: fileName };
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Resume upload rollback error:', rollbackError);
      }
    }
    if (!committed) {
      try {
        await fs.unlink(finalPath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') console.error('Resume upload cleanup error:', cleanupError);
      }
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

exports.analyzeResume = async (req, res) => {
  const body = req.body || {};
  const typedText = body.resume_text === undefined ? '' : body.resume_text;
  if (typeof typedText !== 'string') {
    return res.status(400).json({ success: false, message: 'Resume text must be plain text.' });
  }
  if (typedText.length > maximumResumeCharacters) {
    return res.status(413).json({ success: false, message: 'Resume text must be 100,000 characters or fewer.' });
  }

  const targetRole = body.target_role || 'Software Development';
  if (typeof targetRole !== 'string' || !allowedTargetRoles.has(targetRole)) {
    return res.status(400).json({ success: false, message: 'Select a supported target role.' });
  }
  const jobDescription = body.job_description === undefined ? '' : body.job_description;
  if (typeof jobDescription !== 'string') {
    return res.status(400).json({ success: false, message: 'Job description must be plain text.' });
  }
  if (jobDescription.length > 20000) {
    return res.status(413).json({ success: false, message: 'Job description must be 20,000 characters or fewer.' });
  }

  const uploadedFile = req.file;
  if (!typedText.trim() && !uploadedFile) {
    return res.status(400).json({ success: false, message: 'Paste resume text or upload a PDF, DOCX, or TXT file.' });
  }

  try {
    let extractedText = '';
    if (uploadedFile) {
      try {
        extractedText = await resumeParser.extractResumeText(uploadedFile);
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Unable to read the uploaded resume.' });
      }
    }

    const resumeText = combineResumeText(typedText, extractedText);
    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No selectable text was found in the file. Paste the resume text or upload a text-based PDF/DOCX.'
      });
    }
    if (resumeText.length > maximumResumeCharacters) {
      return res.status(413).json({ success: false, message: 'Combined resume text must be 100,000 characters or fewer.' });
    }
    if (resumeText.trim().length < 30) {
      return res.status(400).json({ success: false, message: 'Provide at least 30 characters of resume content for analysis.' });
    }

    const analysis = await resumeService.analyzeResume(req.user.id, resumeText, targetRole, jobDescription);
    let uploadedResume = null;
    let extractionWarning = null;
    if (uploadedFile) {
      uploadedResume = await storeResumeDocument(req.user.id, uploadedFile);
      if (!extractedText.trim()) {
        extractionWarning = 'The uploaded file had no selectable text, so the ATS score uses the pasted text only.';
      }
    }

    return res.json({
      success: true,
      data: {
        ...analysis,
        input_sources: [
          ...(typedText.trim() ? ['typed_text'] : []),
          ...(uploadedFile ? ['uploaded_file'] : [])
        ],
        uploaded_resume: uploadedResume,
        extraction_warning: extractionWarning
      }
    });
  } catch (error) {
    console.error('Resume analysis controller error:', error);
    return res.status(500).json({ success: false, message: 'Resume analysis failed. Please try again.' });
  }
};
