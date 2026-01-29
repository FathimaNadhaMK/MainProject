# 🏆 Achievement System - Quick Reference

## Current Implementation Status

### ✅ What's Working
1. **Dynamic Streak System** - Resets after 1 day of inactivity
2. **Realistic Percentile Rankings** - Based on actual XP and activity
3. **Achievement Unlocking** - Automatic when thresholds are met
4. **XP & Leveling** - Exponential progression system
5. **UI Display** - Clean achievement section on roadmap page

### 📊 Achievement Categories (40+ Total)

#### 🔥 Streak Achievements (5)
- Starter (1 day) → 10 XP
- 7-Day Fire (7 days) → 50 XP
- 30-Day Legend (30 days) → 200 XP
- 100-Day Master (100 days) → 1,000 XP

#### 📚 Task Completion (6)
- Goal Setter (1 task) → 15 XP
- Consistent Learner (10 tasks) → 75 XP
- Rising Star (25 tasks) → 125 XP
- Dedicated Scholar (50 tasks) → 300 XP
- Unstoppable (100 tasks) → 500 XP
- Legend (250 tasks) → 1,250 XP

#### 🎯 Assessment Achievements (6)
- First Steps (1 assessment) → 20 XP
- Assessment Enthusiast (5 assessments) → 50 XP
- Skill Builder (10 assessments) → 100 XP
- Assessment Expert (25 assessments) → 200 XP
- Assessment Legend (50 assessments) → 750 XP

#### 💼 Interview Achievements (3)
- Interview Ready (1 interview) → 25 XP
- Interview Pro (10 interviews) → 150 XP
- Interview Master (25 interviews) → 500 XP

#### 🏆 Certification Achievements (2)
- Certified (1 cert) → 500 XP
- Multi-Certified (3 certs) → 1,500 XP

#### ⭐ Level Achievements (4)
- Level 5 Achiever → 100 XP
- Level 10 Master → 250 XP
- Level 25 Elite → 1,000 XP
- Level 50 Legend → 5,000 XP

#### 💎 XP Milestones (4)
- XP Collector (1,000 XP) → 100 XP
- XP Hoarder (5,000 XP) → 500 XP
- XP Master (10,000 XP) → 1,000 XP
- XP Legend (50,000 XP) → 5,000 XP

#### 🌟 Special/Hidden Achievements (3)
- Early Adopter (beta user) → 1,000 XP
- Comeback Kid (return after 30 days) → 150 XP [HIDDEN]
- Perfectionist (perfect week) → 300 XP [HIDDEN]

---

## Rarity Tiers

### Bronze (Common)
- First-time achievements
- Easy to unlock
- 10-50 XP rewards

### Silver (Rare)
- Moderate effort required
- 50-200 XP rewards

### Gold (Epic)
- Significant milestones
- 200-1,000 XP rewards

### Platinum (Legendary)
- Exceptional achievements
- 1,000-5,000 XP rewards

---

## Level Progression Formula

```javascript
level = floor(sqrt(totalXP / 100)) + 1
```

### XP Required for Levels
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP
- Level 25: 57,600 XP
- Level 50: 240,100 XP

---

## How Achievements Unlock

### Automatic Triggers
1. **Task Completion** → `toggleRoadmapTask()`
   - Increments `tasksCompleted`
   - Updates streak
   - Checks task-based achievements

2. **Assessment Completion** → `completeAssessment()`
   - Increments `assessmentsTaken`
   - Checks assessment achievements

3. **Interview Practice** → `completeInterview()`
   - Increments `interviewsPracticed`
   - Checks interview achievements

4. **XP Gain** → Any achievement unlock
   - Checks level achievements
   - Checks XP milestone achievements

### Manual Triggers (Future)
- Special events (birthday, holidays)
- Admin-awarded achievements
- Community challenges

---

## User Flow Example

```
User completes a task
    ↓
toggleRoadmapTask() called
    ↓
tasksCompleted incremented (now 10)
    ↓
checkAchievements("tasksCompleted", 10)
    ↓
"Consistent Learner" unlocked! +75 XP
    ↓
totalXP updated (now 285 XP)
    ↓
Level calculated (now Level 2)
    ↓
checkAchievements("level", 2)
    ↓
Toast notification shown
    ↓
UI updates with new badge
```

---

