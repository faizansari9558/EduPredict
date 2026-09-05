/**
 * Generative AI Career & Interview Assistant Service
 * Context-aware guidance, mock interview generation, and personalized roadmap synthesis
 */

class CareerAiService {
  /**
   * Conversational career guidance grounded in student profile
   */
  async generateChatResponse(studentProfile, userMessage, history = []) {
    const msg = userMessage.toLowerCase();
    const studentName = studentProfile?.name || 'Student';
    const cgpa = studentProfile?.cgpa || '7.5';
    const tier = studentProfile?.placement_tier || 'Standard';
    const skills = studentProfile?.skills?.join(', ') || 'JavaScript, Python, Data Structures';

    let reply = '';

    if (msg.includes('interview') || msg.includes('prepare') || msg.includes('questions')) {
      reply = `Hello ${studentName}! Based on your current technical profile (${skills}), here is the high-yield interview preparation strategy:\n\n` +
        `1. **Algorithmic Screening**: Focus on Arrays, HashMaps, Trees, and Two-Pointer patterns in our Coding Arena. Practice at least 2 medium problems daily.\n` +
        `2. **Core CS Fundamentals**: Prepare key DBMS concepts (Indexing, ACID, Normalization) and OS basics (Processes vs Threads, Deadlocks).\n` +
        `3. **Project Deep-Dive**: Be ready to explain architecture trade-offs for your top projects and describe how you handled bottlenecks or errors.\n` +
        `4. **Behavioral (STAR Method)**: Prepare 2 situational examples demonstrating teamwork, resolving conflicts, and learning under tight deadlines.`;
    } else if (msg.includes('roadmap') || msg.includes('learn') || msg.includes('improve')) {
      reply = `Here is your customized 60-Day Technical Mastery Plan tailored to your current standing (Targeting ${tier} Tier):\n\n` +
        `• **Days 1–20 (DSA Foundation)**: Master Binary Search, Sliding Window, and Graph traversals (BFS/DFS).\n` +
        `• **Days 21–40 (Full-Stack & Systems)**: Build an end-to-end project incorporating authentication, database optimization, and cloud deployment.\n` +
        `• **Days 41–60 (Placement Sprint)**: Take timed aptitude tests in EduPredict Assessment Engine and participate in mock technical interviews.`;
    } else if (msg.includes('salary') || msg.includes('package') || msg.includes('lpa')) {
      reply = `For candidates with your current academic performance (${cgpa} CGPA) and skill set in ${skills}:\n\n` +
        `• **Standard Placement Tier**: 4.0 – 6.5 LPA (Requires strong aptitude & core programming).\n` +
        `• **Dream Placement Tier**: 7.0 – 11.0 LPA (Requires strong DSA, OOP, and 2 full-stack projects).\n` +
        `• **Super Dream Tier**: 12.0 – 25.0+ LPA (Requires advanced algorithms, system design, and competitive coding clearance).\n\n` +
        `Consistent practice in EduPredict Coding Arena will help you bridge to the next compensation tier.`;
    } else {
      reply = `Great question, ${studentName}! As your AI Career Copilot, I analyzed your profile (${cgpa} CGPA, ${skills}, predicted tier: ${tier}).\n\n` +
        `To maximize your campus placement odds:\n` +
        `• Keep your coding test pass rate above 80%.\n` +
        `• Add at least 1 deployed project with clear README documentation.\n` +
        `• Ensure all semester marks certificates are verified by your faculty.\n\n` +
        `Would you like me to generate mock interview questions or build a 30-day preparation roadmap for a specific company?`;
    }

    return {
      reply,
      suggested_followups: [
        'Generate mock technical interview questions',
        'Create a 30-day skill improvement roadmap',
        'Draft a customized cover letter for a Software Engineer role',
        'What skills am I missing for Dream Tier companies?'
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate targeted mock interview questions with answer outlines
   */
  async generateMockInterviewQuestions(studentProfile, role = 'Software Engineer', difficulty = 'Medium') {
    const skills = studentProfile?.skills || ['JavaScript', 'Python', 'Data Structures', 'SQL'];

    return {
      role,
      difficulty,
      questions: [
        {
          id: 1,
          category: 'Data Structures & Algorithms',
          question: 'How would you find the longest substring without repeating characters in O(N) time complexity?',
          key_concepts: ['Sliding Window', 'HashMap / HashSet', 'Two Pointers'],
          sample_answer_framework: 'Explain the sliding window pattern using a hash map to store the most recent index of each character, advancing the left pointer whenever a duplicate is found.'
        },
        {
          id: 2,
          category: 'Database & System Design',
          question: 'Explain the difference between clustered and non-clustered indexes in SQL. When would indexing degrade performance?',
          key_concepts: ['B-Tree Indexes', 'Write Amplification', 'Query Optimization'],
          sample_answer_framework: 'Clustered index dictates the physical sorting of rows in table (only 1 per table), whereas non-clustered index creates a separate pointer structure. Over-indexing slows down INSERT/UPDATE operations.'
        },
        {
          id: 3,
          category: 'Core Computer Science & OOP',
          question: 'How does asynchronous execution / event loop work in modern web runtime environments?',
          key_concepts: ['Call Stack', 'Microtask Queue', 'Macrotask Queue', 'Event Loop'],
          sample_answer_framework: 'Walk through the call stack execution, execution of promises in microtask queue before rendering/macrotasks, avoiding blocking operations.'
        },
        {
          id: 4,
          category: 'Practical Problem Solving',
          question: 'Describe a complex bug you encountered in one of your projects and the systematic debugging steps you used to resolve it.',
          key_concepts: ['Root Cause Analysis', 'Logging / Profiling', 'Regression Testing'],
          sample_answer_framework: 'Use STAR method: Describe Context, the bug symptom, profiling logs/breakpoints, the fix, and regression test written.'
        },
        {
          id: 5,
          category: 'Behavioral & Leadership',
          question: 'How do you handle a scenario where team members disagree on the technical architecture for a project deadline?',
          key_concepts: ['Collaboration', 'Objective Evaluation', 'Decision Making'],
          sample_answer_framework: 'Highlight evaluating trade-offs objectively against project constraints, prototyping minimal tests, and seeking mentor guidance if needed.'
        }
      ]
    };
  }

  /**
   * Generate customized 30-60-90 Day Roadmap
   */
  async generateRoadmap(studentProfile, targetGoal = 'Full-Stack Developer') {
    return {
      target_goal: targetGoal,
      milestones: [
        {
          phase: 'Phase 1: Days 1–30 (Foundation & Algorithmic Core)',
          focus: 'Data Structures & Timed Aptitude Mastery',
          tasks: [
            'Solve 40 LeetCode/Coding Arena problems on Arrays, Strings, HashMaps, and Linked Lists.',
            'Complete EduPredict Quantitative & Verbal Aptitude modules.',
            'Review Core OOP principles and design patterns.'
          ]
        },
        {
          phase: 'Phase 2: Days 31–60 (Applied Engineering & Capstone Project)',
          focus: 'Production-ready Project Deployment',
          tasks: [
            'Architect a full-stack application featuring JWT auth, REST APIs, and database migrations.',
            'Deploy live demo on Cloud (Vercel/Render) with CI/CD GitHub Actions.',
            'Run ATS scan on your resume in EduPredict to reach 85+ score.'
          ]
        },
        {
          phase: 'Phase 3: Days 61–90 (Placement Sprint & Mock Drives)',
          focus: 'Interview Execution & Speed Optimization',
          tasks: [
            'Participate in 5 mock technical interview rounds with peers/mentors.',
            'Solve 3 hard graph & dynamic programming problems weekly.',
            'Apply to verified campus recruitment and off-campus career drives.'
          ]
        }
      ]
    };
  }

  /**
   * Generate tailored Cover Letter
   */
  async generateCoverLetter(studentProfile, companyName = 'Innovate Tech', jobTitle = 'Software Development Engineer') {
    const name = studentProfile?.name || 'Applicant';
    const email = studentProfile?.email || 'applicant@edupredict.local';
    const cgpa = studentProfile?.cgpa || '8.2';
    const skills = studentProfile?.skills?.slice(0, 5).join(', ') || 'JavaScript, Python, React, Node.js, SQL';

    return {
      company_name: companyName,
      job_title: jobTitle,
      letter_text: `Dear Hiring Team at ${companyName},\n\n` +
        `I am writing to express my strong enthusiasm for the ${jobTitle} position at ${companyName}. As a Computer Science student with a strong academic standing (${cgpa} CGPA) and hands-on expertise in ${skills}, I am excited about the opportunity to contribute to your engineering team.\n\n` +
        `Through intensive coursework and practical project development on the EduPredict platform, I have engineered scalable web applications, solved complex algorithmic challenges, and collaborated in fast-paced software environments. My technical background in full-stack architectures combined with rigorous problem-solving skills will enable me to hit the ground running.\n\n` +
        `I admire ${companyName}'s commitment to engineering innovation and would welcome the opportunity to discuss how my technical proficiencies align with your upcoming goals.\n\n` +
        `Thank you for your time and consideration.\n\n` +
        `Sincerely,\n${name}\n${email}`
    };
  }
}

module.exports = new CareerAiService();
