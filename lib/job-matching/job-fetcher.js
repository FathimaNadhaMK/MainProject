// Job Fetcher — pulls listings from BrightData (primary) and Adzuna (secondary)
// Normalizes results into a common JobListing shape for database storage.

import { normalizeExperienceLevel, detectExperienceLevelFromText } from "./level-mapper";
import { MOCK_JOBS } from "./mock-jobs";
import { generateMockJobsWithAI } from "./dynamic-mock-jobs";
import { getRoleTaxonomy } from "./role-taxonomy";
import { applyRoleFilters } from "./post-filter";

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
// TheirStack API — ADDITIONAL SOURCE
// =============================================

async function fetchFromTheirstack(query) {
    const apiKey = process.env.THEIRSTACK_API_KEY;

    if (!apiKey) {
        console.warn("THEIRSTACK_API_KEY not set — skipping TheirStack");
        return [];
    }

    try {
        const url = "https://api.theirstack.com/v1/jobs/search";
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                posted_at_max_age_days: 14,
                job_title_or: [query], // Filtering heavily to save credits
                limit: 15
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`TheirStack API error: ${response.status}`, err);
            return [];
        }

        const data = await response.json();
        const results = data.data || (Array.isArray(data) ? data : []);
        console.log(`TheirStack: Received ${results.length} jobs for query "${query}"`);

        return results.map((job) => normalizeTheirStackJob(job));
    } catch (error) {
        console.error("TheirStack fetch error:", error.message);
        return [];
    }
}

function normalizeTheirStackJob(raw) {
    const description = raw.description || raw.text || "";
    const skills = extractSkillsFromDescription(description);

    return {
        title: raw.job_title || raw.title || "Untitled",
        company: raw.company_name || raw.company || "Unknown",
        location: raw.location || raw.city || "Remote",
        experienceLevel: detectExperienceLevelFromText(raw.job_title, description),
        skillsRequired: skills.length > 0 ? skills : (raw.technologies || []),
        industry: detectIndustryFromJob(raw.job_title, description),
        salaryRange: raw.salary_min && raw.salary_max ? `$${raw.salary_min.toLocaleString()} - $${raw.salary_max.toLocaleString()}` : null,
        description: description.substring(0, 5000),
        applicationUrl: raw.url || raw.job_url || raw.apply_url || "",
        postedDate: raw.date_posted || raw.posted_at ? new Date(raw.date_posted || raw.posted_at) : new Date(),
        externalJobId: `theirstack_${raw.id}`,
        source: "theirstack",
        isRemote: (raw.job_title + " " + description).toLowerCase().includes("remote") || raw.remote,
        jobType: raw.job_type || "full-time",
    };
}

// =============================================
// Careerjet API — ADDITIONAL SOURCE
// =============================================

