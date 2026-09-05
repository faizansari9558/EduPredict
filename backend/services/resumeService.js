/**
 * Resume AI & ATS Scoring Engine
 * Analyzes resume content, evaluates section completeness, calculates ATS compatibility score,
 * checks action verb density, and cross-references verified platform credentials.
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

class ResumeService {
  /**
   * Analyze raw resume text or structured resume data
   */
  async analyzeResume(studentId, resumeText = '', targetRole = 'Software Development') {
    const textLower = resumeText.toLowerCase();

    // 1. Detect Sections
    const sections = {
      contact_info: /(email|phone|linkedin|github|portfolio|contact)/i.test(resumeText),
      education: /(education|bachelor|b\.tech|b\.e|university|college|gpa|cgpa)/i.test(resumeText),
      experience_or_projects: /(projects|experience|work history|employment|internship|portfolio)/i.test(resumeText),
      technical_skills: /(skills|technical skills|technologies|proficiencies|languages)/i.test(resumeText),
      certifications: /(certifications|certified|courses|achievements|awards)/i.test(resumeText)
    };

    const sectionScore = Object.values(sections).filter(Boolean).length * 8; // Max 40 pts

    // 2. Keyword & Skill Matching
    const relevantKeywords = TECHNICAL_DOMAINS[targetRole] || TECHNICAL_DOMAINS['Software Development'];
    const matchedKeywords = relevantKeywords.filter(kw => textLower.includes(kw));
    const missingKeywords = relevantKeywords.filter(kw => !textLower.includes(kw));
    const keywordScore = Math.min((matchedKeywords.length / relevantKeywords.length) * 30, 30); // Max 30 pts

    // 3. Action Verb & Impact Metrics Density
    const matchedVerbs = ACTION_VERBS.filter(v => textLower.includes(v));
    const hasQuantifiableMetrics = /\b\d+(\.\d+)?%|\b\d+x\b|\b\$\d+|\b\d+\s*(users|clients|requests|ms|seconds|hours)\b/i.test(resumeText);
    
    let impactScore = Math.min(matchedVerbs.length * 2.5, 15);
    if (hasQuantifiableMetrics) impactScore += 10;
    impactScore = Math.min(impactScore, 25); // Max 25 pts

    // 4. Formatting & Length Check
    const wordCount = resumeText.trim().split(/\s+/).length;
    let lengthScore = 5;
    if (wordCount >= 200 && wordCount <= 800) {
      lengthScore = 5; // Ideal single-page / two-page density
    } else if (wordCount < 100) {
      lengthScore = 1;
    }

    // Total ATS Score (0 - 100)
    const atsScore = Math.min(Math.round(sectionScore + keywordScore + impactScore + lengthScore), 100);

    // 5. Cross-reference Verified Platform Documents & Credentials
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
        const verifiedDocs = docs.filter(d => d.verification_status === 'verified');
        const pendingDocs = docs.filter(d => d.verification_status === 'pending');

        const [skills] = await pool.query(
          'SELECT skill_name, avg_score FROM skill_proficiency WHERE student_id = ?',
          [studentId]
        );

        verifiedCrossReference = {
          verified_documents_count: verifiedDocs.length,
          total_platform_documents: docs.length,
          pending_verification_count: pendingDocs.length,
          verified_skills_match: skills.map(s => s.skill_name)
        };
      } catch (err) {
        console.warn('Could not query verification data for resume:', err.message);
      }
    }

    // 6. Generate Prescriptive ATS Feedback & Improvement Checklist
    const suggestions = [];
    if (!sections.certifications) {
      suggestions.push({
        type: 'SECTION',
        severity: 'MEDIUM',
        tip: 'Add a dedicated Certifications or Achievements section highlighting specialized courseworks or hackathons.'
      });
    }
    if (!hasQuantifiableMetrics) {
      suggestions.push({
        type: 'IMPACT',
        severity: 'HIGH',
        tip: 'Include quantifiable metrics in project bullet points (e.g., "Reduced latency by 35%", "Handled 500+ requests/sec").'
      });
    }
    if (missingKeywords.length > 0) {
      suggestions.push({
        type: 'KEYWORDS',
        severity: 'HIGH',
        tip: `Incorporate industry-standard keywords: ${missingKeywords.slice(0, 4).join(', ')} to improve ATS parser rankings.`
      });
    }
    if (matchedVerbs.length < 4) {
      suggestions.push({
        type: 'ACTION_VERBS',
        severity: 'MEDIUM',
        tip: 'Start bullet points with strong technical action verbs (e.g. Engineered, Spearheaded, Architected, Automated).'
      });
    }

    let atsGrade = 'C (Needs Work)';
    if (atsScore >= 85) atsGrade = 'A+ (ATS Mastered)';
    else if (atsScore >= 75) atsGrade = 'A (Recruiter Ready)';
    else if (atsScore >= 60) atsGrade = 'B (Good Foundation)';

    return {
      ats_score: atsScore,
      ats_grade: atsGrade,
      target_role: targetRole,
      word_count: wordCount,
      sections_detected: sections,
      keyword_analysis: {
        matched_keywords: matchedKeywords,
        missing_keywords: missingKeywords,
        coverage_percent: Math.round((matchedKeywords.length / relevantKeywords.length) * 100)
      },
      action_verbs_detected: matchedVerbs,
      has_quantifiable_metrics: hasQuantifiableMetrics,
      verified_cross_reference: verifiedCrossReference,
      improvement_suggestions: suggestions
    };
  }
}

module.exports = new ResumeService();
