// ===================================
// NAVIGATION AND ROUTING SYSTEM
// ===================================

/**
 * Navigate to home page
 */
function goHome() {
    window.location.href = 'home.html';
}

/**
 * Navigate to units page
 */
function navigateToUnits() {
    window.location.href = 'units.html';
}

/**
 * Navigate to lessons page for a specific unit
 * @param {string} unitId - The unit ID
 */
function navigateToLessons(unitId) {
    sessionStorage.setItem('currentUnit', unitId);
    window.location.href = 'lessons.html';
}

/**
 * Navigate to lessons page from home page (unit card click)
 * @param {number} unitNumber - The unit number (1-9)
 */
function navigateToUnitLessons(unitNumber) {
    const unitId = `unit${unitNumber}`;
    navigateToLessons(unitId);
}

/**
 * Navigate to quiz for a specific lesson
 * @param {string} unitId - The unit ID
 * @param {string} lessonId - The lesson ID
 */
function navigateToQuiz(unitId, lessonId) {
    sessionStorage.setItem('currentUnit', unitId);
    sessionStorage.setItem('currentLesson', lessonId);
    window.location.href = 'quiz.html';
}

/**
 * Navigate to results page
 */
function navigateToResults() {
    window.location.href = 'results.html';
}

/**
 * Go back to previous page
 */
function goBack() {
    window.history.back();
}

/**
 * Start quick lesson from home page
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
function startQuickLesson(difficulty) {
    sessionStorage.setItem('currentDifficulty', difficulty);
    sessionStorage.setItem('isQuickLesson', 'true');
    navigateToQuiz('unit1', 'u1_l1');
}

/**
 * Exit quiz and return to lessons
 */
function exitQuiz() {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
        const currentUnit = sessionStorage.getItem('currentUnit');
        navigateToLessons(currentUnit);
    }
}

/**
 * Retry lesson
 */
function retryLesson() {
    const unitId = sessionStorage.getItem('currentUnit');
    const lessonId = sessionStorage.getItem('currentLesson');
    navigateToQuiz(unitId, lessonId);
}

/**
 * Go back to lessons from results
 */
function backToLessons() {
    const unitId = sessionStorage.getItem('currentUnit');
    navigateToLessons(unitId);
}