async function fetchFromCareerjet(query) {
    const affid = process.env.CAREERJET_AFFID;

    if (!affid) {
        console.warn("CAREERJET_AFFID not set — skipping Careerjet");
        return [];
    }

    try {
        const url = new URL("http://public.api.careerjet.net/search");
        url.searchParams.set("locale_code", "en_US");
        url.searchParams.set("affid", affid);
        
        // Required parameters by Careerjet for tracking
        url.searchParams.set("user_ip", "100.1.2.3"); // Mock generic client IP
        url.searchParams.set("user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        url.searchParams.set("url", "http://www.geo.com");
        
        url.searchParams.set("keywords", query);
        url.searchParams.set("sort", "relevance");
        url.searchParams.set("pagesize", "20");

        const response = await fetch(url.toString(), {
            method: "GET"
        });

        if (!response.ok) {
            console.error(`Careerjet API error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results = data.jobs || [];
        console.log(`Careerjet: Received ${results.length} jobs for query "${query}"`);

        return results.map((job) => normalizeCareerjetJob(job));
    } catch (error) {
        console.error("Careerjet fetch error:", error.message);
        return [];
    }
}

function normalizeCareerjetJob(raw) {
    const description = raw.description || "";
    const skills = extractSkillsFromDescription(description);

    const titleSlug = raw.title ? raw.title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "job";
    const companySlug = raw.company ? raw.company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "unknown";

    return {
        title: raw.title || "Untitled",
        company: raw.company || "Unknown",
        location: raw.locations || "Remote",
        experienceLevel: detectExperienceLevelFromText(raw.title, description),
        skillsRequired: skills,
        industry: detectIndustryFromJob(raw.title, description),
        salaryRange: raw.salary || null,
        description: description.substring(0, 5000),
        applicationUrl: raw.url || "",
        postedDate: raw.date ? new Date(raw.date) : new Date(),
        externalJobId: `careerjet_${titleSlug}_${companySlug}`,
        source: "careerjet",
        isRemote: (raw.title + " " + description + " " + (raw.locations || "")).toLowerCase().includes("remote"),
        jobType: "full-time",
    };
}

// =============================================
// RapidAPI Indeed — ADDITIONAL SOURCE
// =============================================

async function fetchFromRapidApiIndeed(query) {
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!rapidApiKey) {
        console.warn("RAPIDAPI_KEY not set — skipping RapidAPI Indeed");
        return [];
    }

    try {
        const host = "indeed-jobs-api.p.rapidapi.com";
        const url = new URL(`https://${host}/indeed-us/`);
        url.searchParams.set("keyword", query);
        url.searchParams.set("location", "remote"); // Default to remote friendly
        url.searchParams.set("offset", "0");

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "x-rapidapi-host": host,
                "x-rapidapi-key": rapidApiKey
            }
        });

        if (!response.ok) {
            console.error(`RapidAPI Indeed error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results = data.jobs || data.results || data.data || (Array.isArray(data) ? data : []);
        console.log(`RapidAPI Indeed: Received ${results.length} jobs for query "${query}"`);

        return results.map((job) => normalizeRapidApiIndeedJob(job));
    } catch (error) {
        console.error("RapidAPI Indeed fetch error:", error.message);
        return [];
    }
}

function normalizeRapidApiIndeedJob(raw) {
    const description = raw.description || raw.snippet || raw.summary || "";
    const skills = extractSkillsFromDescription(description);

    const title = raw.title || raw.jobTitle || raw.job_title || "Untitled";
    const company = raw.company || raw.companyName || raw.company_name || "Unknown";
    
    const titleSlug = title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const companySlug = company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    return {
        title: title,
        company: company,
        location: raw.location || raw.formattedLocation || "Remote",
        experienceLevel: detectExperienceLevelFromText(title, description),
        skillsRequired: skills,
        industry: detectIndustryFromJob(title, description),
        salaryRange: raw.salary || raw.formattedSalary || null,
        description: description.substring(0, 5000),
        applicationUrl: raw.url || raw.jobUrl || raw.link || "",
        postedDate: raw.date || raw.createDate || raw.dateString ? new Date(raw.date || raw.createDate || raw.dateString) : new Date(),
        externalJobId: `indeed_${raw.id || raw.jobkey || raw.jobKey || titleSlug + "_" + companySlug}`,
        source: "indeed",
        isRemote: (title + " " + description + " " + (raw.location || "")).toLowerCase().includes("remote"),
        jobType: "full-time",
    };
}

// =============================================
// Enrich Layer API — ADDITIONAL SOURCE
// =============================================

async function fetchFromEnrichLayer(query) {
    const apiKey = process.env.ENRICHLAYER_API_KEY;

    if (!apiKey) {
        console.warn("ENRICHLAYER_API_KEY not set — skipping Enrich Layer");
        return [];
    }

    try {
        // Broad search mapping query context
        const url = new URL("https://api.enrichlayer.com/v2/company/job");
        url.searchParams.set("keyword", query);
        url.searchParams.set("flexibility", "remote");
        url.searchParams.set("when", "past-month");

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            console.error(`Enrich Layer API error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const results = data.jobs || data.data || data.results || (Array.isArray(data) ? data : []);
        console.log(`Enrich Layer: Received ${results.length} jobs for query "${query}"`);

        return results.map((job) => normalizeEnrichLayerJob(job));
    } catch (error) {
        console.error("Enrich Layer fetch error:", error.message);
        return [];
    }
}

function normalizeEnrichLayerJob(raw) {
    const description = raw.description || raw.text || raw.snippet || "";
    const skills = extractSkillsFromDescription(description);

    const title = raw.title || raw.job_title || "Untitled";
    const company = raw.company || raw.company_name || raw.brand || "Unknown";

    const titleSlug = title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const companySlug = company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    return {
        title: title,
        company: company,
        location: raw.location || raw.geo || "Remote",
        experienceLevel: detectExperienceLevelFromText(title, description),
        skillsRequired: skills.length > 0 ? skills : (raw.skills || []),
        industry: detectIndustryFromJob(title, description),
        salaryRange: raw.salary || raw.payment || null,
        description: description.substring(0, 5000),
        applicationUrl: raw.url || raw.apply_url || raw.link || "",
        postedDate: raw.posted_at || raw.date || raw.created_at ? new Date(raw.posted_at || raw.date || raw.created_at) : new Date(),
        externalJobId: `enrichlayer_${raw.id || raw.job_id || titleSlug + "_" + companySlug}`,
        source: "enrichlayer",
        isRemote: (title + " " + description + " " + (raw.location || "")).toLowerCase().includes("remote") || raw.flexibility === 'remote',
        jobType: raw.job_type || "full-time",
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
        // Fetch from all sources concurrently
        const [brightDataJobs, adzunaJobs, theirStackJobs, careerjetJobs, indeedJobs, enrichLayerJobs] = await Promise.all([
            fetchFromBrightData(query),
            fetchFromAdzuna(query),
            fetchFromTheirstack(query),
            fetchFromCareerjet(query),
            fetchFromRapidApiIndeed(query),
            fetchFromEnrichLayer(query)
        ]);

        allJobs.push(...brightDataJobs, ...adzunaJobs, ...theirStackJobs, ...careerjetJobs, ...indeedJobs, ...enrichLayerJobs);
    }

    // Deduplicate by externalJobId AND Semantic Hash (Title+Company)
    const seen = new Set();
    const seenHashes = new Set();
    const unique = allJobs.filter((job) => {
        const hash = `${job.title}_${job.company}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seen.has(job.externalJobId) || seenHashes.has(hash)) return false;
        seen.add(job.externalJobId);
        seenHashes.add(hash);
        return true;
    });

    console.log(
        `[JobFetcher] Fetched ${allJobs.length} total, ${unique.length} unique jobs from ${queries.length} queries`
    );

    // If no unique jobs found from real APIs, return mock jobs as fallback
    if (unique.length === 0) {
        console.info("[JobFetcher] No jobs found from external APIs, providing dynamic mock data as fallback");
        if (queries && queries.length > 0) {
            return await generateMockJobsWithAI(queries);
        }
        return MOCK_JOBS;
    }

    const firstRole = queries.length > 0 ? queries[0] : "software-engineer";
    const filteredJobs = await applyRoleFilters(unique, firstRole);
    
    // Fallback if strict filters block all real fetched jobs
    if (filteredJobs.length === 0 && unique.length > 0) {
       console.info("[JobFetcher] Post-Filters stripped all real jobs. Retrying with AI Data...");
       return await generateMockJobsWithAI(queries);
    }

    return filteredJobs;
}

/**
 * Generate search queries based on the target roles.
 * Uses role taxonomy for smart semantic query generation.
 */
export async function generateSearchQueries(roles) {
    if (!roles || roles.length === 0) return ['software developer'];
    
    // We only use the primary role for the main taxonomy queries
    const primaryRole = roles[0];
    const taxonomy = await getRoleTaxonomy(primaryRole);
    
    const queries = new Set();
    
    // Add title variants (Exact matches)
    taxonomy.jobTitleVariants.forEach(title => queries.add(title));
    
    // Skill-focused searches (Top 3 core skills)
    taxonomy.skillHierarchy.core.slice(0, 3).forEach(skill => {
        queries.add(`${skill} ${taxonomy.primaryKeywords[0]}`);
    });
    
    // Primary keyword fallback
    queries.add(taxonomy.primaryKeywords[0]);

    const queryArray = Array.from(queries);
    console.log(`✓ Generated ${queryArray.length} semantic search queries for ${primaryRole}:`, queryArray);
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
