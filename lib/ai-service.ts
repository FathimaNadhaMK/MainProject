import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  private parseAIResponse(text: string): any {
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return { text };
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
      return { text };
    }
  }

  async generateRoadmap(userData: any, preferences?: any): Promise<any> {
    const prompt = `
      You are an AI career coach for computer science students. Generate a personalized 8-week career roadmap.

      STUDENT PROFILE:
      - Education Level: ${userData.educationLevel || 'Not specified'}
      - Background: ${userData.background || 'Not specified'}
      - Target Role: ${userData.targetRole || 'Not specified'}
      - Skills: ${JSON.stringify(userData.skills || [])}

      ${preferences?.targetCompanies ? `TARGET COMPANIES: ${JSON.stringify(preferences.targetCompanies)}` : ''}
      ${preferences?.locationPref ? `LOCATION PREFERENCE: ${preferences.locationPref}` : ''}

      Generate a structured roadmap with:
      1. Skill Gap Analysis
      2. Weekly Learning Plan (8 weeks)
      3. Company-Specific Preparation
      4. Certification Recommendations
      5. Interview Timeline

      Return as JSON.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error('AI Roadmap Generation Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();