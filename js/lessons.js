// ===================================
// LESSONS PAGE FUNCTIONALITY
// ===================================

let currentUnit = '';
let currentUnitData = {};
let allLessons = [];
let lessonQuestionsCount = {};

/**
 * Initialize lessons page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    currentUnit = sessionStorage.getItem('currentUnit') || 'unit1';
    loadLessons();
});

/**
 * Refresh lesson display when page becomes visible
 */
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Lessons page is now visible, refreshing...');
        loadLessons();
    }
});

/**
 * Also refresh on page show (for back button)
 */
window.addEventListener('pageshow', function(event) {
    console.log('Lessons page shown, refreshing...');
    loadLessons();
});

/**
 * Load lessons for current unit
 */
async function loadLessons() {
    try {
        // Extract unit number from unit ID (e.g., 'unit1' -> '1')
        const unitNumber = currentUnit.replace('unit', '');
        
        // Load unit structure for this specific unit
        const response = await fetch(`./Jsons/UnitsStructure/units${unitNumber}.json`);
        const data = await response.json();
        
        currentUnitData = data;
        allLessons = data.lessons || [];
        
        // Update header
        document.getElementById('unitTitle').textContent = data.title;
        
        // Load question counts for all lessons
        await loadAllLessonQuestionCounts();
        
        // Display lessons
        displayLessons();
        
        // Update progress bar
        updateProgressDisplay();
    } catch (error) {
        console.error('Error loading lessons:', error);
        // Fallback to unit1 if file doesn't exist
        try {
            const response = await fetch(`./Jsons/UnitsStructure/units1.json`);
            const data = await response.json();
            currentUnitData = data;
            allLessons = data.lessons || [];
            document.getElementById('unitTitle').textContent = data.title;
            await loadAllLessonQuestionCounts();
            displayLessons();
            updateProgressDisplay();
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
        }
    }
}

/**
 * Load question counts for all lessons
 */
async function loadAllLessonQuestionCounts() {
    const unitNumber = currentUnit.replace('unit', '');
    
    for (const lesson of allLessons) {
        try {
            // Extract lesson number from lesson id (e.g., 'u1_l1' -> '1')
            const lessonMatch = lesson.id.match(/l(\d+)/);
            const lessonNum = lessonMatch ? lessonMatch[1] : '1';
            
            // Load question file for this lesson
            const filePath = `./Jsons/Units_Questions/Unit${unitNumber}/unit_${unitNumber}_Lesson${lessonNum}.json`;
            let lessonData = null;
            const candidatePaths = [
                filePath,
                `./Jsons/Units_Questions/unit${unitNumber}/unit_${unitNumber}_Lesson${lessonNum}.json`
            ];

            for (const candidate of candidatePaths) {
                try {
                    const response = await fetch(candidate);
                    if (!response.ok) continue;
                    lessonData = await response.json();
                    break;
                } catch (error) {
                    // Try next candidate
                }
            }

            if (!lessonData) {
                throw new Error(`Question file not found for ${lesson.id}`);
            }
            const questions = Array.isArray(lessonData)
                ? lessonData
                : (Array.isArray(lessonData.questions) ? lessonData.questions : []);
            
            // Count total questions
            let totalQuestions = 0;
            questions.forEach(q => {
                if (q.data && q.data.questions) {
                    totalQuestions += q.data.questions.length;
                }
            });
            
            lessonQuestionsCount[lesson.id] = totalQuestions || questions.length;
        } catch (error) {
            console.log(`Could not load questions for lesson ${lesson.id}`);
            lessonQuestionsCount[lesson.id] = 0;
        }
    }
}

/**
 * Display lessons in grid
 */
function displayLessons() {
    const lessonsGrid = document.getElementById('lessonsGrid');
    lessonsGrid.innerHTML = '';
    
    allLessons.forEach((lesson, index) => {
        const status = getLessonStatus(currentUnit, lesson.id);
        const stars = getLessonStars(currentUnit, lesson.id);
        const questionCount = lessonQuestionsCount[lesson.id] || 0;
        
        const card = createLessonCard(lesson, status, stars, index, questionCount);
        lessonsGrid.appendChild(card);
    });
}

/**
 * Create a lesson card element
 * @param {object} lesson - Lesson data
 * @param {string} status - Lesson status (locked/unlocked/completed)
 * @param {number} stars - Stars earned
 * @param {number} index - Lesson index
 * @param {number} questionCount - Number of questions in this lesson
 * @returns {HTMLElement} Lesson card element
 */
function createLessonCard(lesson, status, stars, index, questionCount) {
    const card = document.createElement('div');
    card.className = `lesson-card ${status}`;
    
    const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const statusIcon = status === 'locked' ? '🔒' : status === 'completed' ? '✅' : '▶️';
    const isCompleted = status === 'completed';
    const isLocked = status === 'locked';
    
    card.innerHTML = `
        <div class="lesson-card-header">
            <div class="lesson-number-badge">Lesson ${index + 1}</div>
            <div class="lesson-status-icon">${statusIcon}</div>
        </div>
        
        <h3 class="lesson-title">${lesson.title}</h3>
        
        <div class="lesson-card-meta">
            <span class="question-count">
                <span class="meta-icon">❓</span>
                <span>${questionCount} Questions</span>
            </span>
            <span class="lesson-status-text">${isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Ready'}</span>
        </div>
        
        <div class="lesson-stars-display">
            <span class="stars">${starsDisplay}</span>
        </div>
        
        <div class="lesson-card-footer">
            ${isLocked 
                ? '<span class="locked-message">🔓 Complete previous lesson to unlock</span>' 
                : `<button class="lesson-btn ${isCompleted ? 'retry' : 'start'}" onclick="startLesson('${lesson.id}')">
                    ${isCompleted ? '🔄 Retry' : '▶️ Start'}
                </button>`
            }
        </div>
    `;
    
    return card;
}

/**
 * Start a lesson
 * @param {string} lessonId - The lesson ID
 */
function startLesson(lessonId) {
    // Find lesson title
    const lesson = allLessons.find(l => l.id === lessonId);
    const lessonTitle = lesson ? lesson.title : lessonId;
    
    sessionStorage.setItem('currentLesson', lessonId);
    sessionStorage.setItem('lessonTitle', lessonTitle);
    navigateToQuiz(currentUnit, lessonId);
}

/**
 * Update progress display
 */
function updateProgressDisplay() {
    // Recalculate progress fresh
    updateUnitProgress(currentUnit);
    
    const progress = getUnitProgress(currentUnit);
    const percent = progress.percent || 0;
    
    const progressFill = document.getElementById('unitProgressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    console.log(`📊 Updating progress display: ${percent}%`);
    
    if (progressFill) {
        progressFill.style.width = percent + '%';
    }
    if (progressPercent) {
        progressPercent.textContent = Math.round(percent) + '%';
    }
}
