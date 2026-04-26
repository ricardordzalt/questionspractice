# ARCHITECTURE.md

## System Overview

QuestionsApp is a full-stack web application designed to help software developers prepare for senior-level interviews through organized study and practice workflows.

Current repository structure:

```text
questionsapp/
├── AGENTS.md
├── README.md
├── frontend/
└── backend/

The system uses two independent applications:

frontend/ → Next.js client application
backend/ → NestJS REST API
PostgreSQL database
Prisma ORM
Docker for local infrastructure
Architecture Goals
Fast iteration speed
Clean feature growth
Strong separation of concerns
Simple maintainable codebase
Ready for future multi-user support
Stable after MVP
High-Level Flow
User
 ↓
Next.js Frontend
 ↓ HTTP (REST)
NestJS Backend
 ↓
Prisma
 ↓
PostgreSQL
Repository Structure
questionsapp/
├── frontend/
├── backend/
├── README.md
├── AGENTS.md
└── ARCHITECTURE.md
Frontend Architecture
Frontend Stack
Next.js
React
TypeScript
TanStack Query
CSS Modules
Frontend Principles
Feature-based structure
Thin UI pages
Reusable shared components
Server state managed by TanStack Query
Local UI state stays local
Suggested Frontend Structure
frontend/src/
├── app/
├── features/
│   ├── auth/
│   ├── topics/
│   ├── questions/
│   ├── practice/
│   ├── review/
│   └── dashboard/
├── shared/
│   ├── ui/
│   ├── lib/
│   ├── hooks/
│   └── types/
Frontend Responsibility

Frontend owns:

Rendering UI
User interactions
Form state
Query caching
Practice experience
Navigation

Frontend does NOT own:

Business rules
Learning progression rules
Persistence logic
Backend Architecture
Backend Stack
NestJS
TypeScript
Prisma
PostgreSQL
Backend Principles
Modular feature structure
Controllers remain thin
Services contain business logic
Validation on input boundaries
DTOs explicit
Future auth-ready
Suggested Backend Structure
backend/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── topics/
│   ├── questions/
│   ├── practice/
│   └── review/
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── utils/
├── prisma/
Core Domains
Auth

Supports:

Register
Login
Protected routes

Initial version:

Email + password
No email confirmation required

Future-ready for:

JWT refresh flow
OAuth providers
Users

Current mode:

Single user usage

Architecture should support future:

Multi-user accounts
Private question banks
Shared/public question packs
Topics

Examples:

React
NestJS
TypeScript
System Design

Responsibilities:

Organize questions
Group study content
Questions

Each question belongs to a topic.

Contains:

Prompt
Hidden answer
Difficulty
Tags
Notes
Practice

Responsible for:

Hide/show answers
Mark difficulty
Track attempts
Active recall sessions
Review

Responsible for:

Weak areas
Repetition queue
Study progress
Data Ownership Rules
User owns Topics
Topic owns Questions
Question generates Practice Attempts
Attempts feed Review Progress
API Style

REST API.

Examples:

POST   /auth/register
POST   /auth/login

GET    /topics
POST   /topics
PATCH  /topics/:id
DELETE /topics/:id

GET    /questions
POST   /questions
PATCH  /questions/:id
DELETE /questions/:id

POST   /practice/start
POST   /practice/answer
GET    /review
Authentication Flow
Register/Login
↓
Backend validates credentials
↓
Returns token
↓
Frontend stores session securely
↓
Protected requests include token
State Management Rules

Use TanStack Query for:

Topics
Questions
Review data
Auth session fetches

Use local component state for:

Modals
Inputs
Temporary filters
Practice UI interactions

Avoid unnecessary global client state.

Styling Rules

Use CSS Modules.

Each component owns its styles:

QuestionCard.tsx
QuestionCard.module.css
Scaling Strategy

Current target:

Personal use

Future-ready for:

Many users
Role separation
Shared content libraries
Public/private content

No premature complexity now.

Security Baseline
Hash passwords
Validate input
Protect private routes
Sanitize unsafe input
Never expose secrets to frontend
Non-Goals Right Now

Do NOT build yet:

Microservices
Real-time systems
Complex analytics
Gamification engine
Social features
Team collaboration
Guiding Rule

Build today's product cleanly in a way that does not block tomorrow's growth.
