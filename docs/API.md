# Backend API

All protected endpoints require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Swagger is available at `/swagger-ui.html`.

## Authentication

- `POST /api/auth/login`

```json
{ "email": "admin@example.com", "password": "Password123!" }
```

## Questions

- `GET /api/questions`
- `GET /api/questions/{id}`
- `POST /api/questions` - ADMIN, MANAGER
- `PUT /api/questions/{id}` - ADMIN, MANAGER
- `DELETE /api/questions/{id}` - ADMIN, MANAGER, soft-deactivates
- `POST /api/questions/{id}/clone` - ADMIN, MANAGER

Question types:

- `TEXT` stores `answerText`
- `RATING` stores `ratingValue`, configured with `ratingMin` and `ratingMax`
- `YES_NO` stores `yesNoValue`
- `MCQ` stores `choiceId`

## Choices

- `GET /api/questions/{questionId}/choices`
- `POST /api/questions/{questionId}/choices` - ADMIN, MANAGER
- `PUT /api/choices/{id}` - ADMIN, MANAGER
- `DELETE /api/choices/{id}` - ADMIN, MANAGER, soft-deactivates

Choices are only valid for `MCQ` questions.

## Feedback Cycles and Sending

- `GET /api/cycles`
- `POST /api/cycles` - ADMIN, MANAGER
- `POST /api/cycles/send` - ADMIN, MANAGER
- `POST /api/cycles/{id}/clone` - ADMIN, MANAGER

Sending creates one row in `feedback_assignments` per recipient and a simulated row in `notification_logs`. The cycle status changes from `DRAFT` to `SENT`.

## Responses

- `GET /api/responses/my-assignments`
- `POST /api/responses/assignments/{assignmentId}`
- `GET /api/responses/assignments/{assignmentId}`

Users can submit only their own assignments. Submitted assignments move to `SUBMITTED`.

## Approvals

- `GET /api/approvals/pending` - ADMIN, MANAGER
- `POST /api/approvals/assignments/{assignmentId}` - ADMIN, MANAGER

Approving moves assignment status to `APPROVED`; rejecting moves it to `REJECTED` so the user can resubmit.

## Dashboard

- `GET /api/dashboard`
- `GET /api/dashboard?cycleId=1`

Returns total assignments, submitted/approved assignments, response rate, and average rating.

## Users

- `GET /api/users` - ADMIN, MANAGER

