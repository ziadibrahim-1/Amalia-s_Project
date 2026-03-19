// ===================================
// QUIZ PAGE FUNCTIONALITY
// ===================================
let dragMatchState = {
    total: 0,
    correct: 0,
    dropped: 0
};
let matchedCount = 0;
let totalPairs = 0;

let currentTapQuestion = null;

let currentUnit = '';
let currentLesson = '';
let currentQuestionGroups = [];
let flattenedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;
let selectedNumber = null;
let speechEnabled = true;
let orderingSelection = [];

/**
 * Initialize quiz page
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeProgress();
    currentUnit = sessionStorage.getItem('currentUnit') || 'unit1';
    currentLesson = sessionStorage.getItem('currentLesson') || 'u1_l1';

    loadQuestions();
});

/**
 * Load questions for current lesson
 */
async function loadQuestions() {
    try {
        // Construct file path based on lesson ID
        // Example: u1_l1 -> unit_1_Lesson1.json
        const unitNum = currentUnit.replace('unit', '');
        const lessonNum = currentLesson.split('_l')[1];
        const fileName = `unit_${unitNum}_Lesson${lessonNum}.json`;

        const data = await fetchLessonJson(unitNum, fileName);

        // Support both formats:
        // 1) Legacy array of groups
        // 2) Lesson object with "questions" array
        let rawQuestions = [];
        if (Array.isArray(data)) {
            rawQuestions = data;
        } else if (data && Array.isArray(data.questions)) {
            rawQuestions = data.questions;
        }

        currentQuestionGroups = rawQuestions;
        flattenedQuestions = flattenQuestionsArray(rawQuestions);

        // Update header with lesson title from session or default
        const lessonTitle = sessionStorage.getItem('lessonTitle') || `Lesson ${lessonNum}`;
        document.getElementById('lessonTitle').textContent = lessonTitle;

        if (flattenedQuestions.length === 0) {
            alert('No questions found for this lesson');
            exitQuiz();
            return;
        }

        // Display first question
        displayQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load lesson questions');
    }
}

/**
 * Fetch lesson JSON with case-insensitive path fallbacks.
 * @param {string} unitNum - Unit number (e.g., "3")
 * @param {string} fileName - Lesson file name
 * @returns {Promise<any>} Parsed JSON
 */
async function fetchLessonJson(unitNum, fileName) {
    const candidates = [
        `./Jsons/Units_Questions/Unit${unitNum}/${fileName}`,
        `./Jsons/Units_Questions/unit${unitNum}/${fileName}`
    ];

    let lastError = null;
    for (const path of candidates) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                lastError = new Error(`Failed ${path} (${response.status})`);
                continue;
            }
            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Unable to load lesson JSON');
}

/**
 * Flatten question groups into individual questions
 * Each group can have multiple questions in data.questions array OR be a single question
 * @param {array} questionGroups - Array of question group objects
 * @returns {array} Flattened array of individual questions
 */
function flattenQuestionsArray(questionGroups) {
    const flattened = [];

    questionGroups.forEach((group, groupIndex) => {
        // Check if this is a group with sub-questions (Lesson 1 format)
        if (group.data && group.data.questions && Array.isArray(group.data.questions)) {
            // OLD FORMAT: Lesson 1 style
            group.data.questions.forEach((question, questionIndex) => {
                const currentQuestion = group.data?.questions?.[questionIndex] || null;

                flattened.push({
                    groupId: group.id,
                    groupTitle: group.title,
                    groupInstruction: group.instruction,
                    questionType: group.type,
                    questionIndex: questionIndex,

                    // ✅ IMPORTANT FOR TAP COUNT
                    image: currentQuestion?.image || null,
                    correctCount: currentQuestion?.correctCount ?? null,

                    // keep original data if needed later
                    data: group.data,

                    pairs: group.data?.pairs,
                    numbers: group.data?.numbers,

                    groupIndex: groupIndex,
                    showFeedback: group.ui?.showFeedback !== false,
                    autoNext: group.ui?.autoNext === true,
                    sound: group.ui?.sound !== false
                });

            });
        } else {
            // NEW FORMAT: Lesson 2+ style (single question per item)
            flattened.push({
                groupId: group.id,
                groupTitle: group.title,
                groupInstruction: group.instruction,
                questionType: group.type,  // Use 'type' field
                questionIndex: 0,
                data: group.data,  // Store entire data object
                pairs: group.data?.pairs,  // For drag_match
                numbers: group.data?.numbers,  // For number_flash
                groupIndex: groupIndex,
                showFeedback: group.ui?.showFeedback !== false,
                autoNext: group.ui?.autoNext === true,
                sound: group.ui?.sound !== false
            });
        }
    });

    return flattened;
}

/**
 * Display current question
 */
function displayQuestion() {
    hasAnswered = false;
    selectedNumber = null;

    if (currentQuestionIndex >= flattenedQuestions.length) {
        endQuiz();
        return;
    }

    const question = flattenedQuestions[currentQuestionIndex];

    // Update counter and progress
    document.getElementById('questionCounter').textContent = `${currentQuestionIndex + 1} / ${flattenedQuestions.length}`;
    updateProgressBar();

    // Hide feedback section
    document.getElementById('feedbackSection').classList.add('hidden');
    document.getElementById('answersContainer').innerHTML = '';

    // Display question content (this will show/hide number pad based on question type)
    displayQuestionContent(question);

    // Speak question title/instruction when available.
    speakQuestionPrompt(question);
}

/**
 * Display question based on type
 * @param {object} question - Question object
 */
function displayQuestionContent(question) {
    console.log("Question Type =", question.questionType);
    document.getElementById('questionText').textContent = question.groupTitle || 'Question';
    document.getElementById('instruction').textContent = question.groupInstruction || '';

    // Display question image if exists
    const imageContainer = document.getElementById('questionImage');
    if (question.data?.question) {
        document.getElementById('instruction').textContent = question.data.question;
    }

    if (question.image) {
        // Create image element
        const img = document.createElement('img');
        img.src = question.image;
        img.alt = 'Question Image';
        img.className = 'question-img';
        img.onerror = function () {
            console.error('Image failed to load:', question.image);
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);
    } else {
        imageContainer.innerHTML = '';
    }

    // Display options based on question type
    switch (question.questionType) {
        case 'tap_count':
            displayTapCountQuestion(question);
            break;
        case 'compare_numbers':
            displayCompareNumbersQuestion(question);
            break;
        case 'mcq':
            displayMCQQuestion(question);
            break;
        case 'number_flash':
            displayNumberFlashQuestion(question);
            break;
        case 'drag_match':
            displayDragMatchQuestion(question);
            break;
        case 'position_select':
            displayPositionSelectQuestion(question);
            break;
        case 'grid_position_select':
            displayGridPositionSelectQuestion(question);
            break;
        case 'simple_addition':
            displaySimpleAdditionQuestion(question);
            break;
        case 'addition_word_problem':
            displayAdditionWordProblemQuestion(question);
            break;
        case 'story_matching':
            displayStoryMatchingQuestion(question);
            break;
        case 'simple_subtraction':
            displaySimpleSubtractionQuestion(question);
            break;
        case 'subtraction_word_problem':
            displaySubtractionWordProblemQuestion(question);
            break;
        case 'difference_problem':
            displayDifferenceProblemQuestion(question);
            break;
        case 'length_comparison':
            displayLengthComparisonQuestion(question);
            break;
        case 'grid_length_comparison':
            displayGridLengthComparisonQuestion(question);
            break;
        case 'pictograph_reading':
            displayPictographReadingQuestion(question);
            break;
        case 'pictograph_comparison':
            displayPictographComparisonQuestion(question);
            break;
        case 'fill_in_sequence':
            displayFillInSequenceQuestion(question);
            break;
        case 'ten_decomposition':
            displayTenDecompositionQuestion(question);
            break;
        case 'number_ordering':
            displayNumberOrderingQuestion(question);
            break;
        case 'clock_reading':
            displayClockReadingQuestion(question);
            break;
        case 'three_number_addition':
            displayThreeNumberAdditionQuestion(question);
            break;
        case 'three_number_subtraction':
            displayThreeNumberSubtractionQuestion(question);
            break;
        case 'mixed_operations':
            displayMixedOperationsQuestion(question);
            break;
        default:
            displayTapCountQuestion(question);
    }
}

/**
 * Speak question prompt using browser speech synthesis (if available).
 * @param {object} question - Current question object
 */
function speakQuestionPrompt(question) {
    if (!speechEnabled || !window.speechSynthesis) return;
    if (question.sound === false) return;

    const title = question.groupTitle || '';
    const instruction = question.groupInstruction || question.data?.question || '';
    const text = `${title}. ${instruction}`.trim();

    if (!text) return;

    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.log('Speech synthesis not available:', error);
    }
}

/**
 * Display tap count question with number pad
 * @param {object} question - Question object
 */

