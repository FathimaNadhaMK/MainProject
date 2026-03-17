// Job Fetcher — pulls listings from BrightData (primary) and Adzuna (secondary)
// Normalizes results into a common JobListing shape for database storage.

import { normalizeExperienceLevel, detectExperienceLevelFromText } from "./level-mapper";

// =============================================
// BrightData API — PRIMARY SOURCE
// =============================================

async function fetchFromBrightData(query, maxResults = 20) {
    const apiKey = process.env.BRIGHTDATA_API_KEY;
    if (!apiKey) {
        console.warn("BRIGHTDATA_API_KEY not set — skipping BrightData");
        return [];
    }

    // Temporarily disabled due to API format issues
    console.warn("BrightData API temporarily disabled - needs configuration fix");
    return [];

    try {
        // Trigger the Indeed dataset scraping job
        const triggerUrl = new URL("https://api.brightdata.com/datasets/v3/trigger");
        triggerUrl.searchParams.set("dataset_id", "gd_l7q7dkf244hwjntr0"); // Indeed Jobs dataset
        triggerUrl.searchParams.set("discover_by", "keyword");
        triggerUrl.searchParams.set("keyword", query);
        triggerUrl.searchParams.set("country", "us");
        triggerUrl.searchParams.set("limit", String(maxResults));
        triggerUrl.searchParams.set("format", "json");

        console.log(`BrightData: Triggering job search for "${query}"...`);

        const triggerResponse = await fetch(triggerUrl.toString(), {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!triggerResponse.ok) {
            const errorText = await triggerResponse.text();
            console.error(`BrightData trigger error: ${triggerResponse.status} ${triggerResponse.statusText}`);
            console.error(`BrightData error details:`, errorText);
            return [];
        }

        const triggerData = await triggerResponse.json();
        console.log('BrightData trigger response:', JSON.stringify(triggerData, null, 2));
        const snapshotId = triggerData.snapshot_id;

        if (!snapshotId) {
            console.error("BrightData: No snapshot_id returned");
            console.error("Full response:", triggerData);
            return [];
        }

        // Poll for results (simplified approach - wait a bit then fetch)
        console.log(`BrightData: Job triggered, snapshot_id: ${snapshotId}, waiting for results...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        // Fetch the results
        const snapshotUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}`;
        const snapshotResponse = await fetch(snapshotUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!snapshotResponse.ok) {
            const errorText = await snapshotResponse.text();
            console.error(`BrightData snapshot error: ${snapshotResponse.status}`);
            console.error(`BrightData snapshot error details:`, errorText);
            return [];
        }

        const jobs = await snapshotResponse.json();
        console.log(`BrightData: Received ${Array.isArray(jobs) ? jobs.length : 'non-array'} jobs`);

        if (!Array.isArray(jobs)) {
            console.warn("BrightData: Results not ready yet or invalid format");
            console.warn("Response type:", typeof jobs);
            console.warn("Response:", JSON.stringify(jobs, null, 2));
            return [];
        }

        return jobs.map((job) => normalizeBrightDataJob(job));
    } catch (error) {
        console.error("BrightData fetch error:", error.message);
        return [];
    }
}

function normalizeBrightDataJob(raw) {
    const description = raw.description || raw.job_description || "";
    const skills = extractSkillsFromDescription(description);
    const title = raw.title || raw.job_title || "Untitled";

    return {
        title: title,
        company: raw.company_name || raw.company || "Unknown",
        location: raw.location || raw.job_location || "Remote",
        experienceLevel: detectExperienceLevelFromText(title, description),
        skillsRequired: skills,
        industry: detectIndustryFromJob(title, description),
        salaryRange: formatSalary(raw.salary_min, raw.salary_max, "USD"),
        description: description.substring(0, 5000),
        applicationUrl: raw.url || raw.job_url || "",
        postedDate: raw.posted_at || raw.date_posted
            ? new Date(raw.posted_at || raw.date_posted)
            : new Date(),
        externalJobId: `brightdata_${raw.id || raw.job_id || Math.random().toString(36).substr(2, 9)}`,
        source: "brightdata",
        isRemote: (title + " " + description).toLowerCase().includes("remote"),
        jobType: raw.job_type || "full-time",
    };
}

// =============================================
// Adzuna API — SECONDARY SOURCE
// =============================================

async function fetchFromAdzuna(query, location = "us", page = 1) {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.warn("Adzuna credentials not set — skipping Adzuna");
        return [];
    }

    try {
        const url = new URL(
            `https://api.adzuna.com/v1/api/jobs/${location}/search/${page}`
        );
        url.searchParams.set("app_id", appId);
        url.searchParams.set("app_key", appKey);
        url.searchParams.set("what", query);
        url.searchParams.set("results_per_page", "20");
        url.searchParams.set("max_days_old", "7");
        url.searchParams.set("content-type", "application/json");

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Adzuna API error: ${response.status}`);
            console.error(`Adzuna error details:`, errorText);
            return [];
        }

        const data = await response.json();
        const results = data.results || [];
        console.log(`Adzuna: Received ${results.length} jobs for query "${query}"`);

        return results.map((job) => normalizeAdzunaJob(job));
    } catch (error) {
        console.error("Adzuna fetch error:", error.message);
        return [];
    }
}

function normalizeAdzunaJob(raw) {
    const description = raw.description || "";
    const skills = extractSkillsFromDescription(description);

    return {
        title: raw.title || "Untitled",
        company: raw.company?.display_name || "Unknown",
        location: raw.location?.display_name || "Unknown",
        experienceLevel: detectExperienceLevelFromText(raw.title, description),
        skillsRequired: skills,
        industry: detectIndustryFromJob(raw.title, description),
        salaryRange: raw.salary_min && raw.salary_max
            ? `$${Math.round(raw.salary_min).toLocaleString()} - $${Math.round(raw.salary_max).toLocaleString()}`
            : null,
        description: description.substring(0, 5000),
        applicationUrl: raw.redirect_url || "",
        postedDate: raw.created ? new Date(raw.created) : new Date(),
        externalJobId: `adzuna_${raw.id}`,
        source: "adzuna",
        isRemote: (raw.title + " " + description).toLowerCase().includes("remote"),
        jobType: raw.contract_time === "full_time" ? "full-time" : raw.contract_time || "full-time",
    };
}

// =============================================
// Orchestrator
// =============================================

/**
 * Fetch jobs from all configured sources for the given search queries.
 * Deduplicates by externalJobId before returning.
 */
export async function fetchAllJobs(queries = []) {
    const allJobs = [];

    for (const query of queries) {
        // Fetch from both sources concurrently
        const [brightDataJobs, adzunaJobs] = await Promise.all([
            fetchFromBrightData(query),
            fetchFromAdzuna(query),
        ]);

        allJobs.push(...brightDataJobs, ...adzunaJobs);
    }

    // Deduplicate by externalJobId
    const seen = new Set();
    const unique = allJobs.filter((job) => {
        if (seen.has(job.externalJobId)) return false;
        seen.add(job.externalJobId);
        return true;
    });

    console.log(
        `[JobFetcher] Fetched ${allJobs.length} total, ${unique.length} unique jobs from ${queries.length} queries`
    );

    // If no unique jobs found from real APIs, return mock jobs as fallback
    if (unique.length === 0) {
        console.info("[JobFetcher] No jobs found from external APIs, providing mock data as fallback");
        return MOCK_JOBS;
    }

    return unique;
}

/**
 * Generate search queries based on the target roles.
 * Uses intelligent mapping and keyword extraction for better results.
 */
export function generateSearchQueries(roles) {
    // Comprehensive role mapping with multiple query variations
    const roleMap = {
        // Software Development
        "software developer": ["software developer", "software engineer", "programmer"],
        "software engineer": ["software engineer", "software developer", "backend engineer"],
        "frontend developer": ["frontend developer", "front end developer", "react developer", "vue developer"],
        "backend developer": ["backend developer", "back end developer", "api developer"],
        "full stack developer": ["full stack developer", "fullstack developer", "full stack engineer"],
        "web developer": ["web developer", "website developer", "web programmer"],

        // Data & Analytics
        "data scientist": ["data scientist", "machine learning engineer", "ml engineer"],
        "data analyst": ["data analyst", "business analyst", "analytics specialist"],
        "data engineer": ["data engineer", "big data engineer", "etl developer"],
        "business intelligence": ["business intelligence analyst", "bi analyst", "data analyst"],
        "machine learning": ["machine learning engineer", "ml engineer", "ai engineer"],

        // Security
        "cybersecurity": ["cybersecurity analyst", "security analyst", "information security"],
        "security engineer": ["security engineer", "cybersecurity engineer", "infosec engineer"],
        "penetration tester": ["penetration tester", "security tester", "ethical hacker"],

        // Cloud & DevOps
        "devops": ["devops engineer", "site reliability engineer", "sre"],
        "cloud engineer": ["cloud engineer", "aws engineer", "azure engineer"],
        "sre": ["site reliability engineer", "sre", "devops engineer"],

        // Design
        "ux designer": ["ux designer", "user experience designer", "product designer"],
        "ui designer": ["ui designer", "user interface designer", "visual designer"],
        "product designer": ["product designer", "ux designer", "ui ux designer"],

        // Mobile
        "mobile developer": ["mobile developer", "ios developer", "android developer"],
        "ios developer": ["ios developer", "swift developer", "mobile developer"],
        "android developer": ["android developer", "kotlin developer", "mobile developer"],

        // Other Tech Roles
        "qa engineer": ["qa engineer", "quality assurance", "test engineer", "sdet"],
        "product manager": ["product manager", "technical product manager", "pm"],
        "project manager": ["project manager", "technical project manager", "scrum master"],
    };

    const queries = new Set();

    for (const role of roles) {
        if (!role) continue;

        const roleLower = role.toLowerCase().trim();

        // Try exact match first
        if (roleMap[roleLower]) {
            roleMap[roleLower].forEach(q => queries.add(q));
            console.log(`Mapped role "${role}" to queries:`, roleMap[roleLower]);
            continue;
        }

        // Try partial match
        let foundMatch = false;
        for (const [key, values] of Object.entries(roleMap)) {
            if (roleLower.includes(key) || key.includes(roleLower)) {
                values.forEach(q => queries.add(q));
                console.log(`Partial match for "${role}" using "${key}":`, values);
                foundMatch = true;
                break;
            }
        }

        if (foundMatch) continue;

        // Extract meaningful keywords and create clean query
        const cleanedRole = role
            .toLowerCase()
            .replace(/[&\-_]/g, ' ')           // Replace special chars with spaces
            .replace(/\b(tech|and|or|the)\b/gi, '') // Remove filler words
            .replace(/\s+/g, ' ')              // Normalize spaces
            .trim();

        if (cleanedRole) {
            // Split into words and take the most meaningful ones
            const words = cleanedRole.split(' ').filter(w => w.length > 2);

            if (words.length > 0) {
                // Create variations
                if (words.length === 1) {
                    queries.add(words[0]);
                } else if (words.length === 2) {
                    queries.add(words.join(' '));
                } else {
                    // For longer phrases, create multiple variations
                    queries.add(words.slice(0, 2).join(' ')); // First two words
                    queries.add(words.join(' ')); // Full phrase
                }

                console.log(`Created custom queries for "${role}":`, Array.from(queries).slice(-2));
            }
        }
    }

    const queryArray = Array.from(queries);

    // Fallback if no queries generated
    if (queryArray.length === 0) {
        console.warn('No queries generated, using default "software developer"');
        queryArray.push('software developer');
    }

    console.log(`✓ Generated ${queryArray.length} search queries:`, queryArray);
    return queryArray;
}

// =============================================
// Helpers
// =============================================

const COMMON_TECH_SKILLS = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "spring",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
    "git", "rest api", "graphql", "microservices", "agile", "scrum",
    "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
    "figma", "sketch", "adobe xd", "html", "css", "tailwind",
    "linux", "networking", "security", "penetration testing", "encryption",
    "data analysis", "tableau", "power bi", "excel", "r programming",
    "ci/cd", "devops", "automation", "monitoring",
];

function extractSkillsFromDescription(description) {
    if (!description) return [];
    const lower = description.toLowerCase();

    return COMMON_TECH_SKILLS.filter((skill) => lower.includes(skill))
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1)) // Capitalize
        .slice(0, 15); // Limit to 15 skills
}

function detectIndustryFromJob(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes("machine learning") || text.includes("ai ") || text.includes("artificial intelligence"))
        return "AI / Machine Learning";
    if (text.includes("data scien") || text.includes("data analy") || text.includes("business intelligence"))
        return "Data Science";
    if (text.includes("security") || text.includes("cyber") || text.includes("penetration"))
        return "Cyber Security";
    if (text.includes("devops") || text.includes("cloud") || text.includes("sre") || text.includes("infrastructure"))
        return "Cloud / DevOps";
    if (text.includes("ux") || text.includes("ui design") || text.includes("product design"))
        return "UI/UX Design";

    return "IT / Software Developer"; // Default
}

function experienceMonthsToLevel(months) {
    if (months <= 6) return "Intern";
    if (months <= 12) return "Entry Level";
    if (months <= 36) return "Junior";
    if (months <= 72) return "Mid-Level";
    return "Senior";
}

function formatSalary(min, max, currency = "USD") {
    if (!min && !max) return null;
    const symbol = currency === "USD" ? "$" : currency;
    if (min && max) return `${symbol}${Math.round(min).toLocaleString()} - ${symbol}${Math.round(max).toLocaleString()}`;
    if (min) return `From ${symbol}${Math.round(min).toLocaleString()}`;
    return `Up to ${symbol}${Math.round(max).toLocaleString()}`;
}
