# Reuse and Sending Design

## Reuse Previous Questions

`POST /api/questions/{id}/clone` creates a new `questions` row:

- copies text, type, rating scale, active status
- copies MCQ choices into new `choices` rows
- stores the source in `cloned_from_question_id`
- does not copy responses

This gives managers a reusable library without coupling new feedback to old answers.

## Reuse Previous Feedback Cycles

`POST /api/cycles/{id}/clone` creates a new `feedback_cycles` row:

- copies the selected question list from `feedback_cycle_questions`
- stores the source in `cloned_from_cycle_id`
- keeps the new cycle in `DRAFT`
- does not copy assignments, responses, approvals, or notification logs

This is the correct production behavior because each feedback cycle has its own audience, response window, approval trail, and analytics.

## Question Sending

`POST /api/cycles/send` receives:

```json
{ "cycleId": 1, "userIds": [2, 3, 4] }
```

The backend:

1. Verifies the cycle has questions.
2. Creates one `feedback_assignments` row per recipient.
3. Prevents duplicate assignments with `UNIQUE (cycle_id, assigned_to)`.
4. Writes a `notification_logs` row to simulate email delivery.
5. Updates cycle status to `SENT`.

To send real email later, replace or extend `NotificationLogRepository` usage in `CycleService.send()` with a mail adapter such as Spring `JavaMailSender`, while still keeping `notification_logs` for auditability.

