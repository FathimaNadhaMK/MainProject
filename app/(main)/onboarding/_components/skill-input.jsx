"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const PROFICIENCY_LEVELS = ["Basic", "Medium", "Good", "Proficient"];

const COMMON_SKILLS = [
  /* =========================
     CORE TECH / IT SKILLS
     ========================= */
  "JavaScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "TypeScript",
  "R",
  "Kotlin",
  "Swift",

  /* =========================
     WEB & APP DEVELOPMENT
     ========================= */
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",
  "React",
  "Next.js",
  "Angular",
  "Vue.js",
  "Node.js",
  "Express.js",
  "REST API Development",
  "GraphQL",
  "WebSockets",
  "Mobile App Development",
  "Android Development",
  "iOS Development",

  /* =========================
     DATABASE & DATA
     ========================= */
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Firebase",
  "Data Modeling",
  "Data Warehousing",
  "ETL Pipelines",
  "Data Cleaning",

  /* =========================
     CLOUD & DEVOPS
     ========================= */
  "AWS",
  "Azure",
  "Google Cloud Platform",
  "Docker",
  "Kubernetes",
  "CI/CD Pipelines",
  "Linux",
  "Shell Scripting",
  "Terraform",
  "System Administration",

  /* =========================
     AI / ML / DATA SCIENCE
     ========================= */
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Natural Language Processing",
  "Computer Vision",
  "Data Analysis",
  "Data Science",
  "Statistical Analysis",
  "Predictive Modeling",
  "Model Deployment",
  "MLOps",

  /* =========================
     CYBERSECURITY
     ========================= */
  "Cybersecurity Fundamentals",
  "Network Security",
  "Ethical Hacking",
  "Penetration Testing",
  "Cryptography",
  "Risk Assessment",
  "Security Auditing",
  "Compliance & Governance",

  /* =========================
     UI / UX & DESIGN
     ========================= */
  "UI/UX Design",
  "User Research",
  "Wireframing",
  "Prototyping",
  "Figma",
  "Adobe XD",
  "Design Thinking",
  "Accessibility Design",

  /* =========================
     BUSINESS & MANAGEMENT
     ========================= */
  "Business Analysis",
  "Business Strategy",
  "Product Management",
  "Project Management",
  "Agile Methodology",
  "Scrum",
  "Stakeholder Management",
  "Operations Management",
  "Process Optimization",

  /* =========================
     COMMERCE & FINANCE
     ========================= */
  "Accounting Basics",
  "Financial Analysis",
  "Budgeting",
  "Cost Management",
  "Taxation Basics",
  "Auditing",
  "Corporate Finance",
  "Investment Analysis",
  "Risk Management",

  /* =========================
     MARKETING & SALES
     ========================= */
  "Digital Marketing",
  "SEO",
  "Content Marketing",
  "Social Media Marketing",
  "Email Marketing",
  "Brand Management",
  "Market Research",
  "Sales Strategy",
  "Customer Relationship Management",

  /* =========================
     ECONOMICS, GEOGRAPHY & POLITICS
     ========================= */
  "Economic Analysis",
  "Public Policy Analysis",
  "Geopolitical Awareness",
  "International Relations",
  "Political Analysis",
  "Geographical Information Systems (GIS)",
  "Sustainability Studies",
  "Climate Impact Analysis",
  "Urban Planning Basics",

  /* =========================
     HR & PEOPLE MANAGEMENT
     ========================= */
  "Talent Acquisition",
  "Human Resource Management",
  "Performance Management",
  "Employee Engagement",
  "Organizational Behavior",
  "Payroll Management",

  /* =========================
     PERSONAL & PROFESSIONAL SKILLS
     ========================= */
  "Communication Skills",
  "Public Speaking",
  "Presentation Skills",
  "Critical Thinking",
  "Problem Solving",
  "Decision Making",
  "Leadership",
  "Team Collaboration",
  "Time Management",
  "Adaptability",
  "Emotional Intelligence",
  "Negotiation",
  "Conflict Resolution",

  /* =========================
     GENERAL MARKET SKILLS
     ========================= */
  "Analytical Thinking",
  "Research Skills",
  "Documentation",
  "Report Writing",
  "MS Excel",
  "PowerPoint",
  "Business Writing",
  "Client Handling",
  "Entrepreneurial Mindset"
];


export default function SkillInput({ skills = [], onChange }) {
    const [skillName, setSkillName] = useState("");
    const [proficiency, setProficiency] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addSkill = () => {
        if (!skillName.trim() || !proficiency) return;

        const newSkill = {
            name: skillName.trim(),
            level: proficiency,
        };

        onChange([...skills, newSkill]);
        setSkillName("");
        setProficiency("");
        setShowSuggestions(false);
    };

    const removeSkill = (index) => {
        onChange(skills.filter((_, i) => i !== index));
    };

    const selectSuggestion = (suggestion) => {
        setSkillName(suggestion);
        setShowSuggestions(false);
    };

    const filteredSuggestions = COMMON_SKILLS.filter(
        (skill) =>
            skill.toLowerCase().includes(skillName.toLowerCase()) &&
            !skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <Label className="text-gray-300">Skills & Proficiency</Label>

            {/* Display added skills */}
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-sm"
                        >
                            {skill.name} ({skill.level})
                            <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                className="ml-2 hover:text-red-400 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Add new skill */}
            <div className="space-y-3">
                <div className="relative">
                    <Input
                        placeholder="Enter skill name (e.g., React, Python)"
                        value={skillName}
                        onChange={(e) => {
                            setSkillName(e.target.value);
                            setShowSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowSuggestions(skillName.length > 0)}
                        className="bg-gray-900 text-white border-white/10"
                    />

                    {/* Skill suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-white/10 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredSuggestions.slice(0, 5).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => selectSuggestion(suggestion)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-800 text-gray-300 text-sm transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Select value={proficiency} onValueChange={setProficiency}>
                    <SelectTrigger className="bg-gray-900 text-white border-white/10">
                        <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white">
                        {PROFICIENCY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                                {level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    type="button"
                    onClick={addSkill}
                    disabled={!skillName.trim() || !proficiency}
                    variant="outline"
                    className="w-full border-white/10 hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                </Button>
            </div>

            {skills.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                    Add at least 3 skills to get better recommendations
                </p>
            )}
        </div>
    );
}
