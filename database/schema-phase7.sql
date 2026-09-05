-- Phase 7 Aptitude Assessment Schema Enhancements
-- Run this after the base schema.sql to add missing columns

USE EduPredict;

-- Add missing columns to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS duration INT DEFAULT 60;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS total_marks DECIMAL(5,2) DEFAULT 100;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS shuffle_questions TINYINT(1) DEFAULT 0;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS shuffle_options TINYINT(1) DEFAULT 0;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS show_results TINYINT(1) DEFAULT 1;

-- Add missing columns to assessment_questions table
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium';
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS category VARCHAR(120);
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS is_from_bank TINYINT(1) DEFAULT 0;

-- Create question_bank table for reusable questions
CREATE TABLE IF NOT EXISTS question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'short_answer', 'coding', 'essay') NOT NULL,
  marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  difficulty_level ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  category VARCHAR(120),
  subject_area VARCHAR(150),
  options_json JSON NULL,
  correct_answer TEXT NULL,
  explanation TEXT,
  created_by INT NOT NULL,
  is_public TINYINT(1) DEFAULT 0,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_question_bank_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Create assessment_categories table
CREATE TABLE IF NOT EXISTS assessment_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  color_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_published ON assessments(published_at);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_category ON assessment_questions(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON assessment_attempts(status);

-- Seed assessment categories
INSERT IGNORE INTO assessment_categories (name, description, color_code) VALUES
('Aptitude', 'General aptitude and reasoning', '#3B82F6'),
('Coding', 'Programming and algorithm problems', '#10B981'),
('General Knowledge', 'General knowledge and awareness', '#F59E0B'),
('Technical', 'Technical subject-specific questions', '#8B5CF6'),
('Communication', 'English and communication skills', '#EC4899');
