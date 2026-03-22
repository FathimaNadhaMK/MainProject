// lib/job-matching/role-taxonomy.js
import { geminiModel } from "@/app/lib/gemini";

// Standard taxonomy acts as high-speed memory cache for common domains
export const TAXONOMY_CACHE = {
  "software-engineer": {
    primaryKeywords: ["software engineer", "backend developer", "full stack", "developer", "programmer"],
    excludeKeywords: ["data analyst", "data scientist", "ML engineer", "ux designer", "ui designer"],
    requiredSkillCategories: ["programming", "architecture", "devops"],
    optionalSkillCategories: ["databases", "cloud"],
    
    skillHierarchy: {
      core: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "System Design"],
      important: ["Docker", "Kubernetes", "REST APIs", "Git", "React", "Node.js", "Spring Boot"],
      nice: ["GraphQL", "Microservices", "CI/CD", "AWS", "Azure"]
    },
    
    jobTitleVariants: [
      "Software Engineer",
      "Backend Developer", 
      "Full Stack Developer",
      "Application Developer",
      "Frontend Developer"
    ],
    
    excludeTitles: [
      "Data Analyst",
      "Business Analyst", 
      "QA Engineer",
      "Data Scientist",
      "Product Manager",
      "UX Designer"
    ]
  },
  
  "data-analyst": {
    primaryKeywords: ["data analyst", "business intelligence", "analytics", "bi analyst"],
    excludeKeywords: ["software engineer", "full stack", "backend developer", "frontend developer"],
    requiredSkillCategories: ["analytics", "visualization", "statistics"],
    optionalSkillCategories: ["databases", "etl"],
    
    skillHierarchy: {
      core: ["SQL", "Excel", "Tableau", "Power BI", "Statistics", "Data Analysis"],
      important: ["Python", "R", "Data Visualization", "ETL", "Pandas"],
      nice: ["Looker", "DAX", "Business Intelligence", "Google Analytics"]
    },
    
    jobTitleVariants: [
      "Data Analyst",
      "Business Intelligence Analyst",
      "Analytics Engineer",
      "Reporting Analyst",
      "BI Analyst"
    ],
    
    excludeTitles: [
      "Software Engineer",
      "Full Stack Developer",
      "Data Scientist",
      "ML Engineer",
      "Backend Developer"
    ]
  },
  
  "data-scientist": {
    primaryKeywords: ["data scientist", "ML engineer", "machine learning", "ai engineer"],
    excludeKeywords: ["data analyst", "software engineer", "web developer"],
    requiredSkillCategories: ["machine-learning", "statistics", "programming"],
    
    skillHierarchy: {
      core: ["Python", "R", "Machine Learning", "Statistics", "Deep Learning", "TensorFlow", "PyTorch"],
      important: ["Scikit-learn", "SQL", "Feature Engineering", "Data Modeling"],
      nice: ["MLOps", "A/B Testing", "NLP", "Computer Vision", "Spark"]
    },
    
    jobTitleVariants: [
      "Data Scientist",
      "Machine Learning Engineer",
      "AI Engineer",
      "Applied Scientist"
    ],
    
    excludeTitles: [
      "Data Analyst",
      "Business Analyst",
      "Software Engineer",
      "Front End Developer",
      "Web Developer"
    ]
  },
  
  "ui-ux-designer": {
    primaryKeywords: ["ux designer", "ui designer", "product designer", "user experience"],
    excludeKeywords: ["software engineer", "developer", "data analyst"],
    requiredSkillCategories: ["design", "prototyping", "research"],
    
    skillHierarchy: {
      core: ["Figma", "Sketch", "Adobe XD", "UI Design", "UX Research", "Wireframing"],
      important: ["Prototyping", "User Testing", "Interaction Design", "Typography"],
      nice: ["HTML", "CSS", "Illustrator", "Animation"]
    },
    
    jobTitleVariants: [
      "UX Designer",
      "UI/UX Designer",
      "Product Designer",
      "Visual Designer"
    ],
    
    excludeTitles: [
      "Software Engineer",
      "Frontend Developer",
      "Data Analyst",
      "Product Manager"
    ]
  },
  
  "cyber-security": {
    primaryKeywords: ["security analyst", "cybersecurity", "information security", "penetration tester"],
    excludeKeywords: ["software developer", "data analyst", "web developer"],
    requiredSkillCategories: ["security", "networking", "risk"],
    
    skillHierarchy: {
      core: ["Networking", "Security", "Penetration Testing", "Linux", "Risk Assessment"],
      important: ["Firewalls", "Cryptography", "Incident Response", "SIEM"],
      nice: ["CISSP", "CEH", "Cloud Security", "Python"]
    },
    
    jobTitleVariants: [
      "Cyber Security Analyst",
      "Information Security Engineer",
      "Security Consultant",
      "Penetration Tester"
    ],
    
    excludeTitles: [
      "Software Engineer",
      "Data Analyst",
      "Frontend Developer"
    ]
  },
  
  "cloud-devops": {
    primaryKeywords: ["devops", "cloud engineer", "sre", "site reliability"],
    excludeKeywords: ["frontend developer", "data analyst", "ux designer"],
    requiredSkillCategories: ["cloud", "ci/cd", "infrastructure"],
    
    skillHierarchy: {
      core: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD"],
      important: ["Terraform", "Linux", "Jenkins", "Ansible", "Bash"],
      nice: ["Networking", "Security", "Python", "Prometheus"]
    },
    
    jobTitleVariants: [
      "DevOps Engineer",
      "Cloud Engineer",
      "Site Reliability Engineer",
      "Infrastructure Engineer"
    ],
    
    excludeTitles: [
      "Frontend Developer",
      "Data Analyst",
      "UX Designer"
    ]
  }
};

