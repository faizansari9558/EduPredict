const path = require('path');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');

async function extractResumeText(file) {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new Error('The uploaded resume file is unavailable.');
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  if (extension === '.txt') {
    const text = file.buffer.toString('utf8');
    if (text.includes('\u0000')) throw new Error('The uploaded text file is not valid UTF-8 text.');
    return text;
  }

  if (extension === '.docx') {
    if (file.buffer.subarray(0, 4).toString() !== 'PK\u0003\u0004') {
      throw new Error('The DOCX file is invalid or corrupted.');
    }
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (extension === '.pdf') {
    if (file.buffer.subarray(0, 5).toString() !== '%PDF-') {
      throw new Error('The PDF file is invalid or corrupted.');
    }
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  throw new Error('Upload a PDF, DOCX, or TXT resume.');
}

module.exports = { extractResumeText };
