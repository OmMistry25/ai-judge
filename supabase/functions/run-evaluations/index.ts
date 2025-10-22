import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://esm.sh/zod@3.22.4';

// Request payload schema
const RunEvaluationsRequestSchema = z.object({
  queueId: z.string(),
  concurrency: z.number().min(1).max(10).default(3),
});

type RunEvaluationsRequest = z.infer<typeof RunEvaluationsRequestSchema>;

// Response schema
const RunEvaluationsResponseSchema = z.object({
  success: z.boolean(),
  run: z.object({
    id: z.string(),
    queueId: z.string(),
    status: z.enum(['running', 'completed', 'failed']),
    planned: z.number(),
    completed: z.number(),
    failed: z.number(),
    createdAt: z.string(),
    completedAt: z.string().optional(),
  }).optional(),
  summary: z.object({
    totalEvaluations: z.number(),
    successfulEvaluations: z.number(),
    failedEvaluations: z.number(),
    averageLatency: z.number(),
    totalDuration: z.number(),
  }).optional(),
  error: z.string().optional(),
});

type RunEvaluationsResponse = z.infer<typeof RunEvaluationsResponseSchema>;

// Concurrency control
class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(private maxConcurrency: number) {}

  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running < this.maxConcurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task();
      }
    }
  }

  async waitForAll(): Promise<void> {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Main orchestrator function
async function runEvaluations(
  queueId: string,
  concurrency: number,
  supabase: any
): Promise<RunEvaluationsResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Starting evaluation run for queue: ${queueId}`);
    console.log(`⚙️ Concurrency limit: ${concurrency}`);

    // Create a new run record
    const runId = crypto.randomUUID();
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        id: runId,
        queue_id: queueId,
        status: 'running',
        planned_count: 0,
        completed_count: 0,
        failed_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !run) {
      throw new Error(`Failed to create run: ${runError?.message || 'Unknown error'}`);
    }

    console.log(`📝 Created run: ${runId}`);

    // Get all submissions for the queue
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id')
      .eq('queue_id', queueId);

    if (submissionsError || !submissions || submissions.length === 0) {
      throw new Error(`No submissions found for queue: ${queueId}`);
    }

    console.log(`📊 Found ${submissions.length} submissions`);

    // Get all judge assignments for the queue
    const { data: assignments, error: assignmentsError } = await supabase
      .from('judge_assignments')
      .select(`
        id,
        judge_id,
        template_id,
        judges!inner(name, provider, model)
      `)
      .eq('queue_id', queueId);

    if (assignmentsError || !assignments || assignments.length === 0) {
      throw new Error(`No judge assignments found for queue: ${queueId}`);
    }

    console.log(`👥 Found ${assignments.length} judge assignments`);

    // Compute cartesian product: submissions × assignments
    const evaluationTasks: Array<{
      submissionId: string;
      templateId: string;
      judgeId: string;
      judgeName: string;
    }> = [];

    for (const submission of submissions) {
      for (const assignment of assignments) {
        evaluationTasks.push({
          submissionId: submission.id,
          templateId: assignment.template_id,
          judgeId: assignment.judge_id,
          judgeName: assignment.judges.name,
        });
      }
    }

    console.log(`🎯 Planned ${evaluationTasks.length} evaluations`);
    console.log(`  - ${submissions.length} submissions × ${assignments.length} assignments`);

    // Update run with planned count
    await supabase
      .from('runs')
      .update({ planned_count: evaluationTasks.length })
      .eq('id', runId);

    // Track evaluation results with detailed metrics
    let completed = 0;
    let failed = 0;
    const latencies: number[] = [];
    const errors: string[] = [];
    const verdicts: { [key: string]: number } = { pass: 0, fail: 0, inconclusive: 0 };
    const judgeStats: { [key: string]: { completed: number; failed: number; avgLatency: number } } = {};
    const startTime = Date.now();

    // Create concurrency limiter
    const limiter = new ConcurrencyLimiter(concurrency);

    // Execute evaluations with concurrency control
    const evaluationPromises = evaluationTasks.map(async (task, index) => {
      return limiter.execute(async () => {
        const taskStartTime = Date.now();
        console.log(`🔄 Starting evaluation ${index + 1}/${evaluationTasks.length}: ${task.judgeName} on submission ${task.submissionId}`);
        
        try {
          // Call the evaluate Edge Function
          const evaluateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/evaluate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submissionId: task.submissionId,
              templateId: task.templateId,
              judgeId: task.judgeId,
            }),
          });

          const result = await evaluateResponse.json();
          const taskLatency = Date.now() - taskStartTime;
          latencies.push(taskLatency);

          if (result.success && result.evaluation) {
            // Store the evaluation result
            await supabase
              .from('evaluations')
              .insert({
                id: result.evaluation.id,
                run_id: runId,
                submission_id: task.submissionId,
                template_id: task.templateId,
                judge_id: task.judgeId,
                verdict: result.evaluation.verdict,
                reasoning: result.evaluation.reasoning,
                provider: result.evaluation.provider,
                model: result.evaluation.model,
                latency_ms: result.evaluation.latencyMs,
                error: result.evaluation.error || null,
                created_at: new Date().toISOString(),
              });

            completed++;
            
            // Track detailed metrics
            verdicts[result.evaluation.verdict] = (verdicts[result.evaluation.verdict] || 0) + 1;
            
            // Track judge statistics
            if (!judgeStats[task.judgeName]) {
              judgeStats[task.judgeName] = { completed: 0, failed: 0, avgLatency: 0 };
            }
            judgeStats[task.judgeName].completed++;
            judgeStats[task.judgeName].avgLatency = 
              (judgeStats[task.judgeName].avgLatency * (judgeStats[task.judgeName].completed - 1) + taskLatency) / 
              judgeStats[task.judgeName].completed;
            
            console.log(`✅ Evaluation ${index + 1} completed: ${result.evaluation.verdict} (${taskLatency}ms) - ${task.judgeName}`);
          } else {
            failed++;
            const errorMsg = result.error || 'Unknown error';
            errors.push(errorMsg);
            
            // Track judge failure stats
            if (!judgeStats[task.judgeName]) {
              judgeStats[task.judgeName] = { completed: 0, failed: 0, avgLatency: 0 };
            }
            judgeStats[task.judgeName].failed++;
            
            console.log(`❌ Evaluation ${index + 1} failed: ${errorMsg} - ${task.judgeName}`);
          }
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(errorMsg);
          console.log(`💥 Evaluation ${index + 1} crashed: ${errorMsg}`);
        }

        // Update run progress
        await supabase
          .from('runs')
          .update({ 
            completed_count: completed,
            failed_count: failed,
            status: (completed + failed) === evaluationTasks.length ? 'completed' : 'running'
          })
          .eq('id', runId);
      });
    });

    // Wait for all evaluations to complete
    await Promise.all(evaluationPromises);
    await limiter.waitForAll();

    const totalDuration = Date.now() - startTime;
    const averageLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    // Update final run status
    const finalStatus = failed === 0 ? 'completed' : (completed > 0 ? 'completed' : 'failed');
    await supabase
      .from('runs')
      .update({ 
        status: finalStatus,
        completed_count: completed,
        failed_count: failed,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId);

    // Enhanced summary logging
    console.log(`🎉 Evaluation run completed!`);
    console.log(`📊 Summary:`);
    console.log(`  - Total planned: ${evaluationTasks.length}`);
    console.log(`  - Successfully completed: ${completed}`);
    console.log(`  - Failed: ${failed}`);
    console.log(`  - Success rate: ${Math.round((completed / evaluationTasks.length) * 100)}%`);
    console.log(`  - Total duration: ${totalDuration}ms`);
    console.log(`  - Average latency: ${Math.round(averageLatency)}ms`);
    
    console.log(`📈 Verdict breakdown:`);
    console.log(`  - Pass: ${verdicts.pass}`);
    console.log(`  - Fail: ${verdicts.fail}`);
    console.log(`  - Inconclusive: ${verdicts.inconclusive}`);
    
    console.log(`👥 Judge performance:`);
    Object.entries(judgeStats).forEach(([judgeName, stats]) => {
      console.log(`  - ${judgeName}: ${stats.completed} completed, ${stats.failed} failed, ${Math.round(stats.avgLatency)}ms avg`);
    });

    if (errors.length > 0) {
      console.log(`⚠️ Errors encountered: ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? '...' : ''}`);
    }

    return {
      success: true,
      run: {
        id: runId,
        queueId,
        status: finalStatus,
        planned: evaluationTasks.length,
        completed,
        failed,
        createdAt: run.created_at,
        completedAt: new Date().toISOString(),
      },
      summary: {
        totalEvaluations: evaluationTasks.length,
        successfulEvaluations: completed,
        failedEvaluations: failed,
        successRate: Math.round((completed / evaluationTasks.length) * 100),
        averageLatency: Math.round(averageLatency),
        totalDuration,
        verdictBreakdown: {
          pass: verdicts.pass,
          fail: verdicts.fail,
          inconclusive: verdicts.inconclusive,
        },
        judgePerformance: Object.entries(judgeStats).map(([judgeName, stats]) => ({
          judgeName,
          completed: stats.completed,
          failed: stats.failed,
          averageLatency: Math.round(stats.avgLatency),
        })),
        errors: errors.slice(0, 10), // Limit to first 10 errors
      },
    };

  } catch (error) {
    console.error('💥 Run evaluations error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedRequest = RunEvaluationsRequestSchema.parse(body);

    console.log('🚀 Starting run-evaluations request:', validatedRequest);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Run the evaluations
    const result = await runEvaluations(
      validatedRequest.queueId,
      validatedRequest.concurrency,
      supabase
    );

    console.log('✅ Run-evaluations completed:', result.success ? 'SUCCESS' : 'FAILED');

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Run-evaluations function error:', error);

    const errorResponse: RunEvaluationsResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});