/**
 * Universal algorithm: Dynamically calculates or retrieves Taxonomy logic for ANY role.
 */
export async function getRoleTaxonomy(userRole) {
  if (!userRole) return TAXONOMY_CACHE["software-engineer"];
  
  const lowerRole = userRole.toLowerCase().trim();
  
  // High-speed static fallback mapping for major generic titles
  if (lowerRole.includes("data") && lowerRole.includes("analyst")) return TAXONOMY_CACHE["data-analyst"];
  if (lowerRole.includes("data") && lowerRole.includes("scien")) return TAXONOMY_CACHE["data-scientist"];
  if (lowerRole.includes("machine learning") || lowerRole.includes("ml ") || lowerRole.includes("ai ")) return TAXONOMY_CACHE["data-scientist"];
  if (lowerRole.includes("design") || lowerRole.includes("ux") || lowerRole.includes("ui")) return TAXONOMY_CACHE["ui-ux-designer"];
  if (lowerRole.includes("security") || lowerRole.includes("cyber")) return TAXONOMY_CACHE["cyber-security"];
  if (lowerRole.includes("devops") || lowerRole.includes("cloud") || lowerRole.includes("sre")) return TAXONOMY_CACHE["cloud-devops"];
  if (lowerRole.includes("software engineer") || lowerRole.includes("full stack")) return TAXONOMY_CACHE["software-engineer"];

  // Exact match from cache
  if (TAXONOMY_CACHE[lowerRole]) {
      return TAXONOMY_CACHE[lowerRole];
  }

  // Dynamic Generative Taxonomy Engine
  console.log(`[Role Taxonomy] Building advanced dynamic taxonomy for unseen role: ${lowerRole}`);
  
  const prompt = `You are an expert career architect. Generate a strict job taxonomy mapping for the specific role: "${lowerRole}".
  Return ONLY valid JSON with no markdown formatting.
  
  Schema required:
  {
    "primaryKeywords": ["keyword1", "keyword2"], // 3-6 general search terms for the role
    "excludeKeywords": ["unrelated_keyword"], // 3-6 terms blocking unrelated jobs
    "requiredSkillCategories": ["category-name"], 
    "skillHierarchy": {
      "core": ["Skill1"], // 5-8 absolutely mandatory foundation skills 
      "important": ["Skill2"], // 5-8 highly relevant ecosystem skills
      "nice": ["Skill3"] // 3-5 bonus advanced skills
    },
    "jobTitleVariants": ["Variant1"], // 4-6 alternative variations of this specific job title
    "excludeTitles": ["ExcludedTitle1"] // 4-6 somewhat similarly-named titles that are COMPLETELY WRONG for this role
  }`;

  try {
      const result = await geminiModel.generateContent(prompt);
      const cleanedText = result.response.text().replace(/```(?:json)?\n?/g, "").replace(/\n?```/g, "").trim();
      const generatedTaxonomy = JSON.parse(cleanedText);
      
      // Save it memory-cache to accelerate future lookups this session!
      TAXONOMY_CACHE[lowerRole] = generatedTaxonomy;
      
      return generatedTaxonomy;
  } catch(error) {
      console.error("[Role Taxonomy] Failed to dynamically generate taxonomy, reverting to fallback:", error.message);
      return TAXONOMY_CACHE["software-engineer"];
  }
}
