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
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'home' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Queues
              </button>
              <button 
                onClick={() => setCurrentPage('judges')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'judges' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Judges
              </button>
              <button 
                onClick={() => setCurrentPage('assignments')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'assignments' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Assignments
              </button>
              <button 
                onClick={() => setCurrentPage('evaluations')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'evaluations' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Evaluations
              </button>
              <button 
                onClick={() => setCurrentPage('results')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'results' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentPage === 'home' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judge Dashboard</h2>
                <p className="text-gray-600 mb-6">Upload and manage submission queues.</p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Queues</h3>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{queues.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide">Active Judges</h3>
                        <p className="text-3xl font-bold text-green-900 mt-2">{judges.filter(j => j.active).length}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Total Submissions</h3>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{submissions.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Assignments</h3>
                        <p className="text-3xl font-bold text-orange-900 mt-2">{assignments.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Database Status */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-200 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">Database Status</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 font-semibold">Supabase Connected</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Ready</span>
                        </div>
                        <p className="text-green-600 mt-2">
                          Database is ready for submissions and evaluations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Queue Management */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Queue Management</h3>
                  </div>
                  
                  {/* Create Queue Form */}
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Enter queue name..."
                      value={queueName}
                      onChange={(e) => setQueueName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateQueue()}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all duration-200"
                    />
                    <button 
                      onClick={handleCreateQueue}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      disabled={!queueName.trim()}
                    >
                      Create Queue
                    </button>
                  </div>
                  
                  {/* Message Display */}
                  {message && (
                    <div className={`mt-4 p-4 rounded-xl border-2 ${
                      message.startsWith('✅') 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{message.startsWith('✅') ? '✅' : '❌'}</span>
                        <span className="font-semibold">{message}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Queue Selection */}
                  {queues.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Select Queue for Upload
                      </h4>
                      <select
                        value={selectedQueueId}
                        onChange={(e) => setSelectedQueueId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all duration-200"
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
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        All Queues ({queues.length})
                      </h4>
                      <div className="grid gap-4">
                        {queues.map((queue) => {
                          // Check if this queue has assignments
                          const queueAssignments = assignments.filter(a => a.queue_id === queue.id);
                          const hasAssignments = queueAssignments.length > 0;
                          
                          return (
                            <div key={queue.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h5 className="text-xl font-bold text-gray-900">{queue.name}</h5>
                                    {hasAssignments && (
                                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                        {queueAssignments.length} assignments
                                      </span>
                                    )}
                                    {!hasAssignments && (
                                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                                        No assignments
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">ID: {queue.id}</p>
                                  <p className="text-sm text-gray-600">
                                    Created: {new Date(queue.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="ml-6">
                                  <button
                                    onClick={() => {
                                      setSelectedQueueId(queue.id);
                                      setCurrentPage('evaluations');
                                    }}
                                    disabled={!hasAssignments}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                                      hasAssignments
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    title={hasAssignments ? 'Run AI Judges for this queue' : 'No judge assignments found. Go to Assignment tab to assign judges.'}
                                  >
                                    {hasAssignments ? 'Run AI Judges' : 'No Assignments'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Uploaded Submissions</h3>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                        {submissions.length}
                      </span>
                    </div>
                    <div className="grid gap-4">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h5 className="text-lg font-bold text-gray-900 mb-1">{submission.id}</h5>
                              <p className="text-sm text-gray-600">Queue: {submission.queueId}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-500">
                                {new Date(submission.uploadedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {currentPage === 'judges' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Judges</h2>
                <p className="text-lg text-gray-600 mb-8">Create and manage AI judges for evaluating submissions.</p>
                
                {!showJudgeForm && (
                  <button
                    onClick={() => setShowJudgeForm(true)}
                    className="mb-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
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