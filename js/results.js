// ===================================
// RESULTS PAGE FUNCTIONALITY
// ===================================

/**
 * Initialize progress bar at top of page
 */
function initializeProgress() {
    // Results page doesn't need progress bar, but we can add custom header if needed
    // This function is called but optional
}

/**
 * Initialize results page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    displayResults();
});

/**
 * Display quiz results
 */
function displayResults() {
    const score = parseInt(sessionStorage.getItem('quizScore')) || 0;
    const total = parseInt(sessionStorage.getItem('quizTotal')) || 10;
    const stars = parseInt(sessionStorage.getItem('quizStars')) || 0;
    const outcome = sessionStorage.getItem('quizOutcome') || 'success';
    
    // Debug logging
    console.log('Displaying Results');
    console.log('Score from storage:', score);
    console.log('Total from storage:', total);
    console.log('Stars from storage:', stars);
    
    // Display score
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = total;
    
    // Display stars with animation
    displayStars(stars);
    
    // Display performance message
    displayPerformanceMessage(score, total);
    
    // Play success/fail video with voice
    playVideoWithAutoplay(outcome);
    speakResultSummary(score, total, outcome);
    
    // Trigger celebration animation
    triggerCelebration();

    // Auto-open next lesson when requested by quiz flow.
    const nextLesson = sessionStorage.getItem('autoOpenNextLesson');
    if (nextLesson === 'u2_l2') {
        setTimeout(() => {
            sessionStorage.setItem('currentUnit', 'unit2');
            sessionStorage.setItem('currentLesson', 'u2_l2');
            sessionStorage.setItem('lessonTitle', 'Where Is It?');
            sessionStorage.removeItem('autoOpenNextLesson');
            window.location.href = 'quiz.html';
        }, 4500);
    }
}

/**
 * Display stars with filled and empty stars
 * @param {number} numStars - Number of stars (0-3)
 */
function displayStars(numStars) {
    let starsHTML = '';
    
    // Add filled stars
    for (let i = 0; i < numStars; i++) {
        starsHTML += '<span class="star filled">⭐</span>';
    }
    
    // Add empty stars
    for (let i = numStars; i < 3; i++) {
        starsHTML += '<span class="star empty">☆</span>';
    }
    
    document.getElementById('starsDisplay').innerHTML = starsHTML;
    
    // Add animation class to stars
    const starElements = document.querySelectorAll('.star');
    starElements.forEach((star, index) => {
        star.style.animationDelay = (index * 0.2) + 's';
        star.classList.add('bounce-in');
    });
}

/**
 * Display performance message based on score
 * @param {number} score - Correct answers
 * @param {number} total - Total questions
 */
function displayPerformanceMessage(score, total) {
    const percentage = Math.round((score / total) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
        message = 'Perfect Score! You are AMAZING!';
        emoji = '🏆';
    } else if (percentage >= 90) {
        message = 'Excellent Work! You are a Super Star!';
        emoji = '⭐';
    } else if (percentage >= 75) {
        message = 'Great Job! You did really well!';
        emoji = '👏';
    } else if (percentage >= 60) {
        message = 'Good Effort! Keep practicing!';
        emoji = '😊';
    } else if (percentage >= 50) {
        message = 'Nice Try! You are getting better!';
        emoji = '💪';
    } else {
        message = 'Keep Learning! You can do it!';
        emoji = '🌟';
    }
    
    document.getElementById('performanceMessage').innerHTML = `${emoji} ${message}`;
}

/**
 * Play celebration video with autoplay fallback
 */
function playVideoWithAutoplay(outcome) {
    const video = document.getElementById('celebrationVideo');
    if (video) {
        video.src = outcome === 'success' ? './VFinal.mp4' : './V2Wrobg.mp4';
        video.style.display = 'block';
        
        // Try to play the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay prevented:', error);
                // Video will still autoplay due to muted attribute
            });
        }
    }
}

/**
 * Speak a simple end-of-lesson summary.
 * @param {number} score - Correct answers
 * @param {number} total - Total questions
 * @param {string} outcome - success or fail
 */
function speakResultSummary(score, total, outcome) {
    if (!window.speechSynthesis) return;

    const message = outcome === 'success'
        ? `Great work. You got ${score} out of ${total}. Lesson completed successfully.`
        : `Good effort. You got ${score} out of ${total}. Keep practicing and try again.`;

    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.log('Result speech synthesis unavailable:', error);
    }
}

/**
 * Trigger celebration animations - balloons and fireworks
 */
function triggerCelebration() {
    // Create multiple fireworks bursts
    setTimeout(() => createFireworks(), 200);
    setTimeout(() => createFireworks(), 800);
    setTimeout(() => createFireworks(), 1400);
    
    // Animate balloons continuously
    animateBalloons();
}

/**
 * Create fireworks effect
 */
function createFireworks() {
    const fireworksContainer = document.getElementById('fireworksContainer');
    
    if (!fireworksContainer) return;
    
    // Create multiple sparks
    for (let i = 0; i < 40; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        // Random position in center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        spark.style.left = centerX + 'px';
        spark.style.top = centerY + 'px';
        spark.style.animationDelay = (i * 0.03) + 's';
        
        // Random color
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'];
        spark.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        fireworksContainer.appendChild(spark);
        
        // Remove spark after animation
        setTimeout(() => {
            spark.remove();
        }, 1500);
    }
}

/**
 * Animate balloons floating up
 */
function animateBalloons() {
    const balloonContainer = document.getElementById('balloonContainer');
    
    if (!balloonContainer) return;
    
    const balloons = balloonContainer.querySelectorAll('.balloon');
    balloons.forEach((balloon, index) => {
        // Restart animation
        balloon.style.animation = 'none';
        setTimeout(() => {
            balloon.style.animation = `float 4s ease-in infinite`;
            balloon.style.animationDelay = (index * 0.3) + 's';
        }, 10);
    });
}
