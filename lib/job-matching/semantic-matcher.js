// lib/job-matching/semantic-matcher.js

import { getRoleTaxonomy } from "./role-taxonomy";

export async function calculateSemanticSkillMatch(userRole, userSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 50;
  if (!userSkills || userSkills.length === 0) return 50; // default to neutral instead of failing match to 0
  
  const taxonomy = await getRoleTaxonomy(userRole);
  
  // Normalize arrays to lowercase string sets
  const userSkillSet = new Set(userSkills.map(s => typeof s === 'string' ? s.toLowerCase().trim() : ''));
  const jobSkillsList = jobSkills.map(s => typeof s === 'string' ? s.toLowerCase().trim() : '');

  let weightedMatch = 0;
  let totalPossibleWeight = 0;
  
  // Create quick lookup sets for taxonomy hierarchy (all lowercase for matching)
  const coreSet = new Set(taxonomy.skillHierarchy.core.map(s => s.toLowerCase()));
  const importantSet = new Set(taxonomy.skillHierarchy.important.map(s => s.toLowerCase()));
  const niceSet = new Set(taxonomy.skillHierarchy.nice.map(s => s.toLowerCase()));
  
  for (const jobSkill of jobSkillsList) {
    if (!jobSkill) continue;
    
    // Determine the dynamic weight of this skill based on the role's taxonomy
    let skillWeight = 0.3; // Default weight for unknown skills
    
    if (coreSet.has(jobSkill)) {
        skillWeight = 1.0;
    } else if (importantSet.has(jobSkill)) {
        skillWeight = 0.7;
    } else if (niceSet.has(jobSkill)) {
        skillWeight = 0.4;
    }
    
    totalPossibleWeight += skillWeight;
    
    if (userSkillSet.has(jobSkill)) {
      weightedMatch += skillWeight;
    }
  }
  
  if (totalPossibleWeight === 0) return 0;
  
  return Math.round((weightedMatch / totalPossibleWeight) * 100);
}