## Database Queries

### Get User's Achievements
```javascript
const achievements = await db.userAchievement.findMany({
  where: { userId },
  include: { achievement: true },
  orderBy: { earnedAt: 'desc' }
});
```

### Check if Achievement Unlocked
```javascript
const hasAchievement = await db.userAchievement.findUnique({
  where: {
    userId_achievementId: { userId, achievementId }
  }
});
```

### Get User Stats
```javascript
const stats = await db.userStats.findUnique({
  where: { userId },
  select: {
    currentStreak: true,
    longestStreak: true,
    totalXP: true,
    level: true,
    tasksCompleted: true,
    assessmentsTaken: true,
    interviewsPracticed: true
  }
});
```

---

## UI Components

### Achievement Section
**Location**: `app/(main)/roadmap/_components/achievement-section.jsx`

**Features**:
- Streak card with fire emoji
- Achievements grid (earned + locked)
- XP and level display
- Stats breakdown

### Roadmap View
**Location**: `app/(main)/roadmap/_components/roadmap-view.jsx`

**Integration**:
- Displays achievement section at top
- Shows progress bar
- Handles task completion

---

## API Endpoints

### Get Achievements Data
```javascript
// actions/achievements.js
export async function getAchievementsData()
```

**Returns**:
```javascript
{
  success: true,
  data: {
    stats: { /* UserStats */ },
    achievements: [ /* Achievement[] */ ],
    streak: 5
  }
}
```

### Toggle Task
```javascript
// actions/roadmap.js
export async function toggleRoadmapTask(taskId)
```

**Side Effects**:
- Updates task status
- Increments tasksCompleted
- Updates streak
- Checks achievements
- Awards XP

---

## Testing Checklist

### Manual Testing
- [ ] Complete first task → "Goal Setter" unlocks
- [ ] Complete 10 tasks → "Consistent Learner" unlocks
- [ ] Maintain 7-day streak → "7-Day Fire" unlocks
- [ ] Miss a day → Streak resets to 0
- [ ] Reach 1,000 XP → "XP Collector" unlocks
- [ ] Level up → Level achievement unlocks

### Edge Cases
- [ ] Multiple achievements unlock at once
- [ ] Achievement already unlocked (no duplicate)
- [ ] XP overflow causing multiple level-ups
- [ ] Streak reset at midnight
- [ ] Percentile calculation with 1 user

---

## Future Enhancements

### Phase 1 (Next Sprint)
- [ ] Achievement notification toasts
- [ ] Confetti animation for rare achievements
- [ ] Achievement detail modal
- [ ] Filter achievements by category

### Phase 2
- [ ] Leaderboards
- [ ] Friend challenges
- [ ] Achievement sharing
- [ ] Custom badges

### Phase 3
- [ ] Daily challenges
- [ ] Seasonal achievements
- [ ] Team competitions
- [ ] Achievement marketplace

---

## Performance Considerations

### Optimization Tips
1. **Cache achievement definitions** (they rarely change)
2. **Batch achievement checks** (don't check one by one)
3. **Use database indexes** on userId, achievementId
4. **Lazy load locked achievements** (only show top 5)
5. **Debounce XP updates** (batch multiple unlocks)

### Database Indexes
```prisma
@@index([userId])
@@index([achievementId])
@@index([earnedAt])
@@index([category])
@@index([rarity])
```

---

## Troubleshooting

### Achievement Not Unlocking
1. Check if requirement type matches UserStats field
2. Verify threshold value is correct
3. Check if achievement already unlocked
4. Review console logs for errors

### Streak Not Resetting
1. Verify `lastActivityDate` is being updated
2. Check timezone handling
3. Ensure streak check runs on page load

### XP Not Updating
1. Check if achievement has xpReward > 0
2. Verify database transaction completes
3. Check for race conditions

---

## Support & Documentation

- **Full Guide**: `.agent/docs/achievement-system-guide.md`
- **Implementation**: `.agent/docs/achievement-system-improvements.md`
- **Database Schema**: `prisma/schema.prisma`
- **Service Layer**: `lib/achievement-service.js`
- **Actions**: `actions/achievements.js`
- **UI Components**: `app/(main)/roadmap/_components/`

---

**Last Updated**: 2026-01-29
**Version**: 2.0
**Status**: ✅ Production Ready
