export const companyRequirements = {
    Google: {
        technical: {
            mustHave: ['DSA (Advanced)', 'System Design', 'OOP', 'Code Complexity'],
            goodToHave: ['Distributed Systems', 'ML Basics', 'Network Protocols'],
            depth: 'Very Deep - Expect hard-level algorithmic problem solving.'
        },
        projects: {
            minimum: 3,
            characteristics: ['Scalable', 'Open Source Contribution', 'Computational Efficiency']
        },
        interviewRounds: [
            { name: 'Phone Screen', focus: 'DSA', duration: '45min' },
            { name: 'Onsite (4-5 rounds)', focus: 'DSA + System Design', duration: '45min each' },
            { name: 'Googliness', focus: 'Behavioral & Culture', duration: '45min' }
        ],
        preparationTime: '4-6 months',
        tips: ['Solve 300+ LeetCode problems', 'Focus on time/space complexity', 'Practice whiteboarding.']
    },
    Microsoft: {
        technical: {
            mustHave: ['DSA', 'System Design', 'OS Concepts', 'Multithreading'],
            goodToHave: ['Azure', 'C#/.NET', 'Cloud Fundamentals'],
            depth: 'Deep - Strong focus on engineering fundamentals.'
        },
        projects: {
            minimum: 2,
            characteristics: ['Product-focused', 'Well-documented', 'End-to-end implementation']
        },
        interviewRounds: [
            { name: 'Initial Screen', focus: 'DSA / Fundamentals', duration: '45min' },
            { name: 'Onsite (4-5 rounds)', focus: 'Design + DSA + Principles', duration: '1 hour each' }
        ],
        preparationTime: '3-4 months',
        tips: ['Focus on clean code', 'Brush up on OS and Database internals.', 'Understand MS Design Principles.']
    },
    Amazon: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Scalability', 'Object Oriented Design'],
            goodToHave: ['AWS', 'Distributed Systems', 'Java/C++'],
            depth: 'High - Massive focus on Leadership Principles and Scalability.'
        },
        interviewRounds: [
            { name: 'Online Assessment', focus: 'DSA + LP', duration: '90min' },
            { name: 'The Loop (4-5 rounds)', focus: 'LP (50%) + Technical (50%)', duration: '1 hour each' }
        ],
        preparationTime: '3-5 months',
        tips: ['MEMORIZE the 16 Leadership Principles', 'Use the STAR method for behavioral answers.', 'Practice Low-Level Design.']
    },
    Meta: {
        technical: {
            mustHave: ['DSA (Speed focus)', 'System Design (Product focused)', 'Product Sense'],
            goodToHave: ['React', 'Mobile Development', 'GraphQL'],
            depth: 'Heavy - High speed and accuracy required in coding rounds.'
        },
        interviewRounds: [
            { name: 'Technical Screen', focus: 'DSA (2 problems)', duration: '45min' },
            { name: 'Onsite', focus: 'Coding + System Design + Behavioral', duration: '4 hours' }
        ],
        preparationTime: '3-4 months',
        tips: ['Speed matters - solve 2 mediums in 35 mins', 'Focus on Product-System Design.', 'Know your resume inside out.']
    },
    Apple: {
        technical: {
            mustHave: ['DSA', 'Low-Level Programming', 'Concurrency', 'Memory Management'],
            goodToHave: ['Swift/Objective-C', 'Embedded Systems', 'Computer Architecture'],
            depth: 'Specific - Very team-dependent technical depth.'
        },
        interviewRounds: [
            { name: 'Team Screen', focus: 'Domain Knowledge', duration: '1 hour' },
            { name: 'Onsite', focus: 'Deep Dive in Tech + Culture', duration: 'Full Day' }
        ],
        preparationTime: '4-5 months',
        tips: ['Show passion for the specific product', 'Be a specialist in your domain.', 'Focus on design elegance.']
    },
    Netflix: {
        technical: {
            mustHave: ['Advanced System Design', 'Distributed Systems', 'Performance Optimization'],
            goodToHave: ['Java', 'Cloud Architecture', 'Chaos Engineering'],
            depth: 'Elite - Expect highly experienced-level architectural discussions.'
        },
        preparationTime: '5-6 months',
        tips: ['Read the Netflix Culture Memo', 'Show high agency', 'Be ready for "The Keeper Test" discussions.']
    },
    Uber: {
        technical: {
            mustHave: ['DSA', 'Distributed Systems', 'High Availability', 'Concurrency'],
            goodToHave: ['Go/Java', 'Microservices', 'Real-time processing'],
            depth: 'High - Strong emphasis on system reliability.'
        },
        preparationTime: '3-4 months',
        tips: ['Practice Uber-specific system design (Marketplace, Routing)', 'Solidify your threading knowledge.', 'Focus on LLD.']
    },
    Aribnb: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Frontend/Fullstack Excellence', 'UX Sense'],
            goodToHave: ['React', 'Ruby on Rails', 'Culture alignment'],
            depth: 'Moderate Coding + High Architecture/Culture.'
        },
        preparationTime: '3-4 months',
        tips: ['Focus on coding style and hospitality', 'Build a beautiful portfolio.', 'Practice behavioral questions.']
    },
    Flipkart: {
        technical: {
            mustHave: ['DSA', 'Machine Coding Round', 'Low Level Design', 'System Design'],
            depth: 'Deep - Machine coding round is a major eliminator.'
        },
        preparationTime: '2-3 months',
        tips: ['Practice writing working code in 90 mins', 'Focus on LLD patterns.', 'Solve Flipkart-specific LLD problems.']
    },
    TCS: {
        technical: {
            mustHave: ['C/C++/Java basics', 'DBMS', 'SDLC', 'SQL'],
            depth: 'Foundational - Focus on clear communication and academic basics.'
        },
        preparationTime: '1 month',
        tips: ['Brush up on academic projects', 'Be confident in HR rounds.', 'Focus on Aptitude tests.']
    },
    Infosys: {
        technical: {
            mustHave: ['Core Java/Python', 'SQL', 'Data Structures basics'],
            depth: 'Foundational.'
        },
        preparationTime: '1 month',
        tips: ['Participate in HackWithInfy', 'Good command over English.', 'Prepare 1-2 coding questions.']
    },
    GoldmanSachs: {
        technical: {
            mustHave: ['Math/Probability', 'DSA', 'Java/C++', 'Design Patterns'],
            depth: 'High - Focus on algorithmic efficiency and problem solving.'
        },
        preparationTime: '3 months',
        tips: ['Practice Puzzles and Probability', 'Focus on sorting and searching.', 'Strong OOP concepts.']
    },
    Adobe: {
        technical: {
            mustHave: ['DSA', 'C++', 'System Design', 'OS'],
            depth: 'Deep - Algorithmic and CS fundamentals focus.'
        },
        preparationTime: '3 months',
        tips: ['Solve Top Adobe interview questions on GFG', 'Strong foundation in OS/DBMS.', 'Product-specific knowledge helps.']
    },
    Oracle: {
        technical: {
            mustHave: ['SQL/DBMS', 'DSA', 'Core Java', 'System Design'],
            depth: 'Deep - Strong database focus.'
        },
        preparationTime: '3 months',
        tips: ['Master SQL queries', 'Be ready for complex DSA problems.', 'Knowledge of OCI helps.']
    },
    Salesforce: {
        technical: {
            mustHave: ['Java/C#', 'Cloud Architecture', 'DSA', 'Design Patterns'],
            depth: 'High.'
        },
        preparationTime: '3 months',
        tips: ['Show interest in CRM/Cloud', 'Focus on OOPS.', 'Good behavioral prep.']
    },
    Nvidia: {
        technical: {
            mustHave: ['C/C++', 'CUDA', 'Parallel Computing', 'Computer Architecture', 'DSA'],
            depth: 'Very Deep - Low-level optimization and hardware knowledge.'
        },
        preparationTime: '4-5 months',
        tips: ['Master C++ and Pointers', 'Understand GPU internals.', 'Brush up on Linear Algebra.']
    },
    JPMorgan: {
        technical: {
            mustHave: ['Java/Spring', 'Microservices', 'DSA', 'SQL'],
            depth: 'Moderate - High focus on stability and best practices.'
        },
        preparationTime: '2 months',
        tips: ['Prepare for Code for Good hackathon', 'Be strong in Java ecosystems.', 'Communication is key.']
    },
    Zomato: {
        technical: {
            mustHave: ['Javascript/Node.js', 'Scaling', 'DSA', 'System Design'],
            depth: 'Deep.'
        },
        tips: ['Focus on Backend scaling', 'Be ready for rapid prototyping tasks.', 'Show product ownership.']
    },
    Swiggy: {
        technical: {
            mustHave: ['DSA', 'System Design', 'LLD', 'Java/Go'],
            depth: 'High - Focus on real-world engineering challenges.'
        },
        tips: ['Practice LLD for delivery systems', 'Understand Geofencing and concurrency.']
    },
    PhonePe: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Functional Programming', 'Observability'],
            depth: 'Very High - Elite engineering bar.'
        },
        tips: ['Focus on clean modular code', 'Master Distributed Tracing and Logging concepts.']
    },
    Atlassian: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Code Design/LLD', 'Value Alignment'],
            depth: 'High - Unique coding style requirements.'
        },
        tips: ['Practice "Collaboration" rounds', 'Iterative design is key.', 'Read their values.']
    },
    Spotify: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Agile Principles', 'Culture Fit'],
            depth: 'Moderate Coding + High Culture/Teamwork.'
        },
        tips: ['Show passion for music/audio', 'Understand the Spotify Squad Model.']
    },
    Airbnb: {
        technical: {
            mustHave: ['DSA', 'System Design', 'Product Sense', 'Culture Fit'],
            depth: 'Moderate Coding + High Engineering Culture.'
        },
        tips: ['Focus on communication and design.', 'Be prepared for a full-day onsite.']
    },
    Twitter: {
        technical: {
            mustHave: ['Scalability', 'DSA', 'Distributed Systems', 'ML (for Ads/Feeds)'],
            depth: 'Deep - Focus on high-throughput systems.'
        },
        tips: ['Solve Twitter-scale design problems (Real-time feeds).']
    },
    LinkedIn: {
        technical: {
            mustHave: ['DSA', 'System Design', 'JVM Internals', 'Concurrency'],
            depth: 'Deep.'
        },
        tips: ['Read LinkedIn Engineering blogs.', 'Be strong in Distributed Systems.']
    },
    Tesla: {
        technical: {
            mustHave: ['Embedded C', 'C++', 'Control Systems', 'RTOS', 'DSA'],
            depth: 'Very Deep - Hardcore engineering.'
        },
        tips: ['Focus on firmware and hardware integration.']
    },
    Stripe: {
        technical: {
            mustHave: ['Integration Design', 'API Design', 'Security', 'DSA'],
            depth: 'Practical - Interview feels like a day on the job.'
        },
        tips: ['Write code that is readable and testable.', 'Focus on API design patterns.']
    },
    Palantir: {
        technical: {
            mustHave: ['Complex DSA', 'Product Architecture', 'Decomposition'],
            depth: 'Extreme - Hardest technical bar in the industry.'
        },
        tips: ['Think from the user/agent perspective.', 'Practice solving ambiguous problems.']
    },
    ServiceNow: {
        technical: {
            mustHave: ['Java', 'Javascript', 'Cloud Architecture', 'DSA'],
            depth: 'High.'
        },
        tips: ['Focus on PaaS and ITSM concepts.']
    },
    Zoom: {
        technical: {
            mustHave: ['Video/Audio codecs', 'Latency Optimization', 'C++', 'Networking'],
            depth: 'Very Specific.'
        },
        tips: ['Understand WebRTC and VoIP.']
    },
    Slack: {
        technical: {
            mustHave: ['Real-time messaging', 'Scalability', 'API Design', 'Frontend/Backend'],
            depth: 'High.'
        },
        tips: ['Focus on concurrency and message delivery reliability.']
    },
    Pinterest: {
        technical: {
            mustHave: ['Image Processing', 'ML', 'Analytics Scaling', 'DSA'],
            depth: 'Deep.'
        },
        tips: ['Understand content discovery algorithms.']
    },
    Snapchat: {
        technical: {
            mustHave: ['Mobile Optimization', 'Graphics/Shaders', 'Latency', 'DSA'],
            depth: 'Deep.'
        },
        tips: ['Focus on mobile engineering and AR fundamentals.']
    },
    Dropbox: {
        technical: {
            mustHave: ['Sync Algorithms', 'Performance', 'Python/Rust', 'DSA'],
            depth: 'Deep.'
        },
        tips: ['Understand file synchronization and block storage.']
    },
    Square: {
        technical: {
            mustHave: ['Security/Encryption', 'Mobile Hardware', 'Java/Go', 'DSA'],
            depth: 'High.'
        },
        tips: ['Focus on payments and POS system stability.']
    },
    PayPal: {
        technical: {
            mustHave: ['Java', 'Security', 'Fintech Architecture', 'DSA'],
            depth: 'Moderate to High.'
        },
        tips: ['Focus on transaction integrity and scale.']
    },
    Coinbase: {
        technical: {
            mustHave: ['Blockchain', 'Security', 'Go', 'Scalability', 'DSA'],
            depth: 'High.'
        },
        tips: ['Understand crypto fundamentals and high-security code.']
    },
    TikTok: {
        technical: {
            mustHave: ['Recommendation Engines', 'Video Processing', 'DSA', 'System Design'],
            depth: 'Very Deep.'
        },
        tips: ['Focus on ML at scale and feed ranking.']
    },
    Intuit: {
        technical: {
            mustHave: ['Java/Spring', 'AWS', 'DSA', 'Culture Alignment'],
            depth: 'Moderate to High.'
        },
        tips: ['Focus on design patterns and testing.']
    },
    Paytm: {
        technical: {
            mustHave: ['Java', 'SpringBoot', 'Microservices', 'SQL/NoSQL'],
            depth: 'Deep.'
        },
        tips: ['Focus on high-concurrency wallet systems.']
    },
    Zomato: {
        technical: {
            mustHave: ['Node.js', 'React', 'ElasticSearch', 'Redis'],
            depth: 'High.'
        }
    },
    Ola: {
        technical: {
            mustHave: ['DSA', 'LLD', 'System Design', 'Java'],
            depth: 'Deep.'
        }
    },
    Razorpay: {
        technical: {
            mustHave: ['PHP/Go', 'Fintech Security', 'API Design', 'System Design'],
            depth: 'High.'
        },
        tips: ['Focus on reliability and low-latency API responses.']
    },
    CRED: {
        technical: {
            mustHave: ['Javascript', 'React Native', 'Node.js', 'System Design'],
            depth: 'Moderate Coding + High Product Design.'
        },
        tips: ['Show strong UI/UX sense and engineering quality.']
    },
    Cisco: {
        technical: {
            mustHave: ['Networking', 'C/C++', 'OS Internals', 'Python'],
            depth: 'Deep.'
        },
        tips: ['Brush up on TCP/IP and switching.']
    },
    Intel: {
        technical: {
            mustHave: ['VHDL/Verilog', 'Architecture', 'C/C++', 'Compilers'],
            depth: 'Very Deep.'
        }
    },
    Qualcomm: {
        technical: {
            mustHave: ['Wireless Communication', 'RTOS', 'Embedded Systems', 'C/C++'],
            depth: 'Very Deep.'
        }
    },
    AMD: {
        technical: {
            mustHave: ['GPU/CPU Design', 'Verilog', 'C++', 'Architecture'],
            depth: 'Deep.'
        }
    },
    IBM: {
        technical: {
            mustHave: ['Cloud', 'AI', 'Java', 'Legacy Systems'],
            depth: 'Moderate.'
        }
    },
    Wipro: {
        technical: {
            mustHave: ['Java/C#', 'SQL', 'Web Tech'],
            depth: 'Foundational.'
        }
    },
    HCL: {
        technical: {
            mustHave: ['Java', 'Infrastructure Support', 'SQL'],
            depth: 'Foundational.'
        }
    },
    Cognizant: {
        technical: {
            mustHave: ['Java', 'Cloud Foundations', 'SQL'],
            depth: 'Foundational to Moderate.'
        }
    },
    Accenture: {
        technical: {
            mustHave: ['Cloud', 'DevOps', 'Agile', 'Consulting'],
            depth: 'Moderate.'
        }
    },
    LTI_Mindtree: {
        technical: {
            mustHave: ['Fullstack', 'Cloud', 'SQL'],
            depth: 'Moderate.'
        }
    },
    Morgan_Stanley: {
        technical: {
            mustHave: ['Java', 'Advanced DSA', 'Math', 'Multi-threading'],
            depth: 'High.'
        }
    },
    American_Express: {
        technical: {
            mustHave: ['Java', 'React', 'Cloud', 'Data Science'],
            depth: 'Moderate.'
        }
    },
    Visa: {
        technical: {
            mustHave: ['Payments tech', 'Java', 'Security', 'System Design'],
            depth: 'High.'
        }
    },
    Mastercard: {
        technical: {
            mustHave: ['Blockchain', 'Security', 'Spring Boot', 'DSA'],
            depth: 'Moderate to High.'
        }
    },
    Twilio: {
        technical: {
            mustHave: ['API Design', 'Go/Java', 'Cloud Communications', 'DSA'],
            depth: 'High.'
        }
    },
    Snowflake: {
        technical: {
            mustHave: ['Data Warehousing', 'C++', 'Java', 'Distributed Systems'],
            depth: 'Very Deep.'
        }
    },
    Databricks: {
        technical: {
            mustHave: ['Spark/Scala', 'Python', 'MLOps', 'Distributed Systems'],
            depth: 'High.'
        }
    },
    MongoDB: {
        technical: {
            mustHave: ['C++', 'Go', 'Distributed Systems', 'Database Internals'],
            depth: 'Very Deep.'
        }
    },
    Elastic: {
        technical: {
            mustHave: ['Lucene/Search', 'Java', 'Distributed Systems'],
            depth: 'Deep.'
        }
    },
    Reddit: {
        technical: {
            mustHave: ['Go/Python', 'Scaling', 'Ads Modeling', 'Community Governance Tools'],
            depth: 'Deep.'
        }
    },
    Dropbox: {
        technical: {
            mustHave: ['Sync Algorithms', 'Rust/Python', 'Infrastructure'],
            depth: 'Deep.'
        }
    },
    Box: {
        technical: {
            mustHave: ['Enterprise Content Management', 'PaaS Architecture', 'Java'],
            depth: 'Moderate.'
        }
    },
    Docusign: {
        technical: {
            mustHave: ['Security', 'Digital Signatures', '.NET/Java', 'Scalability'],
            depth: 'Moderate to High.'
        }
    },
    Hubspot: {
        technical: {
            mustHave: ['Java', 'Frontend Frameworks', 'Culture Alignment', 'DSA'],
            depth: 'Moderate to High.'
        }
    },
    Twitch: {
        technical: {
            mustHave: ['Video Streaming', 'Real-time Chat scaling', 'Go/C++', 'DSA'],
            depth: 'Deep.'
        }
    },
    Discord: {
        technical: {
            mustHave: ['Elixir/Rust', 'Real-time comms', 'Scaling', 'DSA'],
            depth: 'Deep.'
        }
    }
};
