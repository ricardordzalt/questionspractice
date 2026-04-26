# UI_FLOWS.md

## Purpose

Define how the user moves through the application in a way that maximizes interview preparation, reduces friction, and encourages consistent practice.

This product is practice-first.

The primary goal of the UI is to help the user answer interview questions better and faster.

---

# Global UX Principles

## Core Principles

- Open fast
- Practice fast
- Low friction
- Clear navigation
- Strong readability
- Minimal clutter
- Desktop-first efficiency
- Neutral tone (no guilt mechanics)

## Learning Principles

- Active recall first
- Answers hidden until reveal
- Immediate self-rating
- Surface weak areas
- Encourage consistency without pressure

---

# Global Layout

## Desktop Layout

```text
┌───────────────┬──────────────────────────────┐
│ Sidebar       │ Main Content                │
│               │                              │
│ Practice      │ Current Page                │
│ Questions     │                              │
│ Topics        │                              │
│ Review        │                              │
│ Dashboard     │                              │
│ Settings      │                              │
└───────────────┴──────────────────────────────┘
Sidebar Navigation

Order of priority:

Practice
Questions
Review
Topics
Dashboard
Settings

Practice should feel like the main home of the app.

Authentication Flows
Register Flow
Landing
→ Register Form
→ Create account
→ Auto login
→ Practice Home

Fields:

Email
Password
Confirm Password

No email verification in MVP.

Login Flow
Landing
→ Login Form
→ Authenticate
→ Resume session if exists
→ Otherwise Practice Home
Logout Flow
Sidebar
→ Logout
→ Return to Login
Main Entry Flow
App Open Behavior

Priority:

If unfinished practice session exists:
Open App
→ Resume Practice Session Prompt
→ Continue
Otherwise:
Open App
→ Practice Home

This reduces friction and keeps momentum.

Practice Flow (Core Product)
Practice Home Screen

Main options:

Continue previous session
Start Quick 5 Questions
Start Standard 10 Questions
Unlimited Mode
Select Topics
Select Difficulty
Due For Review Only
Weak Questions Only
Session Configuration Flow
Practice Home
→ Select topic(s)
→ Select session size
→ Optional filters
→ Start Session

Supported topic modes:

Single topic
Multiple topics
All topics
Practice Question Screen

Recommended layout:

┌────────────────────────────────────────────┐
│ Topic / Difficulty                        │
│                                            │
│ Question Prompt                           │
│                                            │
│ [Reveal Answer]                           │
│                                            │
│ Progress (optional)                       │
└────────────────────────────────────────────┘

Optional progress:

Question 3 of 10

User can disable progress if preferred.

Reveal Answer Flow
Question Screen
→ User thinks silently or answers aloud
→ Reveal Answer

After reveal:

┌────────────────────────────────────────────┐
│ Main Answer                               │
│                                            │
│ Expand Deep Answer                        │
│ Expand Personal Example                   │
│ Expand Notes                              │
└────────────────────────────────────────────┘

Main answer visible first.

Other answer versions collapsed.

Goal:

Fast comparison between user's mental answer and ideal answer.

Self Rating Flow

After reviewing answer:

Buttons:

Again
Hard
Good
Easy

Behavior:

Saves immediately
Updates review state
User chooses next step

Then:

[Next Question]

User requested control, not forced auto-next.

Session Completion Flow

After final question:

Session Complete

Show:

Questions completed
Again count
Hard count
Good count
Easy count
Weak topics surfaced
Continue practicing
Review failed questions now
Questions Management Flow
Questions Page

Purpose:

Manage question bank.

Layout:

Top Search Bar
Filters Row
Questions List

Filters:

Topic
Tag
Difficulty
Review Status
Weak Only
Due Today
Add Question Flow
Questions Page
→ Add Question
→ Slide-over Drawer

Drawer fields:

Title
Prompt
Difficulty
Topics
Tags
Answers
Notes

Save without leaving page.

Edit Question Flow
Questions List
→ Edit
→ Slide-over Drawer
→ Save

Chosen because it preserves context and feels faster than page navigation.

Delete Question Flow
Questions List
→ Delete
→ Confirm Modal

Soft delete backend behavior.

Import Flow
Import Entry

Located inside Questions page.

Buttons:

Import JSON File
Paste JSON
Import Process
Questions Page
→ Import
→ Validate
→ Preview Count
→ Confirm Import
→ Success Message
→ Refresh Questions List

If invalid:

Show exact errors
No partial import
Topics Flow
Topics Page

Used to organize study structure.

Actions:

Create Topic
Rename Topic
Delete Topic
View topic question count
Topic Detail
Topic
→ See related questions
→ Start practice for this topic
Review Flow
Review Home

Primary metrics:

Due Today
Weak Questions
Recently Failed
Learning Queue

Actions:

Start Due Review
Start Weak Review
Due Review Session

Same practice UI, but queue only includes due questions.

Dashboard Flow

Dashboard should be lightweight.

Show only high-value info:

Questions total
Topics total
Due today
Weak topics
Last practiced date
Continue studying button

Dashboard must not compete with Practice page.

Search UX
Global Search Placement

Always visible top search bar on Questions page.

Later enhancement:

Cmd + K / Ctrl + K

For quick navigation and search.

Empty States
No Questions Yet
You have no questions yet.
Import questions or create one manually.

CTA:

Import Questions
Add Question
No Due Reviews
Nothing due right now.
Start a new practice session.
Tone & Motivation
Tone Rules
Calm
Professional
Encouraging
No guilt
No manipulative streak pressure

If user skipped days:

Welcome back. Ready for a quick session?

Not:

You lost your streak.
Session Sizes

Supported:

Quick Burst → 5
Standard → 10
Unlimited

Default:

Standard (10)
Accessibility
Keyboard-friendly navigation
Clear focus states
Large readable text
Good contrast
Minimal motion by default
Future UX Extensions

Not MVP but compatible:

Voice answer mode
Mock interview mode
AI answer review
Keyboard-only rapid practice
Heatmaps by weak topics
Guiding Rule

Every click should either help the user learn faster, practice better, or return to study mode quickly.
