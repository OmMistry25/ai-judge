import { useState, useEffect } from 'react';

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

interface Question {
  id: string;
  submission_id: string;
  template_id: string;
  rev: number;
  question_type: string;
  question_text: string;
}

interface Assignment {
  id: string;
  queue_id: string;
  template_id: string;
  judge_id: string;
  judge?: Judge;
}

interface AssignmentManagerProps {
  queues: Queue[];
  judges: Judge[];
  onAssignmentChange?: () => void;
}

export function AssignmentManager({ queues, judges, onAssignmentChange }: AssignmentManagerProps) {
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch questions for selected queue
  const fetchQuestions = async (queueId: string) => {
    if (!queueId) return;
    
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        // Get all submissions for this queue
        const { data: submissions, error: submissionsError } = await (supabase as any)
          .from('submissions')
          .select('id')
          .eq('queue_id', queueId);

        if (submissionsError) {
          throw new Error(`Error fetching submissions: ${submissionsError.message}`);
        }

        if (!submissions || submissions.length === 0) {
          setQuestions([]);
          setAssignments([]);
          return;
        }

        // Get all questions for these submissions
        const { data: questionsData, error: questionsError } = await (supabase as any)
          .from('questions')
          .select('*')
          .in('submission_id', submissions.map((s: any) => s.id));

        if (questionsError) {
          throw new Error(`Error fetching questions: ${questionsError.message}`);
        }

        setQuestions(questionsData || []);

        // Get existing assignments
        const { data: assignmentsData, error: assignmentsError } = await (supabase as any)
          .from('judge_assignments')
          .select(`
            *,
            judge:judges(*)
          `)
          .eq('queue_id', queueId);

        if (assignmentsError) {
          throw new Error(`Error fetching assignments: ${assignmentsError.message}`);
        }

        setAssignments(assignmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle queue selection
  useEffect(() => {
    if (selectedQueueId) {
      fetchQuestions(selectedQueueId);
    } else {
      setQuestions([]);
      setAssignments([]);
    }
  }, [selectedQueueId]);

  // Create assignment
  const handleCreateAssignment = async (templateId: string, judgeId: string) => {
    if (!selectedQueueId) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        const { error } = await (supabase as any)
          .from('judge_assignments')
          .insert({
            queue_id: selectedQueueId,
            template_id: templateId,
            judge_id: judgeId,
          });

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Refresh assignments
        await fetchQuestions(selectedQueueId);
        setMessage('✅ Assignment created successfully!');
        setTimeout(() => setMessage(''), 3000);
        
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId: string) => {
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        const { error } = await supabase
          .from('judge_assignments')
          .delete()
          .eq('id', assignmentId);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Refresh assignments
        await fetchQuestions(selectedQueueId);
        setMessage('✅ Assignment deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
        
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get assignments for a specific question
  const getAssignmentsForQuestion = (templateId: string) => {
    return assignments.filter(a => a.template_id === templateId);
  };

  // Get available judges (not already assigned to this question)
  const getAvailableJudges = (templateId: string) => {
    const assignedJudgeIds = getAssignmentsForQuestion(templateId).map(a => a.judge_id);
    return judges.filter(judge => 
      judge.active && !assignedJudgeIds.includes(judge.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Queue Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Queue</h3>
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
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Questions and Assignments */}
      {selectedQueueId && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Questions & Judge Assignments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign AI judges to evaluate specific questions
            </p>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No questions found in this queue.</p>
              <p className="text-sm text-gray-400 mt-1">Upload some submissions first.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {questions.map((question) => {
                const questionAssignments = getAssignmentsForQuestion(question.template_id);
                const availableJudges = getAvailableJudges(question.template_id);

                return (
                  <div key={question.id} className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {question.question_text}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {question.question_type}</span>
                        <span>Template: {question.template_id}</span>
                      </div>
                    </div>

                    {/* Current Assignments */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Assigned Judges ({questionAssignments.length})
                      </h5>
                      {questionAssignments.length === 0 ? (
                        <p className="text-sm text-gray-500">No judges assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {questionAssignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{assignment.judge?.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({assignment.judge?.provider} / {assignment.judge?.model})
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={loading}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add New Assignment */}
                    {availableJudges.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Assign Judge
                        </h5>
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleCreateAssignment(question.template_id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                          >
                            <option value="">Select a judge...</option>
                            {availableJudges.map((judge) => (
                              <option key={judge.id} value={judge.id}>
                                {judge.name} ({judge.provider} / {judge.model})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {availableJudges.length === 0 && questionAssignments.length > 0 && (
                      <p className="text-sm text-gray-500">
                        All available judges have been assigned to this question.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
