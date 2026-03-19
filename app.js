// ===================================
// AMALIA'S QUIZ APPLICATION - MAIN LOGIC
// ===================================

// Game state variables
let currentDifficulty = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;
let matchingPairs = []; // Store matched pairs for matching questions
let selectedLeftItem = null; // Track selected left item for matching

// DOM Elements
const answersContainer = document.getElementById('answersContainer');
const quizScreen = document.getElementById('quizScreen');
const endScreen = document.getElementById('endScreen');
const questionText = document.getElementById('questionText');
const questionImage = document.getElementById('questionImage');
const feedbackSection = document.getElementById('feedbackSection');
const feedbackImage = document.getElementById('feedbackImage');
const feedbackMessage = document.getElementById('feedbackMessage');
const correctAnswerDisplay = document.getElementById('correctAnswerDisplay');
const nextButton = document.getElementById('nextButton');
const currentScore = document.getElementById('currentScore');
const questionNumber = document.getElementById('questionNumber');
const finalScore = document.getElementById('finalScore');
const starsDisplay = document.getElementById('starsDisplay');
const performanceMessage = document.getElementById('performanceMessage');
const successSound = document.getElementById('successSound');
const tryAgainSound = document.getElementById('tryAgainSound');
const matchingContainer = document.getElementById('matchingContainer');
const matchingLeft = document.getElementById('matchingLeft');
const matchingRight = document.getElementById('matchingRight');
const submitMatchingButton = document.getElementById('submitMatchingButton');
const exitButton = document.getElementById('exitButton');
const welcomeScreen = document.getElementById('welcomeScreen');

// ===================================
// WELCOME SCREEN HANDLERS
// ===================================

/**
 * Initialize the game - set up event listeners for difficulty buttons
 */
function initializeGame() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
            startQuiz(difficulty);
        });
    });
}

/**
 * Start the quiz with the selected difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
function startQuiz(difficulty) {
    currentDifficulty = difficulty;
    currentQuestions = getQuestionsByDifficulty(difficulty);
    currentQuestionIndex = 0;
    score = 0;
    
    // Show quiz screen and hide welcome screen
    welcomeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    // Display first question
    displayQuestion();
}

// ===================================
// QUIZ SCREEN LOGIC
// ===================================

/**
 * Display the current question and answer options
 */
function displayQuestion() {
    hasAnswered = false;
    const question = currentQuestions[currentQuestionIndex];
    const totalQuestions = currentQuestions.length;
    
    // Update question counter and score
    questionNumber.textContent = currentQuestionIndex + 1;
    currentScore.textContent = score;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('totalQuestions2').textContent = totalQuestions;
    
    // Update progress bar
    updateProgressBar(currentQuestionIndex + 1, totalQuestions);
    
    // Display question text
    questionText.textContent = question.question;
    
    // Display question image if exists
    if (question.image) {
        questionImage.textContent = question.image;
    } else {
        questionImage.textContent = '';
    }
    
    // Hide feedback section for new question
    feedbackSection.classList.add('hidden');
    
    // Check if this is a matching question
    if (question.type === 'matching') {
        displayMatchingQuestion(question);
    } else {
        // Clear previous answers and show multiple choice
        answersContainer.innerHTML = '';
        matchingContainer.classList.add('hidden');
        
        // Shuffle and display answer options
        const shuffledOptions = shuffleArray(question.options);
        shuffledOptions.forEach((option) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'answer-btn';
            button.addEventListener('click', () => handleAnswer(option, question.correctAnswer));
            button.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAnswer(option, question.correctAnswer);
            });
            answersContainer.appendChild(button);
        });
    }
}

/**
 * Update progress bar and percentage
 * @param {number} current - Current question number
 * @param {number} total - Total questions
 */
function updateProgressBar(current, total) {
    const percentage = (current / total) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    if (progressPercent) {
        progressPercent.textContent = Math.round(percentage);
    }
}

/**
 * Display matching question with left and right columns
 * @param {object} question - The matching question object
 */
function displayMatchingQuestion(question) {
    // Hide multiple choice answers and show matching container
    answersContainer.innerHTML = '';
    matchingContainer.classList.remove('hidden');
    
    // Initialize matching state
    matchingPairs = [];
    selectedLeftItem = null;
    submitMatchingButton.disabled = false;
    
    // Shuffle right side items
    const shuffledRight = shuffleArray(question.pairs.map(pair => pair.right));
    
    // Display left items
    matchingLeft.innerHTML = '';
    question.pairs.forEach((pair, index) => {
        const leftItem = document.createElement('button');
        leftItem.className = 'matching-item left-item';
        leftItem.textContent = pair.left;
        leftItem.dataset.index = index;
        leftItem.dataset.correctRight = pair.right;
        leftItem.addEventListener('click', () => selectLeftItem(leftItem, index, pair.right));
        matchingLeft.appendChild(leftItem);
    });
    
    // Display right items (shuffled)
    matchingRight.innerHTML = '';
    shuffledRight.forEach((rightValue) => {
        const rightItem = document.createElement('button');
        rightItem.className = 'matching-item right-item';
        rightItem.textContent = rightValue;
        rightItem.dataset.value = rightValue;
        rightItem.addEventListener('click', () => selectRightItem(rightItem, rightValue));
        matchingRight.appendChild(rightItem);
    });
}

