// ===================================
// QUESTION BANK FOR AMALIA'S QUIZ
// ===================================
// All questions are organized by difficulty level and curriculum topic

const quizData = {
    easy: [
        // Topic: Counting Numbers 0-10
        {
            id: 1,
            question: "Count the apples.",
            image: "🍎🍎🍎",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Counting"
        },
        {
            id: 31,
            question: "Match the number to the group.",
            type: "matching",
            topic: "Counting",
            pairs: [
                { left: "🍎", right: "1" },
                { left: "🍎🍎", right: "2" },
                { left: "🍎🍎🍎", right: "3" }
            ]
        },
        {
            id: 2,
            question: "Count the stars.",
            image: "⭐⭐⭐⭐",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 3,
            question: "Count the balloons.",
            image: "🎈🎈",
            correctAnswer: "2",
            options: ["1", "2", "3"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 4,
            question: "What comes after 5?",
            image: "5️⃣ ?",
            correctAnswer: "6",
            options: ["5", "6", "7"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 5,
            question: "Which number is bigger: 3 or 5?",
            image: "3️⃣ 5️⃣",
            correctAnswer: "5",
            options: ["3", "5"],
            topic: "Comparing",
            type: "multiple-choice"
        },

        // Topic: Recognizing Numbers
        {
            id: 6,
            question: "What number is this?",
            image: "7️⃣",
            correctAnswer: "Seven",
            options: ["Six", "Seven", "Eight"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },
        {
            id: 7,
            question: "How many red dots?",
            image: "🔴",
            correctAnswer: "1",
            options: ["1", "2", "3"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },
        {
            id: 8,
            question: "What number is this?",
            image: "9️⃣",
            correctAnswer: "Nine",
            options: ["Eight", "Nine", "Ten"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },

        // Topic: Simple Addition
        {
            id: 9,
            question: "Add them up. 2 + 1 = ?",
            image: "🍎🍎 + 🍎",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 10,
            question: "Add them up. 1 + 2 = ?",
            image: "🎈 + 🎈🎈",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Addition",
            type: "multiple-choice"
        },

        // Topic: Simple Subtraction
        {
            id: 11,
            question: "Take away. 5 - 2 = ?",
            image: "🍎🍎🍎🍎🍎 - 🍎🍎",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 12,
            question: "Take away. 4 - 1 = ?",
            image: "🎈🎈🎈🎈 - 🎈",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Subtraction",
            type: "multiple-choice"
        },

        // Topic: Understanding Zero
        {
            id: 13,
            question: "What number is this?",
            image: "0️⃣",
            correctAnswer: "Zero",
            options: ["One", "Zero", "Two"],
            topic: "Understanding Zero",
            type: "multiple-choice"
        },
        {
            id: 14,
            question: "I eat all 3 apples. How many are left?",
            image: "🍎🍎🍎 - 🍎🍎🍎",
            correctAnswer: "0",
            options: ["1", "0", "2"],
            topic: "Understanding Zero",
            type: "multiple-choice"
        },

        // Topic: Positions and Directions
        {
            id: 15,
            question: "Which is on the right?",
            image: "🐱 🐶",
            correctAnswer: "Dog",
            options: ["Cat", "Dog"],
            topic: "Positions",
            type: "multiple-choice"
        },
        {
            id: 16,
            question: "Is the star above or below?",
            image: "⭐\n●",
            correctAnswer: "Above",
            options: ["Above", "Below"],
            topic: "Positions",
            type: "multiple-choice"
        },

        // Topic: Comparing Lengths
        {
            id: 17,
            question: "Which line is longer?",
            image: "📏 long\n📏 short",
            correctAnswer: "The first one",
            options: ["The first one", "The second one"],
            topic: "Comparing Lengths",
            type: "multiple-choice"
        },

        // Topic: Simple Data Representation
        {
            id: 18,
            question: "Count the red circles.",
            image: "🔴🔴🔴",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Data",
            type: "multiple-choice"
        },

        // Topic: Number Bonds
        {
            id: 19,
            question: "2 + ? = 5. What is missing?",
            image: "2️⃣ + ?",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 20,
            question: "1 + ? = 4. What is missing?",
            image: "1️⃣ + ?",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },

        // Additional easy questions (21-30)
        {
            id: 21,
            question: "Count the flowers.",
            image: "🌸🌸🌸🌸🌸",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 22,
            question: "Which is bigger? 2 or 6?",
            image: "2️⃣ 6️⃣",
            correctAnswer: "6",
            options: ["2", "6"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 23,
            question: "Add them up. 3 + 2 = ?",
            image: "🍎🍎🍎 + 🍎🍎",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 24,
            question: "Take away. 6 - 1 = ?",
            image: "🎈🎈🎈🎈🎈🎈 - 🎈",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 25,
            question: "Count the stars.",
            image: "⭐⭐⭐⭐⭐⭐",
            correctAnswer: "6",
            options: ["5", "6", "7"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 26,
            question: "What comes after 7?",
            image: "7️⃣ ?",
            correctAnswer: "8",
            options: ["7", "8", "9"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 27,
            question: "How many toys?",
            image: "🧸🧸🧸",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 28,
            question: "Is the cat above or below?",
            image: "🐱\n●",
            correctAnswer: "Above",
            options: ["Above", "Below"],
            topic: "Positions",
            type: "multiple-choice"
        },
        {
            id: 29,
            question: "Add them up. 0 + 5 = ?",
            image: "0️⃣ + 5️⃣",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 30,
            question: "Take away. 3 - 3 = ?",
            image: "🍎🍎🍎 - 🍎🍎🍎",
            correctAnswer: "0",
            options: ["0", "1", "2"],
            topic: "Subtraction",
            type: "multiple-choice"
        },

        // Matching Questions (31-33)

        {
            id: 32,
            question: "Match the word to the number.",
            type: "matching",
            topic: "Recognizing Numbers",
            pairs: [
                { left: "One", right: "1️⃣" },
                { left: "Two", right: "2️⃣" },
                { left: "Three", right: "3️⃣" }
            ]
        },
        {
            id: 33,
            question: "Match the problem to the answer.",
            type: "matching",
            topic: "Addition",
            pairs: [
                { left: "1 + 1", right: "2" },
                { left: "2 + 1", right: "3" },
                { left: "1 + 2", right: "3" }
            ]
        }
    ],

    medium: [
        // Topic: Counting Numbers 0-10
        {
            id: 1,
            question: "Count all the apples.",
            image: "🍎🍎🍎🍎🍎",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 2,
            question: "Count the flowers.",
            image: "🌸🌸🌸🌸🌸🌸",
            correctAnswer: "6",
            options: ["5", "6", "7"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 3,
            question: "What comes before 8?",
            image: "? 8️⃣",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 4,
            question: "What is in the middle? 4, ?, 6",
            image: "4️⃣ ? 6️⃣",
            correctAnswer: "5",
            options: ["4", "5", "7"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 5,
            question: "Which is smaller? 7 or 4?",
            image: "7️⃣ 4️⃣",
            correctAnswer: "4",
            options: ["7", "4"],
            topic: "Comparing",
            type: "multiple-choice"
        },

        // Topic: Recognizing Numbers
        {
            id: 6,
            question: "What number is this?",
            image: "8️⃣",
            correctAnswer: "Eight",
            options: ["Seven", "Eight", "Nine"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },
        {
            id: 7,
            question: "Find the number 10.",
            image: "10️⃣",
            correctAnswer: "10",
            options: ["9", "10"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },
        {
            id: 8,
            question: "What number is this?",
            image: "6️⃣",
            correctAnswer: "Six",
            options: ["Five", "Six", "Seven"],
            topic: "Recognizing Numbers",
            type: "multiple-choice"
        },

        // Topic: Simple Addition
        {
            id: 9,
            question: "Add them up. 3 + 2 = ?",
            image: "🍎🍎🍎 + 🍎🍎",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 10,
            question: "Add them up. 4 + 1 = ?",
            image: "🎈🎈🎈🎈 + 🎈",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Addition",
            type: "multiple-choice"
        },

        // Topic: Simple Subtraction
        {
            id: 11,
            question: "Take away. 6 - 2 = ?",
            image: "🍎🍎🍎🍎🍎🍎 - 🍎🍎",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 12,
            question: "Take away. 7 - 3 = ?",
            image: "🎈🎈🎈🎈🎈🎈🎈 - 🎈🎈🎈",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Subtraction",
            type: "multiple-choice"
        },

        // Topic: Number Bonds
        {
            id: 13,
            question: "3 + ? = 7. What is missing?",
            image: "3️⃣ + ?",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 14,
            question: "2 + ? = 6. What is missing?",
            image: "2️⃣ + ?",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },

        // Topic: Positions and Directions
        {
            id: 15,
            question: "Which is behind?",
            image: "🐕 ... 🐈",
            correctAnswer: "Cat",
            options: ["Dog", "Cat"],
            topic: "Positions",
            type: "multiple-choice"
        },
        {
            id: 16,
            question: "Is this left or right? 🚗",
            image: "←→",
            correctAnswer: "Left",
            options: ["Left", "Right"],
            topic: "Positions",
            type: "multiple-choice"
        },

        // Topic: Comparing Lengths
        {
            id: 17,
            question: "Which is shorter?",
            image: "📏 long\n📏 short",
            correctAnswer: "The second one",
            options: ["The first one", "The second one"],
            topic: "Comparing Lengths",
            type: "multiple-choice"
        },

        // Topic: Simple Data Representation
        {
            id: 18,
            question: "Count the toys.",
            image: "🧸🧸🧸🧸",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Data",
            type: "multiple-choice"
        },

        {
            id: 19,
            question: "Count the stars.",
            image: "⭐⭐⭐⭐⭐",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Data",
            type: "multiple-choice"
        },
        {
            id: 20,
            question: "Add them up. 5 + 2 = ?",
            image: "5️⃣ + 2️⃣",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Addition",
            type: "multiple-choice"
        },

        // Additional medium questions (21-30)
        {
            id: 21,
            question: "Count all the toys.",
            image: "🧸🧸🧸🧸🧸",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 22,
            question: "Is the number bigger? 5 or 3?",
            image: "5️⃣ 3️⃣",
            correctAnswer: "5",
            options: ["3", "5"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 23,
            question: "Take away. 8 - 2 = ?",
            image: "🍎🍎🍎🍎🍎🍎🍎🍎 - 🍎🍎",
            correctAnswer: "6",
            options: ["5", "6", "7"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 24,
            question: "What number is before 5?",
            image: "? 5️⃣",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 25,
            question: "3 + ? = 9. What is missing?",
            image: "3️⃣ + ?",
            correctAnswer: "6",
            options: ["5", "6", "7"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 26,
            question: "Count the balloons.",
            image: "🎈🎈🎈🎈🎈🎈🎈",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 27,
            question: "Which is on the left?",
            image: "🐶 🐱",
            correctAnswer: "Dog",
            options: ["Cat", "Dog"],
            topic: "Positions",
            type: "multiple-choice"
        },
        {
            id: 28,
            question: "Add them up. 2 + 5 = ?",
            image: "🎈🎈 + 🎈🎈🎈🎈🎈",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 29,
            question: "Take away. 5 - 3 = ?",
            image: "🔴🔴🔴🔴🔴 - 🔴🔴🔴",
            correctAnswer: "2",
            options: ["1", "2", "3"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 30,
            question: "What is bigger? 8 or 2?",
            image: "8️⃣ 2️⃣",
            correctAnswer: "8",
            options: ["2", "8"],
            topic: "Comparing",
            type: "multiple-choice"
        },

        // Matching Questions (31-32)
        {
            id: 31,
            question: "Match the pairs that make 10.",
            type: "matching",
            topic: "Number Bonds",
            pairs: [
                { left: "5 + ?", right: "5" },
                { left: "7 + ?", right: "3" },
                { left: "4 + ?", right: "6" }
            ]
        },
        {
            id: 32,
            question: "Match the position word to the emoji.",
            type: "matching",
            topic: "Positions",
            pairs: [
                { left: "Top", right: "⬆️" },
                { left: "Bottom", right: "⬇️" },
                { left: "Middle", right: "➡️" }
            ]
        }
    ],

    hard: [
        // Topic: Advanced Counting and Numbers
        {
            id: 1,
            question: "Count all the apples.",
            image: "🍎🍎🍎🍎🍎🍎🍎",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 2,
            question: "Which is smallest? 3, 8, 1",
            image: "3️⃣ 8️⃣ 1️⃣",
            correctAnswer: "1",
            options: ["3", "8", "1"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 3,
            question: "Which is the biggest? 5, 9, 6",
            image: "5️⃣ 9️⃣ 6️⃣",
            correctAnswer: "9",
            options: ["5", "9", "6"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 4,
            question: "How many more apples does 3 have than 1?",
            image: "🍎🍎🍎 vs 🍎",
            correctAnswer: "2",
            options: ["1", "2", "3"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 5,
            question: "Which is the smallest? 2, 8, 4",
            image: "2️⃣ 8️⃣ 4️⃣",
            correctAnswer: "2",
            options: ["2", "8", "4"],
            topic: "Comparing",
            type: "multiple-choice"
        },

        // Topic: Complex Addition
        {
            id: 6,
            question: "Add them up. 4 + 3 = ?",
            image: "4️⃣ + 3️⃣",
            correctAnswer: "7",
            options: ["6", "7", "8"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 7,
            question: "Add them up. 5 + 4 = ?",
            image: "5️⃣ + 4️⃣",
            correctAnswer: "9",
            options: ["8", "9", "10"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 8,
            question: "Add them up. 6 + 2 = ?",
            image: "6️⃣ + 2️⃣",
            correctAnswer: "8",
            options: ["7", "8", "9"],
            topic: "Addition",
            type: "multiple-choice"
        },

        // Topic: Complex Subtraction
        {
            id: 9,
            question: "Take away. 8 - 3 = ?",
            image: "8️⃣ - 3️⃣",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 10,
            question: "Take away. 9 - 4 = ?",
            image: "9️⃣ - 4️⃣",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Subtraction",
            type: "multiple-choice"
        },

        // Topic: Number Bonds - Making 10
        {
            id: 11,
            question: "5 + ? = 10. What is missing?",
            image: "5️⃣ + ?",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 12,
            question: "3 + ? = 8. What is missing?",
            image: "3️⃣ + ?",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 13,
            question: "4 + ? = 9. What is missing?",
            image: "4️⃣ + ?",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },

        // Topic: Advanced Positions
        {
            id: 14,
            question: "Which is in front?",
            image: "🐕 🐈",
            correctAnswer: "Dog",
            options: ["Dog", "Cat"],
            topic: "Positions",
            type: "multiple-choice"
        },
        {
            id: 15,
            question: "Is the star above or below?",
            image: "⭐\n●",
            correctAnswer: "Above",
            options: ["Above", "Below"],
            topic: "Positions",
            type: "multiple-choice"
        },

        // Topic: Comparing Lengths and Sizes
        {
            id: 16,
            question: "Which line is much longer?",
            image: "📏 long\n📏 short",
            correctAnswer: "The first one",
            options: ["The first one", "The second one"],
            topic: "Comparing Lengths",
            type: "multiple-choice"
        },
        {
            id: 17,
            question: "Which is bigger? 🐘 or 🐜?",
            image: "🐘 vs 🐜",
            correctAnswer: "Elephant",
            options: ["Elephant", "Ant"],
            topic: "Comparing Lengths",
            type: "multiple-choice"
        },

        // Topic: Data Representation
        {
            id: 18,
            question: "Count and add. 2 + 3 = ?",
            image: "🍎🍎 + 🍎🍎🍎",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Data",
            type: "multiple-choice"
        },
        {
            id: 19,
            question: "Count and take away. 6 - 3 = ?",
            image: "🎈🎈🎈🎈🎈🎈 - 🎈🎈🎈",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Data",
            type: "multiple-choice"
        },
        {
            id: 20,
            question: "Add them up. 3 + 3 + 2 = ?",
            image: "3️⃣ + 3️⃣ + 2️⃣",
            correctAnswer: "8",
            options: ["7", "8", "9"],
            topic: "Addition",
            type: "multiple-choice"
        },

        // Additional hard questions (21-30)
        {
            id: 21,
            question: "Count all the objects.",
            image: "🍎🍎🍎🍎🍎🍎🍎🍎",
            correctAnswer: "8",
            options: ["7", "8", "9"],
            topic: "Counting",
            type: "multiple-choice"
        },
        {
            id: 22,
            question: "Which is smallest? 6, 2, 9?",
            image: "6️⃣ 2️⃣ 9️⃣",
            correctAnswer: "2",
            options: ["2", "6", "9"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 23,
            question: "Add them up. 7 + 3 = ?",
            image: "7️⃣ + 3️⃣",
            correctAnswer: "10",
            options: ["9", "10"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 24,
            question: "Take away. 10 - 5 = ?",
            image: "🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈 - 🎈🎈🎈🎈🎈",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 25,
            question: "6 + ? = 10. What is missing?",
            image: "6️⃣ + ?",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },
        {
            id: 26,
            question: "Which is the biggest? 7, 3, 9?",
            image: "7️⃣ 3️⃣ 9️⃣",
            correctAnswer: "9",
            options: ["3", "7", "9"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 27,
            question: "Add them up. 4 + 2 + 3 = ?",
            image: "🍎🍎🍎🍎 + 🍎🍎 + 🍎🍎🍎",
            correctAnswer: "9",
            options: ["8", "9", "10"],
            topic: "Addition",
            type: "multiple-choice"
        },
        {
            id: 28,
            question: "Take away. 7 - 4 = ?",
            image: "🔴🔴🔴🔴🔴🔴🔴 - 🔴🔴🔴🔴",
            correctAnswer: "3",
            options: ["2", "3", "4"],
            topic: "Subtraction",
            type: "multiple-choice"
        },
        {
            id: 29,
            question: "How many more apples does 9 have than 5?",
            image: "🍎🍎🍎🍎🍎 vs 🍎🍎🍎🍎🍎🍎🍎🍎🍎",
            correctAnswer: "4",
            options: ["3", "4", "5"],
            topic: "Comparing",
            type: "multiple-choice"
        },
        {
            id: 30,
            question: "2 + ? = 7. What is missing?",
            image: "2️⃣ + ?",
            correctAnswer: "5",
            options: ["4", "5", "6"],
            topic: "Number Bonds",
            type: "multiple-choice"
        },

        // Matching Questions (31-32)
        {
            id: 31,
            question: "Match the problem to the answer.",
            type: "matching",
            topic: "Addition",
            pairs: [
                { left: "3 + 4", right: "7" },
                { left: "5 + 3", right: "8" },
                { left: "2 + 6", right: "8" }
            ]
        },
        {
            id: 32,
            question: "Match the number to the word.",
            type: "matching",
            topic: "Comparing",
            pairs: [
                { left: "10", right: "The biggest" },
                { left: "3", right: "The smallest" },
                { left: "7", right: "In the middle" }
            ]
        }
    ]
};

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Helper function to get questions for a specific difficulty
function getQuestionsByDifficulty(difficulty) {
    return quizData[difficulty] || quizData.easy;
}
