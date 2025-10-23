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
            question:questions(*),
            submission:submissions(*)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setEvaluations(data || []);
        setFilteredEvaluations(data || []);
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

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verdict
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reasoning
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  {/* Submission */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{evaluation.submission?.id || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs">
                        Queue: {evaluation.submission?.queue_id || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Question */}
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{evaluation.judge?.name || 'Unknown Judge'}</div>
                      <div className="text-gray-500 text-xs">
                        {evaluation.judge?.provider || 'N/A'} / {evaluation.judge?.model || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Verdict */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerdictColor(evaluation.verdict)}`}>
                      {evaluation.verdict}
                    </span>
                  </td>

                  {/* Reasoning */}
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
