# API_CONTRACTS.md

## API Principles

- REST API.
- All private endpoints require authentication.
- All user-owned resources must be scoped to the authenticated user.
- Responses use a standard envelope.
- List endpoints use cursor pagination.
- Updates use PATCH for partial changes.
- Validation errors must include both human-readable messages and structured field errors.

## Standard Response Envelope

### Success

```json
{
  "data": {},
  "meta": null,
  "error": null
}
List Success
{
  "data": [],
  "meta": {
    "nextCursor": "string | null",
    "hasNextPage": true
  },
  "error": null
}
Error
{
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "fields": {
      "email": ["Email is required."]
    }
  }
}
Authentication

Auth uses email and password.

The backend issues a JWT access token as an HttpOnly cookie.

No email confirmation is required for MVP.

POST /auth/register

Creates a user account.

Request:

{
  "email": "abel@example.com",
  "password": "StrongPassword123"
}

Response:

{
  "data": {
    "user": {
      "id": "user_id",
      "email": "abel@example.com"
    }
  },
  "meta": null,
  "error": null
}
POST /auth/login

Logs in an existing user.

Request:

{
  "email": "abel@example.com",
  "password": "StrongPassword123"
}

Response:

{
  "data": {
    "user": {
      "id": "user_id",
      "email": "abel@example.com"
    }
  },
  "meta": null,
  "error": null
}
POST /auth/logout

Clears auth cookie.

Response:

{
  "data": {
    "success": true
  },
  "meta": null,
  "error": null
}
GET /auth/me

Returns current authenticated user.

Response:

{
  "data": {
    "id": "user_id",
    "email": "abel@example.com"
  },
  "meta": null,
  "error": null
}
Topics
GET /topics

Returns user topics.

Query params:

cursor
limit
search
sort

Response:

{
  "data": [
    {
      "id": "topic_id",
      "name": "React",
      "slug": "react",
      "description": "React interview questions",
      "createdAt": "2026-04-26T00:00:00.000Z",
      "updatedAt": "2026-04-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "nextCursor": null,
    "hasNextPage": false
  },
  "error": null
}
POST /topics

Creates a topic.

Duplicate topic names are allowed for the same user.

Request:

{
  "name": "React",
  "description": "React interview questions"
}
PATCH /topics/:id

Partially updates a topic.

Request:

{
  "name": "Advanced React"
}
DELETE /topics/:id

Soft deletes a topic.

Response:

{
  "data": {
    "success": true
  },
  "meta": null,
  "error": null
}
Tags
GET /tags

Returns user tags.

Query params:

cursor
limit
search
POST /tags

Creates a tag.

Request:

{
  "name": "performance"
}
PATCH /tags/:id

Partially updates a tag.

DELETE /tags/:id

Soft deletes a tag.

Questions
GET /questions

Returns user questions.

Query params:

cursor
limit
search
topicId
tagId
difficulty
reviewStatus
dueForReview
weakOnly
sort

Recommended filters:

topicId
tagId
difficulty
reviewStatus
search
dueForReview
weakOnly

Response:

{
  "data": [
    {
      "id": "question_id",
      "title": "How does dependency injection work in NestJS?",
      "prompt": "Explain dependency injection in NestJS.",
      "difficulty": "senior",
      "source": "import",
      "notes": "Important backend architecture question.",
      "topics": [
        {
          "id": "topic_id",
          "name": "NestJS"
        }
      ],
      "tags": [
        {
          "id": "tag_id",
          "name": "dependency-injection"
        }
      ],
      "reviewState": {
        "status": "learning",
        "nextReviewAt": "2026-04-27T00:00:00.000Z"
      },
      "createdAt": "2026-04-26T00:00:00.000Z",
      "updatedAt": "2026-04-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "nextCursor": null,
    "hasNextPage": false
  },
  "error": null
}
GET /questions/:id

Returns question detail with answers.

POST /questions

Creates a single question manually.

Request:

{
  "title": "How does dependency injection work in NestJS?",
  "prompt": "Explain dependency injection in NestJS.",
  "difficulty": "senior",
  "topicIds": ["topic_id"],
  "tagIds": ["tag_id"],
  "answers": [
    {
      "type": "short",
      "content": "Dependency injection lets classes receive dependencies from NestJS's IoC container.",
      "position": 1
    },
    {
      "type": "deep",
      "content": "NestJS registers providers inside modules and resolves dependencies through its container...",
      "position": 2
    }
  ],
  "notes": "Useful for backend interviews."
}
PATCH /questions/:id

Partially updates a question.

Request:

{
  "title": "Explain dependency injection in NestJS",
  "difficulty": "senior"
}
DELETE /questions/:id

Soft deletes a question.

Answers
POST /questions/:questionId/answers

Adds an answer version to a question.

Request:

{
  "type": "short",
  "content": "Short answer content.",
  "position": 1
}
PATCH /answers/:id

Updates an answer.

DELETE /answers/:id

Soft deletes an answer.

Import
POST /imports/questions

Imports questions from raw JSON body.

Behavior:

Validate entire payload first.
Reject entire import if any row is invalid.
Do not partially import valid rows.

Request:

{
  "questions": [
    {
      "title": "How does dependency injection work in NestJS?",
      "prompt": "Explain dependency injection in NestJS.",
      "difficulty": "senior",
      "topics": ["NestJS"],
      "tags": ["dependency-injection", "architecture"],
      "answers": [
        {
          "type": "short",
          "content": "Dependency injection lets classes receive dependencies from NestJS's IoC container."
        }
      ],
      "notes": "Good senior backend question."
    }
  ]
}

Response:

{
  "data": {
    "importBatchId": "import_batch_id",
    "createdQuestions": 1
  },
  "meta": null,
  "error": null
}
POST /imports/questions/file

Imports questions from a JSON file upload.

Content type:

multipart/form-data

Field:

file
Practice
POST /practice/sessions

Creates a backend-managed practice session.

Request:

{
  "mode": "mixed",
  "topicIds": ["topic_id"],
  "tagIds": [],
  "difficulty": "senior",
  "onlyDueForReview": false,
  "limit": 10
}

Response:

{
  "data": {
    "sessionId": "practice_session_id",
    "questions": [
      {
        "id": "question_id",
        "title": "How does dependency injection work in NestJS?",
        "prompt": "Explain dependency injection in NestJS.",
        "difficulty": "senior",
        "topics": [
          {
            "id": "topic_id",
            "name": "NestJS"
          }
        ],
        "tags": []
      }
    ]
  },
  "meta": null,
  "error": null
}
POST /practice/sessions/:sessionId/attempts

Saves an answer rating immediately.

Request:

{
  "questionId": "question_id",
  "rating": "good",
  "revealedAnswer": true
}

Response:

{
  "data": {
    "attemptId": "attempt_id",
    "reviewState": {
      "status": "reviewing",
      "nextReviewAt": "2026-04-29T00:00:00.000Z"
    }
  },
  "meta": null,
  "error": null
}
Review
GET /review/queue

Returns questions due for review.

Query params:

cursor
limit
topicId
tagId
difficulty
GET /review/summary

Returns simple review summary.

Response:

{
  "data": {
    "dueToday": 12,
    "learning": 24,
    "reviewing": 35,
    "mastered": 8
  },
  "meta": null,
  "error": null
}
Dashboard
GET /dashboard

Returns dashboard summary.

Response:

{
  "data": {
    "totalQuestions": 120,
    "totalTopics": 8,
    "dueForReview": 12,
    "recentlyPracticed": [
      {
        "id": "question_id",
        "title": "How does dependency injection work in NestJS?"
      }
    ]
  },
  "meta": null,
  "error": null
}
Error Codes

Common error codes:

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
IMPORT_VALIDATION_FAILED
INTERNAL_SERVER_ERROR
Ownership Rules

Every protected request must use the authenticated user as the ownership boundary.

Never trust userId from the client for protected resources.

The backend must infer userId from the authenticated session.

Pagination Rules

Use cursor pagination for list endpoints.

Query params:

cursor
limit

Response metadata:

{
  "nextCursor": "string | null",
  "hasNextPage": true
}

Rules:

Default limit: 20
Maximum limit: 100
Sort by stable fields such as createdAt and id
Guiding Rule

Frontend should never guess backend behavior. Every important request and response shape should be explicit.
