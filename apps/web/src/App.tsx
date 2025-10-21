import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, queryClient } from './lib/router';
import { testSupabaseConnection } from './lib/supabase';
import { useEffect } from 'react';

function App() {
  // Test Supabase connection on app start
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
