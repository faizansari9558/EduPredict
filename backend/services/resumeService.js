/**
 * ATS scoring based on the submitted resume content and selected target role.
 */

const pool = require('../config/db');

const ACTION_VERBS = [
  'developed', 'engineered', 'implemented', 'designed', 'built', 'architected',
  'optimized', 'enhanced', 'created', 'deployed', 'managed', 'led', 'spearheaded',
  'integrated', 'automated', 'reduced', 'increased', 'improved', 'resolved', 'analyzed'
];

const TECHNICAL_DOMAINS = {
  'Software Development': ['javascript', 'python', 'java', 'c++', 'react', 'node.js', 'sql', 'git', 'docker', 'rest api'],
  'Data Science & AI': ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'sql', 'machine learning', 'data analysis'],
  'Web Development': ['html', 'css', 'javascript', 'react', 'tailwind', 'express', 'mongodb', 'mysql'],
  'Core Computer Science': ['data structures', 'algorithms', 'dbms', 'operating systems', 'computer networks', 'oop']
};
const JOB_DESCRIPTION_KEYWORDS = [
  ...new Set([
    ...Object.values(TECHNICAL_DOMAINS).flat(),
    'typescript', 'c#', 'ruby', 'php', 'go', 'rust', 'kotlin', 'swift',
    'aws', 'azure', 'gcp', 'kubernetes', 'ci/cd', 'graphql', 'linux',
    'microservices', 'deep learning', 'natural language processing',
    'computer vision', 'data visualization', 'statistics', 'spark',
    'hadoop', 'postgresql', 'redis', 'spring boot', 'fastapi', 'django',
    'flask', 'agile', 'scrum', 'unit testing', 'automation testing'
  ])
];

function containsTerm(text, term) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escapedTerm}(?=$|[^a-z0-9])`, 'i').test(text);
}

class ResumeService {
  async analyzeResume(studentId, resumeText = '', targetRole = 'Software Development', jobDescription = '') {
    const textLower = resumeText.toLowerCase();
    const sections = {
      contact_info: /(email|phone|linkedin|github|portfolio|contact)/i.test(resumeText),
      education: /(education|bachelor|b\.tech|b\.e|university|college|gpa|cgpa)/i.test(resumeText),
      experience_or_projects: /(projects|experience|work history|employment|internship|portfolio)/i.test(resumeText),
      technical_skills: /(skills|technical skills|technologies|proficiencies|languages)/i.test(resumeText),
      certifications: /(certifications|certified|courses|achievements|awards)/i.test(resumeText)
    };
    const sectionScore = Object.values(sections).filter(Boolean).length * 8;

    const jobDescriptionTerms = jobDescription
      ? JOB_DESCRIPTION_KEYWORDS.filter((keyword) => containsTerm(jobDescription.toLowerCase(), keyword))
      : [];
    const usesJobDescriptionTerms = jobDescriptionTerms.length > 0;
    const relevantKeywords = usesJobDescriptionTerms
      ? jobDescriptionTerms
      : TECHNICAL_DOMAINS[targetRole] || TECHNICAL_DOMAINS['Software Development'];
    const matchedKeywords = relevantKeywords.filter((keyword) => containsTerm(textLower, keyword));
    const missingKeywords = relevantKeywords.filter((keyword) => !containsTerm(textLower, keyword));
    const keywordScore = Math.round((matchedKeywords.length / relevantKeywords.length) * 30);

    const matchedVerbs = ACTION_VERBS.filter((verb) => containsTerm(textLower, verb));
    const hasQuantifiableMetrics = /\b\d+(\.\d+)?%|\b\d+x\b|\$\d+|\b\d+\s*(users|clients|requests|ms|seconds|hours)\b/i.test(resumeText);
    const actionVerbScore = Math.min(matchedVerbs.length * 2.5, 15);
    const metricScore = hasQuantifiableMetrics ? 10 : 0;
    const impactScore = actionVerbScore + metricScore;

    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
    const lengthScore = wordCount >= 200 && wordCount <= 1000
      ? 5
      : wordCount >= 100 && wordCount <= 1500 ? 4
        : wordCount >= 50 ? 3 : 1;
    const atsScore = Math.min(sectionScore + keywordScore + impactScore + lengthScore, 100);

    let verifiedCrossReference = {
      verified_documents_count: 0,
      verified_skills_match: [],
      pending_verification: []
    };

    if (studentId) {
      try {
        const [docs] = await pool.query(
          'SELECT document_type, verification_status FROM documents WHERE user_id = ?',
          [studentId]
        );
        const verifiedDocs = docs.filter((document) => document.verification_status === 'verified');
        const pendingDocs = docs.filter((document) => document.verification_status === 'pending');
        const [skills] = await pool.query(
          'SELECT skill_name, avg_score FROM skill_proficiency WHERE student_id = ?',
          [studentId]
        );

        verifiedCrossReference = {
          verified_documents_count: verifiedDocs.length,
          total_platform_documents: docs.length,
          pending_verification_count: pendingDocs.length,
          verified_skills_match: skills.map((skill) => skill.skill_name)
        };
      } catch (error) {
        console.warn('Could not query verification data for resume:', error.message);
      }
    }

    const suggestions = [];
    if (!sections.certifications) {
      suggestions.push({
        type: 'SECTION',
        severity: 'MEDIUM',
        tip: 'Add a certifications, courses, or achievements section if you have relevant credentials.'
      });
    }
    if (!hasQuantifiableMetrics) {
      suggestions.push({
        type: 'IMPACT',
        severity: 'HIGH',
        tip: 'Where accurate, add measurable outcomes to project or experience bullets.'
      });
    }
    if (missingKeywords.length > 0) {
      suggestions.push({
        type: 'KEYWORDS',
        severity: 'HIGH',
        tip: `Consider adding relevant ${usesJobDescriptionTerms ? 'job-description' : targetRole} keywords when they accurately describe your experience: ${missingKeywords.slice(0, 4).join(', ')}.`
      });
    }
    if (matchedVerbs.length < 4) {
      suggestions.push({
        type: 'ACTION_VERBS',
        severity: 'MEDIUM',
        tip: 'Use clear action verbs to describe work you actually completed.'
      });
    }

    let atsGrade = 'C (Needs Improvement)';
    if (atsScore >= 85) atsGrade = 'A+ (Strong Match)';
    else if (atsScore >= 75) atsGrade = 'A (Good Match)';
    else if (atsScore >= 60) atsGrade = 'B (Partial Match)';

    return {
      ats_score: atsScore,
      ats_grade: atsGrade,
      target_role: targetRole,
      word_count: wordCount,
      sections_detected: sections,
      score_breakdown: {
        section_completeness: { score: sectionScore, maximum: 40 },
        keyword_match: { score: keywordScore, maximum: 30 },
        impact_evidence: { score: impactScore, maximum: 25 },
        resume_length: { score: lengthScore, maximum: 5 }
      },
      keyword_analysis: {
        matched_keywords: matchedKeywords,
        missing_keywords: missingKeywords,
        coverage_percent: Math.round((matchedKeywords.length / relevantKeywords.length) * 100),
        source: usesJobDescriptionTerms ? 'job_description' : 'target_role'
      },
      action_verbs_detected: matchedVerbs,
      has_quantifiable_metrics: hasQuantifiableMetrics,
      verified_cross_reference: verifiedCrossReference,
      improvement_suggestions: suggestions
    };
  }
}

module.exports = new ResumeService();
