import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';
import { tasksAPI, selfTasksAPI, leavesAPI } from '../lib/api';
import Navbar from '../components/Navbar';

interface DashboardStats {
  activeTasks: number;
  selfTasks: number;
  leaveRequests: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, employee, isCEO, clearAuth, sessionReady } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeTasks: 0,
    selfTasks: 0,
    leaveRequests: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && sessionReady && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, sessionReady, router]);

  useEffect(() => {
    if (sessionReady && isAuthenticated && mounted) {
      loadDashboardStats();
    }
  }, [sessionReady, isAuthenticated, mounted]);

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch all stats in parallel
      const [tasksRes, selfTasksRes, leavesRes] = await Promise.all([
        tasksAPI.list({ status: 'OPEN,IN_PROGRESS' }).catch(() => ({ data: { tasks: [] } })),
        selfTasksAPI.list().catch(() => ({ data: { self_tasks: [] } })),
        leavesAPI.list().catch(() => ({ data: { leaves: [] } })),
      ]);

      // Count active tasks (OPEN or IN_PROGRESS)
      const activeTasks = tasksRes.data.tasks?.length || 0;
      
      // Count self tasks
      const selfTasks = selfTasksRes.data.self_tasks?.length || 0;
      
      // Count pending leave requests only
      const leaveRequests = leavesRes.data.leaves?.filter((leave: any) => leave.status === 'PENDING' || !leave.status).length || 0;

      setStats({
        activeTasks,
        selfTasks,
        leaveRequests,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!mounted || isLoading || !sessionReady || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar currentPage="dashboard" />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
          {/* Info Banner for Non-CEO Users */}
          {!isCEO && (
            <div className="mb-3 sm:mb-4 lg:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 lg:p-4 flex items-start gap-2">
              <span className="text-lg sm:text-xl flex-shrink-0">ℹ️</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-0.5 sm:mb-1 leading-tight">
                  Your Personal Dashboard
                </h3>
                <p className="text-xs text-blue-700 leading-tight">
                  Shows your tasks, self-tasks, and leaves. Other employees' data is private.
                </p>
              </div>
            </div>
          )}

          {/* CEO Info Banner */}
          {isCEO && (
            <div className="mb-4 sm:mb-6 bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">👑</span>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-purple-900 mb-1">
                  Admin Dashboard - Full Access
                </h3>
                <p className="text-xs sm:text-sm text-purple-700">
                  As an administrator, you have full visibility of all employees' tasks, self-tasks, and leave requests.
                  This dashboard shows aggregated data across the entire organization.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
            {/* Stats Cards */}
            <div 
              className="card stat-card cursor-pointer hover:shadow-md active:shadow-lg transition-shadow border-l-4 border-l-primary-600 touch-manipulation"
              onClick={() => router.push('/tasks')}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                  {isCEO ? 'All Tasks' : 'My Tasks'}
                </h3>
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              {loadingStats ? (
                <div className="flex items-center justify-start my-1">
                  <div className="loading-spinner-small"></div>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 my-0.5">{stats.activeTasks}</p>
              )}
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                {isCEO ? 'Active tasks (all)' : 'Active assigned'}
              </p>
            </div>

            <div 
              className="card stat-card cursor-pointer hover:shadow-md active:shadow-lg transition-shadow border-l-4 border-l-purple-600 touch-manipulation"
              onClick={() => router.push('/self-tasks')}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                  {isCEO ? 'All Self Tasks' : 'Self Tasks'}
                </h3>
                <span className="text-xl sm:text-2xl">✏️</span>
              </div>
              {loadingStats ? (
                <div className="flex items-center justify-start my-1">
                  <div className="loading-spinner-small"></div>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 my-0.5">{stats.selfTasks}</p>
              )}
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                {isCEO ? 'All self-logged' : 'Self-logged'}
              </p>
            </div>

            <div 
              className="card stat-card cursor-pointer hover:shadow-md active:shadow-lg transition-shadow border-l-4 border-l-yellow-600 touch-manipulation"
              onClick={() => router.push('/leaves')}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                  {isCEO ? 'Leave Requests' : 'My Leaves'}
                </h3>
                <span className="text-xl sm:text-2xl">🏖️</span>
              </div>
              {loadingStats ? (
                <div className="flex items-center justify-start my-1">
                  <div className="loading-spinner-small"></div>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 my-0.5">{stats.leaveRequests}</p>
              )}
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                {isCEO ? 'Pending requests' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-6 lg:mt-8 card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <button 
                className="btn btn-primary text-sm sm:text-base py-3 sm:py-2"
                onClick={() => router.push('/tasks')}
              >
                📋 View Tasks
              </button>
              <button 
                className="btn btn-primary text-sm sm:text-base py-3 sm:py-2"
                onClick={() => router.push('/self-tasks')}
              >
                ✏️ Log Self Task
              </button>
              {isCEO ? (
                <button 
                  className="btn btn-primary text-sm sm:text-base py-3 sm:py-2"
                  onClick={() => router.push('/tasks?action=assign')}
                >
                  ➕ Assign Task
                </button>
              ) : (
                <button 
                  className="btn btn-primary text-sm sm:text-base py-3 sm:py-2"
                  onClick={() => router.push('/leaves')}
                >
                  🏖️ Request Leave
                </button>
              )}
              {isCEO && (
                <button 
                  className="btn btn-primary text-sm sm:text-base py-3 sm:py-2"
                  onClick={() => router.push('/admin')}
                >
                  👥 Manage Employees
                </button>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="mt-4 sm:mt-6 lg:mt-8 card bg-green-50 border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-green-800">
                  System is operational
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All services are running normally
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
