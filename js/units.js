// ===================================
// UNITS PAGE FUNCTIONALITY
// ===================================

let allUnits = [];

/**
 * Initialize units page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    loadUnits();
});

window.addEventListener('pageshow', function(event) {
    console.log('Units page shown, refreshing...');
    loadUnits();
});

/**
 * Load units from JSON and display them
 */
async function loadUnits() {
    try {
        const response = await fetch('./Jsons/UnitsStructure/units_Structure.json');
        const data = await response.json();
        allUnits = data.units;
        
        displayUnits();
    } catch (error) {
        console.error('Error loading units:', error);
    }
}

/**
 * Display units in grid
 */
/**
 * Display units in grid
 */
function displayUnits() {
    const unitsGrid = document.getElementById('unitsGrid');
    unitsGrid.innerHTML = '';
    
    allUnits.forEach((unit, index) => {
        const progress = getUnitProgress(unit.id);
        
        // Unlock logic: first unit always unlocked, others unlock when previous unit is 100% complete
        let isLocked = false;
        if (unit.id === 'unit2' || unit.id === 'unit3' || unit.id === 'unit4' || unit.id === 'unit5' || unit.id === 'unit6' || unit.id === 'unit7' || unit.id === 'unit8' || unit.id === 'unit9') {
            isLocked = false;
        } else if (index > 0) {
            // Check if previous unit is completed (100%)
            const prevUnit = allUnits[index - 1];
            const prevProgress = getUnitProgress(prevUnit.id);
            isLocked = (prevProgress.percent || 0) < 100;
        }
        
        const card = createUnitCard(unit, progress, isLocked);
        unitsGrid.appendChild(card);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const unitId = sessionStorage.getItem("currentUnit") || "unit1";
    const progress = JSON.parse(localStorage.getItem("amaliaProgress"));

    if (!progress || !progress[unitId]) return;

    const percent = progress[unitId].percent || 0;

    const bar = document.querySelector(".progress-fill");
    const label = document.querySelector(".progress-percent");

    if (bar) bar.style.width = percent + "%";
    if (label) label.textContent = percent + "%";

    console.log("✅ UI Progress Updated:", percent);
});


/**
 * Create a unit card element
 * @param {object} unit - Unit data
 * @param {object} progress - Unit progress
 * @param {boolean} isLocked - Whether unit is locked
 * @returns {HTMLElement} Unit card element
 */
function createUnitCard(unit, progress, isLocked) {
    const card = document.createElement('div');
    card.className = `unit-card ${isLocked ? 'locked' : ''} ${progress.percent === 100 ? 'completed' : ''}`;
    
    const progressPercent = progress.percent || 0;
    const completionBadge = progress.percent === 100 ? '✓' : '';
    
    card.innerHTML = `
        <div class="unit-card-header">
            <h3 class="unit-title">${unit.title}</h3>
            ${completionBadge ? `<span class="completion-badge">${completionBadge}</span>` : ''}
        </div>
        
        <div class="unit-card-body">
            <p class="lessons-count">${unit.lessonsCount} Lessons</p>
            
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${progressPercent}%</span>
            </div>
        </div>
        
        <div class="unit-card-footer">
            ${isLocked 
                ? '<span class="locked-badge">🔒 Coming Soon</span>' 
                : `<button class="unit-btn" onclick="navigateToLessons('${unit.id}')">Start →</button>`
            }
        </div>
    `;
    
    return card;
}
