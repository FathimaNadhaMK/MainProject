// lib/ai-retry.js
// Utility for handling AI API rate limits with exponential backoff.

/**
 * Executes an AI operation with automatic retry on 429 (Rate Limit) errors.
 * @param {Function} fn - The async function to execute.
 * @param {Object} options - Retry options.
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { maxRetries = 3, initialDelay = 2000, context = "AI" } = {}) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Check for Rate Limit (429) or Quota Exceeded errors
            const isRateLimit = 
                error.status === 429 || 
                error.message?.includes("429") || 
                error.message?.includes("quota") ||
                error.message?.includes("Too Many Requests");

            if (isRateLimit) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`[${context}] Quota exceeded. Retrying in ${delay}ms (Attempt ${i + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            // If it's another type of error, don't retry unless it's a transient network issue
            if (error.message?.includes("fetch") || error.message?.includes("network")) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`[${context}] Network error. Retrying in ${delay}ms (Attempt ${i + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        }
    }
    
    console.error(`[${context}] Maximum retries reached. Last error:`, lastError.message);
    throw lastError;
}

// Simple memory cache to avoid redundant calls for identical requests
const aiCache = new Map();

/**
 * Wraps an AI call with a simple cache.
 * @param {string} key - Unique key for the request (e.g., hash of the prompt).
 * @param {Function} fn - The actual call.
 * @param {number} ttl - Time to live in milliseconds (default 30 mins).
 */
export async function withCache(key, fn, ttl = 30 * 60 * 1000) {
    const cached = aiCache.get(key);
    if (cached && (Date.now() - cached.timestamp < ttl)) {
        console.log(`[AI-Cache] Returning cached result for key: ${key.substring(0, 20)}...`);
        return cached.data;
    }
    
    const result = await fn();
    aiCache.set(key, { data: result, timestamp: Date.now() });
    
    // Simple cache cleanup: if too large, clear oldest
    if (aiCache.size > 100) {
        const oldestKey = aiCache.keys().next().value;
        aiCache.delete(oldestKey);
    }
    
    return result;
}
