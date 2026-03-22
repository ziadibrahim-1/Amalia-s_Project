const multGrid = document.getElementById('multiplication-grid');
const divGrid = document.getElementById('division-grid');

const multColors = [
    'linear-gradient(135deg, #e0f7fa 0%, #ffc0cb 100%)', // T1
    'linear-gradient(135deg, #ffc0cb 0%, #ffe4e1 100%)', // T2
    'linear-gradient(135deg, #fffdd0 0%, #ffdab9 100%)', // T3
    'linear-gradient(135deg, #ff7f50 0%, #87ceeb 100%)', // T4
    'linear-gradient(135deg, #dda0dd 0%, #add8e6 100%)', // T5
    'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)', // T6
    'linear-gradient(135deg, #87cefa 0%, #e0ffff 100%)', // T7
    'linear-gradient(135deg, #98fb98 0%, #afeeee 100%)', // T8
    'linear-gradient(135deg, #ffb6c1 0%, #ffffe0 100%)', // T9
    'linear-gradient(135deg, #e0ffff 0%, #dda0dd 100%)'  // T10
];

const divColors = [
    'linear-gradient(135deg, #ffffe0 0%, #ffd700 100%)', // D1
    'linear-gradient(135deg, #ffdab9 0%, #ff6347 100%)', // D2
    'linear-gradient(135deg, #e6e6fa 0%, #dda0dd 100%)', // D3
    'linear-gradient(135deg, #ffc0cb 0%, #ff69b4 100%)', // D4
    'linear-gradient(135deg, #90ee90 0%, #3cb371 100%)', // D5
    'linear-gradient(135deg, #add8e6 0%, #00ffff 100%)', // D6
    'linear-gradient(135deg, #87ceeb 0%, #4682b4 100%)', // D7
    'linear-gradient(135deg, #dda0dd 0%, #ee82ee 100%)', // D8
    'linear-gradient(135deg, #ffb6c1 0%, #ff4500 100%)', // D9
    'linear-gradient(135deg, #ffffe0 0%, #ffa500 100%)'  // D10
];

const getDifficulty = (num) => {
    if ([1, 2, 5, 10].includes(num)) return 'Easy ⭐';
    if ([3, 4, 6].includes(num)) return 'Medium ⭐⭐';
    return 'Hard ⭐⭐⭐';
};

function createCard(type, num, color) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = 'times-tables-practice.html?type=' + type + '&num=' + num;
    card.style.background = color;

    const title = type === 'mult' ? `Table ${num}` : `Divisor ÷${num}`;
    const range = type === 'mult' ? `${num}×1 to ${num}×10` : `${num}÷${num} to ${num*10}÷${num}`;
    const diff = getDifficulty(num);

    card.innerHTML = `
        <h3>${title}</h3>
        <div class="range">${range}</div>
        <div class="difficulty">${diff}</div>
    `;
    return card;
}

for (let i = 1; i <= 10; i++) {
    multGrid.appendChild(createCard('mult', i, multColors[i-1]));
    divGrid.appendChild(createCard('div', i, divColors[i-1]));
}