# Context for Amalia's MathBook Website

## Overview
Amalia's MathBook is an interactive educational platform designed for 6-year-old Amalia to learn mathematics. The platform features:
- **Interactive quizzes** with instant feedback.
- **Progress tracking** with stars and animations.
- **Responsive design** for desktop, tablet, and mobile.
- **Fun visuals** like celebration videos and sound effects.

## Website Structure

### Core Pages
1. **Home Page (home.html)**: Displays 9 unit cards for navigation.
2. **Lessons Page (lessons.html)**: Shows lessons within a unit with progress bars.
3. **Quiz Page (quiz.html)**: Interactive quiz interface with feedback.
4. **Results Page (results.html)**: Displays scores, stars, and celebration animations.
5. **Units Page (units.html)**: Backup page for unit overview.

### JavaScript Files
- **navigation.js**: Handles routing between pages.
- **home.js**: Manages the home page logic.
- **lessons.js**: Loads and displays lessons.
- **quiz.js**: Implements the quiz engine and feedback system.
- **results.js**: Displays results and animations.
- **progress.js**: Tracks user progress.
- **units.js**: Manages unit-related logic.

### Stylesheets
- **home.css**: Styling for the home page.
- **lessons.css**: Styling for the lessons page.
- **quiz.css**: Styling for the quiz page, including animations.
- **results.css**: Styling for the results page.
- **units.css**: Styling for the units page.

### Data Files
- **UnitsStructure**: Contains JSON files defining the structure of units.
- **Units_Questions**: JSON files with questions for each lesson.
- **QuestionTypes**: JSON files defining different question types.

## Question Types
The platform supports the following question types:
1. **Tap Count**: Count objects and select the correct number.
2. **Compare Numbers**: Compare quantities using bigger/smaller buttons.
3. **Multiple Choice (MCQ)**: Select the correct option from a list.
4. **Drag Match**: Match pairs using drag-and-drop.
5. **Number Flash**: Quick recognition of numbers using flashcards.

## Adding a New Question Style
To add a new question style, follow these steps:

### 1. Define the Question Type
- Create a new JSON file in the `QuestionTypes` folder.
- Define the structure, including `type`, `title`, `instruction`, and `data` fields.

### 2. Update the Quiz Engine
- Modify `quiz.js` to handle the new question type.
- Add logic for displaying the question and checking answers.

### 3. Design the UI
- Update `quiz.css` to style the new question type.
- Ensure the design is responsive and touch-friendly.

### 4. Test the Implementation
- Use the `TESTING_VISUAL_FEEDBACK.md` guide to verify functionality.
- Check animations, feedback, and responsiveness.

### 5. Update Documentation
- Add details about the new question type to `QUESTION_TYPES_GUIDE.md`.
- Update the `README.md` and other relevant files.

## Deployment Checklist
- Verify all core files are functional.
- Test the platform on multiple browsers and devices.
- Ensure all progress tracking and animations work as expected.
- Follow the steps in `DEPLOYMENT_CHECKLIST.md` for final deployment.

## Summary
Amalia's MathBook is a robust, user-friendly platform designed to make learning math fun and engaging. By following the structured documentation and guidelines, new features and question types can be seamlessly integrated into the system.