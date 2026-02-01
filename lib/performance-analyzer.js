/**
 * Analyzes assessment data to identify weak areas.
 * @param {Array} assessments - List of user assessments from DB
 * @returns {Array} List of skills needing improvement
 */
export function analyzeAssessments(assessments) {
    if (!assessments || assessments.length === 0) return [];

    const skillPerformance = {};

    assessments.forEach((assessment) => {
        // Collect weak areas identified during the assessment
        if (assessment.weakAreas && Array.isArray(assessment.weakAreas)) {
            assessment.weakAreas.forEach((skill) => {
                if (!skillPerformance[skill]) skillPerformance[skill] = { count: 0, totalScore: 0 };
                skillPerformance[skill].count += 1;
                // Penalize score for being in weak areas
                skillPerformance[skill].totalScore -= 20;
            });
        }

        // Also look at overall score
        const category = assessment.title || assessment.type;
        if (!skillPerformance[category]) skillPerformance[category] = { count: 0, totalScore: 0 };
        skillPerformance[category].count += 1;
        skillPerformance[category].totalScore += assessment.score || 0;
    });

    // Identify skills with average score below 60% or multiple mentions in weak areas
    return Object.entries(skillPerformance)
        .filter(([skill, data]) => (data.totalScore / data.count) < 65)
        .map(([skill]) => skill);
}

/**
 * Analyzes time tracking to check if user is meeting intensity goals.
 * @param {Array} activities - List of user activities
 * @param {number} currentWeek - The current week index
 * @returns {Object} { timeSpent, intensityStatus }
 */
export function analyzeTimeTracking(activities, currentWeek) {
    if (!activities || activities.length === 0) return { timeSpent: 0, status: 'unknown' };

    // Calculate time spent in the current week (approximate)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentActivities = activities.filter(a => new Date(a.createdAt) > oneWeekAgo);
    const timeSpent = recentActivities.reduce((acc, curr) => acc + (curr.details?.duration || 0), 0);

    // Expected intensity approx 15-20 hours (900-1200 mins) per week for heavy phases
    let status = 'on-track';
    if (timeSpent < 300) status = 'lagging-low-intensity';
    else if (timeSpent > 2000) status = 'high-intensity';

    return { timeSpent, status };
}
