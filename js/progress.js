// ===================================
// PROGRESS TRACKING SYSTEM
// ===================================

/**
 * Initialize progress system from localStorage
 */
function initializeProgress() {
    const existingProgress = localStorage.getItem('amaliaProgress');

    if (!existingProgress) {
        const defaultProgress = {
            unit1: { completedLessons: [], stars: {}, percent: 0, totalLessons: 13 },
            unit2: { completedLessons: [], stars: {}, percent: 0, totalLessons: 2 },
            unit3: { completedLessons: [], stars: {}, percent: 0, totalLessons: 4 },
            unit4: { completedLessons: [], stars: {}, percent: 0, totalLessons: 5 },
            unit5: { completedLessons: [], stars: {}, percent: 0, totalLessons: 3 },
            unit6: { completedLessons: [], stars: {}, percent: 0, totalLessons: 3 },
            unit7: { completedLessons: [], stars: {}, percent: 0, totalLessons: 6 },
            unit8: { completedLessons: [], stars: {}, percent: 0, totalLessons: 1 },
            unit9: { completedLessons: [], stars: {}, percent: 0, totalLessons: 3 }
        };

        localStorage.setItem('amaliaProgress', JSON.stringify(defaultProgress));
        return;
    }

    // Migration: make sure existing users also use 2 lessons for Unit 2.
    try {
        const parsed = JSON.parse(existingProgress);
        if (parsed.unit2 && parsed.unit2.totalLessons !== 2) {
            parsed.unit2.totalLessons = 2;
            localStorage.setItem('amaliaProgress', JSON.stringify(parsed));
        }
    } catch (error) {
        console.log('Progress data parse error, reinitializing defaults.');
        localStorage.removeItem('amaliaProgress');
        initializeProgress();
    }
}



/**
 * Get progress for a specific unit
 * @param {string} unitId - The unit ID
 * @returns {object} Unit progress object
 */
function getUnitProgress(unitId) {
    initializeProgress();
    const progress = JSON.parse(localStorage.getItem('amaliaProgress'));
    return progress[unitId] || {};
}

/**
 * Update lesson completion
 * @param {string} unitId - The unit ID
 * @param {string} lessonId - The lesson ID
 * @param {number} stars - Stars earned (1-3)
 * @param {number} score - Score out of 100
 */
function updateLessonProgress(unitId, lessonId, stars, score) {
    initializeProgress();
    const progress = JSON.parse(localStorage.getItem('amaliaProgress'));
    
    // Mark lesson as completed
    if (!progress[unitId].completedLessons.includes(lessonId)) {
        progress[unitId].completedLessons.push(lessonId);
    }
    
    // Store stars and score
    progress[unitId].stars[lessonId] = stars;
    
    // Update unit progress percentage
    updateUnitProgress(unitId);
    
    // Save to localStorage
    localStorage.setItem('amaliaProgress', JSON.stringify(progress));
}

/**
 * Calculate and update unit progress percentage
 * @param {string} unitId - The unit ID
 */
function updateUnitProgress(unitId) {
    const progress = JSON.parse(localStorage.getItem('amaliaProgress'));
    const unit = progress[unitId];

    if (!unit) return;

    const completed = unit.completedLessons.length;
    const total = unit.totalLessons || 1;

    const percent = Math.round((completed / total) * 100);

    unit.percent = percent;

    localStorage.setItem('amaliaProgress', JSON.stringify(progress));

    console.log(`📈 Unit ${unitId} Progress = ${percent}% (${completed}/${total})`);
}




/**
 * Get lesson status (locked/unlocked/completed)
 * @param {string} unitId - The unit ID
 * @param {string} lessonId - The lesson ID
 * @returns {string} Status: 'locked', 'unlocked', or 'completed'
 */
function getLessonStatus(unitId, lessonId) {
    const progress = getUnitProgress(unitId);
    
    if (progress.completedLessons && progress.completedLessons.includes(lessonId)) {
        return 'completed';
    }
    
    // First lesson of any unit is always unlocked (u1_l1, u2_l1, ...)
    const lessonNum = parseInt(lessonId.split('_l')[1]);
    if (lessonNum === 1) {
        return 'unlocked';
    }

    // Check if previous lesson is completed (sequential unlock)
    const prevLessonId = `u${unitId.replace('unit', '')}_l${lessonNum - 1}`;
    
    if (progress.completedLessons && progress.completedLessons.includes(prevLessonId)) {
        return 'unlocked';
    }
    
    return 'locked';
}

/**
 * Get stars earned in a lesson
 * @param {string} unitId - The unit ID
 * @param {string} lessonId - The lesson ID
 * @returns {number} Stars earned (0-3)
 */
function getLessonStars(unitId, lessonId) {
    const progress = getUnitProgress(unitId);
    return progress.stars && progress.stars[lessonId] ? progress.stars[lessonId] : 0;
}

/**
 * Calculate stars based on score
 * @param {number} score - Score percentage (0-100)
 * @returns {number} Stars (1-3)
 */
function calculateStars(score) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
}

/**
 * Clear all progress (for testing)
 */
function clearAllProgress() {
    localStorage.removeItem('amaliaProgress');
    initializeProgress();
}