/**
 * Handle left item selection in matching
 * @param {element} element - The clicked left item
 * @param {number} index - Index of the pair
 * @param {string} correctRight - Correct right value for this pair
 */
function selectLeftItem(element, index, correctRight) {
    // Deselect previous selection
    document.querySelectorAll('.left-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Select current item
    element.classList.add('selected');
    selectedLeftItem = { element, index, correctRight };
}

/**
 * Handle right item selection and create match
 * @param {element} element - The clicked right item
 * @param {string} rightValue - The value of right item
 */
function selectRightItem(element, rightValue) {
    if (!selectedLeftItem) return;
    
    const { element: leftElement, index, correctRight } = selectedLeftItem;
    const isCorrect = rightValue === correctRight;
    
    if (isCorrect) {
        // Mark as matched
        leftElement.classList.add('matched');
        leftElement.disabled = true;
        element.classList.add('matched');
        element.disabled = true;
        
        // Store the match
        matchingPairs.push({ leftIndex: index, rightValue: rightValue, correct: true });
        
        // Deselect
        selectedLeftItem = null;
        leftElement.classList.remove('selected');
        
        // Check if all pairs are matched
        const totalPairs = document.querySelectorAll('.left-item').length;
        if (matchingPairs.length === totalPairs) {
            // All pairs matched correctly
            handleMatchingSuccess();
        }
    } else {
        // Wrong match - show animation
        element.classList.add('incorrect-match');
        setTimeout(() => {
            element.classList.remove('incorrect-match');
        }, 500);
    }
}

/**
 * Handle successful matching of all pairs
 */
function handleMatchingSuccess() {
    // Show feedback
    feedbackSection.classList.remove('hidden');
    
    const feedbackVideo = document.getElementById('feedbackVideo');
    feedbackImage.style.display = 'none';
    feedbackVideo.style.display = 'block';
    feedbackVideo.src = './corect1.mp4';
    feedbackVideo.play();
    
    feedbackMessage.textContent = 'Perfect! All matches are correct!';
    correctAnswerDisplay.textContent = '';
    correctAnswerDisplay.classList.add('hidden');
    
    // Play success sound
    playSuccessSound();
    
    // Increase score
    score++;
    currentScore.textContent = score;
    
    // Disable submit button
    submitMatchingButton.disabled = true;
    hasAnswered = true;
}

/**
 * Submit matching question answers (fallback if some are incorrect)
 */
function submitMatchingAnswers() {
    const totalPairs = document.querySelectorAll('.left-item').length;
    const matchedPairs = document.querySelectorAll('.left-item.matched').length;
    
    if (matchedPairs === totalPairs) {
        // All correct
        handleMatchingSuccess();
    } else {
        // Some not matched yet
        feedbackMessage.textContent = `Match all ${totalPairs} pairs to continue!`;
    }
}

/**
 * Handle answer selection
 * @param {string} selectedAnswer - User's selected answer
 * @param {string} correctAnswer - Correct answer from question data
 */
function handleAnswer(selectedAnswer, correctAnswer) {
    // Prevent multiple answers for same question
    if (hasAnswered) return;
    hasAnswered = true;
    
    // Disable all answer buttons after selection
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.disabled = true);
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Highlight selected answer
    answerButtons.forEach(btn => {
        if (btn.textContent === selectedAnswer) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    });
    
    // Show feedback
    showFeedback(isCorrect, selectedAnswer, correctAnswer);
}

/**
 * Display feedback for the selected answer
 * @param {boolean} isCorrect - Whether the answer is correct
 * @param {string} selectedAnswer - The selected answer
 * @param {string} correctAnswer - The correct answer
 */
