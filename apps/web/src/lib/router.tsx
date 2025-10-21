import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { MockConnectionTest } from '../components/MockConnectionTest';
import { QueueManager } from '../components/QueueManager';

// Create a root route
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AI Judge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-gray-900">Queues</a>
              <a href="/judges" className="text-gray-700 hover:text-gray-900">Judges</a>
              <a href="/results" className="text-gray-700 hover:text-gray-900">Results</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  ),
});

// Create routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judge Dashboard</h2>
        <p className="text-gray-600 mb-6">Upload and manage submission queues.</p>
        <MockConnectionTest />
      </div>
      <QueueManager />
    </div>
  ),
});

const judgesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/judges',
  component: () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Judges</h2>
      <p className="text-gray-600">Create and manage AI judges.</p>
    </div>
  ),
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/results',
  component: () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Results</h2>
      <p className="text-gray-600">View evaluation results and statistics.</p>
    </div>
  ),
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  judgesRoute,
  resultsRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});