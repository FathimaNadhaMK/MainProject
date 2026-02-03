import { GoogleGenerativeAI } from "@google/generative-ai";

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set in .env");
      this.model = null;
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for maximum stability and compatibility
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      }
    });
  }

  isAvailable() {
    return this.model !== null;
  }

  sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>]/g, '').substring(0, 5000);
  }

  parseAIResponse(text) {
    try {
      // Clean markdown code blocks
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn("AI response parse error:", error.message);
      // Try to match strict JSON object if parsing failed
      const jsonMatch = text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Secondary parse failed", e);
        }
      }
      return { text: text.trim(), error: "Failed to parse JSON" };
    }
  }

  async generateRoadmap(user, preferences = {}) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const prompt = `You are an expert career coach and technical mentor. Generate a comprehensive, personalized career roadmap.

USER PROFILE:
- Education: ${user.educationLevel || 'Not specified'}
- Background: ${user.background || 'Not specified'}
- Current Role/Status: ${user.currentStatus || 'Student'}
- Target Role: ${user.targetRole || 'Software Engineer'}
- Current Skills: ${JSON.stringify(user.skills || [])}
- Skill Levels: ${JSON.stringify(user.skillLevels || {})}
- Target Companies: ${preferences.targetCompanies?.join(', ') || 'General'}
- Location Preference: ${preferences.locationPref || 'Flexible'}
- Interested in Internships: ${user.interestedInInternships || 'No'}
- Interested in Certifications: ${user.interestedInCertifications || 'No'}

Generate a DETAILED roadmap with:

1. SKILL GAP ANALYSIS:
   - Identify 3-5 specific strengths with examples
   - Identify 5-7 critical skill gaps for the target role
   - Priority learning order based on dependencies
   - Timeline impact of each gap

2. PROGRESSIVE WEEKLY PLAN (16 weeks):
   Break the journey into 4 clear phases:
   - PHASE 1: FOUNDATION (Weeks 1-4)
     * Focus: Core fundamentals, environment setup
     * Intensity: Heavy learning
   - PHASE 2: INTERMEDIATE (Weeks 5-8)
     * Focus: Applied projects, framework mastery
     * Intensity: Balanced learning + building
   - PHASE 3: ADVANCED (Weeks 9-12)
     * Focus: Complex systems, optimization, specialization
     * Intensity: Project-heavy
   - PHASE 4: INTERVIEW MASTERY (Weeks 13-16)
     * Focus: DSA, System Design, Behavioral mock interviews
     * Intensity: Practice-focused

   For each week provide:
   - phase (use "Foundation", "Intermediate", "Advanced", or "Interview Prep")
   - Specific, measurable learning objectives
   - 3-5 actionable tasks with time estimates
   - Real project ideas to build
   - Specific resources (YouTube channels, courses, documentation)
   - Success criteria for the week

3. COMPANY-SPECIFIC PREPARATION:
   ${preferences.targetCompanies && preferences.targetCompanies.length > 0 ? `
   For each company (${preferences.targetCompanies.join(', ')}):
   - Required technical skills and depth
   - Interview process breakdown
   - Common interview questions
   - Projects that would impress them
   - Timeline to be interview-ready
   ` : 'General industry preparation strategies for top tier companies.'}

4. CERTIFICATION ROADMAP:
   - 3-5 certifications ranked by priority
   - For each: name, provider, cost, study time, ROI, prerequisites
   - Optimal timing in the overall roadmap
   - Free alternatives if available

5. PROJECT MILESTONES:
   - 3-4 portfolio projects to build
   - Complexity progression
   - Technologies to showcase
   - GitHub best practices

6. INTERVIEW PREPARATION TIMELINE:
   - When to start DSA practice
   - System design preparation (if relevant)
   - Behavioral interview prep schedule
   - Mock interview milestones

Return ONLY valid JSON matching this exact structure:
{
  "skillGapAnalysis": {
    "strengths": [{"skill": "", "evidence": "", "level": ""}],
    "gaps": [{"skill": "", "impact": "critical|high|medium", "learningTime": ""}],
    "priorityOrder": ["skill1", "skill2"],
    "timelineImpact": ""
  },
  "weeklyPlan": [{
    "week": 1,
    "phase": "",
    "topic": "",
    "objectives": [""],
    "tasks": [{
      "title": "",
      "description": "",
      "timeEstimate": "",
      "type": "learning|project|practice",
      "resources": {
        "videos": [{"title": "", "creator": "", "url": "", "duration": ""}],
        "courses": [{"platform": "", "title": "", "url": "", "cost": "", "duration": ""}],
        "articles": [{"title": "", "url": "", "readTime": ""}],
        "documentation": [{"title": "", "url": ""}],
        "books": [{"title": "", "author": "", "chapters": ""}]
      },
      "deliverable": ""
    }],
    "projectIdea": {
      "title": "",
      "description": "",
      "techStack": [],
      "features": [],
      "difficulty": ""
    },
    "successCriteria": [""]
  }],
  "companyPrep": {
    "CompanyName": {
      "requiredSkills": [],
      "interviewProcess": [],
      "timeline": "",
      "focusAreas": [],
      "projectSuggestions": []
    }
  },
  "certifications": [{
    "name": "",
    "provider": "",
    "priority": 1,
    "cost": "",
    "studyTime": "",
    "examFormat": "",
    "passingScore": "",
    "roi": "",
    "prerequisites": [],
    "recommendedWeek": 0,
    "studyResources": [],
    "freeAlternatives": []
  }],
  "projectMilestones": [{
    "week": 0,
    "title": "",
    "description": "",
    "technologies": [],
    "features": [],
    "learningGoals": [],
    "portfolioImpact": ""
  }],
  "interviewTimeline": {
    "dsaStart": "week X",
    "systemDesignStart": "week Y",
    "behavioralStart": "week Z",
    "mockInterviewSchedule": [],
    "readyToApply": "week N"
  }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const data = this.parseAIResponse(response.text());

      return data;
    } catch (error) {
      console.error("Roadmap generation error:", error);
      // Enhanced Fallback with more variety
      const role = user.targetRole || "Professional";
      return {
        skillGapAnalysis: {
          strengths: [{ skill: "Foundational Knowledge", evidence: "Work history/Education", level: "Intermediate" }],
          gaps: [{ skill: "Advanced Industry Tools", impact: "high", learningTime: "4 weeks" }],
          priorityOrder: ["Tooling Mastery", "Portfolio Expansion"],
          timelineImpact: "2-3 months"
        },
        weeklyPlan: Array.from({ length: 16 }, (_, i) => {
          const week = i + 1;
          let phase = "Foundation";
          let phaseDescription = "Core fundamentals and environment setup";

          if (week > 12) {
            phase = "Interview Prep";
            phaseDescription = "DSA, System Design, and Mock Interviews";
          } else if (week > 8) {
            phase = "Advanced";
            phaseDescription = "Complex systems and specialization";
          } else if (week > 4) {
            phase = "Intermediate";
            phaseDescription = "Applied projects and framework mastery";
          }

          // Generate phase-specific resources
          const getPhaseResources = (phase) => {
            if (phase === "Foundation") {
              return {
                videos: [
                  { title: "Getting Started with Programming", creator: "freeCodeCamp", url: "https://www.youtube.com/freecodecamp", duration: "4 hours" },
                  { title: "Development Environment Setup", creator: "Traversy Media", url: "https://www.youtube.com/traversymedia", duration: "45 min" }
                ],
                courses: [
                  { platform: "freeCodeCamp", title: "Full Stack Development", url: "https://www.freecodecamp.org", cost: "Free", duration: "300 hours" },
                  { platform: "Coursera", title: "Programming Fundamentals", url: "https://www.coursera.org", cost: "Free", duration: "40 hours" }
                ],
                articles: [
                  { title: "Beginner's Guide to Programming", url: "https://developer.mozilla.org/en-US/docs/Learn", readTime: "15 min" },
                  { title: "Best Practices for New Developers", url: "https://github.com/kamranahmedse/developer-roadmap", readTime: "20 min" }
                ],
                documentation: [
                  { title: "MDN Web Docs", url: "https://developer.mozilla.org" },
                  { title: "Official Documentation", url: "https://docs.github.com" }
                ],
                books: [
                  { title: "Clean Code", author: "Robert C. Martin", chapters: "1-5" }
                ]
              };
            } else if (phase === "Intermediate") {
              return {
                videos: [
                  { title: "Advanced Programming Concepts", creator: "Academind", url: "https://www.youtube.com/academind", duration: "6 hours" },
                  { title: "Building Real Projects", creator: "Web Dev Simplified", url: "https://www.youtube.com/webdevsimplified", duration: "3 hours" }
                ],
                courses: [
                  { platform: "Udemy", title: "Advanced Development Course", url: "https://www.udemy.com", cost: "$49.99", duration: "60 hours" },
                  { platform: "Pluralsight", title: "Framework Mastery", url: "https://www.pluralsight.com", cost: "Subscription", duration: "50 hours" }
                ],
                articles: [
                  { title: "Design Patterns Explained", url: "https://refactoring.guru/design-patterns", readTime: "30 min" },
                  { title: "API Development Best Practices", url: "https://swagger.io/resources/articles", readTime: "25 min" }
                ],
                documentation: [
                  { title: "Framework Documentation", url: "https://reactjs.org/docs" },
                  { title: "API Reference", url: "https://nodejs.org/api" }
                ],
                books: [
                  { title: "Design Patterns", author: "Gang of Four", chapters: "Selected patterns" }
                ]
              };
            } else if (phase === "Advanced") {
              return {
                videos: [
                  { title: "System Design Fundamentals", creator: "Gaurav Sen", url: "https://www.youtube.com/@gkcs", duration: "8 hours" },
                  { title: "Advanced Architecture Patterns", creator: "Hussein Nasser", url: "https://www.youtube.com/@hnasr", duration: "5 hours" }
                ],
                courses: [
                  { platform: "educative.io", title: "System Design Interview", url: "https://www.educative.io/courses/grokking-the-system-design-interview", cost: "$79", duration: "40 hours" },
                  { platform: "Coursera", title: "Cloud Architecture", url: "https://www.coursera.org", cost: "Free", duration: "30 hours" }
                ],
                articles: [
                  { title: "Scalability Principles", url: "https://github.com/donnemartin/system-design-primer", readTime: "45 min" },
                  { title: "Microservices Architecture", url: "https://microservices.io", readTime: "35 min" }
                ],
                documentation: [
                  { title: "AWS Documentation", url: "https://docs.aws.amazon.com" },
                  { title: "Kubernetes Docs", url: "https://kubernetes.io/docs" }
                ],
                books: [
                  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", chapters: "All chapters" }
                ]
              };
            } else { // Interview Prep
              return {
                videos: [
                  { title: "LeetCode Patterns", creator: "NeetCode", url: "https://www.youtube.com/@neetcode", duration: "10 hours" },
                  { title: "Mock System Design Interviews", creator: "Exponent", url: "https://www.youtube.com/@tryexponent", duration: "6 hours" }
                ],
                courses: [
                  { platform: "LeetCode", title: "Premium Interview Prep", url: "https://leetcode.com/subscribe", cost: "$35/month", duration: "100+ hours" },
                  { platform: "AlgoExpert", title: "Coding Interview Prep", url: "https://www.algoexpert.io", cost: "$99", duration: "80 hours" }
                ],
                articles: [
                  { title: "Top Interview Questions", url: "https://leetcode.com/explore/interview", readTime: "20 min" },
                  { title: "Behavioral Interview Guide", url: "https://www.techinterviewhandbook.org/behavioral-interview", readTime: "30 min" }
                ],
                documentation: [
                  { title: "LeetCode Patterns", url: "https://seanprashad.com/leetcode-patterns" },
                  { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }
                ],
                books: [
                  { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", chapters: "All chapters" }
                ]
              };
            }
          };

          return {
            week,
            phase,
            topic: `Week ${week}: ${phase} - ${week === 1 ? "Setup & Foundations" : phaseDescription}`,
            objectives: [`Master ${phase} level concepts for ${role}`, "Complete practical exercises"],
            tasks: [{
              title: `${phase} Level Task`,
              description: `Focused ${phase.toLowerCase()} work for ${role} development`,
              timeEstimate: "5-8 hours",
              type: week > 12 ? "practice" : week > 8 ? "project" : "learning",
              resources: getPhaseResources(phase),
              deliverable: `${phase} milestone completed`
            }],
            projectIdea: {
              title: `${phase} Project`,
              description: `Build a ${phase.toLowerCase()}-level project`,
              techStack: ["Technology Stack"],
              features: ["Core Feature"],
              difficulty: phase
            },
            successCriteria: ["All tasks completed", "Project milestone achieved"]
          };
        }),
        companyPrep: { "General": { requiredSkills: ["DSA", "System Design"], interviewProcess: ["Initial screening", "Technical"], timeline: "4-6 weeks", focusAreas: ["Portfolio"], projectSuggestions: ["Fullstack app"] } },
        certifications: [{ name: "Professional Cert", provider: "Main Provider", priority: 1, cost: "Free", studyTime: "20 hours", roi: "High", recommendedWeek: 4 }],
        projectMilestones: [{ week: 4, title: "First Project", description: "Portfolio starter", technologies: ["React"], features: [], learningGoals: [], portfolioImpact: "High" }],
        interviewTimeline: { dsaStart: "week 1", systemDesignStart: "week 4", behavioralStart: "week 8", readyToApply: "week 12" }
      };
    }
  }

  async generateQuiz(topic, difficulty) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const prompt = `
        Create 5 multiple choice questions on ${topic} (${difficulty} level).
        Return as JSON: {topic: "${topic}", questions: [{question: "", options: {a,b,c,d}, correctAnswer: "a", explanation: ""}]}
      `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Quiz gen error:", error);
      return { error: error.message };
    }
  }
}

export const aiService = new AIService();