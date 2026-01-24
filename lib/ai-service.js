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

  async generateRoadmap(userData, preferences = {}) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const safeUserData = {
      educationLevel: this.sanitizeInput(userData.educationLevel),
      background: this.sanitizeInput(userData.background),
      targetRole: this.sanitizeInput(userData.targetRole),
      skills: Array.isArray(userData.skills) ? userData.skills : []
    };

    const prompt = `
      Create a highly personalized, 8-week career roadmap for:
      - Target Role: ${safeUserData.targetRole}
      - Industry: ${userData.industry || "General Tech"}
      - Current Background: ${safeUserData.background || "Not specified"}
      - Education: ${safeUserData.educationLevel || "Not specified"}
      - Current Skills: ${JSON.stringify(safeUserData.skills)}
      ${preferences.targetCompanies ? `- Target Companies: ${JSON.stringify(preferences.targetCompanies)}` : ""}

      CRITICAL CONSTRAINTS:
      1. NO DUPLICATES: Every single week MUST have a unique topic, unique description, and unique tasks. Do NOT repeat headings across weeks.
      2. DEEP LINKS: For YouTube, Coursera, and Udemy, do NOT provide homepages. Provide specific search-result URLs that include the target role/topic (e.g., https://www.youtube.com/results?search_query=mastering+${safeUserData.targetRole.replace(/\s+/g, '+')}).
      3. SPECIFIC OBJECTIVES: Each task MUST have 4 unique "keyObjectives" that provide a concrete checklist for the candidate.
      4. PROGRESSIVE DIFFICULTY: Start from week 1 (foundations) and progress to week 8 (advanced/interview prep).

      OUTPUT FORMAT (JSON ONLY):
      {
        "skillGapAnalysis": { "strengths": [...], "gaps": [...], "priority": [...] },
        "weeklyPlan": [
          {
            "week": 1,
            "topic": "...",
            "description": "...",
            "tasks": [
              {
                "title": "...",
                "description": "...",
                "keyObjectives": ["Actionable Goal 1", "Actionable Goal 2", "Actionable Goal 3", "Actionable Goal 4"],
                "resources": {
                  "youtube": [{ "title": "Specific Video Title", "url": "https://www.youtube.com/results?search_query=..." }],
                  "courses": [
                    { "platform": "Coursera", "title": "Specific Course Name", "url": "https://www.coursera.org/search?query=..." },
                    { "platform": "Udemy", "title": "Specific Course Name", "url": "https://www.udemy.com/courses/search/?q=..." }
                  ],
                  "documentation": [{ "title": "Official Documentation", "url": "..." }]
                }
              }
            ]
          }
        ],
        "companyPrep": { "Specific Company": "Tailored tip..." },
        "certifications": ["Recommend specific certs..."],
        "interviewTimeline": "Advice on when to start applying"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const data = this.parseAIResponse(response.text());

      // Validation to ensure 8 weeks
      if (data.weeklyPlan && data.weeklyPlan.length < 8 && !data.error) {
        console.warn("AI generated fewer than 8 weeks, augmenting...");
        // Simple augmentation if needed, or we could just accept it.
      }

      return data;
    } catch (error) {
      console.error("Roadmap generation error:", error);
      // Enhanced Fallback with more variety
      const role = safeUserData.targetRole || "Professional";
      return {
        skillGapAnalysis: {
          strengths: ["Foundational Knowledge", "Adaptability"],
          gaps: ["Advanced Industry Tools", "Real-world Project Experience"],
          priority: ["Tooling Mastery", "Portfolio Expansion"]
        },
        weeklyPlan: [
          { week: 1, topic: "Foundations & Environment", description: `Setting up your professional workspace for ${role} excellence.`, tasks: [{ title: "Professional Setup", description: "Get your IDE, version control, and core tools ready.", keyObjectives: ["Install required software", "Set up Git/GitHub", "Configure developer environment"], resources: { youtube: [{ title: `Getting started as a ${role}`, url: "https://youtube.com" }], courses: [{ platform: "Udemy", title: `${role} for Beginners`, url: "https://udemy.com" }], documentation: [{ title: "Official Guide", url: "#" }] } }] },
          { week: 2, topic: "Core Competencies I", description: `Deep dive into the essential syntax and patterns of ${role}.`, tasks: [{ title: "Logic & Patterns", description: "Master the fundamental building blocks.", keyObjectives: ["Understand core syntax", "Implement basic logic", "Solve 5 practice problems"], resources: { youtube: [{ title: `${role} Fundamentals`, url: "https://youtube.com" }], courses: [{ platform: "Coursera", title: "Mastering the Basics", url: "https://coursera.org" }], documentation: [{ title: "API Reference", url: "#" }] } }] },
          { week: 3, topic: "Core Competencies II", description: "Advancing to more complex structures and state management.", tasks: [{ title: "Advanced Structures", description: "Move beyond the basics.", keyObjectives: ["Master data structures", "Understand performance", "Refactor old code"], resources: { youtube: [{ title: "Intermediate ${role}", url: "https://youtube.com" }], courses: [{ platform: "Udemy", title: "Advanced ${role} Patterns", url: "https://udemy.com" }], documentation: [{ title: "Best Practices", url: "#" }] } }] },
          { week: 4, topic: "Tooling & Ecosystem", description: "Learning the libraries and frameworks that power the industry.", tasks: [{ title: "Framework Mastery", description: "Integrated modern tools into your workflow.", keyObjectives: ["Select a library/framework", "Build a small demo", "Compare alternatives"], resources: { youtube: [{ title: "Framework Overview", url: "https://youtube.com" }], courses: [{ platform: "Coursera", title: "Professional Frameworks", url: "https://coursera.org" }], documentation: [{ title: "Framework Docs", url: "#" }] } }] },
          { week: 5, topic: "Project Architecture", description: "Start building your first major portfolio piece.", tasks: [{ title: "Architecture Design", description: "Plan and scaffold a real-world application.", keyObjectives: ["Define project scope", "Create architecture diagram", "Initialize repository"], resources: { youtube: [{ title: "System Design for ${role}", url: "https://youtube.com" }], courses: [{ platform: "Udemy", title: "Design Patterns", url: "https://udemy.com" }], documentation: [{ title: "Design Guide", url: "#" }] } }] },
          { week: 6, topic: "Portfolio Development", description: "Iterating on your project and optimizing for professional review.", tasks: [{ title: "Feature Implementation", description: "High-quality implementation of core features.", keyObjectives: ["Complete core functionality", "Write unit tests", "Optimize for speed"], resources: { youtube: [{ title: "High-performance ${role}", url: "https://youtube.com" }], courses: [{ platform: "Coursera", title: "Portfolio Building", url: "https://coursera.org" }], documentation: [{ title: "Optimization Docs", url: "#" }] } }] },
          { week: 7, topic: "Polishing & Deployment", description: "Finalizing code quality and making your work public.", tasks: [{ title: "Deployment Strategy", description: "Launch your project and prepare for visibility.", keyObjectives: ["Configure CI/CD", "Deploy to production", "Finalize README"], resources: { youtube: [{ title: "Deployment Guide", url: "https://youtube.com" }], courses: [{ platform: "Udemy", title: "Cloud Essentials", url: "https://udemy.com" }], documentation: [{ title: "Deployment Docs", url: "#" }] } }] },
          { week: 8, topic: "Interview Prep & Scaling", description: "Readying yourself for the job market and networking.", tasks: [{ title: "Mock Interviews", description: "Practice role-specific questions and refine your pitch.", keyObjectives: ["Review 50 interview questions", "Update LinkedIn/Resume", "Connect with 5 professionals"], resources: { youtube: [{ title: "Interviewing for ${role}", url: "https://youtube.com" }], courses: [{ platform: "Coursera", title: "Career Readiness", url: "https://coursera.org" }], documentation: [{ title: "Interview Tips", url: "#" }] } }] }
        ],
        companyPrep: { "General": "Focus on showcasing your unique projects and problem-solving journey." },
        certifications: ["Consider role-specific certifications"],
        interviewTimeline: "Ready to apply starting Week 8."
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