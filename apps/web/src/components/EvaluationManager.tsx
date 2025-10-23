import { useState, useEffect } from 'react';
import { RunSummary } from './RunSummary';
import { ToastContainer } from './Toast';

interface Queue {
  id: string;
  name: string;
  createdAt: string;
}

interface Judge {
  id: string;
  name: string;
  system_prompt: string;
  provider: string;
  model: string;
  active: boolean;
}

interface Assignment {
  id: string;
  queue_id: string;
  template_id: string;
  judge_id: string;
  judge?: Judge;
}

interface Submission {
  id: string;
  queue_id: string;
  labeling_task_id: string;
  created_at_ms: number;
}

interface Question {
  id: string;
  submission_id: string;
  template_id: string;
  rev: number;
  question_type: string;
  question_text: string;
}

interface Answer {
  id: string;
  submission_id: string;
  template_id: string;
  choice: string | null;
  reasoning: string | null;
}

interface Run {
  id: string;
  queue_id: string;
  planned_count: number;
  completed_count: number;
  failed_count: number;
  created_at: string;
}

interface Evaluation {
  id: string;
  run_id: string;
  submission_id: string;
  template_id: string;
  judge_id: string;
  verdict: 'pass' | 'fail' | 'inconclusive';
  reasoning: string;
  provider: string;
  model: string;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
  judge?: Judge;
}

interface EvaluationManagerProps {
  queues: Queue[];
  judges: Judge[];
  assignments: Assignment[];
}

