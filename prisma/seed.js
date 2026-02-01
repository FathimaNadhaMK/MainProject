import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENT_DEFINITIONS } from "../lib/achievement-service.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ==================== CREATE TEST USER ====================
  const testUser = await prisma.user.upsert({
    where: { email: "test@guidely.com" },
    update: {},
    create: {
      clerkUserId: "seed_test_123",
      email: "test@guidely.com",
      name: "Test User",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",

      // Onboarding fields
      educationLevel: "graduate",
      background: "B.Tech in Computer Science",
      targetRole: "SDE",
      skills: [
        { skill: "JavaScript", level: "proficient" },
        { skill: "React", level: "good" },
        { skill: "Node.js", level: "medium" },
        { skill: "Python", level: "good" }
      ],

      // Preferences
      targetCompanies: ["Google", "Microsoft", "Amazon"],
      companySizePref: "Big Tech",
      locationPref: "Bangalore, India",
      internshipInterest: ["GSoC", "Company", "Outreachy"],
      certificationInterest: true
    }
  });
  console.log("✅ Created user:", testUser.email);

  // ==================== CREATE/UPDATE ROADMAP ====================
  const roadmap = await prisma.roadmap.upsert({
    where: { userId: testUser.id },
    update: {
      title: "8-Week SDE Preparation Roadmap",
      lastAIGenerated: new Date()
    },
    create: {  // Changed from "data" to "create"
      userId: testUser.id,
      title: "8-Week SDE Preparation Roadmap",

      skillGapAnalysis: {
        strengths: ["JavaScript Fundamentals", "React Basics", "Problem Solving"],
        gaps: ["System Design", "Advanced DSA", "Database Optimization"],
        priority: ["System Design", "Advanced DSA", "Behavioral Interview Prep"]
      },

      weeklyPlan: [
        {
          week: 1,
          focus: "DSA Fundamentals - Arrays & Strings",
          topics: ["Two Pointers", "Sliding Window", "Array Manipulation"],
          resources: ["LeetCode Easy", "NeetCode.io", "Abdul Bari Algorithms"],
          projects: ["Implement ArrayList", "String manipulation library"]
        },
        {
          week: 2,
          focus: "Linked Lists & Stacks",
          topics: ["Singly/Doubly Linked Lists", "Stack Operations"],
          resources: ["GeeksforGeeks", "LeetCode Medium"],
          projects: ["LRU Cache", "Expression evaluator"]
        },
        {
          week: 3,
          focus: "Trees & Recursion",
          topics: ["Binary Trees", "BST", "Tree Traversals"],
          resources: ["LeetCode Tree problems", "InterviewBit"],
          projects: ["File system tree viewer", "BST operations"]
        },
        {
          week: 4,
          focus: "Graphs & BFS/DFS",
          topics: ["Graph Representation", "BFS/DFS", "Shortest Path"],
          resources: ["William Fiset Graph Theory", "LeetCode Graphs"],
          projects: ["Social network analyzer", "Dijkstra's algorithm"]
        },
        {
          week: 5,
          focus: "Dynamic Programming",
          topics: ["Memoization", "Tabulation", "DP Patterns"],
          resources: ["Aditya Verma DP", "LeetCode DP"],
          projects: ["Solve 20 DP problems", "DP pattern cheatsheet"]
        },
        {
          week: 6,
          focus: "System Design Basics",
          topics: ["Load Balancing", "Caching", "API Design"],
          resources: ["Grokking System Design", "ByteByteGo"],
          projects: ["URL shortener", "Rate limiter"]
        },
        {
          week: 7,
          focus: "Advanced System Design",
          topics: ["Microservices", "Message Queues", "CAP Theorem"],
          resources: ["DDIA Book", "High Scalability blog"],
          projects: ["Twitter-like system", "Notification service"]
        },
        {
          week: 8,
          focus: "Mock Interviews & Behavioral Prep",
          topics: ["STAR Method", "Leadership Principles"],
          resources: ["Pramp", "Amazon LP guide"],
          projects: ["10 STAR stories", "5 mock interviews"]
        }
      ],

      companyPrep: {
        Google: {
          focus: "Data Structures & Algorithms",
          timeline: "3 months intensive prep",
          resources: ["LeetCode Google tagged", "Google Interview Guide"]
        },
        Microsoft: {
          focus: "Problem Solving & OOP",
          timeline: "2 months",
          resources: ["Microsoft Learn", "LeetCode Microsoft tagged"]
        },
        Amazon: {
          focus: "Leadership Principles + DSA",
          timeline: "2-3 months",
          resources: ["Amazon LP guide", "System Design"]
        }
      },

      certificationRecs: [
        "AWS Certified Developer - Associate",
        "Google Cloud Associate",
        "Microsoft Azure Fundamentals"
      ],

      internshipTimeline: {
        GSoC: "Applications open Feb-March",
        "TCS NQT": "Register 3 weeks before exam",
        "Company Internships": "Start applying 6 months before"
      },

      progress: 12.5,
      currentWeek: 1,
      completedWeeks: [],

      milestones: {
        completed: ["Profile setup", "First quiz attempt"],
        upcoming: ["Complete Week 1", "Upload resume"]
      },

      lastAIGenerated: new Date()
    }
  });
  console.log("✅ Created/Updated roadmap:", roadmap.title);

  // ==================== CREATE OPPORTUNITIES ====================
  const opportunities = await Promise.all([
    // GSoC Opportunity
    prisma.opportunity.create({
      data: {
        title: "Google Summer of Code 2026",
        type: "internship",
        company: "Google",
        description: "Google Summer of Code is a global program focused on bringing new contributors into open source software development.",
        isGSoC: true,
        gsocOrg: "Various Open Source Organizations",
        gsocTimeline: {
          timeline: [
            { date: "2026-02-01", event: "Organization applications open" },
            { date: "2026-03-15", event: "Student applications open" },
            { date: "2026-04-01", event: "Application deadline" },
            { date: "2026-05-01", event: "Accepted students announced" }
          ]
        },
        eligibility: ["Students 18+", "New or beginner open source contributors"],
        skillsRequired: ["Programming", "Git", "Open Source collaboration"],
        applicationOpen: new Date("2026-03-15"),
        applicationClose: new Date("2026-04-01"),
        applyLink: "https://summerofcode.withgoogle.com/",
        resources: [
          "GSoC Student Guide",
          "How to write a winning proposal",
          "Past GSoC projects"
        ]
      }
    }),

    // Regular Internship
    prisma.opportunity.create({
      data: {
        title: "Google STEP Internship 2026",
        type: "internship",
        company: "Google",
        description: "Student Training in Engineering Program - 12 week internship for first and second-year undergraduate students.",
        eligibility: [
          "First or second-year undergraduate student",
          "Pursuing Computer Science degree",
          "Strong academic record"
        ],
        skillsRequired: ["Data Structures", "Algorithms", "Python or Java"],
        applicationClose: new Date("2026-03-31"),
        applyLink: "https://careers.google.com/students/",
        resources: ["Google Interview Prep", "LeetCode"]
      }
    }),

    // Certification
    prisma.opportunity.create({
      data: {
        title: "AWS Certified Developer - Associate Exam",
        type: "certification",
        company: "Amazon Web Services",
        description: "Validate technical expertise in developing and maintaining applications on AWS.",
        isCertification: true,
        certProvider: "AWS",
        examDate: new Date("2026-06-15"),
        cost: 150.00,
        eligibility: ["Anyone interested in AWS", "1+ year AWS experience recommended"],
        skillsRequired: ["AWS Services", "CI/CD", "Security", "Monitoring"],
        applicationClose: new Date("2026-06-10"),
        applyLink: "https://aws.amazon.com/certification/",
        resources: [
          "AWS Training Portal",
          "Practice exams",
          "AWS Documentation"
        ]
      }
    }),

    // Microsoft Internship
    prisma.opportunity.create({
      data: {
        title: "Microsoft Explore Program 2026",
        type: "internship",
        company: "Microsoft",
        description: "12-week summer internship for college underclassmen (freshmen and sophomores).",
        eligibility: [
          "First or second year undergraduate",
          "Interest in technology"
        ],
        skillsRequired: ["Basic Programming", "Problem Solving"],
        applicationClose: new Date("2026-02-28"),
        applyLink: "https://careers.microsoft.com/explore",
        resources: ["Microsoft Learn", "Interview Prep Guide"]
      }
    }),

    // Job Fair
    prisma.opportunity.create({
      data: {
        title: "Tech Career Fair 2026 - Bangalore",
        type: "job_fair",
        company: "Multiple Companies",
        description: "Meet recruiters from top tech companies. On-spot interviews and networking opportunities.",
        eligibility: ["Students", "Recent graduates", "Experienced professionals"],
        skillsRequired: ["Resume ready", "Professional attire"],
        applicationOpen: new Date("2026-02-01"),
        applicationClose: new Date("2026-03-01"),
        applyLink: "https://techcareerfair.example.com",
        resources: ["How to prepare for job fairs", "Elevator pitch guide"]
      }
    })
  ]);

  console.log(`✅ Created ${opportunities.length} opportunities`);

  // ==================== CREATE SAVED OPPORTUNITIES ====================
  const savedOpp = await prisma.savedOpportunity.create({
    data: {
      userId: testUser.id,
      opportunityId: opportunities[0].id, // GSoC
      status: "interested",
      notes: "Need to prepare proposal by March"
    }
  });
  console.log("✅ Created saved opportunity");

  // ==================== CREATE ASSESSMENT ====================
  const assessment = await prisma.assessment.create({
    data: {
      userId: testUser.id,
      title: "JavaScript Fundamentals - Google Style",
      type: "coding",
      company: "Google",

      questions: [
        {
          id: 1,
          question: "What is the output of: console.log(typeof null)?",
          options: {
            a: "null",
            b: "object",
            c: "undefined",
            d: "number"
          },
          correctAnswer: "b"
        },
        {
          id: 2,
          question: "Which method adds elements to the end of an array?",
          options: {
            a: "append()",
            b: "add()",
            c: "push()",
            d: "insert()"
          },
          correctAnswer: "c"
        },
        {
          id: 3,
          question: "What does '===' check in JavaScript?",
          options: {
            a: "Value only",
            b: "Type only",
            c: "Value and type",
            d: "Reference"
          },
          correctAnswer: "c"
        }
      ],

      totalQuestions: 3,

      explanations: {
        "1": "typeof null returns 'object' due to a legacy bug in JavaScript.",
        "2": "push() adds elements to the end and returns new length.",
        "3": "=== checks both value and type (strict equality)."
      },

      weakAreas: [],
      recommendations: {
        nextQuiz: "Advanced JavaScript Concepts",
        studyTopics: ["Closures", "Promises", "Async/Await"]
      }
    }
  });
  console.log("✅ Created assessment:", assessment.title);

  // ==================== CREATE INTERVIEW PRACTICE ====================
  const interview = await prisma.interview.create({
    data: {
      userId: testUser.id,
      title: "Google Behavioral Interview Practice",
      type: "behavioral",
      company: "Google",
      role: "SDE",
      difficulty: "medium",

      questions: [
        {
          id: 1,
          question: "Tell me about a time you faced a technical challenge. How did you solve it?",
          type: "behavioral",
          starFormat: true
        },
        {
          id: 2,
          question: "Describe a situation where you had to work with a difficult team member.",
          type: "behavioral",
          starFormat: true
        },
        {
          id: 3,
          question: "Tell me about your most significant technical achievement.",
          type: "behavioral",
          starFormat: true
        }
      ],

      idealAnswers: {
        "1": {
          situation: "Clearly describe the technical problem",
          task: "What was your specific responsibility",
          action: "Steps you took to solve it",
          result: "Quantifiable outcome"
        }
      },

      areasToImprove: [],
      isCompleted: false
    }
  });
  console.log("✅ Created interview practice:", interview.title);

  // ==================== CREATE RESUME ====================
  const resume = await prisma.resume.create({
    data: {
      userId: testUser.id,
      fileName: "test_user_resume.pdf",
      fileUrl: "https://example.com/resumes/test_user_resume.pdf",
      fileSize: 245000, // 245 KB
      fileType: "pdf",

      aiScore: 78.5,
      atsScore: 82.0,

      strengths: [
        "Clear project descriptions",
        "Quantified achievements",
        "Relevant technical skills",
        "Good formatting"
      ],

      weaknesses: [
        "Missing action verbs in some bullets",
        "Could add more metrics",
        "Education section could be expanded"
      ],

      companyFeedback: {
        Google: "Add more system design projects. Highlight scalability achievements.",
        Microsoft: "Emphasize teamwork and collaboration. Add Azure experience.",
        Amazon: "Frame achievements using Leadership Principles. Add customer impact."
      },

      missingKeywords: [
        "Microservices",
        "Cloud",
        "CI/CD",
        "Agile",
        "TDD"
      ],

      optimizationSuggestions: {
        general: [
          "Add a summary section highlighting key strengths",
          "Use more action verbs: 'Architected', 'Engineered', 'Optimized'",
          "Quantify more achievements with metrics"
        ],
        technical: [
          "Add cloud platform experience",
          "Highlight system design skills",
          "Mention testing frameworks used"
        ]
      }
    }
  });
  console.log("✅ Created resume");

  // ==================== CREATE USER CERTIFICATIONS ====================
  const certifications = await Promise.all([
    prisma.userCertification.create({
      data: {
        userId: testUser.id,
        name: "AWS Certified Developer - Associate",
        provider: "AWS",
        status: "planned",
        studyMaterials: [
          "AWS Training Portal",
          "A Cloud Guru course",
          "Practice exams"
        ],
        examDate: new Date("2026-06-15"),
        cost: 150.00,
        roiAnalysis: {
          expectedSalaryIncrease: "10-15%",
          jobOpportunities: "+40%",
          skillsGained: ["AWS Services", "Cloud Architecture", "DevOps"]
        }
      }
    }),
    prisma.userCertification.create({
      data: {
        userId: testUser.id,
        name: "Google Cloud Associate",
        provider: "Google",
        status: "in_progress",
        studyMaterials: [
          "Google Cloud Training",
          "Qwiklabs",
          "Official Study Guide"
        ],
        examDate: new Date("2026-04-20"),
        cost: 125.00
      }
    })
  ]);
  console.log(`✅ Created ${certifications.length} certifications`);

  // ==================== CREATE USER SKILLS ====================
  const skills = await Promise.all([
    prisma.userSkill.create({
      data: {
        userId: testUser.id,
        skill: "JavaScript",
        level: "proficient",
        category: "technical",
        confidence: 85,
        lastPracticed: new Date(),
        resourcesUsed: ["MDN", "JavaScript.info", "LeetCode"]
      }
    }),
    prisma.userSkill.create({
      data: {
        userId: testUser.id,
        skill: "React",
        level: "good",
        category: "technical",
        confidence: 75,
        lastPracticed: new Date(),
        resourcesUsed: ["React Docs", "Scrimba", "Projects"]
      }
    }),
    prisma.userSkill.create({
      data: {
        userId: testUser.id,
        skill: "Communication",
        level: "good",
        category: "soft",
        confidence: 70,
        resourcesUsed: ["Toastmasters", "Mock interviews"]
      }
    })
  ]);
  console.log(`✅ Created ${skills.length} user skills`);

  // ==================== CREATE PROGRESS MILESTONES ====================
  const milestones = await Promise.all([
    prisma.progressMilestone.create({
      data: {
        userId: testUser.id,
        title: "Complete First Week of Roadmap",
        description: "Finish all topics and projects for Week 1",
        type: "roadmap",
        targetValue: 100,
        currentValue: 60,
        targetDate: new Date("2026-01-11"),
        badge: "Week Warrior",
        xpReward: 100
      }
    }),
    prisma.progressMilestone.create({
      data: {
        userId: testUser.id,
        title: "Score 80% on Assessment",
        description: "Achieve 80% or higher on technical assessment",
        type: "assessment",
        targetValue: 80,
        currentValue: 0,
        badge: "Assessment Ace",
        xpReward: 150
      }
    }),
    prisma.progressMilestone.create({
      data: {
        userId: testUser.id,
        title: "Optimize Resume",
        description: "Get ATS score above 85",
        type: "resume",
        targetValue: 85,
        currentValue: 82,
        badge: "Resume Master",
        xpReward: 200
      }
    })
  ]);
  console.log(`✅ Created ${milestones.length} milestones`);

  // ==================== CREATE USER ACTIVITIES ====================
  const activities = await Promise.all([
    prisma.userActivity.create({
      data: {
        userId: testUser.id,
        activityType: "roadmap_updated",
        module: "roadmap",
        details: {
          action: "AI generated personalized roadmap",
          weeksCovered: 8
        }
      }
    }),
    prisma.userActivity.create({
      data: {
        userId: testUser.id,
        activityType: "resume_uploaded",
        module: "resume",
        details: {
          fileName: "test_user_resume.pdf",
          aiScore: 78.5
        },
        score: 78.5
      }
    }),
    prisma.userActivity.create({
      data: {
        userId: testUser.id,
        activityType: "opportunity_saved",
        module: "opportunities",
        details: {
          opportunityTitle: "Google Summer of Code 2026",
          type: "GSoC"
        }
      }
    })
  ]);
  console.log(`✅ Created ${activities.length} activities`);

  // ==================== CREATE JOB ALERTS ====================
  const jobAlerts = await Promise.all([
    prisma.jobAlert.create({
      data: {
        userId: testUser.id,
        title: "SDE Intern - Google",
        company: "Google",
        matchScore: 92.5,
        description: "Software Development Engineering Intern role matching your profile.",
        source: "target_company",
        status: "new",
        applyLink: "https://careers.google.com/jobs/123",
        detailsLink: "https://careers.google.com/jobs/123"
      }
    }),
    prisma.jobAlert.create({
      data: {
        userId: testUser.id,
        title: "Full Stack Developer - Microsoft",
        company: "Microsoft",
        matchScore: 87.0,
        description: "Full stack development role with React and Azure.",
        source: "smart_matching",
        status: "new",
        applyLink: "https://careers.microsoft.com/jobs/456"
      }
    })
  ]);
  console.log(`✅ Created ${jobAlerts.length} job alerts`);

  // ==================== CREATE ACHIEVEMENTS ====================
  console.log("🏆 Seeding achievements...");
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`✅ Created/Updated ${ACHIEVEMENT_DEFINITIONS.length} achievements`);

  // ==================== CREATE WEEKLY INSIGHT ====================
  const weekStart = new Date("2026-01-01");
  const weekEnd = new Date("2026-01-07");

  const weeklyInsight = await prisma.weeklyInsight.create({
    data: {
      userId: testUser.id,
      title: "Weekly Progress Report - Week 1",
      summary: "Great start! You've completed profile setup, uploaded your resume, and started Week 1 of your roadmap. Your ATS score improved by 5 points.",

      insights: {
        activitiesCompleted: 5,
        timeSpent: "8.5 hours",
        skillsImproved: ["JavaScript", "Problem Solving"],
        assessmentsTaken: 1,
        opportunitiesSaved: 1
      },

      recommendations: [
        "Complete remaining Week 1 topics",
        "Take 2-3 practice assessments",
        "Update resume with recent projects",
        "Apply to saved GSoC opportunity"
      ],

      weekStart,
      weekEnd
    }
  });
  console.log("✅ Created weekly insight");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users: 1`);
  console.log(`  - Roadmaps: 1`);
  console.log(`  - Opportunities: ${opportunities.length}`);
  console.log(`  - Saved Opportunities: 1`);
  console.log(`  - Assessments: 1`);
  console.log(`  - Interviews: 1`);
  console.log(`  - Resumes: 1`);
  console.log(`  - Certifications: ${certifications.length}`);
  console.log(`  - Skills: ${skills.length}`);
  console.log(`  - Milestones: ${milestones.length}`);
  console.log(`  - Activities: ${activities.length}`);
  console.log(`  - Job Alerts: ${jobAlerts.length}`);
  console.log(`  - Achievements: ${ACHIEVEMENT_DEFINITIONS.length}`);
  console.log(`  - Weekly Insights: 1`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    console.error("\nFull error details:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });