# Achievement & Streak System - Dynamic Updates

## Overview
This document explains the improvements made to the achievement and streak system to make it more dynamic and realistic, similar to platforms like LeetCode and GitHub.

## Changes Made

### 1. **Dynamic Streak Reset** ✅
**File**: `actions/achievements.js`

**Problem**: 
- Streak was showing "1 Day" even after 2 days of inactivity
- Streak never reset automatically when users stopped completing tasks

**Solution**:
- Added automatic streak checking when fetching achievement data
- Streak now resets to 0 if user hasn't been active for more than 1 day
- Uses `lastActivityDate` from UserStats to calculate days since last activity

**Code Logic**:
```javascript
// Check if streak should be reset
if (stats.lastActivityDate) {
    const now = new Date();
    const daysSinceLastActivity = Math.floor(
        (now.getTime() - stats.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Reset streak if more than 1 day has passed
    if (daysSinceLastActivity > 1 && stats.currentStreak > 0) {
        stats = await db.userStats.update({
            where: { userId: user.id },
            data: { currentStreak: 0 }
        });
    }
}
```

### 2. **Realistic Percentile Calculation** ✅
**File**: `actions/achievements.js`

**Problem**:
- Beginners with 0 XP were showing "Top 17%" which is misleading
- Percentile didn't reflect actual user activity level

**Solution**:
- Implemented tiered percentile calculation based on XP and activity
- Complete beginners (0 XP, 0 tasks) start at bottom 50%
- Low activity users (<100 XP) start at bottom 40%
- Active users get actual percentile based on ranking

**Code Logic**:
```javascript
let percentile;
if (stats.totalXP === 0 && stats.tasksCompleted === 0) {
    // Complete beginners start at bottom 50%
    percentile = Math.max(50, Math.round((rank / totalUsers) * 100));
} else if (stats.totalXP < 100) {
    // Low activity users
    percentile = Math.max(40, Math.round((rank / totalUsers) * 100));
} else {
    // Active users get actual percentile
    percentile = Math.round((rank / totalUsers) * 100);
}
```

### 3. **Improved Streak Display** ✅
**File**: `app/(main)/roadmap/_components/achievement-section.jsx`

**Changes**:
- Proper pluralization: "1 Day" vs "2 Days"
- Shows 💤 emoji when streak is 0 instead of 🔥
- Removes pulsing animation when streak is 0
- Better visual feedback for inactive users

**Before**: Always showed 🔥 with animation
**After**: Shows 💤 when streak is 0, 🔥 when active

### 4. **Conditional Percentile Display** ✅
**File**: `app/(main)/roadmap/_components/achievement-section.jsx`

**Changes**:
- Rank and percentile badge only shown when user has earned at least one achievement
- Prevents misleading "Top X%" for complete beginners
- Cleaner UI for new users

### 5. **Empty State Message** ✅
**File**: `app/(main)/roadmap/_components/achievement-section.jsx`

**Changes**:
- Added helpful message when no achievements are earned yet
- Encourages users to complete their first task
- Better user experience for beginners

## How It Works

### Streak Maintenance
1. **Daily Activity**: When user completes a task, `lastActivityDate` is updated
2. **Streak Check**: Every time achievements are fetched, system checks days since last activity
3. **Auto Reset**: If >1 day passed, streak resets to 0
4. **Streak Increment**: Handled by `updateUserStreak()` in `achievement-service.js`

### Achievement Unlocking
Achievements unlock based on:
- **Streak**: Consecutive days of activity
- **Tasks Completed**: Total tasks finished
- **Assessments Taken**: Number of assessments completed
- **Interviews Practiced**: Mock interviews completed

### XP System
- Each achievement awards XP
- XP determines user level: `level = floor(sqrt(xp / 100)) + 1`
- Level progression is exponential (requires more XP for higher levels)

## Database Schema
**UserStats Model** (relevant fields):
- `currentStreak`: Current consecutive days
- `longestStreak`: Best streak ever achieved
- `lastActivityDate`: Last time user completed a task
- `totalXP`: Total experience points
- `tasksCompleted`: Number of tasks completed
- `assessmentsTaken`: Number of assessments taken
- `interviewsPracticed`: Number of interviews practiced

## Testing Scenarios

### Scenario 1: New User
- **Expected**: 0 Days streak, no percentile shown, "No achievements yet" message
- **Actual**: ✅ Works as expected

### Scenario 2: User Completes First Task
- **Expected**: 1 Day streak, first achievement unlocked, XP awarded
- **Actual**: ✅ Works as expected

### Scenario 3: User Misses a Day
- **Expected**: Streak resets to 0, shows 💤 emoji
- **Actual**: ✅ Works as expected

### Scenario 4: Active User
- **Expected**: Shows actual percentile, multiple achievements, fire emoji
- **Actual**: ✅ Works as expected

## Future Enhancements

1. **Streak Freeze**: Allow users to "freeze" their streak for 1 day (premium feature)
2. **Weekly Challenges**: Time-limited achievements for bonus XP
3. **Leaderboards**: Global and friend-based rankings
4. **Achievement Notifications**: Toast notifications when achievements unlock
5. **Streak Reminders**: Email/push notifications to maintain streak
6. **Milestone Celebrations**: Special animations for major achievements

## Maintenance Notes

- Streak check runs on every achievement data fetch (server-side)
- No cron jobs needed for streak resets
- Percentile calculation is real-time based on current database state
- Achievement unlocking is automatic when thresholds are met