function showFeedback(isCorrect, selectedAnswer, correctAnswer) {
    // Show feedback section
    feedbackSection.classList.remove('hidden');
    
    // Get video element
    const feedbackVideo = document.getElementById('feedbackVideo');
    
    if (isCorrect) {
        // Correct answer feedback - show success video
        feedbackImage.style.display = 'none';
        feedbackVideo.style.display = 'block';
        feedbackVideo.src = './corect1.mp4';
        feedbackVideo.play();
        
        feedbackMessage.textContent = 'Great job Amalia!';
        correctAnswerDisplay.textContent = '';
        correctAnswerDisplay.classList.add('hidden');
        
        // Play success sound
        playSuccessSound();
        
        // Increase score
        score++;
        currentScore.textContent = score;
    } else {
        // Incorrect answer feedback - show try-again video
        feedbackImage.style.display = 'none';
        feedbackVideo.style.display = 'block';
        feedbackVideo.src = './V2Wrobg.mp4';
        feedbackVideo.play();
        
        feedbackMessage.textContent = 'Try again next time!';
        correctAnswerDisplay.textContent = `The correct answer is: ${correctAnswer}`;
        correctAnswerDisplay.classList.remove('hidden');
        
        // Play try-again sound
        playTryAgainSound();
    }
}

/**
 * Play success sound
 */
function playSuccessSound() {
    // Play the success sound from HTML audio element
    if (successSound) {
        successSound.currentTime = 0; // Reset to start
        successSound.play().catch(err => console.log('Audio play failed:', err));
    }
}

/**
 * Play try-again sound
 */
function playTryAgainSound() {
    // Play the try-again sound from HTML audio element
    if (tryAgainSound) {
        tryAgainSound.currentTime = 0; // Reset to start
        tryAgainSound.play().catch(err => console.log('Audio play failed:', err));
    }
}

/**
 * Move to the next question or end screen
 */
function nextQuestion() {
    currentQuestionIndex++;
    
    // Check if quiz is complete
    if (currentQuestionIndex >= currentQuestions.length) {
        endQuiz();
    } else {
        displayQuestion();
    }
}

// Event listener for next button
nextButton.addEventListener('click', nextQuestion);

// Event listener for submit matching button
submitMatchingButton.addEventListener('click', submitMatchingAnswers);

// ===================================
// END SCREEN LOGIC
// ===================================

/**
 * Display the end screen with score and performance
 */
function endQuiz() {
    // Hide quiz screen and show end screen
    quizScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    // Display final score
    const totalQuestions = currentQuestions.length;
    finalScore.textContent = score;
    document.getElementById('finalTotal').textContent = totalQuestions;
    
    // Calculate star rating based on performance
    const stars = calculateStars(score);
    displayStars(stars);
    
    // Display performance message
    displayPerformanceMessage(score, totalQuestions);
}

/**
 * Calculate number of stars based on score
 * @param {number} finalScore - Final score out of total questions
 * @returns {number} Number of stars (1-5)
 */
function calculateStars(finalScore) {
    const totalQuestions = currentQuestions.length;
    const percentage = (finalScore / totalQuestions) * 100;
    
    if (percentage >= 95) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 65) return 3;
    if (percentage >= 50) return 2;
    return 1;
}

/**
 * Display stars based on score
 * @param {number} numStars - Number of stars to display
 */
function displayStars(numStars) {
    let starsHTML = '';
    for (let i = 0; i < numStars; i++) {
        starsHTML += '⭐';
    }
    starsDisplay.textContent = starsHTML;
}

/**
 * Display motivational message based on performance
 * @param {number} finalScore - Final score
 * @param {number} totalQuestions - Total questions in the quiz
 */
function displayPerformanceMessage(finalScore, totalQuestions) {
    const percentage = (finalScore / totalQuestions) * 100;
    let message = '';
    
    if (percentage === 100) {
        message = '🎊 Perfect Score! You are Amazing! 🎊';
    } else if (percentage >= 95) {
        message = '🎉 Excellent Work! You are a Quiz Master!';
    } else if (percentage >= 80) {
        message = '👏 Great Job! You did really well!';
    } else if (percentage >= 65) {
        message = '😊 Good Effort! Keep practicing!';
    } else if (percentage >= 50) {
        message = '💪 Nice Try! You are getting better!';
    } else {
        message = '🌟 Keep Learning! Try again!';
    }
    
    performanceMessage.textContent = message;
}

/**
 * Reset game and return to welcome screen
 */
function resetQuiz() {
    // Reset variables
    currentDifficulty = '';
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    hasAnswered = false;
    
    // Show welcome screen and hide end screen
    endScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
}

/**
 * Exit the quiz and return to welcome screen
 */
function exitQuiz() {
    // Reset variables
    currentDifficulty = '';
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    hasAnswered = false;
    matchingPairs = [];
    selectedLeftItem = null;
    
    // Show welcome screen and hide quiz screen
    quizScreen.classList.remove('active');
    endScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
}

// Event listener for replay button
document.getElementById('replayButton').addEventListener('click', resetQuiz);

// Event listener for exit button
exitButton.addEventListener('click', exitQuiz);

// ===================================
// INITIALIZATION
// ===================================

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
