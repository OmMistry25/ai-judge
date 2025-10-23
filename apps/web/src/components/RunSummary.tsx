import React from 'react';

interface RunSummaryProps {
  run: {
    id: string;
    queueId: string;
    status: 'running' | 'completed' | 'failed';
    planned: number;
    completed: number;
    failed: number;
    createdAt: string;
    completedAt?: string;
  };
  summary: {
    totalEvaluations: number;
    successfulEvaluations: number;
    failedEvaluations: number;
    successRate: number;
    averageLatency: number;
    totalDuration: number;
    verdictBreakdown: {
      pass: number;
      fail: number;
      inconclusive: number;
    };
    judgePerformance: Array<{
      judgeName: string;
      completed: number;
      failed: number;
      averageLatency: number;
    }>;
    errors: string[];
  };
  isLoading?: boolean;
}

export const RunSummary: React.FC<RunSummaryProps> = ({ 
  run, 
  summary, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* Run Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Evaluation Run Summary
          </h3>
          <p className="text-sm text-gray-500">
            Run ID: {run.id.slice(0, 8)}...
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(run.status)}`}>
            {getStatusIcon(run.status)} {run.status}
          </span>
          <div className="text-sm text-gray-500">
            {new Date(run.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalEvaluations}</div>
          <div className="text-sm text-blue-700">Total Planned</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{summary.successfulEvaluations}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{summary.failedEvaluations}</div>
          <div className="text-sm text-red-700">Failed</div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Success Rate</span>
          <span className="text-sm font-bold text-gray-900">{summary.successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${summary.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Verdict Breakdown */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Verdict Breakdown</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-600">{summary.verdictBreakdown.pass}</div>
            <div className="text-sm text-green-700">Pass</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-red-600">{summary.verdictBreakdown.fail}</div>
            <div className="text-sm text-red-700">Fail</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-yellow-600">{summary.verdictBreakdown.inconclusive}</div>
            <div className="text-sm text-yellow-700">Inconclusive</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Average Latency</div>
          <div className="text-lg font-semibold text-gray-900">{summary.averageLatency}ms</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Duration</div>
          <div className="text-lg font-semibold text-gray-900">{summary.totalDuration}ms</div>
        </div>
      </div>

      {/* Judge Performance */}
      {summary.judgePerformance.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Judge Performance</h4>
          <div className="space-y-2">
            {summary.judgePerformance.map((judge, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{judge.judgeName}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {judge.completed} completed, {judge.failed} failed
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {judge.averageLatency}ms avg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {summary.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-red-800 mb-2">Errors Encountered</h4>
          <div className="space-y-1">
            {summary.errors.slice(0, 5).map((error, index) => (
              <div key={index} className="text-sm text-red-700">
                • {error}
              </div>
            ))}
            {summary.errors.length > 5 && (
              <div className="text-sm text-red-600">
                ... and {summary.errors.length - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
