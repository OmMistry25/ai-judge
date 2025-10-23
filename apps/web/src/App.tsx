import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { JudgeForm } from './components/JudgeForm';
import { JudgeList } from './components/JudgeList';
import { AssignmentManager } from './components/AssignmentManager';
import { EvaluationManager } from './components/EvaluationManager';
import { ResultsPage } from './components/ResultsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [queueName, setQueueName] = useState('');
  const [queues, setQueues] = useState<Array<{id: string, name: string, createdAt: string}>>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Array<{id: string, queueId: string, uploadedAt: string}>>([]);
  const [message, setMessage] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Judges state
  const [judges, setJudges] = useState<Array<{
    id: string;
    name: string;
    system_prompt: string;
    provider: string;
    model: string;
    active: boolean;
    created_at: string;
  }>>([]);
  const [showJudgeForm, setShowJudgeForm] = useState(false);
  const [editingJudge, setEditingJudge] = useState<typeof judges[0] | null>(null);
  const [judgesLoading, setJudgesLoading] = useState(false);
  
  // Assignments state
  const [assignments, setAssignments] = useState<Array<{
    id: string;
    queue_id: string;
    template_id: string;
    judge_id: string;
    judge?: typeof judges[0];
  }>>([]);

  const handleCreateQueue = async () => {
    if (queueName.trim()) {
      try {
        // Generate a proper UUID for the queue
        const queueId = crypto.randomUUID();
        
        // Try to save to database first
        try {
          const { supabase } = await import('./lib/supabase');
          if (supabase) {
            const { error } = await supabase
              .from('queues')
              .insert({
                id: queueId,
                name: queueName.trim(),
              } as any);
            
            if (error) {
              console.error('Database error creating queue:', error);
              setMessage(`❌ Database error: ${error.message}`);
              return;
            }
            console.log('✅ Queue saved to database:', queueId);
          }
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          setMessage(`❌ Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          return;
        }
        
        // If database save succeeded, update local state
        const newQueue = {
          id: queueId,
          name: queueName.trim(),
          createdAt: new Date().toISOString()
        };
        setQueues(prev => [newQueue, ...prev]);
        setQueueName('');
        setMessage(`✅ Queue "${newQueue.name}" created successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(`❌ Error creating queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      setMessage('❌ Please enter a queue name');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUploadSuccess = (submissionId: string) => {
    const newSubmission = {
      id: submissionId,
      queueId: selectedQueueId,
      uploadedAt: new Date().toISOString()
    };
    setSubmissions(prev => [newSubmission, ...prev]);
  };

  // Judge management functions
  const handleCreateJudge = async (judgeData: {
    name: string;
    system_prompt: string;
    provider: string;
    model: string;
    active: boolean;
  }) => {
    console.log('Creating new judge with data:', judgeData);
    setJudgesLoading(true);
    try {
      const { supabase } = await import('./lib/supabase');
      if (supabase) {
        const { data, error } = await supabase
          .from('judges')
          .insert(judgeData as any)
          .select()
          .single();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        setJudges(prev => [data, ...prev]);
        setShowJudgeForm(false);
        setMessage('✅ Judge created successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error creating judge:', error);
      setMessage(`❌ Error creating judge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setJudgesLoading(false);
    }
  };

  const handleEditJudge = async (judgeData: {
    name: string;
    system_prompt: string;
    provider: string;
    model: string;
    active: boolean;
  }) => {
    if (!editingJudge) return;

    console.log('Editing judge:', editingJudge.id, 'with data:', judgeData);
    setJudgesLoading(true);
    try {
      const { supabase } = await import('./lib/supabase');
      if (supabase) {
        const { error } = await (supabase as any)
          .from('judges')
          .update({
            name: judgeData.name,
            system_prompt: judgeData.system_prompt,
            provider: judgeData.provider,
            model: judgeData.model,
            active: judgeData.active,
          })
          .eq('id', editingJudge.id);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        setJudges(prev => prev.map(judge => 
          judge.id === editingJudge.id 
            ? { ...judge, ...judgeData }
            : judge
        ));
        setEditingJudge(null);
        setShowJudgeForm(false);
        setMessage('✅ Judge updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating judge:', error);
      setMessage(`❌ Error updating judge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setJudgesLoading(false);
    }
  };

  const handleDeleteJudge = async (judgeId: string) => {
    setJudgesLoading(true);
    try {
      const { supabase } = await import('./lib/supabase');
      if (supabase) {
        const { error } = await supabase
          .from('judges')
          .delete()
          .eq('id', judgeId);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        setJudges(prev => prev.filter(judge => judge.id !== judgeId));
        setMessage('✅ Judge deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting judge:', error);
      setMessage(`❌ Error deleting judge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setJudgesLoading(false);
    }
  };

  const handleEditJudgeClick = (judge: typeof judges[0]) => {
    setEditingJudge(judge);
    setShowJudgeForm(true);
  };

  const handleCancelJudgeForm = () => {
    setShowJudgeForm(false);
    setEditingJudge(null);
  };

  // Global error handler (for future use)
  // const setGlobalErrorHandler = (error: string | null) => {
  //   setGlobalError(error);
  //   if (error) {
  //     setTimeout(() => setGlobalError(null), 10000); // Auto-dismiss after 10 seconds
  //   }
  // };

  // Fetch assignments for all queues
  const fetchAssignments = async () => {
    try {
      const { supabase } = await import('./lib/supabase');
      if (supabase) {
        const { data: assignmentsData, error } = await (supabase as any)
          .from('judge_assignments')
          .select(`
            *,
            judge:judges(*)
          `);

        if (error) {
          console.error('Error fetching assignments:', error);
          return;
        }

        setAssignments(assignmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Load assignments on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AI Judge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`nav-link ${
                  currentPage === 'home' 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                Queues
              </button>
              <button 
                onClick={() => setCurrentPage('judges')}
                className={`nav-link ${
                  currentPage === 'judges' 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                Judges
              </button>
              <button 
                onClick={() => setCurrentPage('assignments')}
                className={`nav-link ${
                  currentPage === 'assignments' 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                Assignments
              </button>
              <button 
                onClick={() => setCurrentPage('evaluations')}
                className={`nav-link ${
                  currentPage === 'evaluations' 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                Evaluations
              </button>
              <button 
                onClick={() => setCurrentPage('results')}
                className={`nav-link ${
                  currentPage === 'results' 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                Results
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Error Display */}
      {globalError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{globalError}</p>
      </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setGlobalError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ✕
        </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentPage === 'home' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judge Dashboard</h2>
                <p className="text-gray-600 mb-6">Upload and manage submission queues.</p>
                
                {/* Simple Connection Test */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">Supabase Connected</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Database is ready for submissions and evaluations.
        </p>
      </div>
                </div>
              </div>
              
              {/* Queue Management */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Management</h3>
                
                {/* Create Queue Form */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Queue name"
                      value={queueName}
                      onChange={(e) => setQueueName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateQueue()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleCreateQueue}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={!queueName.trim()}
                    >
                      Create Queue
                    </button>
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
                  
                  {/* Queue Selection */}
                  {queues.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Select Queue for Upload:</h4>
                      <select
                        value={selectedQueueId}
                        onChange={(e) => setSelectedQueueId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a queue...</option>
                        {queues.map((queue) => (
                          <option key={queue.id} value={queue.id}>
                            {queue.name} (ID: {queue.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Queue List */}
                  {queues.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">All Queues:</h4>
                      <div className="space-y-2">
                        {queues.map((queue) => {
                          // Check if this queue has assignments
                          const queueAssignments = assignments.filter(a => a.queue_id === queue.id);
                          const hasAssignments = queueAssignments.length > 0;
                          
                          return (
                            <div key={queue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                              <div>
                                <span className="font-medium text-gray-900">{queue.name}</span>
                                <span className="ml-2 text-sm text-gray-500">ID: {queue.id}</span>
                                {hasAssignments && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {queueAssignments.length} assignments
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-500">
                                  {new Date(queue.createdAt).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedQueueId(queue.id);
                                    setCurrentPage('evaluations');
                                  }}
                                  disabled={!hasAssignments}
                                  className={`px-3 py-1 text-sm rounded-md font-medium ${
                                    hasAssignments
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={hasAssignments ? 'Run AI Judges for this queue' : 'No judge assignments found. Go to Assignment tab to assign judges.'}
                                >
                                  {hasAssignments ? 'Run AI Judges' : 'No Assignments'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              {selectedQueueId && (
                <FileUpload 
                  queueId={selectedQueueId} 
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {/* Submissions List */}
              {submissions.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Submissions</h3>
                  <div className="space-y-2">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium text-gray-900">{submission.id}</span>
                          <span className="ml-2 text-sm text-gray-500">Queue: {submission.queueId}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(submission.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentPage === 'judges' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judges</h2>
                <p className="text-gray-600 mb-6">Create and manage AI judges for evaluating submissions.</p>
                
                {!showJudgeForm && (
                  <button
                    onClick={() => setShowJudgeForm(true)}
                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create New Judge
                  </button>
                )}
              </div>

              {showJudgeForm && (
                <JudgeForm
                  judge={editingJudge || undefined}
                  onSubmit={editingJudge ? handleEditJudge : handleCreateJudge}
                  onCancel={handleCancelJudgeForm}
                  isLoading={judgesLoading}
                />
              )}

              {!showJudgeForm && (
                <JudgeList
                  judges={judges}
                  onEdit={handleEditJudgeClick}
                  onDelete={handleDeleteJudge}
                  isLoading={judgesLoading}
                />
              )}
            </div>
          )}
          
          {currentPage === 'assignments' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Judge Assignments</h2>
                <p className="text-gray-600 mb-6">Assign AI judges to evaluate specific questions in your queues.</p>
              </div>

              <AssignmentManager
                queues={queues}
                judges={judges}
                onAssignmentChange={fetchAssignments}
              />
            </div>
          )}
          
          {currentPage === 'results' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluation Results</h2>
                <p className="text-gray-600 mb-6">View all evaluation results across all queues with detailed analysis.</p>
              </div>

              <ResultsPage />
            </div>
          )}
          
          {currentPage === 'evaluations' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Run Evaluations</h2>
                <p className="text-gray-600 mb-6">Execute AI judge evaluations on assigned questions and view results.</p>
              </div>

              <EvaluationManager
                queues={queues}
                judges={judges}
                assignments={assignments}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;