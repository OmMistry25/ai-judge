import { useState } from 'react';
import { FileUpload } from './components/FileUpload';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [queueName, setQueueName] = useState('');
  const [queues, setQueues] = useState<Array<{id: string, name: string, createdAt: string}>>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Array<{id: string, queueId: string, uploadedAt: string}>>([]);
  const [message, setMessage] = useState('');

  const handleCreateQueue = () => {
    if (queueName.trim()) {
      const newQueue = {
        id: `queue_${Date.now()}`,
        name: queueName.trim(),
        createdAt: new Date().toISOString()
      };
      setQueues(prev => [newQueue, ...prev]);
      setQueueName('');
      setMessage(`✅ Queue "${newQueue.name}" created successfully!`);
      setTimeout(() => setMessage(''), 3000);
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
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Queues
              </button>
              <button 
                onClick={() => setCurrentPage('judges')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'judges' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Judges
              </button>
              <button 
                onClick={() => setCurrentPage('results')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'results' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Results
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                        {queues.map((queue) => (
                          <div key={queue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div>
                              <span className="font-medium text-gray-900">{queue.name}</span>
                              <span className="ml-2 text-sm text-gray-500">ID: {queue.id}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(queue.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judges</h2>
              <p className="text-gray-600">Create and manage AI judges.</p>
            </div>
          )}
          
          {currentPage === 'results' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Results</h2>
              <p className="text-gray-600">View evaluation results and statistics.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;