export function EvaluationManager({ queues, judges, assignments }: EvaluationManagerProps) {
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);

  // Toast helper functions
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch data for selected queue
  const fetchQueueData = async (queueId: string) => {
    if (!queueId) return;
    
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        // Get submissions
        const { data: submissionsData, error: submissionsError } = await (supabase as any)
          .from('submissions')
          .select('*')
          .eq('queue_id', queueId);

        if (submissionsError) throw new Error(`Error fetching submissions: ${submissionsError.message}`);
        setSubmissions(submissionsData || []);

        if (!submissionsData || submissionsData.length === 0) {
          setQuestions([]);
          setAnswers([]);
          setRuns([]);
          setEvaluations([]);
          return;
        }

        // Get questions
        const { data: questionsData, error: questionsError } = await (supabase as any)
          .from('questions')
          .select('*')
          .in('submission_id', submissionsData.map((s: any) => s.id));

        if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
        setQuestions(questionsData || []);

        // Get answers
        const { data: answersData, error: answersError } = await (supabase as any)
          .from('answers')
          .select('*')
          .in('submission_id', submissionsData.map((s: any) => s.id));

        if (answersError) throw new Error(`Error fetching answers: ${answersError.message}`);
        setAnswers(answersData || []);

        // Get runs
        const { data: runsData, error: runsError } = await (supabase as any)
          .from('runs')
          .select('*')
          .eq('queue_id', queueId)
          .order('created_at', { ascending: false });

        if (runsError) throw new Error(`Error fetching runs: ${runsError.message}`);
        setRuns(runsData || []);

        // Get evaluations
        const { data: evaluationsData, error: evaluationsError } = await (supabase as any)
          .from('evaluations')
          .select(`
            *,
            judge:judges(*)
          `)
          .in('run_id', (runsData || []).map((r: any) => r.id));

        if (evaluationsError) throw new Error(`Error fetching evaluations: ${evaluationsError.message}`);
        setEvaluations(evaluationsData || []);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle queue selection
  useEffect(() => {
    if (selectedQueueId) {
      fetchQueueData(selectedQueueId);
    } else {
      setSubmissions([]);
      setQuestions([]);
      setAnswers([]);
      setRuns([]);
      setEvaluations([]);
    }
  }, [selectedQueueId]);

  // Get assignments for selected queue
  const getQueueAssignments = () => {
    return assignments.filter(a => a.queue_id === selectedQueueId);
  };

  // Calculate evaluation plan
  const getEvaluationPlan = () => {
    const queueAssignments = getQueueAssignments();
    const plan: Array<{
      submissionId: string;
      templateId: string;
      judgeId: string;
      question: Question;
      answer: Answer | null;
      judge: Judge;
    }> = [];

    for (const assignment of queueAssignments) {
      const judge = judges.find(j => j.id === assignment.judge_id);
      if (!judge) continue;

      // Find all questions with this template_id
      const templateQuestions = questions.filter(q => q.template_id === assignment.template_id);
      
      for (const question of templateQuestions) {
        const answer = answers.find(a => 
          a.submission_id === question.submission_id && 
          a.template_id === question.template_id
        ) || null;

        plan.push({
          submissionId: question.submission_id,
          templateId: question.template_id,
          judgeId: assignment.judge_id,
          question,
          answer,
          judge,
        });
      }
    }

    return plan;
  };

  // Run evaluations
  const handleRunEvaluations = async () => {
    if (!selectedQueueId) return;

    const evaluationPlan = getEvaluationPlan();
    if (evaluationPlan.length === 0) {
      addToast('No evaluations to run. Make sure you have assignments and submissions.', 'warning');
      return;
    }

    setRunning(true);
    addToast(`Starting evaluation run for ${evaluationPlan.length} evaluations...`, 'info');

    try {
      // Call the new run-evaluations Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/run-evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          queueId: selectedQueueId,
          concurrency: 3, // Run 3 evaluations concurrently
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.summary) {
        const { summary } = result;
        const successRate = summary.successRate || 0;
        
        addToast(
          `Evaluation completed! ${summary.successfulEvaluations}/${summary.totalEvaluations} successful (${successRate}%)`,
          'success',
          8000
        );
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

      // Refresh data to show new results
      await fetchQueueData(selectedQueueId);

    } catch (error) {
      console.error('Error running evaluations:', error);
      addToast(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 10000);
    } finally {
      setRunning(false);
    }
  };

  // Get evaluations for a specific run
  const getEvaluationsForRun = (runId: string) => {
    return evaluations.filter(e => e.run_id === runId);
  };

  return (
    <div className="space-y-6">
      {/* Queue Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Queue for Evaluation</h3>
        <select
          value={selectedQueueId}
          onChange={(e) => setSelectedQueueId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a queue...</option>
          {queues.map((queue) => (
            <option key={queue.id} value={queue.id}>
              {queue.name}
            </option>
          ))}
        </select>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-md ${
          message.startsWith('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.startsWith('🚀') || message.startsWith('🔄')
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Evaluation Plan */}
      {selectedQueueId && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Plan</h3>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const plan = getEvaluationPlan();
                const queueAssignments = getQueueAssignments();
                
                if (queueAssignments.length === 0) {
                  return (
                    <p className="text-gray-500">
                      No judge assignments found for this queue. Go to the Results tab to assign judges to questions.
                    </p>
                  );
                }

                if (plan.length === 0) {
                  return (
                    <p className="text-gray-500">
                      No submissions found in this queue. Upload some submissions first.
                    </p>
                  );
                }

                return (
                  <>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-blue-800 font-medium">
                        Ready to run {plan.length} evaluations
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        {queueAssignments.length} judge assignments × {submissions.length} submissions
                      </p>
                    </div>

                    <button
                      onClick={handleRunEvaluations}
                      disabled={running || plan.length === 0}
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {running ? 'Running Evaluations...' : `Run ${plan.length} Evaluations`}
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Evaluation Runs */}
      {selectedQueueId && runs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Evaluation Runs</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {runs.map((run) => {
              const runEvaluations = getEvaluationsForRun(run.id);
              const passCount = runEvaluations.filter(e => e.verdict === 'pass').length;
              const failCount = runEvaluations.filter(e => e.verdict === 'fail').length;
              const inconclusiveCount = runEvaluations.filter(e => e.verdict === 'inconclusive').length;

              return (
                <div key={run.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Run {run.id.slice(0, 8)}...
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {run.completed_count}/{run.planned_count} completed
                      </div>
                      {run.failed_count > 0 && (
                        <div className="text-sm text-red-600">
                          {run.failed_count} failed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Run Summary Component */}
                  <RunSummary
                    run={{
                      id: run.id,
                      queueId: run.queue_id,
                      status: run.completed_count === run.planned_count ? 'completed' : 'running',
                      planned: run.planned_count,
                      completed: run.completed_count,
                      failed: run.failed_count,
                      createdAt: run.created_at,
                      completedAt: run.completed_count === run.planned_count ? new Date().toISOString() : undefined
                    }}
                    summary={{
                      totalEvaluations: run.planned_count,
                      successfulEvaluations: run.completed_count,
                      failedEvaluations: run.failed_count,
                      successRate: run.planned_count > 0 ? Math.round((run.completed_count / run.planned_count) * 100) : 0,
                      averageLatency: runEvaluations.length > 0 ? Math.round(runEvaluations.reduce((sum, e) => sum + (e.latency_ms || 0), 0) / runEvaluations.length) : 0,
                      totalDuration: 0, // This would need to be calculated from run data
                      verdictBreakdown: {
                        pass: passCount,
                        fail: failCount,
                        inconclusive: inconclusiveCount
                      },
                      judgePerformance: [], // This would need to be calculated from evaluation data
                      errors: runEvaluations.filter(e => e.error).map(e => e.error!).slice(0, 10)
                    }}
                  />

                  {/* Detailed Results Table */}
                  {runEvaluations.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-700">Detailed Results:</h5>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Judge
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Question
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Verdict
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Reasoning
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Timing
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {runEvaluations.map((evaluation) => (
                                <tr key={evaluation.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {evaluation.judge?.name || 'Unknown Judge'}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {evaluation.template_id}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      evaluation.verdict === 'pass' ? 'bg-green-100 text-green-800' :
                                      evaluation.verdict === 'fail' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {evaluation.verdict}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 max-w-md">
                                    <div className="relative">
                                      <div 
                                        id={`reasoning-${evaluation.id}`}
                                        className="truncate" 
                                        title={evaluation.reasoning}
                                      >
                                        {evaluation.reasoning || 'No reasoning provided'}
                                      </div>
                                      {evaluation.reasoning && evaluation.reasoning.length > 50 && (
                                        <button
                                          className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                                          onClick={() => {
                                            // Toggle full reasoning display
                                            const element = document.getElementById(`reasoning-${evaluation.id}`);
                                            if (element) {
                                              element.classList.toggle('truncate');
                                            }
                                          }}
                                        >
                                          Show full reasoning
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {evaluation.latency_ms ? `${evaluation.latency_ms}ms` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
