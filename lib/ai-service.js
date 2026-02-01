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
        weeklyPlan: Array.from({ length: 12 }, (_, i) => ({
          week: i + 1,
          phase: i < 4 ? "Foundations" : i < 8 ? "Advanced" : "Interview Prep",
          topic: `Week ${i + 1}: ${i === 0 ? "Setup & Foundations" : "Technical Mastery"}`,
          objectives: ["Objective 1", "Objective 2"],
          tasks: [{
            title: "Task title",
            description: "Task description",
            timeEstimate: "4 hours",
            type: "learning",
            resources: { videos: [], courses: [], articles: [], documentation: [], books: [] },
            deliverable: "Completed lab"
          }],
          projectIdea: { title: "Sample Project", description: "A simple demo", techStack: ["React"], features: ["Feature 1"], difficulty: "Beginner" },
          successCriteria: ["Completed all tasks"]
        })),
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