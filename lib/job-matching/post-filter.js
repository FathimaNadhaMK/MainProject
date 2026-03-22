// lib/job-matching/post-filter.js

import { getRoleTaxonomy } from "./role-taxonomy";

export async function applyRoleFilters(jobs, userRole) {
  if (!jobs || jobs.length === 0) return [];
  
  const taxonomy = await getRoleTaxonomy(userRole);
  
  return jobs.filter(job => {
    if (!job.title || !job.description) return false;
    
    // Hard exclude based on title
    const hasExcludedTitle = taxonomy.excludeTitles.some(excluded =>
      job.title.toLowerCase().includes(excluded.toLowerCase())
    );
    
    if (hasExcludedTitle) return false;
    
    // Check description for role-specific keywords
    const description = job.description.toLowerCase();
    const hasRoleKeywords = taxonomy.primaryKeywords.some(keyword =>
      description.includes(keyword.toLowerCase()) || 
      job.title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Require at least 2 core skills OR role-keyword match
    // Soften required skill logic slightly for scraped postings which might list skills sparsely
    const coreSkillCount = taxonomy.skillHierarchy.core.filter(skill =>
      job.skillsRequired && job.skillsRequired.some(js => js.toLowerCase() === skill.toLowerCase())
    ).length;
    
    // Valid if it matches the role's core keywords OR contains at least 1 core skill
    return hasRoleKeywords || coreSkillCount >= 1;
  });
}
