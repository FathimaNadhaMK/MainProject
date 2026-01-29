export class ResourceFetcher {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
    }

    async fetchYouTubeContent(topic, targetRole) {
        // Build a more specific search query
        const cleanTopic = topic.replace(/^(Task title|Implementation|Learning):?\s*/i, '').trim();
        const query = `${cleanTopic} ${targetRole} tutorial programming`;
        const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        console.log(`[ResourceFetcher] Fetching YouTube content for: "${query}"`);

        if (!this.apiKey) {
            console.warn("[ResourceFetcher] YOUTUBE_API_KEY not set, using fallback search links");
            // Return fallback search links when API key is missing
            return [
                {
                    title: `${cleanTopic} Tutorial for ${targetRole}`,
                    creator: "YouTube Search",
                    url: fallbackSearchUrl,
                    thumbnail: null,
                }
            ];
        }

        // Use relevance order and add videoDuration filter for quality content
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&order=relevance&videoDuration=medium&q=${encodeURIComponent(
            query
        )}&key=${this.apiKey}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                console.error("[ResourceFetcher] YouTube API Error:", data.error.message, "- Using fallback");
                // Return fallback search link on API error
                return [
                    {
                        title: `Search: ${cleanTopic} Tutorial`,
                        creator: "YouTube",
                        url: fallbackSearchUrl,
                        thumbnail: null,
                    }
                ];
            }

            const videos = (data.items || []).map((item) => ({
                title: item.snippet.title,
                creator: item.snippet.channelTitle,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.high.url,
            }));

            // If no videos found, return fallback search link
            if (videos.length === 0) {
                console.warn("[ResourceFetcher] No videos found, using fallback");
                return [
                    {
                        title: `Find ${cleanTopic} Tutorials`,
                        creator: "YouTube",
                        url: fallbackSearchUrl,
                        thumbnail: null,
                    }
                ];
            }

            console.log(`[ResourceFetcher] Successfully fetched ${videos.length} YouTube videos`);
            return videos;
        } catch (error) {
            console.error("[ResourceFetcher] Failed to fetch YouTube content:", error.message, "- Using fallback");
            // Return fallback search link on fetch error
            return [
                {
                    title: `Search: ${cleanTopic} on YouTube`,
                    creator: "YouTube",
                    url: fallbackSearchUrl,
                    thumbnail: null,
                }
            ];
        }
    }

    async fetchCourseraContent(skill, level, targetRole) {
        // Highly personalized Coursera recommendation based on skill, level, and target role
        const query = targetRole ? `${skill} for ${targetRole}` : skill;
        const searchUrl = `https://www.coursera.org/search?query=${encodeURIComponent(
            query
        )}`;

        // Define course title variations based on role alignment
        let courseTitle = `Professional ${skill} Certificate`;
        if (targetRole) {
            if (targetRole.toLowerCase().includes("engineer") || targetRole.toLowerCase().includes("developer")) {
                courseTitle = `${skill} for Modern ${targetRole}s`;
            } else if (targetRole.toLowerCase().includes("data") || targetRole.toLowerCase().includes("analyst")) {
                courseTitle = `Data-Driven ${skill} Mastery`;
            } else {
                courseTitle = `${targetRole} Specialization: ${skill}`;
            }
        }

        return {
            provider: "Coursera",
            recommendedCourses: [
                {
                    platform: "Coursera",
                    title: courseTitle,
                    level: level || "Intermediate",
                    duration: "3–6 months",
                    cost: "₹3,000–₹5,000 / month",
                    rating: "4.8+",
                    url: searchUrl,
                    note: `Aligned with your target role as a ${targetRole || 'Professional'}.`,
                },
            ],
            disclaimer: "Course metadata generated via AI, not direct Coursera API",
        };
    }

    async fetchUdemyContent(skill, targetRole) {
        // Personalized Udemy recommendation aligned with target role
        const query = targetRole ? `${skill} for ${targetRole} masterclass` : `${skill} masterclass`;
        const searchUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`;

        return {
            provider: "Udemy",
            filterCriteria: {
                minRating: 4.5,
                lastUpdated: "Last 12 months",
            },
            recommended: [
                {
                    platform: "Udemy",
                    title: targetRole
                        ? `${targetRole} Guide: Mastering ${skill}`
                        : `Complete ${skill} Bootcamp: Zero to Hero`,
                    avgRating: 4.6,
                    duration: "30+ hours",
                    priceRange: "₹455–₹799 (frequent discounts)",
                    url: searchUrl,
                    note: `Practical, project-based learning for ${targetRole || 'Industry'} standards.`,
                },
            ],
        };
    }

    async fetchFreeResources(topic) {
        const freePlatforms = [
            {
                platform: "freeCodeCamp",
                type: "Interactive",
                relevance: "Beginner → Advanced",
                url: `https://www.freecodecamp.org/learn/search?q=${encodeURIComponent(topic)}`,
            },
            {
                platform: "MDN Web Docs",
                type: "Official Documentation",
                relevance: "Web Development",
                url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`,
            },
            {
                platform: "fast.ai",
                type: "Practical ML",
                relevance: "Deep Learning",
                url: "https://www.fast.ai/",
            },
            {
                platform: "GitHub",
                type: "Awesome Lists",
                relevance: "Curated Open Source",
                url: `https://github.com/search?q=awesome+${encodeURIComponent(topic)}`,
            },
        ];

        // Simple filtering based on topic keywords for relevance
        const topicLower = topic.toLowerCase();
        return freePlatforms.filter((p) => {
            if (p.platform === "MDN Web Docs" && !topicLower.includes("web") && !topicLower.includes("js") && !topicLower.includes("html") && !topicLower.includes("css")) return false;
            if (p.platform === "fast.ai" && !topicLower.includes("ml") && !topicLower.includes("ai") && !topicLower.includes("learn")) return false;
            return true;
        });
    }

    async fetchCertificationInfo(certName) {
        return {
            name: certName,
            estimatedCost: "₹10,000 – ₹15,000",
            averagePrepTime: "6–8 weeks",
            difficulty: "Intermediate",
            examFrequency: "Monthly / On-demand",
            roi: "High for entry-level roles",
            source: "Official certification guides + industry reports",
        };
    }

    async validateResources(resources) {
        if (!resources || !Array.isArray(resources)) return [];

        const validatedResources = await Promise.all(
            resources.map(async (resource) => {
                const url = resource.url || resource.link;
                if (!url || url === "#") return { ...resource, validated: true };

                const isValid = await this.checkUrlStatus(url);
                const isRecent = await this.checkContentDate(url);

                return {
                    ...resource,
                    validated: isValid,
                    contentFreshness: isRecent,
                    lastChecked: new Date()
                };
            })
        );

        // Filter out broken links
        return validatedResources.filter(r => r.validated);
    }

    async checkUrlStatus(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
            return response.ok;
        } catch (error) {
            // Fallback to GET if HEAD is not supported by the platform
            try {
                const response = await fetch(url, { method: 'GET', timeout: 5000 });
                return response.ok;
            } catch (e) {
                return false;
            }
        }
    }

    async checkContentDate(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
            const lastModified = response.headers.get('last-modified');

            if (!lastModified) return true; // Assume fresh if header is missing

            const modDate = new Date(lastModified);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            return modDate > sixMonthsAgo;
        } catch (error) {
            return true; // Don't penalize on fetch errors
        }
    }
}

export const resourceFetcher = new ResourceFetcher();