function displayTapCountQuestion(question) {
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.remove('hidden');

    // Support both old grouped format and direct question format.
    const groupedQuestion = question.data?.questions?.[question.questionIndex] || null;
    const directQuestion = {
        image: question.data?.image,
        correctCount: question.data?.correctAnswer
    };
    const activeQuestion = groupedQuestion || directQuestion;
    activeQuestion.autoNext = question.autoNext;
    currentTapQuestion = activeQuestion;

    if (!activeQuestion || typeof activeQuestion.correctCount !== 'number') {
        console.error("❌ Tap Count Question missing data", question);
        return;
    }

    configureTapCountNumberPad(question);

    // ✅ Render Image
    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const img = document.createElement('img');
    img.src = activeQuestion.image;
    img.className = 'question-img';
    img.alt = 'Count Image';
    img.onerror = () => {
        imageContainer.innerHTML = `<p style="color:red">Image not found</p>`;
    };

    imageContainer.appendChild(img);

    // ✅ Important: inject correct answer into main question
    question.correctCount = activeQuestion.correctCount;

    // ✅ Reset buttons state
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected', 'correct', 'wrong');
    });

    const submitBtn = document.querySelector('.submit-number-btn');
    if (submitBtn) submitBtn.disabled = false;

    selectedNumber = null;
    hasAnswered = false;
}

/**
 * Build number pad range for tap_count questions.
 * @param {object} question - Question object
 */
function configureTapCountNumberPad(question) {
    const minNumber = Number.isFinite(question.data?.minNumber)
        ? question.data.minNumber
        : 0;
    const maxNumber = Number.isFinite(question.data?.maxNumber)
        ? question.data.maxNumber
        : 10;

    const numberGrid = document.querySelector('#numberPad .number-grid');
    if (!numberGrid) return;

    numberGrid.innerHTML = '';
    for (let n = minNumber; n <= maxNumber; n++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'number-btn';
        btn.textContent = String(n);
        btn.onclick = function () {
            selectNumber(n);
        };
        numberGrid.appendChild(btn);
    }
}


/**
 * Display compare numbers question
 * @param {object} question - Question object
 */
function displayCompareNumbersQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const q = question.data?.question || null;
    const fallbackLeft = question.data?.number1;
    const fallbackRight = question.data?.number2;
    const left = q ? q.left : fallbackLeft;
    const right = q ? q.right : fallbackRight;
    const correct = q ? q.correct : question.data?.correctAnswer;

    if (left === undefined || right === undefined) {
        container.innerHTML = `<p style="color:red">⚠ Missing compare question data</p>`;
        return;
    }

    // ✅ Display numbers visually
    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="compare-display">
            <div class="number-display">${left}</div>
            <div class="compare-symbol">vs</div>
            <div class="number-display">${right}</div>
        </div>
    `;

    // ✅ Button: Left number
    const leftBtn = document.createElement('button');
    leftBtn.className = 'answer-btn';
    leftBtn.textContent = left;
    leftBtn.onclick = () => handleAnswer(left, question);

    // ✅ Button: Right number
    const rightBtn = document.createElement('button');
    rightBtn.className = 'answer-btn';
    rightBtn.textContent = right;
    rightBtn.onclick = () => handleAnswer(right, question);

    container.appendChild(leftBtn);
    container.appendChild(rightBtn);

    // ✅ Inject correct answer for validation
    question.correctAnswer = correct;
}


/**
 * Display MCQ question
 * @param {object} question - Question object
 */
function displayMCQQuestion(question) {
    // Hide number pad for this question type
    const numberPad = document.getElementById('numberPad');
    if (numberPad) {
        numberPad.classList.add('hidden');
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const options = question.data?.options || [];
    const displayMode = question.ui?.displayMode;

    if (question.data?.questionImage) {
        const imageContainer = document.getElementById('questionImage');
        imageContainer.innerHTML = `
            <img src="${question.data.questionImage}" alt="Question context" class="question-img" id="mcqContextImage">
        `;
        const contextImage = document.getElementById('mcqContextImage');
        if (contextImage) {
            contextImage.onerror = function () {
                imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
            };
        }
    }

    if (displayMode === 'image_options' || (options.length > 0 && typeof options[0] === 'object')) {
        container.classList.add('image-options-grid');
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn image-option-btn';
            btn.innerHTML = `
                <img src="${option.image || ''}" alt="${option.label || option.id || 'Option'}" class="option-image">
                <span class="option-label">${option.label || option.id || ''}</span>
            `;
            btn.onclick = () => handleAnswer(option.id, question);
            container.appendChild(btn);
        });
    } else {
        container.classList.remove('image-options-grid');
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option;
            btn.onclick = () => handleAnswer(option, question);
            container.appendChild(btn);
        });
    }
}

/**
 * Display position_select question.
 * @param {object} question - Question object
 */
function displayPositionSelectQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="position-select-wrap">
            <div class="position-feedback" id="positionFeedback"></div>
        </div>
    `;

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="position-image-container" id="positionImageContainer">
            <img
                src="${question.data?.image || ''}"
                alt="Position question"
                class="position-image"
                id="positionImage"
            >
            <div class="position-overlay" id="positionOverlay"></div>
        </div>
    `;

    const image = document.getElementById('positionImage');
    image.onerror = function () {
        imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
    };

    image.onload = function () {
        createPositionClickZones(question);
    };
}

/**
 * Create clickable zones for each object in position_select.
 * @param {object} question - Question object
 */
function createPositionClickZones(question) {
    const overlay = document.getElementById('positionOverlay');
    const image = document.getElementById('positionImage');
    const totalObjects = question.data?.totalObjects || 0;

    if (!overlay || !image || totalObjects < 1) return;

    overlay.innerHTML = '';
    const segmentWidth = 100 / totalObjects;

    for (let i = 1; i <= totalObjects; i++) {
        const zone = document.createElement('button');
        zone.type = 'button';
        zone.className = 'position-zone';
        zone.style.left = `${(i - 1) * segmentWidth}%`;
        zone.style.width = `${segmentWidth}%`;
        zone.dataset.position = String(i);

        zone.onmouseenter = function () {
            if (!hasAnswered) zone.classList.add('hover');
        };
        zone.onmouseleave = function () {
            zone.classList.remove('hover');
        };

        zone.onclick = function () {
            if (hasAnswered) return;
            const selectedPosition = parseInt(zone.dataset.position, 10);
            submitPositionSelectAnswer(selectedPosition, question);
        };

        overlay.appendChild(zone);
    }
}

/**
 * Validate and submit position_select answer.
 * @param {number} selectedPosition - Selected position from front (1-based)
 * @param {object} question - Question object
 */
function submitPositionSelectAnswer(selectedPosition, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const total = question.data?.totalObjects || 0;
    const direction = question.data?.direction || 'front';
    const rawCorrect = question.data?.correctPosition || 0;
    const correctFromFront = direction === 'back'
        ? (total - rawCorrect + 1)
        : rawCorrect;

    const isCorrect = selectedPosition === correctFromFront;

    // Visual state for selected and expected zone.
    document.querySelectorAll('.position-zone').forEach(zone => {
        const zonePos = parseInt(zone.dataset.position, 10);
        zone.disabled = true;
        zone.classList.remove('hover');

        if (zonePos === selectedPosition) {
            zone.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (!isCorrect && zonePos === correctFromFront) {
            zone.classList.add('correct-answer');
        }
    });

    if (isCorrect) {
        score++;
    }

    // Reuse global feedback video/sound flow.
    showFeedback(isCorrect, selectedPosition, {
        correctAnswer: correctFromFront,
        autoNext: question.autoNext
    });
}

/**
 * Display grid_position_select question.
 * @param {object} question - Question object
 */
function displayGridPositionSelectQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const gridImage = question.data?.gridImage;
    if (gridImage) {
        imageContainer.innerHTML = `
            <div class="grid-display">
                <img src="${gridImage}" alt="Grid question" class="grid-image" id="gridQuestionImage">
            </div>
        `;

        const img = document.getElementById('gridQuestionImage');
        if (img) {
            img.onerror = function () {
                imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
            };
        }
    }

    const container = document.getElementById('answersContainer');
    const options = question.data?.options || [];

    container.innerHTML = `
        <div class="grid-question-wrap">
            <div class="grid-options" id="gridOptions"></div>
            <div class="grid-feedback" id="gridFeedback"></div>
        </div>
    `;

    const optionsContainer = document.getElementById('gridOptions');
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'grid-option-btn';
        btn.textContent = option;
        btn.dataset.position = String(index + 1);
        btn.onclick = function () {
            if (hasAnswered) return;
            submitGridPositionAnswer(index + 1, question, btn);
        };
        optionsContainer.appendChild(btn);
    });
}

/**
 * Validate and submit grid_position_select answer.
 * @param {number} selectedPosition - Selected ordinal position
 * @param {object} question - Question object
 */
function submitGridPositionAnswer(selectedPosition, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctPosition = question.data?.correctPosition;
    const isCorrect = selectedPosition === correctPosition;

    document.querySelectorAll('.grid-option-btn').forEach(btn => {
        const btnPos = parseInt(btn.dataset.position, 10);
        btn.disabled = true;

        if (btnPos === selectedPosition) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && btnPos === correctPosition) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        score++;
    }

    showFeedback(isCorrect, selectedPosition, {
        correctAnswer: correctPosition,
        autoNext: question.autoNext
    });
}

/**
 * Display simple_addition question.
 * @param {object} question - Question object
 */
function displaySimpleAdditionQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const container = document.getElementById('answersContainer');
    const data = question.data || {};
    const options = data.options || [];

    container.innerHTML = `
        <div class="simple-addition-wrap">
            <div class="equation-display">
                <span class="num1">${data.num1 ?? ''}</span>
                <span class="operator">+</span>
                <span class="num2">${data.num2 ?? ''}</span>
                <span class="equals">=</span>
                <span class="question-mark">?</span>
            </div>
            ${data.showVisual ? `
                <div class="visual-representation">
                    <div class="dots-group">${'●'.repeat(Math.max(0, data.num1 || 0))}</div>
                    <div class="plus-sign">+</div>
                    <div class="dots-group">${'●'.repeat(Math.max(0, data.num2 || 0))}</div>
                </div>
            ` : ''}
            <div class="addition-options" id="additionOptions"></div>
        </div>
    `;

    const optionsContainer = document.getElementById('additionOptions');

    if (data.answerMode === 'input') {
        optionsContainer.innerHTML = `
            <div class="addition-input-row">
                <input type="number" id="additionInput" class="addition-input-box" min="0" max="30" placeholder="Answer">
                <button type="button" class="submit-answer-btn" id="additionSubmitBtn">Submit</button>
            </div>
        `;

        const input = document.getElementById('additionInput');
        const submit = document.getElementById('additionSubmitBtn');
        submit.onclick = function () {
            if (hasAnswered) return;
            const selected = parseInt(input.value, 10);
            if (Number.isNaN(selected)) return;
            submitSimpleAdditionAnswer(selected, question);
        };
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') submit.click();
        });
    } else {
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'addition-option-btn';
            btn.textContent = option;
            btn.dataset.answer = String(option);
            btn.onclick = function () {
                if (hasAnswered) return;
                submitSimpleAdditionAnswer(parseInt(btn.dataset.answer, 10), question);
            };
            optionsContainer.appendChild(btn);
        });
    }
}

/**
 * Validate and submit simple_addition answer.
 * @param {number} selectedAnswer - User answer
 * @param {object} question - Question object
 */
function submitSimpleAdditionAnswer(selectedAnswer, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = question.data?.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;

    document.querySelectorAll('.addition-option-btn').forEach(btn => {
        btn.disabled = true;
        const value = parseInt(btn.dataset.answer, 10);
        if (value === selectedAnswer) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && value === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    const input = document.getElementById('additionInput');
    const submit = document.getElementById('additionSubmitBtn');
    if (input) input.disabled = true;
    if (submit) submit.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedAnswer, {
        correctAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Display addition_word_problem question.
 * @param {object} question - Question object
 */
function displayAdditionWordProblemQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="word-problem-display">
            <p class="problem-text">${data.problemText || ''}</p>
            ${data.image ? `<img src="${data.image}" alt="Word problem" class="problem-image" id="wordProblemImage">` : ''}
        </div>
    `;

    const problemImage = document.getElementById('wordProblemImage');
    if (problemImage) {
        problemImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const showHint = question.showHint !== false && question.ui?.showHint !== false;

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="word-problem-wrap">
            ${showHint ? `
                <div class="hints-box">
                    <div class="hint-item">${data.num1 ?? ''} ${data.hints?.num1Label || ''}</div>
                    <div class="hint-item">${data.num2 ?? ''} ${data.hints?.num2Label || ''}</div>
                </div>
            ` : ''}
            <div class="word-input-row">
                <input type="text" id="equationInput" class="equation-box" placeholder="e.g. 2 + 3">
                <span class="equals-sign">=</span>
                <input type="number" id="answerInput" class="answer-box" placeholder="?">
            </div>
            <button type="button" class="submit-word-problem-btn" id="wordProblemSubmitBtn">Submit Answer</button>
        </div>
    `;

    const submitBtn = document.getElementById('wordProblemSubmitBtn');
    submitBtn.onclick = function () {
        if (hasAnswered) return;
        submitAdditionWordProblemAnswer(question);
    };
}

/**
 * Validate and submit addition_word_problem answer.
 * @param {object} question - Question object
 */
function submitAdditionWordProblemAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const eqInput = document.getElementById('equationInput');
    const ansInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('wordProblemSubmitBtn');

    const userEquation = (eqInput?.value || '').replace(/\s+/g, '');
    const expectedEquation = (question.data?.correctEquation || '').replace(/\s+/g, '');
    const userAnswer = parseInt(ansInput?.value, 10);
    const correctAnswer = question.data?.correctAnswer;

    const equationCorrect = userEquation === expectedEquation;
    const answerCorrect = userAnswer === correctAnswer;
    const isCorrect = equationCorrect && answerCorrect;

    if (eqInput) eqInput.disabled = true;
    if (ansInput) ansInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, userAnswer, {
        correctAnswer: `${question.data?.correctEquation || ''} = ${correctAnswer}`,
        autoNext: question.autoNext
    });
}

/**
 * Display story_matching question.
 * @param {object} question - Question object
 */
function displayStoryMatchingQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const stories = data.stories || [];

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="story-scene-wrap">
            <div class="equation-banner"><span class="equation-text">${data.equation || ''}</span></div>
            ${data.sceneImage ? `<img src="${data.sceneImage}" alt="Story scene" class="scene-image" id="storySceneImage">` : ''}
        </div>
    `;

    const sceneImage = document.getElementById('storySceneImage');
    if (sceneImage) {
        sceneImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `<div class="story-options" id="storyOptions"></div>`;

    const optionsContainer = document.getElementById('storyOptions');
    stories.forEach(story => {
        const btn = document.createElement('button');
        btn.className = 'story-option';
        btn.textContent = story.text;
        btn.dataset.storyId = story.id;
        btn.onclick = function () {
            if (hasAnswered) return;
            submitStoryMatchingAnswer(story.id, question);
        };
        optionsContainer.appendChild(btn);
    });
}

/**
 * Validate and submit story_matching answer.
 * @param {string} storyId - Selected story id
 * @param {object} question - Question object
 */
function submitStoryMatchingAnswer(storyId, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const selectedStory = (question.data?.stories || []).find(s => s.id === storyId);
    const isCorrect = !!selectedStory?.isCorrect;

    document.querySelectorAll('.story-option').forEach(btn => {
        btn.disabled = true;
        const currentId = btn.dataset.storyId;
        const story = (question.data?.stories || []).find(s => s.id === currentId);

        if (currentId === storyId) {
            btn.classList.add(isCorrect ? 'correct-story' : 'incorrect-story');
        }
        if (!isCorrect && story?.isCorrect) {
            btn.classList.add('correct-story');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedStory?.text || '', {
        correctAnswer: 'A matching story for the equation',
        autoNext: question.autoNext
    });
}

/**
 * Display simple_subtraction question.
 * @param {object} question - Question object
 */
function displaySimpleSubtractionQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const container = document.getElementById('answersContainer');
    const data = question.data || {};
    const options = data.options || [];

    container.innerHTML = `
        <div class="simple-subtraction-wrap">
            <div class="equation-display subtraction-equation">
                <span class="num1">${data.num1 ?? ''}</span>
                <span class="operator">-</span>
                <span class="num2">${data.num2 ?? ''}</span>
                <span class="equals">=</span>
                <span class="question-mark">?</span>
            </div>
            ${data.showVisual ? `
                <div class="visual-representation subtraction-visual">
                    <div class="dots-group">${'●'.repeat(Math.max(0, data.num1 || 0))}</div>
                    <div class="minus-sign">-</div>
                    <div class="dots-group">${'●'.repeat(Math.max(0, data.num2 || 0))}</div>
                </div>
            ` : ''}
            <div class="subtraction-options" id="subtractionOptions"></div>
        </div>
    `;

    const optionsContainer = document.getElementById('subtractionOptions');

    if (data.answerMode === 'input') {
        optionsContainer.innerHTML = `
            <div class="subtraction-input-row">
                <input type="number" id="subtractionInput" class="subtraction-input-box" min="0" max="30" placeholder="Answer">
                <button type="button" class="submit-answer-btn" id="subtractionSubmitBtn">Submit</button>
            </div>
        `;

        const input = document.getElementById('subtractionInput');
        const submit = document.getElementById('subtractionSubmitBtn');
        submit.onclick = function () {
            if (hasAnswered) return;
            const selected = parseInt(input.value, 10);
            if (Number.isNaN(selected)) return;
            submitSimpleSubtractionAnswer(selected, question);
        };
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') submit.click();
        });
    } else {
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'subtraction-option-btn';
            btn.textContent = option;
            btn.dataset.answer = String(option);
            btn.onclick = function () {
                if (hasAnswered) return;
                submitSimpleSubtractionAnswer(parseInt(btn.dataset.answer, 10), question);
            };
            optionsContainer.appendChild(btn);
        });
    }
}

/**
 * Validate and submit simple_subtraction answer.
 * @param {number} selectedAnswer - User answer
 * @param {object} question - Question object
 */
