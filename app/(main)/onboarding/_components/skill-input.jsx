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
       SOFTWARE ENGINEERING & IT
       ========================= */
    "JavaScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "TypeScript", "R", "Kotlin", "Swift", "Ruby", "Perl", "Scala", "Dart", "Objective-C", "Assembly Language", "Bash", "PowerShell", "Lua", "MATLAB", "SQL",
    "HTML", "HTML5", "CSS", "CSS3", "Tailwind CSS", "Bootstrap", "React", "Next.js", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET", "Ruby on Rails", "Laravel", "React Native", "Flutter",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "Oracle", "Microsoft SQL Server", "SQLite", "Cassandra", "Elasticsearch", "Neo4j", "MariaDB", "Supabase", "Prisma", "Snowflake", "BigQuery",
    "Software Development", "Web Development", "Mobile Application Development", "Object-Oriented Programming (OOP)", "API Development", "Microservices", "RESTful WebServices", "GraphQL", "WebSockets", "Test-Driven Development (TDD)", "Version Control", "Git", "GitHub", "GitLab",

    /* =========================
       CLOUD, DEVOPS & INFRASTRUCTURE
       ========================= */
    "Amazon Web Services (AWS)", "Microsoft Azure", "Google Cloud Platform (GCP)", "Docker Products", "Kubernetes", "Linux", "Unix", "Ubuntu", "CentOS", "Shell Scripting", "Terraform", "Ansible", "Jenkins", "CI/CD", "Prometheus", "Grafana", "Datadog", "Nginx", "Apache", "Server Administration", "System Administration", "Network Administration", "Cisco Routers", "TCP/IP", "DNS", "Virtualization", "VMware",

    /* =========================
       DATA, AI & MACHINE LEARNING
       ========================= */
    "Data Analysis", "Data Science", "Machine Learning", "Deep Learning", "Artificial Intelligence (AI)", "Natural Language Processing (NLP)", "Computer Vision", "Statistical Modeling", "Predictive Analytics", "Data Mining", "Data Visualization", "TensorFlow", "PyTorch", "Scikit-Learn", "Keras", "Pandas", "NumPy", "Matplotlib", "Tableau", "Power BI", "Apache Spark", "Hadoop", "Data Warehousing", "ETL", "Business Intelligence (BI)", "A/B Testing",

    /* =========================
       CYBERSECURITY
       ========================= */
    "Cybersecurity", "Information Security", "Network Security", "Ethical Hacking", "Penetration Testing", "Vulnerability Assessment", "Incident Response", "Cryptography", "Identity & Access Management (IAM)", "Firewall Administration", "Malware Analysis", "Security Auditing", "Risk Management", "Compliance Management", "SIEM", "CISSP", "CompTIA Security+",

    /* =========================
       BUSINESS, STRATEGY & MANAGEMENT
       ========================= */
    "Business Analysis", "Business Strategy", "Business Development", "Strategic Planning", "Project Management", "Program Management", "Product Management", "Agile Methodologies", "Scrum", "Kanban", "Lean Six Sigma", "Stakeholder Management", "Operations Management", "Process Improvement", "Change Management", "Risk Management", "Supply Chain Management", "Logistics Management", "Vendor Management", "Contract Negotiation", "Entrepreneurship",

    /* =========================
       FINANCE & ACCOUNTING
       ========================= */
    "Accounting", "Financial Analysis", "Financial Modeling", "Corporate Finance", "Budgeting", "Forecasting", "Auditing", "Tax Preparation", "Bookkeeping", "Accounts Payable (AP)", "Accounts Receivable (AR)", "QuickBooks", "SAP ERP", "Oracle Financials", "Risk Analysis", "Wealth Management", "Investment Banking", "Mergers & Acquisitions (M&A)", "Portfolio Management", "Economics",

    /* =========================
       MARKETING, SALES & PR
       ========================= */
    "Digital Marketing", "Search Engine Optimization (SEO)", "Search Engine Marketing (SEM)", "Content Marketing", "Social Media Marketing", "Email Marketing", "Brand Management", "Market Research", "Public Relations (PR)", "Event Planning", "Advertising", "Google Ads", "Facebook Ads", "Copywriting", "Salesforce", "Customer Relationship Management (CRM)", "B2B Sales", "B2C Sales", "Lead Generation", "Cold Calling", "Account Management", "Sales Management", "E-commerce",

    /* =========================
       DESIGN, UX/UI & MEDIA
       ========================= */
    "User Experience (UX)", "User Interface Design (UI)", "Interaction Design", "Wireframing", "Prototyping", "Figma", "Adobe XD", "Sketch", "Graphic Design", "Typography", "Color Theory", "Adobe Photoshop", "Adobe Illustrator", "InDesign", "Video Editing", "Adobe Premiere Pro", "Final Cut Pro", "Animation", "Adobe After Effects", "Motion Graphics", "3D Modeling", "Blender", "Maya", "Photography", "Audio Editing",

    /* =========================
       HR, RECRUITING & PEOPLE
       ========================= */
    "Human Resources (HR)", "Talent Acquisition", "Technical Recruiting", "Sourcing", "Interviewing", "Onboarding", "Employee Engagement", "Performance Management", "Employee Relations", "Compensation & Benefits", "Diversity & Inclusion", "HR Policies", "Workday", "Applicant Tracking Systems (ATS)", "Training & Development", "Payroll Administration",

    /* =========================
       LEGAL, COMPLIANCE & GOVERNANCE
       ========================= */
    "Legal Writing", "Legal Research", "Contract Drafting", "Corporate Law", "Intellectual Property (IP)", "Litigation", "Compliance", "Regulatory Affairs", "Employment Law", "Privacy Law", "GDPR", "Mediation", "Arbitration", "Paralegal Skills",

    /* =========================
       HEALTHCARE, MEDICAL & SCIENCE
       ========================= */
    "Healthcare Management", "Patient Care", "Nursing", "Clinical Research", "Medical Terminology", "Medical Billing", "Medical Coding", "Electronic Health Records (EHR)", "Public Health", "Pharmacy Practice", "Biotechnology", "Life Sciences", "Laboratory Skills", "Data Collection", "First Aid", "CPR", "Patient Safety",

    /* =========================
       EDUCATION, TEACHING & TRAINING
       ========================= */
    "Teaching", "Curriculum Development", "Instructional Design", "Higher Education", "Special Education", "E-Learning", "Tutoring", "Educational Technology", "Classroom Management", "Adult Education", "Corporate Training", "Student Affairs",

    /* =========================
       ENGINEERING (NON-SOFTWARE) & TRADES
       ========================= */
    "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "AutoCAD", "SolidWorks", "MATLAB", "Manufacturing", "Quality Control", "Quality Assurance", "Architecture", "Construction Management", "Drafting", "Project Engineering", "Plumbing", "Electrical Wiring", "Welding", "Carpentry", "HVAC",

    /* =========================
       CUSTOMER SERVICE & ADMIN
       ========================= */
    "Customer Service", "Technical Support", "Help Desk Support", "Client Satisfaction", "Complaint Resolution", "Ticketing Systems", "Zendesk", "Call Center Operations", "Administrative Assistance", "Data Entry", "Office Administration", "Microsoft Office Suite", "Microsoft Excel", "Microsoft Word", "PowerPoint", "Google Workspace", "Schedule Management",

    /* =========================
       SOFT SKILLS & INTERPERSONAL
       ========================= */
    "Communication", "Public Speaking", "Presentation Skills", "Leadership", "Team Leadership", "Teamwork", "Collaboration", "Problem Solving", "Critical Thinking", "Analytical Skills", "Decision Making", "Time Management", "Adaptability", "Flexibility", "Emotional Intelligence (EQ)", "Negotiation", "Conflict Resolution", "Interpersonal Skills", "Networking", "Mentoring", "Creativity", "Innovation", "Work Ethic", "Multitasking"
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
