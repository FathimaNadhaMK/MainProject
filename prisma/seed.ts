import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@guidely.com' },
    update: {},
    create: {
      clerkUserId: 'test_user_123',
      email: 'test@guidely.com',
      name: 'Test User',
      educationLevel: 'Graduate',
      background: 'B.Tech',
      targetRole: 'SDE',
      skills: [  // This should be an array, not JSON string
        { skill: 'JavaScript', level: 'good' },
        { skill: 'React', level: 'medium' }
      ],
      targetCompanies: ['Google', 'Microsoft'],
      companySizePref: 'FAANG/Big Tech',
      locationPref: 'Bangalore'
    }
  });
  
  console.log('✅ Created test user:', testUser.email);
  
  // Create a test roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: testUser.id,
      title: 'SDE Preparation Roadmap',
      // Pass objects/arrays directly, NOT JSON strings
      skillGapAnalysis: {
        strengths: ['JavaScript', 'HTML/CSS'],
        gaps: ['System Design', 'DSA Advanced'],
        timeline: '3 months'
      },
      weeklyPlan: [
        { 
          week: 1, 
          focus: 'DSA Basics', 
          resources: ['LeetCode Easy'],
          projects: ['Implement basic data structures'],
          duration: '1 week'
        },
        { 
          week: 2, 
          focus: 'System Design', 
          resources: ['Grokking System Design'],
          projects: ['Design a URL shortener'],
          duration: '1 week'
        }
      ],
      progress: 10.5,
      companyPrep: {
        Google: { 
          focus: 'DSA & System Design', 
          timeline: '3 months',
          specificTips: ['Practice LeetCode medium/hard', 'Study Google tech stack']
        },
        Microsoft: { 
          focus: 'C# & Azure', 
          timeline: '2 months',
          specificTips: ['Learn .NET Core', 'Study Azure services']
        }
      },
      certificationRecs: ['AWS Developer Associate'],
      currentWeek: 1
    }
  });
  
  console.log('✅ Created roadmap for user');
  
  // Create test opportunities
  const opportunities = await Promise.all([
    prisma.opportunity.create({
      data: {
        title: 'Google STEP Internship 2025',
        type: 'internship',
        company: 'Google',
        description: 'Student Training in Engineering Program',
        isGSoC: false,
        eligibility: ['Students', 'Graduates'],
        skillsRequired: ['Python', 'Java', 'DSA'],
        applicationOpen: new Date('2025-01-01'),
        applicationClose: new Date('2025-02-28'),
        applyLink: 'https://careers.google.com/step/'
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'AWS Certified Developer Associate',
        type: 'certification',
        company: 'Amazon',
        description: 'AWS Cloud Certification',
        isCertification: true,
        certProvider: 'AWS',
        examDate: new Date('2025-06-30'),
        cost: 150,
        applyLink: 'https://aws.amazon.com/certification/'
      }
    })
  ]);
  
  console.log(`✅ Created ${opportunities.length} opportunities`);
  
  // Create test assessment
  const assessment = await prisma.assessment.create({
    data: {
      userId: testUser.id,
      title: 'Google DSA Mock Test',
      type: 'coding',
      company: 'Google',
      totalQuestions: 10,
      score: 85.5,
      questions: [
        { 
          question: 'What is time complexity of binary search?',
          options: {
            a: 'O(1)',
            b: 'O(log n)',
            c: 'O(n)',
            d: 'O(n²)'
          },
          correctAnswer: 'b',
          difficulty: 'easy'
        },
        {
          question: 'Which data structure uses LIFO?',
          options: {
            a: 'Queue',
            b: 'Stack',
            c: 'Linked List',
            d: 'Tree'
          },
          correctAnswer: 'b',
          difficulty: 'easy'
        }
      ]
    }
  });
  
  console.log('✅ Created test assessment');
  
  // Create a test resume
  const resume = await prisma.resume.create({
    data: {
      userId: testUser.id,
      fileName: 'test_resume.pdf',
      fileUrl: '/resumes/test.pdf',
      fileSize: 1024,
      fileType: 'pdf',
      aiScore: 78.5,
      atsScore: 82.0,
      strengths: ['Strong in JavaScript', 'Good project structure'],
      weaknesses: ['Need more quantifiable achievements', 'Add more keywords'],
      missingKeywords: ['Docker', 'Kubernetes', 'CI/CD']
    }
  });
  
  console.log('✅ Created test resume');
  
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });