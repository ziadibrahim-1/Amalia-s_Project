# 📚 Amalia's MathBook - Educational Quiz Platform

A comprehensive, kid-friendly mathematical learning platform built with HTML, CSS, and Vanilla JavaScript. Designed for children aged 6+ to learn mathematics through interactive quizzes and progressive lessons.

## 🎯 Features

### 🏠 Home Page
- Welcome screen with quick access to quizzes
- 3 difficulty levels (Easy, Medium, Hard)
- "Discover MathBook" button for full curriculum
- Feature showcase cards
- Responsive, animated interface

### 📖 Units Page
- 9 comprehensive math units
- Progress tracking for each unit
- Unit cards with completion status
- Visual progress bars
- Responsive grid layout

### 📝 Lessons Page
- 13 lessons per unit
- Sequential lesson unlock system
- Progress indicators
- Stars earned display
- Unit progress overview

### 🎮 Quiz Page
- Multiple question types:
  - **MCQ (Multiple Choice)**: Select correct answer
  - **Tap Count**: Count objects and select number
  - **Compare Numbers**: Choose bigger or smaller number
- Vertical progress bar
- Real-time score tracking
- Feedback videos (success/try-again)
- Question navigation

### 🎉 Results Page
- Final score display
- Star rating (1-3 stars)
- Celebration animations (balloons, fireworks)
- Retry lesson option
- Return to lessons button

### 💾 Progress System
- localStorage-based progress tracking
- Lesson completion tracking
- Stars earned per lesson
- Unit progress percentage
- Sequential unlock system

## 📂 Project Structure

```
Amalia_Project/
├── home.html              # Home/Welcome page
├── units.html             # Units listing page
├── lessons.html           # Lessons for selected unit
├── quiz.html              # Quiz interface
├── results.html           # Results/Score display
│
├── styles/
│   ├── home.css
│   ├── units.css
│   ├── lessons.css
│   ├── quiz.css
│   └── results.css
│
├── js/
│   ├── navigation.js      # Page routing & navigation
│   ├── progress.js        # Progress tracking system
│   ├── home.js            # Home page logic
│   ├── units.js           # Units page logic
│   ├── lessons.js         # Lessons page logic
│   ├── quiz.js            # Quiz page logic
│   └── results.js         # Results page logic
│
├── Jsons/
│   ├── UnitsStructure/
│   │   ├── units_Structure.json    # All units metadata
│   │   └── units1.json             # Unit 1 lessons
│   │
│   ├── Units_Questions/
│   │   └── Unit1/
│   │       ├── unit_1_Lesson1.json
│   │       ├── unit_1_Lesson2.json
│   │       └── ... (up to Lesson13)
│   │
│   └── QuestionTypes/
│       ├── mcq.json
│       ├── tap_count.json
│       └── compare_numbers.json
│
├── src/
│   └── images/
│       └── unit1/          # Unit 1 question images
│
└── media/
    ├── corect1.mp4         # Success video
    ├── V2Wrobg.mp4        # Try-again video
    └── *.mp3              # Audio files
```

## 🚀 Getting Started

### Installation
1. Clone or download the project
2. Open `home.html` in a web browser
3. Start learning!

### No Dependencies
- Pure HTML5, CSS3, and Vanilla JavaScript
- No external frameworks or libraries
- localStorage for data persistence

## 📱 Responsive Design

- **Mobile**: 320px+ (optimized touch interface)
- **Tablet**: 768px+ (enhanced layout)
- **Desktop**: 1024px+ (full experience)

All pages feature:
- Large, touch-friendly buttons (kid-friendly)
- Rounded, colorful UI elements
- Smooth transitions and animations
- Accessible spacing

## 🎨 UI/UX Features

