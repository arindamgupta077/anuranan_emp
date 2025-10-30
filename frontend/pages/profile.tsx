import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, employee, isCEO } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Your Profile
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  View your account information
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          <div className="card bg-white">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                  {employee?.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {employee?.full_name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 truncate">
                    {employee?.email}
                  </p>
                  {isCEO && (
                    <span className="inline-block mt-2 badge badge-primary text-xs sm:text-sm">
                      👑 CEO
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </dt>
                    <dd className="text-sm sm:text-base text-gray-900 font-medium break-words">
                      {employee?.full_name}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </dt>
                    <dd className="text-sm sm:text-base text-gray-900 font-medium break-all">
                      {employee?.email}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Role
                    </dt>
                    <dd className="text-sm sm:text-base text-gray-900 font-medium">
                      {employee?.roles?.name || 'N/A'}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Account Status
                    </dt>
                    <dd className="text-sm sm:text-base">
                      <span className="inline-flex items-center badge badge-success text-xs sm:text-sm">
                        <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                        Active
                      </span>
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Employee ID
                    </dt>
                    <dd className="text-sm sm:text-base text-gray-900 font-mono break-all">
                      {employee?.id?.substring(0, 8)}...
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Access Level
                    </dt>
                    <dd className="text-sm sm:text-base text-gray-900 font-medium">
                      {isCEO ? 'Full Access (Administrator)' : 'Standard Access (Employee)'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Role Description
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {isCEO ? (
                      <>
                        As a <span className="font-semibold">CEO</span>, you have full administrative access to the system. 
                        You can manage employees, assign tasks, approve leave requests, and access all reports and analytics.
                      </>
                    ) : (
                      <>
                        As a <span className="font-semibold">{employee?.roles?.name}</span>, you can view your assigned tasks, 
                        log self-tasks, request leaves, and manage your personal work activities.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn btn-secondary text-sm py-3 flex items-center justify-center gap-2"
                  >
                    <span>🏠</span>
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => router.push('/tasks')}
                    className="btn btn-secondary text-sm py-3 flex items-center justify-center gap-2"
                  >
                    <span>📋</span>
                    <span>View Tasks</span>
                  </button>
                  {isCEO && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="btn btn-primary text-sm py-3 flex items-center justify-center gap-2"
                    >
                      <span>⚙️</span>
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/leaves')}
                    className="btn btn-secondary text-sm py-3 flex items-center justify-center gap-2"
                  >
                    <span>🏖️</span>
                    <span>Leave Requests</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
