# BUILD_PLAN.md

## Purpose

Convert planning documents into an execution sequence that allows fast progress, low chaos, and a durable MVP.

This project should be built in parallel where useful:

- Frontend and backend can move simultaneously
- Contracts must stay aligned through `API_CONTRACTS.md`
- Large milestone phases preferred over many tiny tasks

---

# Global Build Strategy

## Working Model

```text
Claude Code / ChatGPT:
- planning
- architecture checks
- reviews
- tradeoff decisions

Codex CLI:
- implementation
- scaffolding
- CRUD modules
- repetitive work
- tests
Development Rule

Do not start random features.

Always build in milestone order.

Phase 0 — Repository Foundation
Goal

Create a stable development base for frontend + backend.

Deliverables
questionsapp/
├── frontend/
├── backend/
├── README.md
├── AGENTS.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── DATA_MODEL.md
├── API_CONTRACTS.md
├── UI_FLOWS.md
└── BUILD_PLAN.md
Backend Foundation
NestJS initialized
Prisma installed
PostgreSQL Docker setup
env configuration
lint + format
health endpoint
Frontend Foundation
Next.js initialized
TypeScript strict mode
CSS Modules ready
TanStack Query setup
base layout with sidebar shell
Done When
Both apps run locally
DB connects
Frontend loads
Shared repo structure clean
Phase 1 — Authentication First
Goal

Secure the application early and establish user ownership boundaries.

Backend Deliverables
Register endpoint
Login endpoint
Logout endpoint
Current user endpoint
Password hashing
JWT auth
HttpOnly cookie auth flow
Auth guard
Frontend Deliverables
Login page
Register page
Protected route behavior
Session bootstrap
Logout action
Done When

User can:

register
login
stay authenticated
logout
access protected pages only when logged in
Phase 2 — Core Content System
Goal

Allow managing interview study content.

Backend Deliverables
Topics CRUD
Tags CRUD
Questions CRUD
Answers CRUD
Search/filter endpoints
Ownership enforcement
Frontend Deliverables
Questions page
Topics page
Search bar
Filters
Add question drawer
Edit question drawer
Delete confirmations
Done When

User can:

create topics
create questions
attach topics/tags
create multiple answer versions
search/filter content
Phase 3 — Import Engine
Goal

Fast population of content through AI-generated datasets.

Backend Deliverables
Import JSON endpoint
Import file endpoint
Validation pipeline
Reject invalid imports entirely
Frontend Deliverables
Import UI inside Questions page
Paste JSON flow
Upload file flow
Validation error display
Success feedback
Done When

User can import batches of questions safely.

Phase 4 — Practice Mode (Core Product)
Goal

Create the main reason to use the app.

Backend Deliverables
Create practice session endpoint
Session question selection logic
Save attempt endpoint
Review state updates
Frontend Deliverables
Practice Home page
Session configuration
Question screen
Reveal answer flow
Again / Hard / Good / Easy buttons
Next question flow
Session completion screen
Done When

User can complete real study sessions smoothly.

Phase 5 — Review System
Goal

Turn practice into long-term interview readiness.

Backend Deliverables
Due queue endpoint
Weak questions endpoint
Review summary endpoint
Scheduling logic
Frontend Deliverables
Review page
Due today actions
Weak areas actions
Review sessions
Done When

User can return daily and know exactly what to study.

Phase 6 — UI Polish & UX Upgrade
Goal

Make product feel premium and highly usable.

Deliverables
spacing polish
typography polish
empty states
loading states
keyboard shortcuts
performance cleanup
better desktop ergonomics
Done When

App feels intentionally designed, not assembled.

Phase 7 — AI Layer (Post-MVP)
Goal

Add leverage after core product already works.

Deliverables
AI generate questions
AI improve answers
AI mock interview prompts
AI answer feedback
Rule

Do not start AI before core practice loop is excellent.

Recommended Build Order Inside Each Phase
1. Data model
2. Backend endpoints
3. Frontend integration
4. UX polish
5. Self review
Parallel Execution Model
Example

While backend builds auth:

Frontend builds:

auth pages
layout shell
protected route wrappers

While backend builds questions:

Frontend builds:

questions UI
filters UI
drawers

Contracts must follow API_CONTRACTS.md.

Quality Gates Per Phase

Before moving next phase:

Types pass
No broken flows
Main happy path works
Naming clear
No obvious duplicate logic
UI acceptable
Anti-Chaos Rules

Do not jump ahead to:

AI features
fancy analytics
mobile optimization
gamification
public marketplace

Until core study loop works.

What To Build First This Week
Phase 0
Phase 1

That gives immediate secure foundation.

MVP Complete When

User can:

login
import questions
organize topics
practice hidden-answer sessions
self-rate attempts
review due questions
use app repeatedly
Guiding Rule

Ship the smallest version that genuinely helps pass interviews, then improve from strength.
