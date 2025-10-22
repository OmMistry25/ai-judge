# Coding Challenge — AI Judge

Welcome! This take-home mirrors the kind of self-contained feature work that we build at
Besimple AI.

## 1. Background

Our internal annotation platform lets humans answer **question** (multiple-choice, single-choice or
free-form) for each _submission_. This task asks you to build an **AI Judge** layer that automatically
reviews those answers and records a _verdict_ (pass / fail / inconclusive) plus short
reasoning text.
You will ingest a JSON file shaped like our internal test_input.json (the full file we use to
grade your work will not be shared). A **small sample** is included at the end of this document so
you can test locally.
The finished web application should:

1. Displays the submissions.
2. Lets a user configure which AI judges should run for each question in a queue.
3. Calls a real LLM provider (OpenAI, Anthropic, Gemini, etc.) to execute those judges and
    store the _evaluations_.
4. Surfaces the results with useful filters and pass/fail statistics.

## 2. Deliverables

- A Vite project (npm create vite@latest recommended) written in **React 18 +**
    **TypeScript**.
- All source, a small README and an short Loom / GIF demo.
- The app should start with npm run dev and open on [http://localhost:5173.](http://localhost:5173.)


## 3. Functional Requirements

### 3.1 Data ingestion

- Accept a JSON file upload that follows the _shape_ shown in the sample appendix.
- Persist the parsed submissions in your backend of choice (Firebase, Supabase, SQLite,
    etc.). **Do not** use localStorage or keep them only in memory.

### 3.2 AI Judge definitions

Provide a UI that lets a user **create, edit and deactivate** AI Judges. Each judge should store at
minimum: a name, a system-prompt / rubric, a target model name, and an “active” flag.
Judges must be persisted in the same backend used elsewhere so they survive page reloads.

### 3.3 Assigning judges

- Provide a UI that lets a user select **one or more judges per question within a queue**.
- Persist these selections in your backend so they can later be fetched by the evaluation
    runner. The concrete API design and schema are entirely up to you.

### 3.4 Running evaluations

Add a **“Run AI Judges”** action on the queue page. When invoked, your feature should:

1. Iterate through the submissions in the chosen queue.
2. For each question, look up the judges configured in step 3.
3. Call the chosen LLM provider for every (question × judge) pair using the judge’s prompt,
    question text and the user’s answer. This needs to invoke the actual llm provider API
    and parse response.
4. Persist an _evaluation_ record that captures at least the verdict (pass / fail /
    inconclusive), the judge used and a short reasoning string. Store these records in
    your backend — not in the browser.
Show a short summary (planned / completed / failed counts) when the run finishes and handle
common error cases gracefully (e.g., timeouts, quota errors).

### 3.5 Results view

- A dedicated **“Results”** page must list evaluations with the assocaited meta:
    Submission, Question, Judge, Verdict, Reasoning, Created.
- Filters:
    - Judge (multi-select)
    - Question (multi-select)
    - Verdict (pass / fail / inconclusive)


- Above the table show an aggregate pass rate (e.g., **“42 % pass of 120 evaluations”** ).

## 4. Bonus

- Allow file attachments (e.g., screenshots, PDFs) from the Submission to be uploaded
    alongside an evaluation task and forwarded to the LLM API when the provider supports
    it.
- Let the user choose which fields (question text, answers, additional subject metadata)
    are included in the prompt versus omitted.
- Animated charts (e.g., pass-rate by judge)
- Any additional features that you think are relevant.

## 5. Submission Instructions

```
Please include all of the following when you send back your challenge:
```
1. **Screen recording** – Loom, MP4 or GIF that walks through the working web app:
    - Import sample data → judges CRUD → judge assignment → run evaluations →
       results view.
    - Highlight any **extra features** you added or **trade-offs** you made.
    - Voice-over is appreciated but optional.
2. **Time Spent** – add a short “Time Spent” line (~ hours) and trade offs you made
Email the recording URL to hiring@besimple.ai. We will review within 24 hours and reach out to
schedule a **video-call interview** for qualified submissions.

### Evaluation Rubric

Clarity of thought, judgment and clean code matter far more than raw speed.
**Category What we look for**
Correctness Meets all functional requirements without
crashes
Backend & LLM Clean persistence layer and proper LLM
integration


JSON
**Category What we look for**
Code quality Clear naming, small components, idiomatic
React

Types & safety (^) Accurate TypeScript types, minimal any
UX & polish Usable layout, sensible empty / loading states
Judgment & trade-offs Clear reasoning in README for scope cuts or
decisions
_Have fun, and feel free to ask clarifying questions if anything is unclear!_

## Appendix — sample_input.json

```
Use the following minimal example to sanity-check your parser. The real grading file will be
larger but follow the same shape.
[
{
"id": "sub_1",
"queueId": "queue_1",
"labelingTaskId": "task_1",
"createdAt": 1690000000000,
"questions": [
{
"rev": 1,
"data": {
"id": "q_template_1",
"questionType": "single_choice_with_reasoning",
"questionText": "Is the sky blue?"
}
}
],
"answers": {
"q_template_1": {
"choice": "yes",
"reasoning": "Observed on a clear day."
}
```

}
}
]


