# T32 Manual Test: Small Dataset Completes and Persists Rows

## Test Objective
Verify that the AI Judge system can process a small dataset end-to-end, from ingestion to evaluation, with all data properly persisted in the database.

## Test Dataset
We'll use the existing `sample-submission.json` with 1 submission containing 2 questions.

## Test Steps

### 1. Setup Verification
- [ ] Web app is running on http://localhost:5173
- [ ] Supabase connection is working
- [ ] Edge Functions are deployed and accessible

### 2. Data Ingestion Test
- [ ] Navigate to Queues tab
- [ ] Create a new queue (e.g., "test-queue-t32")
- [ ] Upload `sample-submission.json`
- [ ] Verify submission is created in database
- [ ] Verify 2 questions are parsed and stored
- [ ] Verify 2 answers are parsed and stored

### 3. Judge Creation Test
- [ ] Navigate to Judges tab
- [ ] Create at least 2 AI judges with different system prompts
- [ ] Verify judges are stored in database
- [ ] Verify judges are active and ready for assignment

### 4. Assignment Test
- [ ] Navigate to Assignment tab
- [ ] Select the test queue
- [ ] Assign judges to questions (2 judges × 2 questions = 4 assignments)
- [ ] Verify assignments are stored in database
- [ ] Verify assignment UI shows correct counts

### 5. Evaluation Test
- [ ] Navigate to Evaluation tab
- [ ] Select the test queue
- [ ] Verify evaluation plan shows 4 evaluations (2 judges × 2 questions)
- [ ] Run evaluations
- [ ] Verify all 4 evaluations complete successfully
- [ ] Verify run is created with correct status
- [ ] Verify evaluations are stored in database

### 6. Results Verification
- [ ] Check that detailed results table shows all 4 evaluations
- [ ] Verify each evaluation has:
  - Correct judge name
  - Correct question template
  - Valid verdict (pass/fail/inconclusive)
  - Detailed reasoning from AI
  - Timing information
- [ ] Verify summary shows correct counts
- [ ] Verify no errors in console

### 7. Database Verification
- [ ] Check `runs` table has 1 row with status 'completed'
- [ ] Check `evaluations` table has 4 rows
- [ ] Verify all evaluations have valid verdicts and reasoning
- [ ] Verify foreign key relationships are correct

## Expected Results
- All 4 evaluations should complete successfully
- All data should be persisted correctly
- No errors should occur during the process
- Results should be visible in the UI
- Database should contain all expected rows

## Success Criteria
✅ **T32 Complete** when:
- Small dataset (1 submission, 2 questions, 2 judges) processes end-to-end
- All evaluations complete and persist to database
- Results are visible in the UI
- No errors occur during the process
- Database contains all expected data with correct relationships
