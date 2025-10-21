import { useState } from 'react';

export function MockConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setMessage('Testing connection...');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStatus('success');
    setMessage('✅ Mock connection successful! (No database required)');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Test (Mock Mode)</h3>
      
      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Test Connection (Mock)
        </button>
        
        {message && (
          <div className={`p-3 rounded-md ${
            status === 'success' ? 'bg-green-50 text-green-800' :
            status === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This is running in mock mode. To test with real database:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Set up Supabase project</li>
            <li>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local</li>
            <li>Apply database migrations</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
