export function recommendCertifications(user) {
    const userSkills = user.skills?.map(s => (typeof s === 'string' ? s : s.name).toLowerCase()) || [];
    const isStudent = user.background?.toLowerCase().includes('student');

    const certDatabase = {
        'Software Engineer': [
            {
                name: 'AWS Certified Developer - Associate',
                provider: 'Amazon Web Services',
                priority: userSkills.includes('cloud') || userSkills.includes('aws') ? 1 : 2,
                cost: '$150',
                studyTime: '6-8 weeks',
                roi: 'High - Required by 40% of cloud-native roles',
                difficulty: 'Intermediate',
                prerequisites: ['Basic cloud concepts', 'One year of AWS experience recommended'],
                recommendedWeek: 8,
                studyPlan: {
                    'Weeks 1-2': 'IAM, S3, and EC2 Fundamentals',
                    'Weeks 3-4': 'Serverless (Lambda, API Gateway, DynamoDB)',
                    'Weeks 5-6': 'CI/CD (CodeCommit, CodeBuild, CodePipeline)',
                    'Weeks 7-8': 'Monitoring (CloudWatch, X-Ray) and Security'
                },
                freeResources: [
                    'AWS Cloud Practitioner Essentials (Free)',
                    'freeCodeCamp AWS Developer Associate Full Course',
                    'Exam Readiness: AWS Certified Developer (AWS Portal)'
                ],
                examTips: [
                    'Master Lambda integration with other services',
                    'Understand DynamoDB scaling and indexing',
                    'Practice scenario-based permission (IAM) questions'
                ]
            },
            {
                name: 'Oracle Certified Professional: Java SE Developer',
                provider: 'Oracle',
                priority: userSkills.includes('java') ? 1 : 4,
                cost: '$245',
                studyTime: '10-12 weeks',
                roi: 'High for Enterprise backend roles',
                difficulty: 'Hard',
                prerequisites: ['Advanced Java knowledge'],
                recommendedWeek: 12
            },
            {
                name: 'Meta Front-End Developer Professional Certificate',
                provider: 'Meta / Coursera',
                priority: userSkills.includes('react') ? 1 : 3,
                cost: 'Coursera Subscription (~$49/mo)',
                studyTime: '4-6 months',
                roi: 'Excellent for entry-level React roles',
                difficulty: 'Beginner',
                recommendedWeek: 6
            }
        ],
        'Frontend Developer': [
            {
                name: 'Meta Front-End Developer Professional Certificate',
                provider: 'Meta / Coursera',
                priority: 1,
                cost: 'Coursera Subscription (~$49/mo)',
                studyTime: '4-6 months',
                roi: 'Very High - Direct path to Meta interview eligibility',
                difficulty: 'Beginner',
                recommendedWeek: 6,
                studyPlan: {
                    'Month 1': 'HTML & CSS Foundations',
                    'Month 2': 'JavaScript Mastery',
                    'Month 3': 'React Fundamentals',
                    'Month 4': 'Advanced React & UX Design'
                }
            },
            {
                name: 'Google UX Design Professional Certificate',
                provider: 'Google',
                priority: 2,
                cost: 'Coursera Subscription (~$49/mo)',
                studyTime: '3-6 months',
                difficulty: 'Beginner',
                recommendedWeek: 8
            }
        ],
        'Backend Developer': [
            {
                name: 'AWS Certified Solutions Architect - Associate',
                provider: 'AWS',
                priority: 1,
                cost: '$150',
                studyTime: '8-10 weeks',
                roi: 'Elite - Top 5 highest paying certifications',
                difficulty: 'Intermediate',
                recommendedWeek: 10
            },
            {
                name: 'MongoDB Certified Developer Associate',
                provider: 'MongoDB',
                priority: userSkills.includes('mongodb') || userSkills.includes('nosql') ? 1 : 3,
                cost: '$150',
                studyTime: '4-5 weeks',
                difficulty: 'Intermediate',
                recommendedWeek: 7
            }
        ],
        'Full Stack Developer': [
            {
                name: 'Full Stack Web Development with React',
                provider: 'Coursera (HKUST)',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '4 months',
                roi: 'High - Strong portfolio projects',
                difficulty: 'Intermediate',
                recommendedWeek: 9
            },
            {
                name: 'PostgreSQL Associate Certification',
                provider: 'EDB',
                priority: 2,
                cost: '$120',
                studyTime: '3-4 weeks',
                difficulty: 'Intermediate',
                recommendedWeek: 5
            }
        ],
        'Data Analyst': [
            {
                name: 'Google Data Analytics Professional Certificate',
                provider: 'Google',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '6 months',
                roi: 'Excellent for career switchers',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'Microsoft Power BI Data Analyst (PL-300)',
                provider: 'Microsoft',
                priority: 1,
                cost: '$165',
                studyTime: '4-6 weeks',
                difficulty: 'Beginner'
            },
            {
                name: 'Tableau Desktop Specialist',
                provider: 'Tableau',
                priority: 2,
                cost: '$100',
                studyTime: '2-3 weeks',
                difficulty: 'Beginner'
            }
        ],
        'Data Scientist': [
            {
                name: 'Professional Data Scientist',
                provider: 'DataCamp',
                priority: 1,
                cost: 'Subscription',
                studyTime: '6-12 months',
                roi: 'High - Industry recognized certification',
                difficulty: 'Intermediate'
            },
            {
                name: 'IBM Data Science Professional Certificate',
                provider: 'IBM',
                priority: 2,
                cost: 'Coursera Subscription',
                studyTime: '10-12 months',
                difficulty: 'Intermediate',
                recommendedWeek: 12
            }
        ],
        'DevOps Engineer': [
            {
                name: 'CKAD: Certified Kubernetes Application Developer',
                provider: 'CNCF',
                priority: 1,
                cost: '$395',
                studyTime: '8-12 weeks',
                roi: 'Elite - Industry standard for Cloud Native',
                difficulty: 'Hard',
                recommendedWeek: 10
            },
            {
                name: 'HashiCorp Certified: Terraform Associate',
                provider: 'HashiCorp',
                priority: 2,
                cost: '$70',
                studyTime: '3-4 weeks',
                roi: 'High - Essential for IaC roles',
                difficulty: 'Intermediate',
                recommendedWeek: 6
            }
        ],
        'Career Switcher - IT': [
            {
                name: 'Google IT Support Professional Certificate',
                provider: 'Google',
                priority: 1,
                cost: 'Coursera Subscription (~$49/mo)',
                studyTime: '3-6 months',
                roi: 'Excellent - Entry point into IT',
                difficulty: 'Beginner',
                prerequisites: ['None - Complete beginner friendly']
            },
            {
                name: 'CompTIA A+',
                provider: 'CompTIA',
                priority: 1,
                cost: '$246 (2 exams)',
                studyTime: '3-4 months',
                roi: 'High - Foundational IT certification',
                difficulty: 'Beginner'
            }
        ],
        'Cloud Engineer': [
            {
                name: 'AWS Certified Cloud Practitioner',
                provider: 'AWS',
                priority: 1,
                cost: '$100',
                studyTime: '2-4 weeks',
                roi: 'High - Entry to cloud careers',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'Microsoft Azure Fundamentals (AZ-900)',
                provider: 'Microsoft',
                priority: 1,
                cost: '$99',
                studyTime: '2-3 weeks',
                difficulty: 'Beginner'
            },
            {
                name: 'Google Cloud Associate Cloud Engineer',
                provider: 'Google Cloud',
                priority: 2,
                cost: '$125',
                studyTime: '6-8 weeks',
                difficulty: 'Intermediate'
            }
        ],
        'Cybersecurity Analyst': [
            {
                name: 'CompTIA Security+',
                provider: 'CompTIA',
                priority: 1,
                cost: '$392',
                studyTime: '6-8 weeks',
                roi: 'Elite - Required by US DoD for security roles',
                difficulty: 'Intermediate',
                prerequisites: ['Network+ or equivalent knowledge']
            },
            {
                name: 'Google Cybersecurity Professional Certificate',
                provider: 'Google',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '6 months',
                roi: 'Very High for entry-level',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'Certified Ethical Hacker (CEH)',
                provider: 'EC-Council',
                priority: 2,
                cost: '$1,199',
                studyTime: '3-4 months',
                difficulty: 'Advanced'
            }
        ],
        'IT Project Manager': [
            {
                name: 'Google Project Management Professional Certificate',
                provider: 'Google',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '6 months',
                roi: 'High - Prepares for CAPM/PMP',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'Certified Associate in Project Management (CAPM)',
                provider: 'PMI',
                priority: 2,
                cost: '$225 (PMI member) / $300 (non-member)',
                studyTime: '2-3 months',
                difficulty: 'Intermediate'
            }
        ],
        'QA Engineer': [
            {
                name: 'ISTQB Certified Tester Foundation Level',
                provider: 'ISTQB',
                priority: 1,
                cost: '$200-250',
                studyTime: '4-6 weeks',
                roi: 'High - Global standard for QA',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'Selenium WebDriver with Java Certification',
                provider: 'Udemy/Coursera',
                priority: 2,
                cost: '$50-100',
                studyTime: '6-8 weeks',
                difficulty: 'Intermediate'
            }
        ],
        'AI/ML Engineer': [
            {
                name: 'Google AI Essentials',
                provider: 'Google',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '10 hours',
                roi: 'Good - AI literacy for all roles',
                difficulty: 'Beginner',
                prerequisites: ['None']
            },
            {
                name: 'AWS Certified Machine Learning - Specialty',
                provider: 'AWS',
                priority: 2,
                cost: '$300',
                studyTime: '3-4 months',
                difficulty: 'Advanced'
            }
        ],
        'Product Manager - Technical': [
            {
                name: 'Meta Product Manager Professional Certificate',
                provider: 'Meta',
                priority: 1,
                cost: 'Coursera Subscription',
                studyTime: '5-6 months',
                difficulty: 'Beginner'
            }
        ],
        'Business Analyst': [
            {
                name: 'ECBA (Entry Certificate in Business Analysis)',
                provider: 'IIBA',
                priority: 1,
                cost: '$125 (member) / $250 (non-member)',
                studyTime: '2-3 months',
                difficulty: 'Beginner'
            }
        ]
    };

    const roleCerts = certDatabase[user.targetRole] || certDatabase['Software Engineer'];
    const hasNonITBackground = user.background?.toLowerCase().includes('non-it') ||
        user.background?.toLowerCase().includes('career switcher') ||
        user.background?.toLowerCase().includes('career change');

    return roleCerts
        .map(cert => {
            // Adjustment logic
            let score = cert.priority;

            // Prioritize beginner-friendly certs for career switchers
            if (hasNonITBackground) {
                if (cert.difficulty === 'Beginner' && (cert.prerequisites?.includes('None') || !cert.prerequisites)) {
                    score -= 2; // Boost priority
                }
            }

            // If student, slightly deprioritize high-cost certs without financial aid noted
            const costValue = parseInt(cert.cost.replace(/\D/g, '')) || 0;
            const isActuallyExpensive = cert.cost.includes('$') && costValue > 150;
            const isBudgetFriendly = cert.cost.includes('Coursera') || (cert.cost.includes('$') && costValue < 150);

            if (isStudent) {
                if (isActuallyExpensive) score += 2;
                if (isBudgetFriendly) score -= 1;
            }

            return { ...cert, finalScore: score };
        })
        .sort((a, b) => a.finalScore - b.finalScore)
        .slice(0, 5);
}
