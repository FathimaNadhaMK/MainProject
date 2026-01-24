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
    // Use gemini-2.5-flash for speed and accuracy
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
      Create a high-impact, 8-week career roadmap for a student aiming for a ${safeUserData.targetRole} position.
      
      CRITICAL: Each of the 8 weeks must have a UNIQUE topic, UNIQUE description, and UNIQUE tasks. 
      Do NOT repeat the same text across different weeks.

      PROFILE:
      - Education: ${safeUserData.educationLevel || "Not specified"}
      - Background: ${safeUserData.background || "Not specified"}  
      - Target Role: ${safeUserData.targetRole}
      - Skills: ${JSON.stringify(safeUserData.skills)}
      - Industry: ${userData.industry || "General Tech"}

      ${preferences.targetCompanies ? `Target Companies: ${JSON.stringify(preferences.targetCompanies)}` : ""}
      
      JSON STRUCTURE:
      {
        "skillGapAnalysis": { "strengths": ["..."], "gaps": ["..."], "priority": ["..."] },
        "weeklyPlan": [
          {
            "week": 1,
            "topic": "Foundation & Core Principles",
            "description": "...",
            "tasks": [
              { 
                "title": "...", 
                "description": "...", 
                "resources": {
                  "youtube": [{ "title": "...", "url": "..." }],
                  "courses": [{ "platform": "Coursera", "title": "...", "url": "..." }],
                  "documentation": [{ "title": "...", "url": "..." }]
                }
              }
            ]
          },
          ... up to week 8
        ],
        "companyPrep": { "Specific Company Name": "Tailored interview tips..." },
        "certifications": ["Specific Professional Cert with link..."],
        "interviewTimeline": "Specific week range for starting prep"
      }

      RESOURCE GUIDELINES:
      - YouTube: Provide REAL links to popular tutorials (e.g., from freeCodeCamp, Traversy Media, etc.).
      - Courses: Provide REAL links to Coursera or Udemy courses.
      - Description: Make it engaging and role-specific.
      - Return ONLY raw JSON.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Roadmap generation error:", error);
      // Mock Fallback
      return {
        skillGapAnalysis: {
          strengths: ["Learner Mindset", "Communication"],
          gaps: ["Technical Proficiency", "Project Experience"],
          priority: ["Foundational Skills", "Portfolio Building"]
        },
        weeklyPlan: Array(8).fill(null).map((_, i) => ({
          week: i + 1,
          topic: `Week ${i + 1} Growth Phase`,
          description: "Focus on building core competencies and practical projects.",
          tasks: [
            {
              title: "Foundation Setup",
              description: "Getting used to the industry environment and tools.",
              resources: {
                youtube: [{ title: "Industry Overview 2026", url: "https://youtube.com/results?search_query=career+in+tech+2026" }],
                courses: [{ platform: "Coursera", title: "Professional Skill 101", url: "https://www.coursera.org" }],
                documentation: [{ title: "Getting Started Guide", url: "#" }]
              }
            }
          ]
        })),
        companyPrep: { "General": "Research company values and tech stack." },
        certifications: [],
        interviewTimeline: "Start preparing in Week 4."
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