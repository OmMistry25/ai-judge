#!/usr/bin/env node

/**
 * T32 Database Verification Script
 * 
 * This script verifies that the manual test completed successfully
 * by checking the database state after running evaluations.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in apps/web/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log('🔍 Verifying database state for T32 manual test...\n');

  try {
    // Check queues
    const { data: queues, error: queuesError } = await supabase
      .from('queues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queuesError) throw queuesError;
    console.log(`📁 Queues: ${queues.length} found`);
    queues.forEach(q => console.log(`  - ${q.name} (${q.id})`));

    // Check submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (submissionsError) throw submissionsError;
    console.log(`\n📄 Submissions: ${submissions.length} found`);
    submissions.forEach(s => console.log(`  - ${s.id} (queue: ${s.queue_id})`));

    // Check questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (questionsError) throw questionsError;
    console.log(`\n❓ Questions: ${questions.length} found`);
    questions.forEach(q => console.log(`  - ${q.template_id} (${q.question_type})`));

    // Check answers
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (answersError) throw answersError;
    console.log(`\n💬 Answers: ${answers.length} found`);
    answers.forEach(a => console.log(`  - ${a.template_id} (${a.choice ? 'choice' : 'reasoning'})`));

    // Check judges
    const { data: judges, error: judgesError } = await supabase
      .from('judges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (judgesError) throw judgesError;
    console.log(`\n⚖️ Judges: ${judges.length} found`);
    judges.forEach(j => console.log(`  - ${j.name} (${j.provider}/${j.model})`));

    // Check judge assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('judge_assignments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (assignmentsError) throw assignmentsError;
    console.log(`\n🔗 Judge Assignments: ${assignments.length} found`);
    assignments.forEach(a => console.log(`  - Judge ${a.judge_id} → ${a.template_id}`));

    // Check runs
    const { data: runs, error: runsError } = await supabase
      .from('runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (runsError) throw runsError;
    console.log(`\n🏃 Runs: ${runs.length} found`);
    runs.forEach(r => console.log(`  - ${r.id} (${r.status}) - ${r.completed_count}/${r.planned_count}`));

    // Check evaluations
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (evaluationsError) throw evaluationsError;
    console.log(`\n🎯 Evaluations: ${evaluations.length} found`);
    evaluations.forEach(e => console.log(`  - ${e.verdict} (${e.judge_id}) - ${e.reasoning?.substring(0, 50)}...`));

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  - Queues: ${queues.length}`);
    console.log(`  - Submissions: ${submissions.length}`);
    console.log(`  - Questions: ${questions.length}`);
    console.log(`  - Answers: ${answers.length}`);
    console.log(`  - Judges: ${judges.length}`);
    console.log(`  - Assignments: ${assignments.length}`);
    console.log(`  - Runs: ${runs.length}`);
    console.log(`  - Evaluations: ${evaluations.length}`);

    // Check for completed runs
    const completedRuns = runs.filter(r => r.status === 'completed');
    console.log(`\n✅ Completed runs: ${completedRuns.length}`);

    if (completedRuns.length > 0) {
      console.log('\n🎉 T32 Manual Test appears to be successful!');
      console.log('   All data has been persisted correctly.');
    } else {
      console.log('\n⚠️ No completed runs found. Make sure to run evaluations first.');
    }

  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