function submitSimpleSubtractionAnswer(selectedAnswer, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = question.data?.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;

    document.querySelectorAll('.subtraction-option-btn').forEach(btn => {
        btn.disabled = true;
        const value = parseInt(btn.dataset.answer, 10);
        if (value === selectedAnswer) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && value === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    const input = document.getElementById('subtractionInput');
    const submit = document.getElementById('subtractionSubmitBtn');
    if (input) input.disabled = true;
    if (submit) submit.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedAnswer, {
        correctAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Display subtraction_word_problem question.
 * @param {object} question - Question object
 */
function displaySubtractionWordProblemQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="word-problem-display subtraction-word-display">
            <p class="problem-text">${data.problemText || ''}</p>
            ${data.image ? `<img src="${data.image}" alt="Subtraction problem" class="problem-image" id="subtractionProblemImage">` : ''}
        </div>
    `;

    const problemImage = document.getElementById('subtractionProblemImage');
    if (problemImage) {
        problemImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const showHint = question.showHint !== false && question.ui?.showHint !== false;

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="word-problem-wrap subtraction-word-wrap">
            ${showHint ? `
                <div class="hints-box subtraction-hints-box">
                    <div class="hint-item">${data.num1 ?? ''} ${data.hints?.num1Label || ''}</div>
                    <div class="hint-item">${data.num2 ?? ''} ${data.hints?.num2Label || ''}</div>
                </div>
            ` : ''}
            <div class="word-input-row subtraction-input-row">
                <input type="text" id="subEquationInput" class="equation-box" placeholder="e.g. 7 - 4">
                <span class="equals-sign">=</span>
                <input type="number" id="subAnswerInput" class="answer-box" placeholder="?">
            </div>
            <button type="button" class="submit-word-problem-btn" id="subWordSubmitBtn">Submit Answer</button>
        </div>
    `;

    const submitBtn = document.getElementById('subWordSubmitBtn');
    submitBtn.onclick = function () {
        if (hasAnswered) return;
        submitSubtractionWordProblemAnswer(question);
    };
}

/**
 * Validate and submit subtraction_word_problem answer.
 * @param {object} question - Question object
 */
function submitSubtractionWordProblemAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const eqInput = document.getElementById('subEquationInput');
    const ansInput = document.getElementById('subAnswerInput');
    const submitBtn = document.getElementById('subWordSubmitBtn');

    const userEquation = (eqInput?.value || '').replace(/\s+/g, '');
    const expectedEquation = (question.data?.correctEquation || '').replace(/\s+/g, '');
    const userAnswer = parseInt(ansInput?.value, 10);
    const correctAnswer = question.data?.correctAnswer;

    const equationCorrect = userEquation === expectedEquation;
    const answerCorrect = userAnswer === correctAnswer;
    const isCorrect = equationCorrect && answerCorrect;

    if (eqInput) eqInput.disabled = true;
    if (ansInput) ansInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) score++;

    const answerLabel = question.data?.answerUnit
        ? `${correctAnswer} ${question.data.answerUnit}`
        : correctAnswer;

    showFeedback(isCorrect, userAnswer, {
        correctAnswer: `${question.data?.correctEquation || ''} = ${answerLabel}`,
        autoNext: question.autoNext
    });
}

/**
 * Display difference_problem question.
 * @param {object} question - Question object
 */
function displayDifferenceProblemQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const item1 = data.item1 || {};
    const item2 = data.item2 || {};

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="difference-problem-display">
            <p class="problem-text">${data.problemText || ''}</p>
            ${data.image ? `<img src="${data.image}" alt="Difference problem" class="problem-image" id="differenceProblemImage">` : ''}
            <div class="difference-items-summary">
                <div class="difference-item-card">
                    <div class="difference-item-title">${item1.emoji || ''} ${item1.name || 'Item 1'}</div>
                    <div class="difference-item-count">${item1.count ?? ''}</div>
                </div>
                <div class="difference-item-card">
                    <div class="difference-item-title">${item2.emoji || ''} ${item2.name || 'Item 2'}</div>
                    <div class="difference-item-count">${item2.count ?? ''}</div>
                </div>
            </div>
        </div>
    `;

    const problemImage = document.getElementById('differenceProblemImage');
    if (problemImage) {
        problemImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="difference-problem-wrap">
            <div class="hints-box difference-hint-box">
                <div class="hint-item">Tip: Find the larger number, then subtract the smaller number.</div>
            </div>
            <div class="word-input-row difference-input-row">
                <input type="text" id="differenceEquationInput" class="equation-box" placeholder="e.g. 8 - 6">
                <span class="equals-sign">=</span>
                <input type="number" id="differenceAnswerInput" class="answer-box" placeholder="?">
            </div>
            <button type="button" class="submit-word-problem-btn" id="differenceSubmitBtn">Submit Answer</button>
        </div>
    `;

    const submitBtn = document.getElementById('differenceSubmitBtn');
    submitBtn.onclick = function () {
        if (hasAnswered) return;
        submitDifferenceProblemAnswer(question);
    };
}

/**
 * Validate and submit difference_problem answer.
 * @param {object} question - Question object
 */
function submitDifferenceProblemAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const eqInput = document.getElementById('differenceEquationInput');
    const ansInput = document.getElementById('differenceAnswerInput');
    const submitBtn = document.getElementById('differenceSubmitBtn');

    const userEquation = (eqInput?.value || '').replace(/\s+/g, '');
    const expectedEquation = (question.data?.correctEquation || '').replace(/\s+/g, '');
    const reversedEquation = expectedEquation.includes('-')
        ? expectedEquation.split('-').reverse().join('-')
        : expectedEquation;
    const userAnswer = parseInt(ansInput?.value, 10);
    const correctAnswer = question.data?.correctAnswer;

    const equationCorrect = userEquation === expectedEquation || userEquation === reversedEquation;
    const answerCorrect = userAnswer === correctAnswer;
    const isCorrect = equationCorrect && answerCorrect;

    if (eqInput) eqInput.disabled = true;
    if (ansInput) ansInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, userAnswer, {
        correctAnswer: `${question.data?.correctEquation || ''} = ${correctAnswer}`,
        autoNext: question.autoNext
    });
}

/**
 * Display length_comparison question.
 * @param {object} question - Question object
 */
function displayLengthComparisonQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const item1 = data.item1 || { id: 'item1', name: 'Item 1' };
    const item2 = data.item2 || { id: 'item2', name: 'Item 2' };

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = data.image
        ? `
            <div class="length-image-wrap">
                <img src="${data.image}" alt="Length comparison" class="length-comparison-image" id="lengthComparisonImage">
            </div>
        `
        : '';

    const lengthImage = document.getElementById('lengthComparisonImage');
    if (lengthImage) {
        lengthImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="length-comparison-options" id="lengthComparisonOptions">
            <button type="button" class="length-option-btn" data-item-id="${item1.id}">${item1.name}</button>
            <button type="button" class="length-option-btn" data-item-id="${item2.id}">${item2.name}</button>
        </div>
    `;

    document.querySelectorAll('.length-option-btn').forEach(btn => {
        btn.onclick = function () {
            if (hasAnswered) return;
            submitLengthComparisonAnswer(btn.dataset.itemId, question);
        };
    });
}

/**
 * Validate and submit length_comparison answer.
 * @param {string} selectedItemId - Selected item id
 * @param {object} question - Question object
 */
function submitLengthComparisonAnswer(selectedItemId, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = question.data?.correctAnswer;
    const isCorrect = selectedItemId === correctAnswer;

    document.querySelectorAll('.length-option-btn').forEach(btn => {
        btn.disabled = true;
        const optionId = btn.dataset.itemId;

        if (optionId === selectedItemId) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && optionId === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedItemId, {
        correctAnswer: getLengthComparisonPrompt(question),
        autoNext: question.autoNext
    });
}

/**
 * Display grid_length_comparison question.
 * @param {object} question - Question object
 */
function displayGridLengthComparisonQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const item1 = data.item1 || { id: 'item1', name: 'Item 1', blocks: '' };
    const item2 = data.item2 || { id: 'item2', name: 'Item 2', blocks: '' };

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = data.image
        ? `
            <div class="grid-length-image-wrap">
                <img src="${data.image}" alt="Grid length comparison" class="grid-length-image" id="gridLengthComparisonImage">
            </div>
        `
        : '';

    const gridImage = document.getElementById('gridLengthComparisonImage');
    if (gridImage) {
        gridImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const showBlockCount = data.showBlockCount === true;
    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="grid-length-comparison-wrap">
            ${showBlockCount ? `
                <div class="block-count-box">
                    <p>${item1.name}: <strong>${item1.blocks}</strong> blocks</p>
                    <p>${item2.name}: <strong>${item2.blocks}</strong> blocks</p>
                </div>
            ` : ''}
            <div class="grid-length-options" id="gridLengthOptions">
                <button type="button" class="grid-length-option-btn" data-item-id="${item1.id}">${item1.name}</button>
                <button type="button" class="grid-length-option-btn" data-item-id="${item2.id}">${item2.name}</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.grid-length-option-btn').forEach(btn => {
        btn.onclick = function () {
            if (hasAnswered) return;
            submitGridLengthComparisonAnswer(btn.dataset.itemId, question);
        };
    });
}

/**
 * Validate and submit grid_length_comparison answer.
 * @param {string} selectedItemId - Selected item id
 * @param {object} question - Question object
 */
function submitGridLengthComparisonAnswer(selectedItemId, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = question.data?.correctAnswer;
    const isCorrect = selectedItemId === correctAnswer;

    document.querySelectorAll('.grid-length-option-btn').forEach(btn => {
        btn.disabled = true;
        const optionId = btn.dataset.itemId;

        if (optionId === selectedItemId) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && optionId === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedItemId, {
        correctAnswer: getLengthComparisonPrompt(question),
        autoNext: question.autoNext
    });
}

/**
 * Build a friendly label for length comparison correct answer.
 * @param {object} question - Question object
 * @returns {string} Prompt text
 */
function getLengthComparisonPrompt(question) {
    const data = question.data || {};
    const item1 = data.item1 || {};
    const item2 = data.item2 || {};
    const correct = data.correctAnswer === item1.id ? item1 : item2;
    const relation = data.comparisonType || 'longer';

    if (!correct || !correct.name) return String(data.correctAnswer || '');

    if (typeof correct.blocks === 'number') {
        return `${correct.name} (${correct.blocks} blocks) is ${relation}`;
    }

    return `${correct.name} is ${relation}`;
}

/**
 * Display pictograph_reading question.
 * @param {object} question - Question object
 */
function displayPictographReadingQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const options = Array.isArray(data.options) ? data.options : [];

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = data.chartImage
        ? `
            <div class="pictograph-image-wrap">
                <img src="${data.chartImage}" alt="Pictograph chart" class="pictograph-image" id="pictographReadingImage">
            </div>
        `
        : '';

    const chartImage = document.getElementById('pictographReadingImage');
    if (chartImage) {
        chartImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="pictograph-options" id="pictographReadingOptions"></div>
    `;

    const optionsContainer = document.getElementById('pictographReadingOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pictograph-option-btn';
        btn.textContent = option;
        btn.dataset.answer = String(option);
        btn.onclick = function () {
            if (hasAnswered) return;
            submitPictographReadingAnswer(btn.dataset.answer, question);
        };
        optionsContainer.appendChild(btn);
    });
}

