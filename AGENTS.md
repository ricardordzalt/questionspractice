# AGENTS.md

## Mission

Build a beautiful, simple, study-first application that helps software developers prepare for senior-level technical interviews through organized questions, active recall, and efficient learning workflows.

The product must feel fast, clear, motivating, and frictionless.

---

## Product Priorities

Priority order:

1. Fast development speed
2. Beautiful UI
3. Simplicity
4. Strong learning experience
5. Maintainability
6. Modular architecture
7. Stability after MVP

When tradeoffs appear, prefer simplicity and learning value over unnecessary complexity.

---

## Core Product Principle

Preparation should feel like training, not like reading.

Every feature should improve learning speed, recall quality, clarity, or motivation.

---

## Tech Stack

Frontend:

- Next.js
- React
- TypeScript

Backend:

- NestJS
- Prisma
- PostgreSQL

Infrastructure:

- Docker

Data Fetching:

- TanStack Query

Styling:

- CSS Modules

---

## Architecture Rules

Use screaming architecture / feature-based structure.

Preferred structure:

```text
src/features/questions
src/features/topics
src/features/practice
src/features/review
src/features/dashboard
src/shared/ui
src/shared/lib
src/shared/types

Rules:

Organize by business domain, not technical layers
Keep features isolated
Shared code only when truly reused
Avoid tight coupling between features
UI, domain logic, and data access should remain separated
Code Style Rules

Use TypeScript strict mode.

Prefer:

Highly modular code
Clean and concise implementations
Clear naming
Small focused files
Reusable utilities when justified
Predictable patterns

Avoid:

Magic strings
Duplicated logic
Unclear names
Overengineering
Premature abstractions
Deep nesting
Giant files
Clever code over readable code
Naming Rules

Names must explain intent immediately.

Good:

getNextReviewDate
QuestionCard
PracticeSessionSummary
createTopicSlug

Bad:

handleData
tempFn
item2
stuff
managerUtil
UI / UX Rules

UI must feel modern, clean, calm, and focused.

Prioritize:

Fast interactions
Clear hierarchy
Low friction
Minimal clutter
Strong readability
Great spacing
Smooth flows

Every screen should answer:

What can I do here?
What should I do next?
How fast can I continue studying?

Avoid decorative complexity.

Learning Experience Rules

This is a study product, not a CRUD product.

Prioritize features that improve learning:

Active recall
Hidden answers
Progress visibility
Topic clarity
Quick repetition
Reduced friction
Motivation loops

If a feature looks impressive but does not improve learning, deprioritize it.

Data / API Rules
Keep contracts explicit
Validate all inputs
Prefer predictable response shapes
Keep endpoints simple
Avoid leaking database details into UI
Handle loading and error states cleanly
TanStack Query Rules

Use TanStack Query as primary async state layer.

Prefer:

Query keys by feature
Cache intentionally
Invalidate precisely
Keep server state separate from UI state

Do not recreate global state unnecessarily.

CSS Modules Rules
Co-locate styles with components
Use semantic class names
Prefer maintainable selectors
Avoid overly nested selectors
Keep visual consistency across features
Agent Workflow Rules

Default workflow:

Understand goal
Inspect existing patterns
Propose simple solution
Implement cleanly
Self-review
Suggest improvements only if useful

When task is unclear, ask concise questions.

When task is large, break into steps.

Autonomy Rules

Agent may act autonomously for:

Normal features
Refactors with no behavioral risk
UI improvements
Internal cleanup
Tests
Documentation

Agent must ask before risky changes.

Risky Changes Requiring Approval

Always ask before:

Database schema redesigns
Auth flow changes
Large dependency additions
Architecture rewrites
Deleting significant code
Breaking API contracts
Major folder restructures
Performance tradeoffs with UX impact
Definition of Done

A task is done when:

Works correctly
Types pass
No duplicated logic introduced
Naming is clear
Code is readable
UI is polished
Errors handled
Fits existing architecture
No unnecessary complexity added
Decision Heuristics

When multiple solutions exist:

Choose the one that is:

Easier to maintain
Faster for users
Simpler to reason about
More aligned with learning goals
Easier to extend later
Anti-Bloat Rule

Do not add systems, abstractions, or libraries unless they solve a real current problem.

MVP should survive after launch, but remain lean.

Output Style For Agents

When responding:

Be direct
Be practical
Explain tradeoffs briefly
Prefer execution over theory
Avoid filler text
Long-Term Goal

Create a trusted personal study system for senior software engineering interviews that feels better than scattered notes, faster than generic study tools, and more effective than passive reading.
