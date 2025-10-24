import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { JudgeForm } from './components/JudgeForm';
import { JudgeList } from './components/JudgeList';
import { AssignmentManager } from './components/AssignmentManager';
import { EvaluationManager } from './components/EvaluationManager';
import { ResultsPage } from './components/ResultsPage';

// Import design system components
import { 
  ModernHeader, 
  AnalyticsDashboardLayout, 
  DashboardGrid, 
  DashboardWidget,
  StatsOverview,
  Button,
  Card,
  Badge
} from './design-system';

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
    <AnalyticsDashboardLayout
      header={
        <ModernHeader
          title="AI Judge"
          navigation={[
            { label: 'Queues', href: '#', active: currentPage === 'home' },
            { label: 'Judges', href: '#', active: currentPage === 'judges' },
            { label: 'Assignments', href: '#', active: currentPage === 'assignments' },
            { label: 'Evaluations', href: '#', active: currentPage === 'evaluations' },
            { label: 'Results', href: '#', active: currentPage === 'results' },
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('home')}
              >
                Queues
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('judges')}
              >
                Judges
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('assignments')}
              >
                Assignments
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('evaluations')}
              >
                Evaluations
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('results')}
              >
                Results
              </Button>
            </div>
          }
        />
      }
    >

      {/* Global Error Display */}
      {globalError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
      {currentPage === 'home' && (
        <div className="space-y-8">
          {/* Dashboard Overview */}
      <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Judge Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">Upload and manage submission queues with AI-powered evaluation.</p>
            
            {/* Stats Overview */}
            <StatsOverview
              stats={[
                {
                  title: 'Total Queues',
                  value: queues.length,
                  change: { value: 0, type: 'neutral' },
                  color: 'blue'
                },
                {
                  title: 'Active Judges',
                  value: judges.filter(j => j.active).length,
                  change: { value: 0, type: 'neutral' },
                  color: 'green'
                },
                {
                  title: 'Total Submissions',
                  value: submissions.length,
                  change: { value: 0, type: 'neutral' },
                  color: 'purple'
                },
                {
                  title: 'Assignments',
                  value: assignments.length,
                  change: { value: 0, type: 'neutral' },
                  color: 'yellow'
                }
              ]}
              className="mb-8"
            />
          </div>

          {/* Database Status */}
          <DashboardWidget
            title="Database Status"
            subtitle="Connection and system health"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Supabase Connected</span>
              <Badge variant="success" size="sm">Ready</Badge>
      </div>
            <p className="text-sm text-gray-600 mt-2">
              Database is ready for submissions and evaluations.
            </p>
          </DashboardWidget>
          
          {/* Queue Management */}
          <DashboardWidget
            title="Queue Management"
            subtitle="Create and manage submission queues"
          >
            <div className="space-y-6">
              {/* Create Queue Form */}
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter queue name..."
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateQueue()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <Button 
                  onClick={handleCreateQueue}
                  disabled={!queueName.trim()}
                  size="lg"
                >
                  Create Queue
                </Button>
              </div>
              
              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.startsWith('✅') 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{message.startsWith('✅') ? '✅' : '❌'}</span>
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
              )}
              
              {/* Queue Selection */}
              {queues.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Queue for Upload</h4>
                  <select
                    value={selectedQueueId}
                    onChange={(e) => setSelectedQueueId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">All Queues ({queues.length})</h4>
                  <DashboardGrid columns={1} gap="md">
                    {queues.map((queue) => {
                      // Check if this queue has assignments
                      const queueAssignments = assignments.filter(a => a.queue_id === queue.id);
                      const hasAssignments = queueAssignments.length > 0;
                      
                      return (
                        <Card key={queue.id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-gray-900 mb-2">{queue.name}</h5>
                              <p className="text-sm text-gray-500 mb-3">ID: {queue.id}</p>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  Created: {new Date(queue.createdAt).toLocaleDateString()}
                                </span>
                                {hasAssignments && (
                                  <Badge variant="success" size="sm">
                                    {queueAssignments.length} assignments
                                  </Badge>
                                )}
                                {!hasAssignments && (
                                  <Badge variant="warning" size="sm">
                                    No assignments
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                onClick={() => {
                                  setSelectedQueueId(queue.id);
                                  setCurrentPage('evaluations');
                                }}
                                disabled={!hasAssignments}
                                variant={hasAssignments ? 'primary' : 'secondary'}
                                size="sm"
                              >
                                {hasAssignments ? 'Run AI Judges' : 'No Assignments'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </DashboardGrid>
                </div>
              )}
            </div>
          </DashboardWidget>

          {/* File Upload Section */}
          {selectedQueueId && (
            <DashboardWidget
              title="Upload Submissions"
              subtitle="Upload JSON files to the selected queue"
            >
              <FileUpload 
                queueId={selectedQueueId} 
                onUploadSuccess={handleUploadSuccess}
              />
            </DashboardWidget>
          )}

          {/* Submissions List */}
          {submissions.length > 0 && (
            <DashboardWidget
              title="Uploaded Submissions"
              subtitle={`${submissions.length} submissions uploaded`}
            >
              <DashboardGrid columns={1} gap="sm">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-semibold text-gray-900">{submission.id}</h5>
                        <p className="text-sm text-gray-500">Queue: {submission.queueId}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {new Date(submission.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </DashboardGrid>
            </DashboardWidget>
          )}
        </div>
      )}
      
      {currentPage === 'judges' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Judges</h1>
            <p className="text-lg text-gray-600 mb-8">Create and manage AI judges for evaluating submissions.</p>
            
            {!showJudgeForm && (
              <Button
                onClick={() => setShowJudgeForm(true)}
                size="lg"
                className="mb-8"
              >
                Create New Judge
              </Button>
            )}
          </div>

          {showJudgeForm && (
            <DashboardWidget
              title={editingJudge ? 'Edit AI Judge' : 'Create New AI Judge'}
              subtitle="Configure judge settings and prompts"
            >
              <JudgeForm
                judge={editingJudge || undefined}
                onSubmit={editingJudge ? handleEditJudge : handleCreateJudge}
                onCancel={handleCancelJudgeForm}
                isLoading={judgesLoading}
              />
            </DashboardWidget>
          )}

          {!showJudgeForm && (
            <DashboardWidget
              title="AI Judges"
              subtitle={`${judges.length} judges configured`}
            >
              <JudgeList
                judges={judges}
                onEdit={handleEditJudgeClick}
                onDelete={handleDeleteJudge}
                isLoading={judgesLoading}
              />
            </DashboardWidget>
          )}
        </div>
      )}
      
      {currentPage === 'assignments' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Judge Assignments</h1>
            <p className="text-lg text-gray-600 mb-8">Assign AI judges to evaluate specific questions in your queues.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluation Results</h1>
            <p className="text-lg text-gray-600 mb-8">View all evaluation results across all queues with detailed analysis.</p>
          </div>

          <ResultsPage />
        </div>
      )}
      
      {currentPage === 'evaluations' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Run Evaluations</h1>
            <p className="text-lg text-gray-600 mb-8">Execute AI judge evaluations on assigned questions and view results.</p>
          </div>

          <EvaluationManager
            queues={queues}
            judges={judges}
            assignments={assignments}
          />
      </div>
      )}
    </AnalyticsDashboardLayout>
  );
}

export default App;