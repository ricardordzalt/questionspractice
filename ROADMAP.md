# ROADMAP.md

## Product Objective

Help the user pass senior software developer interviews by building a focused study system for technical questions, structured answers, active recall, and repeated practice.

The app is not just a question storage tool. It is a training system for improving interview recall, clarity, and confidence.

---

## Roadmap Principles

- Prioritize features related to questions and answers.
- Build for desktop first.
- Keep analytics simple.
- Start with authentication.
- Avoid ugly UI, messy code, and architecture that requires rewriting.
- Prefer balanced quality and strong UX over rushing an unfinished MVP.
- AI is important, but it comes soon after the MVP, not inside the first version.

---

## MVP

Goal: Create a usable private study system for importing, organizing, and practicing interview questions.

### 1. Authentication

- Register
- Login
- Logout
- Protected app pages
- No email verification for MVP

### 2. Topics

- Create topic
- Edit topic
- Delete topic
- List topics

Example topics:

- React
- Next.js
- NestJS
- Node.js
- TypeScript
- Databases
- System Design
- Testing
- Performance
- Security
- Behavioral

### 3. Question Import

The primary way to add questions should be import-based.

Support importing structured question data generated externally by AI.

Initial import format can be JSON.

Each imported question should include:

- Topic
- Question text
- Answer
- Difficulty
- Tags
- Optional notes

### 4. Question Management

- List questions
- View question detail
- Edit question
- Delete question
- Filter by topic
- Search questions
- Filter by difficulty or tags

### 5. Answer System

Each question should support at least:

- Main answer
- Short answer
- Deep answer
- Notes

This matters because real interviews require different answer lengths depending on the situation.

### 6. Practice Mode

Core learning flow:

1. Show question
2. Hide answer
3. User thinks or speaks the answer
4. User reveals answer
5. User self-rates performance

Self-rating options:

- Again
- Hard
- Good
- Easy

This supports active recall and prepares the user better than passive reading.

### 7. Simple Review Queue

The app should use self-rating to decide what should be reviewed again.

Initial behavior can be simple:

- Again → review soon
- Hard → review later
- Good → review in a few days
- Easy → review later

No complex analytics in MVP.

### 8. Dashboard

The dashboard should show only useful study information:

- Questions available
- Topics available
- Questions due for review
- Recently practiced questions
- Continue studying button

Keep it simple and motivating.

---

## Version 1

Goal: Improve study quality and make the app feel like a serious interview preparation tool.

### 1. Better Practice Sessions

- Practice by topic
- Practice mixed topics
- Practice weak questions
- Practice random questions

Mixed-topic practice is important because interviews do not always follow one topic at a time.

### 2. Better Review Logic

- Improve review scheduling
- Track last practiced date
- Track current confidence level
- Track number of attempts per question

### 3. Better Question Import

- Import JSON
- Import Markdown
- Preview imported questions before saving
- Show validation errors before import

### 4. Better UI Polish

- Clean desktop-first layout
- Fast keyboard-friendly flow
- Beautiful question cards
- Focused practice screen
- Clear topic navigation

### 5. Search and Filtering

- Search by question text
- Search by answer content
- Filter by topic
- Filter by difficulty
- Filter by tags
- Filter by review status

---

## Version 1.5

Goal: Add AI support after the core product is already useful.

### 1. AI Question Generation

- Generate common questions by topic
- Generate questions by seniority level
- Generate follow-up questions
- Generate interview-style variations

### 2. AI Answer Improvement

- Improve user's answer
- Suggest a shorter version
- Suggest a deeper version
- Add real-world examples
- Detect vague explanations

### 3. AI Interview Feedback

- User writes an answer
- AI reviews clarity, depth, seniority, and structure
- AI suggests better phrasing

---

## Later Versions

### Mock Interview Mode

- Select interview type
- Generate question sequence
- Mix technical and behavioral questions
- Save session results

### Voice Practice

- User speaks answer aloud
- App records or transcribes answer
- AI gives feedback

### Advanced Progress

- Weakness detection by topic
- Study streaks
- Interview readiness score
- More detailed history

### Multi-user Support

The app is personal-first, but architecture should allow more users later.

Potential future features:

- Multiple private accounts
- Public question packs
- Shared question collections
- Admin roles

---

## Non-Goals For MVP

Do not build in MVP:

- Full gamification
- Voice recording
- AI chat
- Public marketplace
- Team features
- Complex analytics
- Mobile-first redesign
- Social features

---

## MVP Success Criteria

MVP is successful when the user can:

- Register and log in
- Import interview questions
- Organize questions by topic
- Study questions with hidden answers
- Self-rate performance
- Return later to review weak questions
- Use the app regularly without friction