/**
 * Validate and submit pictograph_reading answer.
 * @param {string} selectedAnswer - Selected answer
 * @param {object} question - Question object
 */
function submitPictographReadingAnswer(selectedAnswer, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = String(question.data?.correctAnswer ?? '');
    const isCorrect = String(selectedAnswer) === correctAnswer;

    document.querySelectorAll('.pictograph-option-btn').forEach(btn => {
        btn.disabled = true;
        const answer = String(btn.dataset.answer || '');
        if (answer === String(selectedAnswer)) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && answer === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedAnswer, {
        correctAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Display pictograph_comparison question.
 * @param {object} question - Question object
 */
function displayPictographComparisonQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const options = Array.isArray(data.options) ? data.options : [];

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = data.chartImage
        ? `
            <div class="pictograph-compare-image-wrap">
                <img src="${data.chartImage}" alt="Pictograph comparison" class="pictograph-compare-image" id="pictographComparisonImage">
            </div>
        `
        : '';

    const chartImage = document.getElementById('pictographComparisonImage');
    if (chartImage) {
        chartImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="pictograph-compare-options" id="pictographCompareOptions"></div>
    `;

    const optionsContainer = document.getElementById('pictographCompareOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pictograph-compare-option-btn';
        btn.textContent = option;
        btn.dataset.answer = String(option);
        btn.onclick = function () {
            if (hasAnswered) return;
            submitPictographComparisonAnswer(btn.dataset.answer, question);
        };
        optionsContainer.appendChild(btn);
    });
}

/**
 * Validate and submit pictograph_comparison answer.
 * @param {string} selectedAnswer - Selected answer
 * @param {object} question - Question object
 */
function submitPictographComparisonAnswer(selectedAnswer, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctAnswer = String(question.data?.correctAnswer ?? '');
    const isCorrect = String(selectedAnswer) === correctAnswer;

    document.querySelectorAll('.pictograph-compare-option-btn').forEach(btn => {
        btn.disabled = true;
        const answer = String(btn.dataset.answer || '');
        if (answer === String(selectedAnswer)) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && answer === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedAnswer, {
        correctAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Display fill_in_sequence question.
 * @param {object} question - Question object
 */
function displayFillInSequenceQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const sequence = Array.isArray(data.sequence) ? data.sequence : [];

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="sequence-wrap">
            <div class="sequence-row" id="sequenceRow"></div>
            <button type="button" class="sequence-submit-btn" id="sequenceSubmitBtn">Check</button>
        </div>
    `;

    const sequenceRow = document.getElementById('sequenceRow');
    let blankIndex = 0;

    sequence.forEach(value => {
        const cell = document.createElement('div');
        cell.className = 'sequence-cell';

        if (value === null || value === undefined) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'sequence-input';
            input.dataset.blankIndex = String(blankIndex++);
            input.placeholder = '?';
            cell.appendChild(input);
        } else {
            cell.classList.add('filled');
            cell.textContent = String(value);
        }

        sequenceRow.appendChild(cell);
    });

    const submitBtn = document.getElementById('sequenceSubmitBtn');
    submitBtn.onclick = function () {
        if (hasAnswered) return;
        submitFillInSequenceAnswer(question);
    };
}

/**
 * Validate and submit fill_in_sequence answer.
 * @param {object} question - Question object
 */
function submitFillInSequenceAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const inputs = Array.from(document.querySelectorAll('.sequence-input'));
    const userAnswers = inputs.map(input => parseInt(input.value, 10));
    const correctAnswers = getExpectedSequenceAnswers(question);

    let isCorrect = userAnswers.length === correctAnswers.length;
    userAnswers.forEach((value, index) => {
        if (value !== correctAnswers[index]) {
            isCorrect = false;
        }
    });

    inputs.forEach((input, index) => {
        input.disabled = true;
        const current = parseInt(input.value, 10);
        if (current === correctAnswers[index]) {
            input.classList.add('correct');
        } else {
            input.classList.add('incorrect');
        }
    });

    const submitBtn = document.getElementById('sequenceSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, userAnswers.join(', '), {
        correctAnswer: correctAnswers.join(', '),
        autoNext: question.autoNext
    });
}

/**
 * Resolve expected answers for fill_in_sequence using provided answers or sequence math.
 * @param {object} question - Question object
 * @returns {number[]} Expected answers
 */
function getExpectedSequenceAnswers(question) {
    const data = question.data || {};
    const sequence = Array.isArray(data.sequence) ? [...data.sequence] : [];
    const provided = Array.isArray(data.correctAnswers) ? data.correctAnswers.map(v => parseInt(v, 10)) : [];
    const blanksCount = sequence.filter(v => v === null || v === undefined).length;

    if (provided.length === blanksCount) {
        return provided;
    }

    const step = Number.isFinite(data.step) ? data.step : 1;
    for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== null && sequence[i] !== undefined) continue;

        const prev = i > 0 ? sequence[i - 1] : null;
        const next = i < sequence.length - 1 ? sequence[i + 1] : null;

        if (typeof prev === 'number') {
            sequence[i] = prev + step;
        } else if (typeof next === 'number') {
            sequence[i] = next - step;
        }
    }

    return sequence.filter((_, index) => data.sequence[index] === null || data.sequence[index] === undefined);
}

/**
 * Display ten_decomposition question.
 * @param {object} question - Question object
 */
function displayTenDecompositionQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = data.showVisual && data.tenFrameImage
        ? `
            <div class="ten-visual-wrap">
                <img src="${data.tenFrameImage}" alt="Ten decomposition visual" class="ten-visual-image" id="tenVisualImage">
            </div>
        `
        : '';

    const tenImage = document.getElementById('tenVisualImage');
    if (tenImage) {
        tenImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="ten-decomposition-wrap">
            <div class="ten-question-format">${data.questionFormat || ''}</div>
            <div class="ten-input-row">
                <input type="number" id="tenDecompositionInput" class="ten-decomposition-input" placeholder="?">
                <button type="button" class="ten-submit-btn" id="tenDecompositionSubmitBtn">Check</button>
            </div>
        </div>
    `;

    const submitBtn = document.getElementById('tenDecompositionSubmitBtn');
    const input = document.getElementById('tenDecompositionInput');
    submitBtn.onclick = function () {
        if (hasAnswered) return;
        submitTenDecompositionAnswer(question);
    };
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') submitBtn.click();
    });
}

/**
 * Validate and submit ten_decomposition answer.
 * @param {object} question - Question object
 */
function submitTenDecompositionAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const input = document.getElementById('tenDecompositionInput');
    const submitBtn = document.getElementById('tenDecompositionSubmitBtn');
    const userAnswer = parseInt(input?.value, 10);
    const correctAnswer = getExpectedTenDecompositionAnswer(question);
    const isCorrect = userAnswer === correctAnswer;

    if (input) {
        input.disabled = true;
        input.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, userAnswer, {
        correctAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Resolve ten decomposition answer from question structure.
 * @param {object} question - Question object
 * @returns {number} Expected answer
 */
function getExpectedTenDecompositionAnswer(question) {
    const data = question.data || {};
    const declared = parseInt(data.correctAnswer, 10);

    // Trust authored JSON answer first when provided.
    if (Number.isFinite(declared)) {
        return declared;
    }

    const total = Number.isFinite(data.totalNumber) ? data.totalNumber : null;
    const format = String(data.questionFormat || '');
    const missing = String(data.missingPart || '').toLowerCase();

    if (missing === 'ones' && total !== null) {
        return total - 10;
    }
    if (missing === 'tens') {
        return 10;
    }
    if (missing === 'total') {
        const match = format.match(/10\s*and\s*(\d+)/i);
        if (match) {
            return 10 + parseInt(match[1], 10);
        }
    }

    return Number.isFinite(declared) ? declared : NaN;
}

/**
 * Display number_ordering question.
 * @param {object} question - Question object
 */
function displayNumberOrderingQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    orderingSelection = [];

    const data = question.data || {};
    const numbers = Array.isArray(data.numbers) ? [...data.numbers] : [];
    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = '';

    const container = document.getElementById('answersContainer');
    container.innerHTML = `
        <div class="ordering-wrap">
            <div class="ordering-picked" id="orderingPicked"></div>
            <div class="ordering-cards" id="orderingCards"></div>
            <div class="ordering-actions">
                <button type="button" class="ordering-reset-btn" id="orderingResetBtn">Reset</button>
                <button type="button" class="ordering-submit-btn" id="orderingSubmitBtn">Check</button>
            </div>
        </div>
    `;

    const cardsContainer = document.getElementById('orderingCards');
    numbers.forEach((num, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ordering-card-btn';
        btn.textContent = String(num);
        btn.dataset.value = String(num);
        btn.dataset.index = String(index);
        btn.onclick = function () {
            if (hasAnswered || btn.disabled) return;
            orderingSelection.push(Number(btn.dataset.value));
            btn.disabled = true;
            btn.classList.add('selected');
            renderOrderingSelection();
        };
        cardsContainer.appendChild(btn);
    });

    document.getElementById('orderingResetBtn').onclick = function () {
        if (hasAnswered) return;
        orderingSelection = [];
        document.querySelectorAll('.ordering-card-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');
        });
        renderOrderingSelection();
    };

    document.getElementById('orderingSubmitBtn').onclick = function () {
        if (hasAnswered) return;
        submitNumberOrderingAnswer(question);
    };

    renderOrderingSelection();
}

/**
 * Render selected number order slots.
 */
function renderOrderingSelection() {
    const picked = document.getElementById('orderingPicked');
    if (!picked) return;

    picked.innerHTML = '';
    orderingSelection.forEach(value => {
        const chip = document.createElement('span');
        chip.className = 'ordering-picked-chip';
        chip.textContent = String(value);
        picked.appendChild(chip);
    });
}

/**
 * Validate and submit number_ordering answer.
 * @param {object} question - Question object
 */
function submitNumberOrderingAnswer(question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const expected = Array.isArray(question.data?.correctOrder)
        ? question.data.correctOrder.map(v => Number(v))
        : [];

    let isCorrect = orderingSelection.length === expected.length;
    for (let i = 0; i < expected.length; i++) {
        if (orderingSelection[i] !== expected[i]) {
            isCorrect = false;
            break;
        }
    }

    document.querySelectorAll('.ordering-card-btn, .ordering-reset-btn, .ordering-submit-btn').forEach(btn => {
        btn.disabled = true;
    });

    const picked = document.getElementById('orderingPicked');
    if (picked) {
        picked.classList.add(isCorrect ? 'correct' : 'incorrect');
    }

    if (isCorrect) score++;

    showFeedback(isCorrect, orderingSelection.join(', '), {
        correctAnswer: expected.join(', '),
        autoNext: question.autoNext
    });
}

/**
 * Display clock_reading question.
 * @param {object} question - Question object
 */
function displayClockReadingQuestion(question) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const mode = data.questionMode || 'read';
    const options = Array.isArray(data.options) ? data.options : [];

    const imageContainer = document.getElementById('questionImage');
    imageContainer.innerHTML = `
        <div class="clock-image-wrap">
            ${data.clockImage ? `<img src="${data.clockImage}" alt="Clock" class="clock-image" id="clockQuestionImage">` : ''}
            ${data.showTips && Array.isArray(data.tips) && data.tips.length ? `
                <div class="clock-tips">
                    ${data.tips.map(tip => `<p class="clock-tip">${tip}</p>`).join('')}
                </div>
            ` : ''}
        </div>
    `;

    const clockImage = document.getElementById('clockQuestionImage');
    if (clockImage) {
        clockImage.onerror = function () {
            imageContainer.innerHTML = '<div class="image-error">Image not found</div>';
        };
    }

    const container = document.getElementById('answersContainer');
    if (mode === 'draw') {
        container.innerHTML = `
            <div class="clock-draw-wrap">
                <div class="clock-draw-grid" id="clockDrawGrid"></div>
            </div>
        `;

        const grid = document.getElementById('clockDrawGrid');
        for (let pos = 1; pos <= 12; pos++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'clock-position-btn';
            btn.textContent = String(pos);
            btn.dataset.position = String(pos);
            btn.onclick = function () {
                if (hasAnswered) return;
                submitClockDrawAnswer(pos, question);
            };
            grid.appendChild(btn);
        }
        return;
    }

    container.innerHTML = `<div class="clock-options" id="clockOptions"></div>`;
    const optionsWrap = document.getElementById('clockOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'clock-option-btn';
        btn.textContent = option;
        btn.dataset.value = String(option);
        btn.onclick = function () {
            if (hasAnswered) return;
            submitClockReadAnswer(btn.dataset.value, question);
        };
        optionsWrap.appendChild(btn);
    });
}

/**
 * Validate and submit clock_reading in read mode.
 * @param {string} selectedTime - Selected time label
 * @param {object} question - Question object
 */
function submitClockReadAnswer(selectedTime, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctTime = String(question.data?.correctTime || '').trim().toLowerCase();
    const selected = String(selectedTime || '').trim().toLowerCase();
    const isCorrect = selected === correctTime;

    document.querySelectorAll('.clock-option-btn').forEach(btn => {
        btn.disabled = true;
        const value = String(btn.dataset.value || '').trim().toLowerCase();
        if (value === selected) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && value === correctTime) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedTime, {
        correctAnswer: question.data?.correctTime || '',
        autoNext: question.autoNext
    });
}

/**
 * Validate and submit clock_reading in draw mode.
 * @param {number} selectedPosition - Selected clock position (1-12)
 * @param {object} question - Question object
 */
function submitClockDrawAnswer(selectedPosition, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    const correctPosition = getClockCorrectPosition(question.data || {});
    const isCorrect = selectedPosition === correctPosition;

    document.querySelectorAll('.clock-position-btn').forEach(btn => {
        btn.disabled = true;
        const pos = parseInt(btn.dataset.position, 10);
        if (pos === selectedPosition) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && pos === correctPosition) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedPosition, {
        correctAnswer: `Point to ${correctPosition}`,
        autoNext: question.autoNext
    });
}

/**
 * Resolve expected minute-hand position for clock draw questions.
 * @param {object} data - Question data
 * @returns {number} Clock position from 1..12
 */
function getClockCorrectPosition(data) {
    if (Number.isFinite(data.correctPosition)) {
        return data.correctPosition;
    }

    const minute = Number.isFinite(data.minute) ? data.minute : 0;
    if (minute === 0) return 12;
    if (minute === 30) return 6;
    if (minute === 15) return 3;
    if (minute === 45) return 9;

    const raw = Math.round(minute / 5);
    return raw === 0 ? 12 : raw;
}

/**
 * Display three_number_addition question.
 * @param {object} question - Question object
 */
function displayThreeNumberAdditionQuestion(question) {
    displayThreeNumberOperationQuestion(question, 'three_number_addition');
}

/**
 * Display three_number_subtraction question.
 * @param {object} question - Question object
 */
function displayThreeNumberSubtractionQuestion(question) {
    displayThreeNumberOperationQuestion(question, 'three_number_subtraction');
}

/**
 * Display mixed_operations question.
 * @param {object} question - Question object
 */
function displayMixedOperationsQuestion(question) {
    displayThreeNumberOperationQuestion(question, 'mixed_operations');
}

/**
 * Display a three-number operation question (addition/subtraction/mixed).
 * @param {object} question - Question object
 * @param {string} type - Operation type
 */
function displayThreeNumberOperationQuestion(question, type) {
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const data = question.data || {};
    const mode = String(data.answerMode || 'input').toLowerCase();
    const operation = getThreeNumberOperationMeta(data, type);

    renderThreeNumberStory(data);

    const container = document.getElementById('answersContainer');
    const modeClass = mode === 'full' ? 'full' : mode;
    container.innerHTML = `
        <div class="three-op-wrap">
            <div class="three-op-equation">
                <span class="three-op-num">${operation.num1}</span>
                <span class="three-op-operator">${operation.operator1}</span>
                <span class="three-op-num">${operation.num2}</span>
                <span class="three-op-operator">${operation.operator2}</span>
                <span class="three-op-num">${operation.num3}</span>
                <span class="three-op-operator">=</span>
                <span class="three-op-result">?</span>
            </div>
            ${data.showSteps ? `
                <div class="three-op-steps-note">
                    Step 1: ${operation.num1} ${operation.operator1} ${operation.num2} = ?<br>
                    Step 2: ? ${operation.operator2} ${operation.num3} = ?
                </div>
            ` : ''}
            ${data.showHints && Array.isArray(data.hints) && data.hints.length ? `
                <ul class="three-op-hints">${data.hints.map(h => `<li>${h}</li>`).join('')}</ul>
            ` : ''}
            <div class="three-op-answer-area mode-${modeClass}" id="threeOpAnswerArea"></div>
        </div>
    `;

    const answerArea = document.getElementById('threeOpAnswerArea');
    if (mode === 'mcq') {
        const options = Array.isArray(data.options) ? data.options : [];
        answerArea.innerHTML = `<div class="three-op-options" id="threeOpOptions"></div>`;
        const optionsWrap = document.getElementById('threeOpOptions');
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'three-op-option-btn';
            btn.textContent = String(option);
            btn.dataset.value = String(option);
            btn.onclick = function () {
                if (hasAnswered) return;
                submitThreeNumberOperationMcqAnswer(Number(btn.dataset.value), question, type);
            };
            optionsWrap.appendChild(btn);
        });
        return;
    }

    if (mode === 'steps') {
        answerArea.innerHTML = `
            <div class="three-op-step-inputs">
                <label class="three-op-input-label">Step 1 result</label>
                <input type="number" class="three-op-input" id="threeOpStep1Input" inputmode="numeric">
                <label class="three-op-input-label">Final answer${data.answerUnit ? ` (${data.answerUnit})` : ''}</label>
                <input type="number" class="three-op-input" id="threeOpFinalInput" inputmode="numeric">
                <button type="button" class="three-op-submit-btn" id="threeOpSubmitBtn">Check</button>
            </div>
        `;
        document.getElementById('threeOpSubmitBtn').onclick = function () {
            if (hasAnswered) return;
            submitThreeNumberOperationStepsAnswer(question, type);
        };
        return;
    }

    answerArea.innerHTML = `
        <div class="three-op-input-row">
            <label class="three-op-input-label">Answer${data.answerUnit ? ` (${data.answerUnit})` : ''}</label>
            <input type="number" class="three-op-input" id="threeOpFinalInput" inputmode="numeric">
            <button type="button" class="three-op-submit-btn" id="threeOpSubmitBtn">Check</button>
        </div>
    `;

    document.getElementById('threeOpSubmitBtn').onclick = function () {
        if (hasAnswered) return;
        submitThreeNumberOperationInputAnswer(question, type);
    };
}

/**
 * Render optional story images/text for three-number operation questions.
 * @param {object} data - Question data
 */
function renderThreeNumberStory(data) {
    const imageContainer = document.getElementById('questionImage');
    if (!data.visualStory || !Array.isArray(data.storyImages) || !data.storyImages.length) {
        imageContainer.innerHTML = '';
        return;
    }

    const storyText = Array.isArray(data.storyText) ? data.storyText : [];
    imageContainer.innerHTML = `
        <div class="three-op-story" id="threeOpStory"></div>
    `;

    const story = document.getElementById('threeOpStory');
    data.storyImages.forEach((src, index) => {
        const card = document.createElement('div');
        card.className = 'three-op-story-card';
        const text = storyText[index] ? `<p class="three-op-story-text">${storyText[index]}</p>` : '';
        card.innerHTML = `
            <img src="${src}" alt="Story step ${index + 1}" class="three-op-story-image">
            ${text}
        `;
        const img = card.querySelector('img');
        if (img) {
            img.onerror = function () {
                img.replaceWith(Object.assign(document.createElement('div'), {
                    className: 'image-error',
                    textContent: 'Image not found'
                }));
            };
        }
        story.appendChild(card);
    });
}

/**
 * Resolve operators and expected answers for three-number operations.
 * @param {object} data - Question data
 * @param {string} type - Operation type
 * @returns {object} Operation metadata
 */
function getThreeNumberOperationMeta(data, type) {
    const num1 = Number(data.num1 || 0);
    const num2 = Number(data.num2 || 0);
    const num3 = Number(data.num3 || 0);

    let operator1 = '+';
    let operator2 = '+';

    if (type === 'three_number_subtraction') {
        operator1 = '-';
        operator2 = '-';
    } else if (type === 'mixed_operations') {
        operator1 = data.operator1 === '-' ? '-' : '+';
        operator2 = data.operator2 === '-' ? '-' : '+';
    }

    const computedStep1 = operator1 === '+' ? (num1 + num2) : (num1 - num2);
    const computedFinal = operator2 === '+' ? (computedStep1 + num3) : (computedStep1 - num3);

    const step1 = Number.isFinite(data.step1Result) ? Number(data.step1Result) : computedStep1;
    const finalAnswer = Number.isFinite(data.finalAnswer) ? Number(data.finalAnswer) : computedFinal;

    return {
        num1,
        num2,
        num3,
        operator1,
        operator2,
        step1,
        finalAnswer
    };
}

/**
 * Validate and submit MCQ answer for three-number operation.
 * @param {number} selectedAnswer - Selected answer
 * @param {object} question - Question object
 * @param {string} type - Operation type
 */
function submitThreeNumberOperationMcqAnswer(selectedAnswer, question, type) {
    if (hasAnswered) return;
    hasAnswered = true;

    const meta = getThreeNumberOperationMeta(question.data || {}, type);
    const isCorrect = Number(selectedAnswer) === meta.finalAnswer;

    document.querySelectorAll('.three-op-option-btn').forEach(btn => {
        btn.disabled = true;
        const value = Number(btn.dataset.value);
        if (value === Number(selectedAnswer)) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (!isCorrect && value === meta.finalAnswer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) score++;

    showFeedback(isCorrect, selectedAnswer, {
        correctAnswer: meta.finalAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Validate and submit final-input answer for three-number operation.
 * @param {object} question - Question object
 * @param {string} type - Operation type
 */
function submitThreeNumberOperationInputAnswer(question, type) {
    if (hasAnswered) return;

    const input = document.getElementById('threeOpFinalInput');
    const value = parseInt(input?.value, 10);
    if (!Number.isFinite(value)) {
        alert('Please enter an answer');
        return;
    }

    hasAnswered = true;
    const meta = getThreeNumberOperationMeta(question.data || {}, type);
    const isCorrect = value === meta.finalAnswer;

    if (input) {
        input.disabled = true;
        input.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    const submit = document.getElementById('threeOpSubmitBtn');
    if (submit) submit.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, value, {
        correctAnswer: meta.finalAnswer,
        autoNext: question.autoNext
    });
}

/**
 * Validate and submit step-by-step answers for three-number operation.
 * @param {object} question - Question object
 * @param {string} type - Operation type
 */
function submitThreeNumberOperationStepsAnswer(question, type) {
    if (hasAnswered) return;

    const step1Input = document.getElementById('threeOpStep1Input');
    const finalInput = document.getElementById('threeOpFinalInput');
    const step1Value = parseInt(step1Input?.value, 10);
    const finalValue = parseInt(finalInput?.value, 10);

    if (!Number.isFinite(step1Value) || !Number.isFinite(finalValue)) {
        alert('Please complete both steps');
        return;
    }

    hasAnswered = true;
    const meta = getThreeNumberOperationMeta(question.data || {}, type);
    const isCorrect = step1Value === meta.step1 && finalValue === meta.finalAnswer;

    if (step1Input) {
        step1Input.disabled = true;
        step1Input.classList.add(step1Value === meta.step1 ? 'correct' : 'incorrect');
    }
    if (finalInput) {
        finalInput.disabled = true;
        finalInput.classList.add(finalValue === meta.finalAnswer ? 'correct' : 'incorrect');
    }
    const submit = document.getElementById('threeOpSubmitBtn');
    if (submit) submit.disabled = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, `${step1Value}, ${finalValue}`, {
        correctAnswer: `Step1: ${meta.step1}, Final: ${meta.finalAnswer}`,
        autoNext: question.autoNext
    });
}

/**
 * Select number in tap count question
 * @param {number} num - Selected number
 */
function selectNumber(num) {
    if (hasAnswered) return;

    // Clear previous selection
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Mark selected number
    document.querySelectorAll('.number-btn').forEach(btn => {
        if (parseInt(btn.textContent) === num) {
            btn.classList.add('selected');
        }
    });

    selectedNumber = num;
}

/**
 * Submit number answer
 */
function submitNumberAnswer() {
    if (hasAnswered) return;

    if (selectedNumber === null) {
        alert('Please select a number');
        return;
    }

    if (!currentTapQuestion) {
        console.error("❌ No active tap question");
        return;
    }

    handleAnswer(selectedNumber, {
        correctCount: currentTapQuestion.correctCount,
        autoNext: currentTapQuestion.autoNext === true
    });
}



/**
 * Handle answer selection
 * @param {any} selectedAnswer - Selected answer
 * @param {object} question - Question object
 */
function handleAnswer(selectedAnswer, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    // Check if correct
    const isCorrect =
        selectedAnswer === question.correctCount ||
        selectedAnswer === question.correctAnswer ||
        selectedAnswer === question.data?.correct ||
        selectedAnswer === question.data?.correctAnswer;


    // Apply visual feedback to selected button
    document.querySelectorAll('.number-btn').forEach(btn => {
        const btnValue = parseInt(btn.textContent);
        if (btnValue === selectedAnswer) {
            btn.classList.remove('selected');
            if (isCorrect) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('wrong');
            }
        }
    });

    // Disable all answer buttons
    document.querySelectorAll('.answer-btn, .number-btn, .submit-number-btn').forEach(btn => {
        btn.disabled = true;
    });

    // Update score if correct
    if (isCorrect) {
        score++;
    }

    // Show feedback
    showFeedback(isCorrect, selectedAnswer, question);
}

/**
 * Show feedback for answer
 * @param {boolean} isCorrect - Whether answer is correct
 * @param {any} selectedAnswer - Selected answer
 * @param {object} question - Question object
 */
function showFeedback(isCorrect, selectedAnswer, question) {
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackVideo = document.getElementById('feedbackVideo');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const correctAnswerDisplay = document.getElementById('correctAnswer');
    const numberPad = document.getElementById('numberPad');

    // Hide number pad
    if (numberPad) {
        numberPad.classList.add('hidden');
    }

    // Show feedback section
    feedbackSection.classList.remove('hidden');

    if (isCorrect) {
        // Success feedback with encouraging messages
        const encouragements = [
            '🎉 Perfect! You got it right!',
            '⭐ Excellent work, Amalia!',
            '🌟 Amazing answer!',
            '👏 Great job! Keep it up!',
            '🎊 You are awesome!',
            '💯 That\'s correct! Well done!'
        ];

        const randomMessage = encouragements[Math.floor(Math.random() * encouragements.length)];

        feedbackVideo.src = './corect1.mp4';
        feedbackVideo.play().catch(err => console.log('Video play error:', err));
        feedbackMessage.innerHTML = `<span style="font-size: 24px; color: #28a745; font-weight: 700;">${randomMessage}</span>`;
        correctAnswerDisplay.classList.add('hidden');

        playSuccessSound();
    } else {
        // Failure feedback with encouraging messages
        const tryAgainMessages = [
            '💪 Try again next time!',
            '🌱 Keep learning, you\'ll get better!',
            '📚 Let\'s practice more!',
            '🎯 Almost there! Try once more!',
            '✨ Great effort! Learning takes practice!'
        ];

        const randomTryMessage = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)];

        feedbackVideo.src = './V2Wrobg.mp4';
        feedbackVideo.play().catch(err => console.log('Video play error:', err));
        feedbackMessage.innerHTML = `<span style="font-size: 24px; color: #fd7e14; font-weight: 700;">${randomTryMessage}</span>`;

        const correctAns = question.correctCount !== undefined
            ? question.correctCount
            : (question.correctAnswer !== undefined ? question.correctAnswer : question.data?.correct);
        correctAnswerDisplay.innerHTML = `<span style="font-size: 18px; color: #667eea; font-weight: 600;">The correct answer is: <strong>${correctAns}</strong></span>`;
        correctAnswerDisplay.classList.remove('hidden');

        playTryAgainSound();
    }

    // Auto-move to next question if enabled
    if (question.autoNext) {
        setTimeout(() => {
            nextQuestion();
        }, 2500);
    }
}

/**
 * Move to next question
 */
function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

/**
 * Update progress bar
 */
function updateProgressBar() {
    const total = flattenedQuestions.length;
    const current = currentQuestionIndex + 1;
    const percentage = (current / total) * 100;

    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');

    if (progressFill) {
        progressFill.style.height = percentage + '%';
    }
    if (progressPercent) {
        progressPercent.textContent = Math.round(percentage) + '%';
    }
}

/**
 * End quiz and show results
 */
function endQuiz() {
    const total = flattenedQuestions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const stars = calculateStars(percentage);
    const outcome = percentage >= 60 ? 'success' : 'fail';

    // Debug logging
    console.log('Quiz Ended!');
    console.log('Score:', score);
    console.log('Total:', total);
    console.log('Percentage:', percentage);
    console.log('Stars:', stars);

    // Update progress
    updateLessonProgress(currentUnit, currentLesson, stars, percentage);

    // Store results in session for results page
    sessionStorage.setItem('quizScore', score);
    sessionStorage.setItem('quizTotal', total);
    sessionStorage.setItem('quizStars', stars);
    sessionStorage.setItem('quizOutcome', outcome);

    // Auto-open Unit 2 Lesson 2 when Unit 2 Lesson 1 finishes.
    if (currentUnit === 'unit2' && currentLesson === 'u2_l1') {
        sessionStorage.setItem('autoOpenNextLesson', 'u2_l2');
    } else {
        sessionStorage.removeItem('autoOpenNextLesson');
    }

    console.log('SessionStorage updated');
    console.log('quizScore:', sessionStorage.getItem('quizScore'));
    console.log('quizTotal:', sessionStorage.getItem('quizTotal'));
    console.log('quizStars:', sessionStorage.getItem('quizStars'));

    // Navigate to results
    navigateToResults();
}

/**
 * Play success sound
 */
function playSuccessSound() {
    const sound = document.getElementById('successSound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log('Audio play failed'));
    }
}

/**
 * Play try-again sound
 */
function playTryAgainSound() {
    const sound = document.getElementById('tryAgainSound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log('Audio play failed'));
    }
}

/**
 * Calculate stars based on percentage
 * @param {number} percentage - Percentage of correct answers (0-100)
 * @returns {number} Number of stars (0-3)
 */
function calculateStars(percentage) {
    if (percentage === 100) {
        return 3;  // Perfect score = 3 stars
    } else if (percentage >= 75) {
        return 3;  // 75-99% = 3 stars
    } else if (percentage >= 50) {
        return 2;  // 50-74% = 2 stars
    } else if (percentage >= 25) {
        return 1;  // 25-49% = 1 star
    } else {
        return 0;  // 0-24% = 0 stars
    }
}

/**
 * Navigate to results page
 */
function navigateToResults() {
    // Delay to allow animations
    console.log('Navigating to results page...');
    setTimeout(() => {
        console.log('Redirecting to results.html');
        window.location.href = 'results.html';
    }, 1000);  // Increased delay to 1 second
}

/**
 * Display number_flash question - Learning mode with numbers and labels
 * @param {object} question - Question object with numbers array
 */
function displayNumberFlashQuestion(question) {
    console.log("Number Flash Question:", question);

    // Hide number pad
    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const numbers = question.numbers || [];

    if (!numbers.length) {
        container.innerHTML = `<p style="color:red">⚠ No numbers found!</p>`;
        return;
    }

    // Grid
    const gridDiv = document.createElement('div');
    gridDiv.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
    margin-top: 30px;
    width: 100%;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
`;


    numbers.forEach((num) => {
        const card = document.createElement('div');
        card.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 25px;
    text-align: center;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    min-height: 130px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


        card.onmouseenter = () => card.style.transform = 'scale(1.08)';
        card.onmouseleave = () => card.style.transform = 'scale(1)';

        const valueDiv = document.createElement('div');
        valueDiv.style.cssText = 'font-size:48px;font-weight:900;';
        valueDiv.textContent = num.value;

        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'font-size:20px;margin-top:8px;';
        labelDiv.textContent = num.label;

        card.appendChild(valueDiv);
        card.appendChild(labelDiv);

        // 🔊 Optional sound or animation on click
        card.onclick = () => {
            card.style.background = '#28a745';
            setTimeout(() => {
                card.style.background =
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 400);
        };

        gridDiv.appendChild(card);
    });

    container.appendChild(gridDiv);

    // 🔊 Play learning sound if enabled
    if (question.sound !== false) {
        playNumberFlashSound(numbers);
    }
}


/**
 * Display drag_match question - Drag images to match correct numbers
 * @param {object} question - Question object with pairs array
 */
function shuffleArray(array) {
    const arr = [...array]; // clone
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function displayDragMatchQuestion(question) {

    const numberPad = document.getElementById('numberPad');
    if (numberPad) numberPad.classList.add('hidden');

    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    const pairs = shuffleArray(question.pairs || []);
    // ✅ initialize state
    dragMatchState.total = pairs.length;
    dragMatchState.correct = 0;
    dragMatchState.dropped = 0;

    const matchContainer = document.createElement('div');
    matchContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 30px;
        align-items: start;
    `;

    // --------------------
    // Images (Draggable)
    // --------------------
    const imagesDiv = document.createElement('div');
    imagesDiv.style.cssText = 'display:flex; flex-direction:column; gap:20px;';
    imagesDiv.innerHTML = '<h3 style="text-align:center;color:#667eea;">📸 Images</h3>';

    pairs.forEach((pair, index) => {
        const imageCard = document.createElement('div');
        imageCard.draggable = true;
        imageCard.dataset.index = index;
        imageCard.style.cssText = `
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 15px;
            background: white;
            cursor: grab;
        `;

        imageCard.ondragstart = (e) => {
            e.dataTransfer.setData('pairIndex', index);
        };

        const img = document.createElement('img');
        img.src = pair.image;
        img.style.cssText = 'height:80px; object-fit:contain;';
        imageCard.appendChild(img);

        imagesDiv.appendChild(imageCard);
    });

    // --------------------
    // Drop Zones (Numbers)
    // --------------------
    const numbersDiv = document.createElement('div');
    numbersDiv.style.cssText = 'display:flex; flex-direction:column; gap:20px;';
    numbersDiv.innerHTML = '<h3 style="text-align:center;color:#764ba2;">🔢 Numbers</h3>';

    const uniqueNumbers = shuffleArray([
        ...new Set(pairs.map(p => p.correct))
    ]);

    uniqueNumbers.forEach(num => {
        const dropZone = document.createElement('div');
        dropZone.dataset.number = num;
        dropZone.style.cssText = `
            border: 3px dashed #764ba2;
            border-radius: 10px;
            padding: 20px;
            min-height: 100px;
            text-align: center;
            background: #f5f5f5;
        `;

        dropZone.innerHTML = `<strong style="font-size:40px;">${num}</strong>`;

        dropZone.ondragover = e => e.preventDefault();

        dropZone.ondrop = (e) => {
            e.preventDefault();

            const pairIndex = Number(e.dataTransfer.getData('pairIndex'));
            const draggedPair = pairs[pairIndex];

            if (!draggedPair || dropZone.classList.contains('filled')) return;

            dragMatchState.dropped++;

            const imgEl = document.createElement('img');
            imgEl.src = draggedPair.image;
            imgEl.style.cssText = 'height:50px; margin-top:10px;';
            dropZone.appendChild(imgEl);
            dropZone.classList.add('filled');

            // ✅ check correctness
            if (draggedPair.correct === num) {
                dragMatchState.correct++;
                dropZone.style.borderColor = 'green';
            } else {
                dropZone.style.borderColor = 'red';
            }

            // ✅ when all images placed → evaluate once
            if (dragMatchState.dropped === dragMatchState.total) {
                const isCorrect = dragMatchState.correct === dragMatchState.total;
                finalizeDragMatch(isCorrect, question);
            }
        };

        numbersDiv.appendChild(dropZone);
    });

    matchContainer.appendChild(imagesDiv);
    matchContainer.appendChild(numbersDiv);
    container.appendChild(matchContainer);
}

function finalizeDragMatch(isCorrect, question) {
    hasAnswered = true;

    if (isCorrect) score++;

    showFeedback(isCorrect, null, question);

    // lock drag
    document.querySelectorAll('[draggable]').forEach(el => {
        el.draggable = false;
        el.style.opacity = 0.5;
    });
}

/**
 * Play sound for number flash
 */
function playNumberFlashSound(numbers) {
    // Implement sound playback if needed
    console.log('Playing number flash sounds for:', numbers);
}
