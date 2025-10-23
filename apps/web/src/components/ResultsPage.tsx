import React, { useState, useEffect } from 'react';
import { FiltersBar } from './FiltersBar';

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
  judge?: {
    id: string;
    name: string;
    system_prompt: string;
    provider: string;
    model: string;
    active: boolean;
  };
  question?: {
    id: string;
    submission_id: string;
    template_id: string;
    rev: number;
    question_type: string;
    question_text: string;
  };
  submission?: {
    id: string;
    queue_id: string;
    labeling_task_id: string;
    created_at_ms: number;
    raw: any;
  };
}

interface ResultsPageProps {
  // No props needed - this component fetches its own data
}

export const ResultsPage: React.FC<ResultsPageProps> = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedVerdicts, setSelectedVerdicts] = useState<string[]>([]);

  // Fetch all evaluations with joined data
  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        const { data, error: fetchError } = await (supabase as any)
          .from('evaluations')
          .select(`
            *,
            judge:judges(*),
            submission:submissions(*)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Fetch questions separately to match by template_id
        const { data: questionsData, error: questionsError } = await (supabase as any)
          .from('questions')
          .select('*');

        if (questionsError) {
          throw new Error(`Error fetching questions: ${questionsError.message}`);
        }

        // Combine evaluations with questions
        const evaluationsWithQuestions = (data || []).map((evaluation: any) => ({
          ...evaluation,
          question: questionsData?.find((q: any) => q.template_id === evaluation.template_id) || null
        }));

        setEvaluations(evaluationsWithQuestions);
        setFilteredEvaluations(evaluationsWithQuestions);
        
        // Verify pass rate calculations after data loads
        if (evaluationsWithQuestions && evaluationsWithQuestions.length > 0) {
          setTimeout(() => {
            verifyPassRateCalculations();
          }, 100);
        }
      } else {
        throw new Error('Supabase not available');
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to evaluations
  useEffect(() => {
    let filtered = evaluations;

    if (selectedJudges.length > 0) {
      filtered = filtered.filter(e => selectedJudges.includes(e.judge_id));
    }

    if (selectedQuestions.length > 0) {
      filtered = filtered.filter(e => selectedQuestions.includes(e.template_id));
    }

    if (selectedVerdicts.length > 0) {
      filtered = filtered.filter(e => selectedVerdicts.includes(e.verdict));
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, selectedJudges, selectedQuestions, selectedVerdicts]);

  // Generate filter options
  const getFilterOptions = () => {
    const judges = Array.from(new Set(evaluations.map(e => e.judge_id)))
      .map(judgeId => {
        const judge = evaluations.find(e => e.judge_id === judgeId)?.judge;
        const count = evaluations.filter(e => e.judge_id === judgeId).length;
        return {
          value: judgeId,
          label: judge?.name || 'Unknown Judge',
          count
        };
      });

    const questions = Array.from(new Set(evaluations.map(e => e.template_id)))
      .map(templateId => {
        const question = evaluations.find(e => e.template_id === templateId)?.question;
        const count = evaluations.filter(e => e.template_id === templateId).length;
        return {
          value: templateId,
          label: question?.question_text || templateId,
          count
        };
      });

    const verdicts = [
      { value: 'pass', label: 'Pass', count: evaluations.filter(e => e.verdict === 'pass').length },
      { value: 'fail', label: 'Fail', count: evaluations.filter(e => e.verdict === 'fail').length },
      { value: 'inconclusive', label: 'Inconclusive', count: evaluations.filter(e => e.verdict === 'inconclusive').length }
    ];

    return { judges, questions, verdicts };
  };

  const handleFiltersChange = (filters: {
    judges: string[];
    questions: string[];
    verdicts: string[];
  }) => {
    setSelectedJudges(filters.judges);
    setSelectedQuestions(filters.questions);
    setSelectedVerdicts(filters.verdicts);
  };

  // Verify pass rate calculations against database counts
  const verifyPassRateCalculations = () => {
    const totalEvaluations = evaluations.length;
    const passCount = evaluations.filter(e => e.verdict === 'pass').length;
    const calculatedPassRate = totalEvaluations > 0 ? Math.round((passCount / totalEvaluations) * 100) : 0;
    
    const failCount = evaluations.filter(e => e.verdict === 'fail').length;
    const inconclusiveCount = evaluations.filter(e => e.verdict === 'inconclusive').length;
    
    console.log('Pass Rate Verification:', {
      totalEvaluations,
      passCount,
      calculatedPassRate,
      failCount,
      inconclusiveCount,
      verification: passCount + failCount + inconclusiveCount === totalEvaluations
    });
    
    return {
      totalEvaluations,
      passCount,
      calculatedPassRate,
      isVerified: passCount + failCount + inconclusiveCount === totalEvaluations
    };
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-3">❌</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Results</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchEvaluations}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-600 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
          <p className="text-gray-700 mb-4">
            No evaluation results are available yet. Run some evaluations to see results here.
          </p>
          <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-800">
            <strong>To get results:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to the <strong>Evaluations</strong> tab</li>
              <li>Select a queue and run evaluations</li>
              <li>Results will appear here automatically</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const filterOptions = getFilterOptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
            <p className="text-gray-600 mt-1">
              {filteredEvaluations.length} of {evaluations.length} evaluations
              {filteredEvaluations.length !== evaluations.length && ' (filtered)'}
            </p>
          </div>
          <button
            onClick={fetchEvaluations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar
        judges={filterOptions.judges}
        questions={filterOptions.questions}
        verdicts={filterOptions.verdicts}
        selectedJudges={selectedJudges}
        selectedQuestions={selectedQuestions}
        selectedVerdicts={selectedVerdicts}
        onFiltersChange={handleFiltersChange}
      />

      {/* Aggregate Pass Rate */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aggregate Pass Rate</h3>
          <button
            onClick={verifyPassRateCalculations}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Verify calculations against database counts"
          >
            Verify
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {filteredEvaluations.length > 0 
                ? Math.round((filteredEvaluations.filter(e => e.verdict === 'pass').length / filteredEvaluations.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Pass Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {filteredEvaluations.filter(e => e.verdict === 'pass').length} of {filteredEvaluations.length} evaluations
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {filteredEvaluations.length > 0 
                ? Math.round((filteredEvaluations.filter(e => e.verdict === 'pass').length / filteredEvaluations.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Pass Rate (Filtered)</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on current filters
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {evaluations.length > 0 
                ? Math.round((evaluations.filter(e => e.verdict === 'pass').length / evaluations.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Pass Rate (All Data)</div>
            <div className="text-xs text-gray-500 mt-1">
              {evaluations.filter(e => e.verdict === 'pass').length} of {evaluations.length} total
            </div>
          </div>
        </div>
        
        {/* Pass Rate Breakdown by Judge */}
        {filteredEvaluations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Pass Rate by Judge</h4>
            <div className="space-y-2">
              {Array.from(new Set(filteredEvaluations.map(e => e.judge_id))).map(judgeId => {
                const judgeEvaluations = filteredEvaluations.filter(e => e.judge_id === judgeId);
                const judge = judgeEvaluations[0]?.judge;
                const passCount = judgeEvaluations.filter(e => e.verdict === 'pass').length;
                const passRate = Math.round((passCount / judgeEvaluations.length) * 100);
                
                return (
                  <div key={judgeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{judge?.name || 'Unknown Judge'}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {judgeEvaluations.length} evaluations
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{passRate}%</div>
                      <div className="text-sm text-gray-500">{passCount} passed</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table-mobile">
            <thead>
              <tr>
                <th>Submission</th>
                <th>Question</th>
                <th>Judge</th>
                <th>Verdict</th>
                <th>Reasoning</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  {/* Submission */}
                  <td data-label="Submission">
                    <div>
                      <div className="font-medium">{evaluation.submission?.id || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs">
                        Queue: {evaluation.submission?.queue_id || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Question */}
                  <td data-label="Question">
                    <div>
                      <div className="font-medium">{evaluation.question?.template_id || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {evaluation.question?.question_type || 'N/A'}
                      </div>
                      <div className="text-gray-600 text-xs mt-1 truncate" title={evaluation.question?.question_text}>
                        {evaluation.question?.question_text || 'No question text'}
                      </div>
                    </div>
                  </td>

                  {/* Judge */}
                  <td data-label="Judge">
                    <div>
                      <div className="font-medium">{evaluation.judge?.name || 'Unknown Judge'}</div>
                      <div className="text-gray-500 text-xs">
                        {evaluation.judge?.provider || 'N/A'} / {evaluation.judge?.model || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Verdict */}
                  <td data-label="Verdict">
                    <span className={`${
                      evaluation.verdict === 'pass' 
                        ? 'status-pass'
                        : evaluation.verdict === 'fail'
                        ? 'status-fail'
                        : 'status-inconclusive'
                    }`}>
                      {evaluation.verdict}
                    </span>
                  </td>

                  {/* Reasoning */}
                  <td data-label="Reasoning">
                    <div className="truncate" title={evaluation.reasoning}>
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
                  </td>

                  {/* Created */}
                  <td data-label="Created" className="text-gray-500">
                    <div>
                      <div>{formatDate(evaluation.created_at)}</div>
                      {evaluation.latency_ms && (
                        <div className="text-xs text-gray-400">
                          {evaluation.latency_ms}ms
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredEvaluations.length}</div>
            <div className="text-sm text-gray-600">Filtered Evaluations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredEvaluations.filter(e => e.verdict === 'pass').length}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredEvaluations.filter(e => e.verdict === 'fail').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredEvaluations.filter(e => e.verdict === 'inconclusive').length}
            </div>
            <div className="text-sm text-gray-600">Inconclusive</div>
          </div>
        </div>
      </div>
    </div>
  );
};