### Colors & Gradients
- Purple gradient primary theme (#667eea to #764ba2)
- Pastel gradients for difficulty levels
- High contrast for readability
- Kid-friendly, warm colors

### Animations
- Fade-in effects on page load
- Slide-up transitions
- Button hover animations
- Celebration effects on results
- Progress bar animations

### Accessibility
- Large font sizes
- High contrast text
- Clear button labels
- Keyboard navigation support
- Responsive touch targets

## 💾 Data Structure

### Progress Storage (localStorage)
```javascript
{
  "unit1": {
    "completedLessons": ["u1_l1", "u1_l2"],
    "stars": {
      "u1_l1": 3,
      "u1_l2": 2
    },
    "percent": 15
  }
}
```

### Question Format
```json
{
  "id": "u1_l1_q1",
  "unitId": "unit1",
  "lessonId": "u1_l1",
  "type": "tap_count",
  "title": "Count the Animals",
  "instruction": "Count the animals and choose the correct number",
  "data": {
    "mode": "select_number",
    "questions": [
      {
        "image": "./src/images/unit1/Q1_Dogs&cats.png",
        "correctCount": 2
      }
    ]
  }
}
```

## 🎓 Curriculum Topics

### Unit 1: Numbers up to 10
1. How Many?
2. Numbers from 1 to 5
3. Let's Count! (1-5)
4. What Makes 5
5. Numbers from 6 to 10
6. Let's Count! (6-10)
7. What Makes 6
8. What Makes 7
9. What Makes 8
10. What Makes 9
11. What Makes 10
12. Let's Compare Numbers
13. The Number Zero

(Units 2-9 available for future expansion)

## 🎯 Navigation Flow

```
Home Page
├── Quick Start (Easy/Medium/Hard)
└── Discover MathBook
    └── Units Page
        └── Select Unit
            └── Lessons Page
                └── Select Lesson
                    └── Quiz Page
                        └── Results Page
                            ├── Retry Lesson
                            └── Back to Lessons
```

## ⚙️ Question Types

### 1. Multiple Choice (MCQ)
- Display question text
- Show multiple answer options
- Highlight selected answer
- Show feedback

### 2. Tap Count
- Display image with countable objects
- Show number pad (0-10)
- User selects correct count
- Immediate feedback

### 3. Compare Numbers
- Display two numbers
- Visual comparison interface
- User selects bigger/smaller
- Feedback on answer

## 🔊 Feedback System

### Success Feedback
- Video: `corect1.mp4`
- Message: "Great job Amalia! 🎉"
- Sound: Success beep (optional)
- Score: +1 point

### Try-Again Feedback
- Video: `V2Wrobg.mp4`
- Message: "Try again next time! 💪"
- Show correct answer
- Sound: Try-again sound (optional)
- No score increase

## 📊 Scoring & Stars

Stars earned based on percentage:
- 90-100%: ⭐⭐⭐ (3 stars)
- 70-89%: ⭐⭐ (2 stars)
- 50-69%: ⭐ (1 star)
- Below 50%: No stars (try again)

## 🔒 Lesson Lock System

- First lesson always unlocked
- Sequential unlock: complete previous lesson to unlock next
- No unit progression until lesson complete
- Retry unlocked lessons anytime

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Code Quality

- Clean, commented code
- Organized file structure
- Consistent naming conventions
- Error handling
- Responsive design principles

## 🎉 Celebration Features

### Results Page Animations
- Floating balloons
- Fireworks effects
- Bouncing stars
- Scale-up score animation

### Performance Messages
- Personalized by score
- Encouraging and positive
- Celebratory for high scores

## 📦 Assets Included

- **Videos**: corect1.mp4, V2Wrobg.mp4
- **Audio**: ElevenLabs voice, success/try-again sounds
- **Images**: Unit 1 question images

## 🔐 Data Privacy

- All data stored locally (localStorage)
- No external API calls
- No data sent to servers
- Parent/teacher can clear progress anytime

## 🚀 Future Enhancements

- Additional units (2-9) implementation
- Drag-and-drop matching questions
- Sound effects toggle
- Dark mode
- Multi-language support
- Teacher dashboard
- Parent monitoring
- Custom content creation

## 📞 Support

For issues or improvements:
1. Check browser console for errors
2. Clear localStorage if experiencing issues: `localStorage.clear()`
3. Ensure all JSON files are in correct paths

## ✨ Created for

**Amalia** - Making mathematics fun and interactive! 🎓📚

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**License**: Educational Use Only
