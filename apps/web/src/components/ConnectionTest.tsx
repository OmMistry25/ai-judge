import { useState } from 'react';
import { testSupabaseConnection } from '../lib/supabase';

export function ConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setMessage('Testing Supabase connection...');
    
    try {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        setStatus('success');
        setMessage('✅ Supabase connection successful! Database is ready.');
      } else {
        setStatus('error');
        setMessage('❌ Supabase connection failed. Check your environment variables.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Connection Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Testing...' : 'Test Database Connection'}
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
          <p><strong>Status:</strong> {status === 'idle' ? 'Ready to test' : status === 'testing' ? 'Testing connection...' : status === 'success' ? 'Connected to Supabase' : 'Connection failed'}</p>
        </div>
      </div>
    </div>
  );
}