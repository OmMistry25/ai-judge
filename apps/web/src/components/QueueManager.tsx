import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';

export function QueueManager() {
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  const [newQueueName, setNewQueueName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch queues
  const { data: queues, isLoading: queuesLoading } = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  // Create queue mutation
  const createQueueMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('queues')
        .insert({ name } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      setNewQueueName('');
      setShowCreateForm(false);
    },
  });

  // Fetch submissions for selected queue
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', selectedQueueId],
    queryFn: async () => {
      if (!selectedQueueId) return [];
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('queue_id', selectedQueueId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedQueueId,
  });

  const handleCreateQueue = () => {
    if (newQueueName.trim()) {
      createQueueMutation.mutate(newQueueName.trim());
    }
  };

  const handleUploadSuccess = () => {
    // Refresh submissions when upload succeeds
    queryClient.invalidateQueries({ queryKey: ['submissions', selectedQueueId] });
  };

  return (
    <div className="space-y-6">
      {/* Queue Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Queue</h3>
        
        {queuesLoading ? (
          <p className="text-gray-600">Loading queues...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <select
                value={selectedQueueId}
                onChange={(e) => setSelectedQueueId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a queue...</option>
                {queues?.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'New Queue'}
              </button>
            </div>

            {showCreateForm && (
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                  placeholder="Queue name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateQueue}
                  disabled={!newQueueName.trim() || createQueueMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {createQueueMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Upload */}
      {selectedQueueId && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Submission</h3>
          <FileUpload onSuccess={handleUploadSuccess} />
        </div>
      )}

      {/* Submissions List */}
      {selectedQueueId && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissions</h3>
          
          {submissionsLoading ? (
            <p className="text-gray-600">Loading submissions...</p>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{submission.id}</p>
                      <p className="text-sm text-gray-600">
                        {submission.labeling_task_id && `Task: ${submission.labeling_task_id}`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No submissions found for this queue.</p>
          )}
        </div>
      )}
    </div>
  );
}
