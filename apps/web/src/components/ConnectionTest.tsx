import { useState } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';

export function ConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setMessage('Testing connection...');
    
    try {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        setStatus('success');
        setMessage('✅ Supabase connection successful!');
      } else {
        setStatus('error');
        setMessage('❌ Supabase connection failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleQueryTest = async () => {
    setStatus('testing');
    setMessage('Testing database query...');
    
    try {
      const { error } = await supabase.from('queues').select('count').limit(1);
      
      if (error) {
        setStatus('error');
        setMessage(`❌ Query failed: ${error.message}`);
      } else {
        setStatus('success');
        setMessage('✅ Database query successful!');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Query error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Supabase Connection Test</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={handleTest}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <button
            onClick={handleQueryTest}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Test Query
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md ${
            status === 'success' ? 'bg-green-50 text-green-800' :
            status === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
