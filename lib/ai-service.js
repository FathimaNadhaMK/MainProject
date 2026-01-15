import { GoogleGenerativeAI } from "@google/generative-ai";

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️  GEMINI_API_KEY not set in .env - AI features will not work");
      this.model = null;
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Updated model name
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
  }

  isAvailable() {
    return this.model !== null;
  }

  // Sanitize user input to prevent prompt injection
  sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/[<>]/g, '') // Remove potential HTML
      .substring(0, 5000); // Limit length
  }

  parseAIResponse(text) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return { text: text.trim() };
    } catch (error) {
      console.warn("AI response parse error:", error.message);
      return { text: text.trim(), error: "Failed to parse JSON" };
    }
  }

  async generateRoadmap(userData, preferences = {}) {
    if (!this.isAvailable()) {
      return { error: "AI service not configured. Add GEMINI_API_KEY to .env" };
    }

    // Sanitize inputs
    const safeUserData = {
      educationLevel: this.sanitizeInput(userData.educationLevel),
      background: this.sanitizeInput(userData.background),
      targetRole: this.sanitizeInput(userData.targetRole),
      skills: Array.isArray(userData.skills) 
        ? userData.skills.map(s => this.sanitizeInput(s)).slice(0, 20)
        : []
    };

    const prompt = `
      Create a personalized 8-week career roadmap for a student.

      PROFILE:
      - Education: ${safeUserData.educationLevel || "Not specified"}
      - Background: ${safeUserData.background || "Not specified"}  
      - Target Role: ${safeUserData.targetRole || "Software Engineer"}
      - Skills: ${JSON.stringify(safeUserData.skills)}

      ${preferences.targetCompanies ? `Target Companies: ${JSON.stringify(preferences.targetCompanies)}` : ""}
      ${preferences.locationPref ? `Location: ${this.sanitizeInput(preferences.locationPref)}` : ""}

      Provide response as JSON with:
      1. skillGapAnalysis: {strengths: [], gaps: [], priority: []}
      2. weeklyPlan: Array of 8 weeks with topics, resources, projects
      3. companyPrep: Company-specific preparation tips
      4. certifications: Recommended certifications
      5. interviewTimeline: When to start interview prep

      Make it practical and actionable.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Roadmap generation error:", error);
      return { error: error.message };
    }
  }

  async analyzeResume(resumeText, targetCompany = null) {
    if (!this.isAvailable()) {
      return { error: "AI service not configured" };
    }

    const safeResumeText = this.sanitizeInput(resumeText);
    const safeCompany = targetCompany ? this.sanitizeInput(targetCompany) : null;

    const prompt = `
      Analyze this resume for ${safeCompany ? "a " + safeCompany + " role" : "a tech role"}:

      RESUME:
      ${safeResumeText.substring(0, 2500)}${safeResumeText.length > 2500 ? "... [truncated]" : ""}

      Provide JSON with:
      1. score: 0-100
      2. strengths: Array of strong points
      3. weaknesses: Areas for improvement  
      4. suggestions: Specific improvement suggestions
      5. missingKeywords: Important keywords missing
      ${safeCompany ? `6. companyTips: Tips specific for ${safeCompany}` : ""}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Resume analysis error:", error);
      return { error: error.message };
    }
  }

  async generateQuiz(topic, difficulty = "medium", company = null) {
    if (!this.isAvailable()) {
      return { error: "AI service not configured" };
    }

    const safeTopic = this.sanitizeInput(topic);
    const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    const safeCompany = company ? this.sanitizeInput(company) : null;

    const prompt = `
      Generate ${safeDifficulty} difficulty quiz on "${safeTopic}" ${safeCompany ? "as asked in " + safeCompany + " interviews" : ""}.

      Create 5 multiple choice questions.
      Each question should have:
      - question: Clear question text
      - options: {a: "...", b: "...", c: "...", d: "..."}
      - correctAnswer: "a", "b", "c", or "d"
      - explanation: Brief explanation of correct answer

      Return as JSON: {topic: "${safeTopic}", questions: []}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Quiz generation error:", error);
      return { error: error.message };
    }
  }
}

// Create and export singleton instance
const aiService = new AIService();
export { AIService, aiService };