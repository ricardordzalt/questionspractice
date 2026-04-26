# DATA_MODEL.md

## Data Model Principles

- All user-created data is private to the owning user.
- All main records must support soft delete.
- All main records must include `createdAt` and `updatedAt`.
- Imported questions must be editable after import.
- Questions may belong to multiple topics.
- Questions may have multiple answer versions.
- Practice attempts must be stored historically.

---

## Core Entities

```text
User
Topic
Tag
Question
QuestionTopic
QuestionTag
Answer
PracticeAttempt
ReviewState
ImportBatch
User

Represents an account in the system.

Fields:

id
email
passwordHash
createdAt
updatedAt
deletedAt

Relationships:

User has many Topics
User has many Tags
User has many Questions
User has many PracticeAttempts
User has many ImportBatches
Topic

Represents a major study category.

Examples:

React
NestJS
TypeScript
System Design
Databases

Fields:

id
userId
name
slug
description
createdAt
updatedAt
deletedAt

Relationships:

Topic belongs to User
Topic has many Questions through QuestionTopic
Tag

Represents flexible labels for filtering.

Examples:

performance
hooks
dependency-injection
security
senior-level

Fields:

id
userId
name
slug
createdAt
updatedAt
deletedAt

Relationships:

Tag belongs to User
Tag has many Questions through QuestionTag
Question

Represents an interview question.

A question can belong to multiple topics and multiple tags.

Fields:

id
userId
title
prompt
difficulty
source
notes
createdAt
updatedAt
deletedAt

Suggested difficulty values:

junior
mid
senior
staff

Relationships:

Question belongs to User
Question has many Topics through QuestionTopic
Question has many Tags through QuestionTag
Question has many Answers
Question has many PracticeAttempts
Question has one ReviewState
QuestionTopic

Join table between questions and topics.

Fields:

id
questionId
topicId
createdAt
updatedAt
deletedAt

Rules:

A question can have multiple topics.
A topic can contain multiple questions.
QuestionTag

Join table between questions and tags.

Fields:

id
questionId
tagId
createdAt
updatedAt
deletedAt

Rules:

A question can have multiple tags.
A tag can be attached to multiple questions.
Answer

Represents one answer version for a question.

Examples:

short
interview
deep
experience
notes

Fields:

id
questionId
type
content
position
createdAt
updatedAt
deletedAt

Suggested answer type values:

short
interview
deep
example
personal_experience
notes

Relationships:

Answer belongs to Question
PracticeAttempt

Represents one historical practice attempt.

Fields:

id
userId
questionId
rating
revealedAnswer
createdAt
updatedAt
deletedAt

Suggested rating values:

again
hard
good
easy

Relationships:

PracticeAttempt belongs to User
PracticeAttempt belongs to Question

Notes:

Practice attempts should never overwrite previous attempts.
They are used for history and future learning insights.
ReviewState

Represents the current review status of a question for a user.

Fields:

id
userId
questionId
status
confidence
nextReviewAt
lastReviewedAt
createdAt
updatedAt
deletedAt

Suggested status values:

new
learning
reviewing
mastered

Relationships:

ReviewState belongs to User
ReviewState belongs to Question

Rules:

There should be one active ReviewState per user-question pair.
ImportBatch

Represents an import operation.

Fields:

id
userId
source
fileName
status
totalItems
successfulItems
failedItems
createdAt
updatedAt
deletedAt

Suggested status values:

pending
completed
failed
partial

Relationships:

ImportBatch belongs to User
ImportBatch can create many Questions
Ownership Rules

Every user-created entity must be scoped by userId, either directly or indirectly.

Direct ownership:

Topic.userId
Tag.userId
Question.userId
PracticeAttempt.userId
ReviewState.userId
ImportBatch.userId

Indirect ownership:

Answer belongs to Question
QuestionTopic belongs through Question
QuestionTag belongs through Question

Backend queries must always enforce user ownership.

Soft Delete Rules

Use deletedAt for soft delete.

Rules:

deletedAt = null means active
deletedAt != null means deleted

Default queries must exclude deleted records.

Do not physically delete user-created records unless explicitly required later.

Timestamp Rules

All main records should include:

createdAt
updatedAt
deletedAt

Where:

createdAt = when record was created
updatedAt = when record was last modified
deletedAt = when record was soft deleted
Import Format Direction

Initial import should support structured JSON.

Example:

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
          "content": "Dependency injection in NestJS allows classes to declare dependencies and receive them from the IoC container."
        },
        {
          "type": "deep",
          "content": "NestJS uses a dependency injection container where providers are registered in modules..."
        }
      ],
      "notes": "Good question for backend architecture interviews."
    }
  ]
}
Non-Goals For Initial Data Model

Avoid for now:

Organizations
Teams
Public question marketplace
Payments
Shared question packs
Complex analytics tables
AI conversation history
Guiding Rule

Design the model to support strong personal study first, while keeping the door open for future multi-user usage.
