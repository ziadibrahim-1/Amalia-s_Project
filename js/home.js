// ===================================
// HOME PAGE FUNCTIONALITY
// ===================================

/**
 * Initialize home page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    setupEventListeners();
});

/**
 * Setup event listeners for home page
 */
function setupEventListeners() {
    // Event listeners are set in HTML onclick handlers
}

/**
 * Animate on page load
 */
window.addEventListener('load', function() {
    // Add animation classes
    const title = document.querySelector('.welcome-title');
    const text = document.querySelector('.welcome-text');
    const buttons = document.querySelectorAll('.difficulty-btn');
    const discoverBtn = document.querySelector('.discover-btn');
    
    if (title) title.classList.add('fade-in');
    if (text) text.classList.add('fade-in');
    
    buttons.forEach((btn, index) => {
        btn.style.animationDelay = (index * 0.1) + 's';
        btn.classList.add('slide-up');
    });
    
    if (discoverBtn) {
        discoverBtn.classList.add('pulse-animation');
    }
});
