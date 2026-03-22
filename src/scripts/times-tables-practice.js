const params = new URLSearchParams(window.location.search);
const type = params.get('type'); // 'mult' or 'div'
const num = parseInt(params.get('num')) || 1;

document.getElementById('practice-title').innerText = type === 'mult' ? `Multiplication by ${num}` : `Division by ${num}`;

let currentQuestion = 0;
let score = 0;
const totalQuestions = 10;
let answeredIncorrectly = false;
let questions = [];

const icons = ['🍎', '🐶', '⭐', '🚗', '🎈', '🍪', '🐱', '⚽', '🍓', '🤖'];

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function generateQuestions() {
    questions = [];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    
    for (let i = 1; i <= 10; i++) {
        let qType = i <= 3 ? 'visual' : (i <= 6 ? 'group' : 'equation');
        
        let q = { type: qType, id: i, icon: icon };

        if (type === 'mult') {
            q.a = num;
            q.b = i;
            q.answer = num * i;
            q.text = `${num} × ${i} = `;
        } else {
            // division: num is divisor
            q.answer = i; // quotient
            q.a = num * i; // dividend
            q.b = num; // divisor
            q.text = `${q.a} ÷ ${q.b} = `;
        }
        questions.push(q);
    }
    // Shuffle the items for 1 to 10
    questions.sort(() => Math.random() - 0.5);
    // Limit to exactly 10 questions (which they are)
}

function renderVisuals(q) {
    const visualDiv = document.getElementById('visual-display');
    visualDiv.innerHTML = '';
    
    if (q.type === 'visual') {
        if (type === 'mult') {
            // Grid of q.a rows x q.b cols
            let html = '<div style="display:flex; flex-direction:column; gap:10px; align-items:center;">';
            for (let r = 0; r < q.a; r++) {
                html += '<div style="display:flex; gap:10px;">';
                for (let c = 0; c < q.b; c++) {
                    html += `<span class="visual-item">${q.icon}</span>`;
                }
                html += '</div>';
            }
            html += '</div>';
            visualDiv.innerHTML = html;
        } else {
            // division visual
            let html = `<p>Share ${q.a} equally into ${q.b} groups:</p>`;
            html += '<div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">';
            for (let g = 0; g < q.b; g++) {
                html += '<div class="group-box">';
                for (let k = 0; k < q.answer; k++) {
                    html += `<span class="visual-item">${q.icon}</span>`;
                }
                html += '</div>';
            }
            html += '</div>';
            visualDiv.innerHTML = html;
        }
    } else if (q.type === 'group') {
        if (type === 'mult') {
            let html = '<div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">';
            for (let g = 0; g < q.a; g++) {
                html += '<div class="group-box">';
                for (let k = 0; k < q.b; k++) {
                    html += `<span class="visual-item">${q.icon}</span>`;
                }
                html += '</div>';
            }
            html += '</div>';
            visualDiv.innerHTML = html;
        } else {
             // division grouping
             let html = `<p>Divide ${q.a} into groups of ${q.b}:</p>`;
             html += '<div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">';
             for (let g = 0; g < q.answer; g++) {
                 html += '<div class="group-box">';
                 for (let k = 0; k < q.b; k++) {
                     html += `<span class="visual-item">${q.icon}</span>`;
                 }
                 html += '</div>';
             }
             html += '</div>';
             visualDiv.innerHTML = html;
        }
    }
}

function loadQuestion() {
    if (currentQuestion >= totalQuestions) {
        showResults();
        return;
    }

    const q = questions[currentQuestion];
    answeredIncorrectly = false;
    
    document.getElementById('current-q').innerText = currentQuestion + 1;
    document.getElementById('progress-bar').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    
    renderVisuals(q);
    
    document.getElementById('equation-text').innerText = q.text;
    const input = document.getElementById('answer-input');
    input.value = '';
    input.className = '';
    input.disabled = false;
    input.focus();
    
    document.getElementById('feedbackSection').style.display = 'none';
    const feedbackVideo = document.getElementById('feedbackVideo');
    if (feedbackVideo) {
        feedbackVideo.pause();
        feedbackVideo.currentTime = 0;
    }
    
    document.getElementById('check-btn').style.display = 'inline-block';
    document.getElementById('check-btn').innerText = 'Check Answer';
    document.getElementById('check-btn').onclick = checkAnswer;
}

function showFeedbackVideo(isCorrect) {
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackVideo = document.getElementById('feedbackVideo');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const input = document.getElementById('answer-input');
    const btn = document.getElementById('check-btn');

    feedbackSection.style.display = 'flex';
    btn.style.display = 'none'; // Hide check button temporarily

    if (isCorrect) {
        const encouragements = [
            '🎉 Perfect! You got it right!',
            '⭐ Excellent work!',
            '🌟 Amazing answer!',
            '👏 Great job! Keep it up!'
        ];
        const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];

        feedbackVideo.src = 'corect1.mp4';
        feedbackMessage.innerHTML = `<span style="color: #4caf50;">${randomMsg}</span>`;
        if(feedbackVideo.play) feedbackVideo.play().catch(e => console.log('Video play error:', e));

        // Manual next question (no auto-advance)
        btn.style.display = 'inline-block';
        btn.innerText = 'Next Question';
        btn.onclick = () => {
            currentQuestion++;
            loadQuestion();
        };

    } else {
        const tryMsgs = [
            '💪 Try again next time!',
            '🌱 Keep learning, you\'ll get better!',
            '🎯 Almost there! Try once more!'
        ];
        const randomMsg = tryMsgs[Math.floor(Math.random() * tryMsgs.length)];

        feedbackVideo.src = 'V2Wrobg.mp4';
        feedbackMessage.innerHTML = `<span style="color: #ff5252;">${randomMsg}</span>`;
        if(feedbackVideo.play) feedbackVideo.play().catch(e => console.log('Video play error:', e));

        // Let them try again after 2.5s
        setTimeout(() => {
            feedbackSection.style.display = 'none';
            btn.style.display = 'inline-block';
            input.value = '';
            input.focus();
        }, 2500);
    }
}

function checkAnswer() {
    const q = questions[currentQuestion];
    const input = document.getElementById('answer-input');
    const ans = parseInt(input.value);

    if (isNaN(ans)) return;

    if (ans === q.answer) {
        input.className = 'correct';
        input.disabled = true;
        
        playSound('sound-correct');
        showFeedbackVideo(true);

        if (!answeredIncorrectly) {
            score++;
            document.getElementById('score').innerText = score;
        }
    } else {
        input.classList.remove('error');
        void input.offsetWidth; // trigger reflow
        input.classList.add('error');
        answeredIncorrectly = true;
        
        playSound('sound-wrong');
        showFeedbackVideo(false);
    }
}

document.getElementById('answer-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const btn = document.getElementById('check-btn');
        btn.click();
    }
});

function showResults() {
    document.getElementById('practice-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    // Play final sound
    playSound('sound-final');
    
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('final-score-value').innerText = score;
    
    let msg = '';
    if (score === 10) msg = "Perfect! You're a math superstar! 🌟";
    else if (score >= 8) msg = "Excellent work! Keep it up! 💪";
    else if (score >= 6) msg = "Good job! Practice makes perfect! 📚";
    else msg = "Keep practicing! You're getting better! 🎯";
    
    document.getElementById('results-message').innerText = msg;
}

// Init
generateQuestions();
loadQuestion();
