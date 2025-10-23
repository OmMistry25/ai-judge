import React, { useState, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FiltersBarProps {
  judges: FilterOption[];
  questions: FilterOption[];
  verdicts: FilterOption[];
  selectedJudges: string[];
  selectedQuestions: string[];
  selectedVerdicts: string[];
  onFiltersChange: (filters: {
    judges: string[];
    questions: string[];
    verdicts: string[];
  }) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  judges,
  questions,
  verdicts,
  selectedJudges,
  selectedQuestions,
  selectedVerdicts,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedJudges.length > 0) {
      params.set('judges', selectedJudges.join(','));
    }
    if (selectedQuestions.length > 0) {
      params.set('questions', selectedQuestions.join(','));
    }
    if (selectedVerdicts.length > 0) {
      params.set('verdicts', selectedVerdicts.join(','));
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedJudges, selectedQuestions, selectedVerdicts]);

  // Load filters from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const urlJudges = params.get('judges')?.split(',').filter(Boolean) || [];
    const urlQuestions = params.get('questions')?.split(',').filter(Boolean) || [];
    const urlVerdicts = params.get('verdicts')?.split(',').filter(Boolean) || [];

    if (urlJudges.length > 0 || urlQuestions.length > 0 || urlVerdicts.length > 0) {
      onFiltersChange({
        judges: urlJudges,
        questions: urlQuestions,
        verdicts: urlVerdicts
      });
    }
  }, []);

  const handleJudgeChange = (judgeId: string, checked: boolean) => {
    const newJudges = checked
      ? [...selectedJudges, judgeId]
      : selectedJudges.filter(id => id !== judgeId);
    
    onFiltersChange({
      judges: newJudges,
      questions: selectedQuestions,
      verdicts: selectedVerdicts
    });
  };

  const handleQuestionChange = (questionId: string, checked: boolean) => {
    const newQuestions = checked
      ? [...selectedQuestions, questionId]
      : selectedQuestions.filter(id => id !== questionId);
    
    onFiltersChange({
      judges: selectedJudges,
      questions: newQuestions,
      verdicts: selectedVerdicts
    });
  };

  const handleVerdictChange = (verdict: string, checked: boolean) => {
    const newVerdicts = checked
      ? [...selectedVerdicts, verdict]
      : selectedVerdicts.filter(v => v !== verdict);
    
    onFiltersChange({
      judges: selectedJudges,
      questions: selectedQuestions,
      verdicts: newVerdicts
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      judges: [],
      questions: [],
      verdicts: []
    });
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'pass':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      case 'inconclusive':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const activeFiltersCount = selectedJudges.length + selectedQuestions.length + selectedVerdicts.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'} filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Judges Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Judges ({selectedJudges.length}/{judges.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {judges.map((judge) => (
                <label key={judge.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJudges.includes(judge.value)}
                    onChange={(e) => handleJudgeChange(judge.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{judge.label}</span>
                  {judge.count !== undefined && (
                    <span className="text-xs text-gray-500">({judge.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Questions Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Questions ({selectedQuestions.length}/{questions.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {questions.map((question) => (
                <label key={question.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.value)}
                    onChange={(e) => handleQuestionChange(question.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1 truncate" title={question.label}>
                    {question.label}
                  </span>
                  {question.count !== undefined && (
                    <span className="text-xs text-gray-500">({question.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Verdicts Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Verdicts ({selectedVerdicts.length}/{verdicts.length})</h4>
            <div className="space-y-2">
              {verdicts.map((verdict) => (
                <label key={verdict.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVerdicts.includes(verdict.value)}
                    onChange={(e) => handleVerdictChange(verdict.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium flex-1 ${getVerdictColor(verdict.value)}`}>
                    {verdict.label}
                  </span>
                  {verdict.count !== undefined && (
                    <span className="text-xs text-gray-500">({verdict.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedJudges.map((judgeId) => {
              const judge = judges.find(j => j.value === judgeId);
              return (
                <span
                  key={`judge-${judgeId}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Judge: {judge?.label}
                  <button
                    onClick={() => handleJudgeChange(judgeId, false)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {selectedQuestions.map((questionId) => {
              const question = questions.find(q => q.value === questionId);
              return (
                <span
                  key={`question-${questionId}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Question: {question?.label}
                  <button
                    onClick={() => handleQuestionChange(questionId, false)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {selectedVerdicts.map((verdict) => (
              <span
                key={`verdict-${verdict}`}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  verdict === 'pass' ? 'bg-green-100 text-green-800' :
                  verdict === 'fail' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                Verdict: {verdict}
                <button
                  onClick={() => handleVerdictChange(verdict, false)}
                  className="ml-1 hover:opacity-75"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
