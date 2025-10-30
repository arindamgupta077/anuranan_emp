import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';
import { selfTasksAPI, adminAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface SelfTask {
  id: number;
  task_date: string;
  details: string;
  is_private: boolean;
  created_at: string;
  employee_id: string;
  employee?: {
    id: string;
    full_name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
}

export default function SelfTasksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, employee, isCEO } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selfTasks, setSelfTasks] = useState<SelfTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<SelfTask | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Form state
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Filter state
  const [filterEmployeeName, setFilterEmployeeName] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && mounted) {
      fetchSelfTasks();
      if (isCEO) {
        fetchEmployees();
      }
    }
  }, [isAuthenticated, mounted, isCEO]);

  const fetchSelfTasks = async () => {
    try {
      setLoading(true);
      const response = await selfTasksAPI.list();
      setSelfTasks(response.data.self_tasks || []);
    } catch (error: any) {
      console.error('Error fetching self tasks:', error);
      toast.error('Failed to load self tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await adminAPI.listEmployees();
      setEmployees(response.data.employees || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!details.trim()) {
      toast.error('Please enter task details');
      return;
    }

    try {
      const data = {
        task_date: taskDate,
        details: details.trim(),
        is_private: isPrivate,
      };

      if (editingTask) {
        await selfTasksAPI.update(editingTask.id, data);
        toast.success('Self task updated successfully!');
      } else {
        await selfTasksAPI.create(data);
        toast.success('Self task logged successfully!');
      }

      // Reset form
      setDetails('');
      setTaskDate(new Date().toISOString().split('T')[0]);
      setIsPrivate(false);
      setShowForm(false);
      setEditingTask(null);
      fetchSelfTasks();
    } catch (error: any) {
      console.error('Error saving self task:', error);
      toast.error(error.response?.data?.message || 'Failed to save self task');
    }
  };

  const handleEdit = (task: SelfTask) => {
    setEditingTask(task);
    setTaskDate(task.task_date);
    setDetails(task.details);
    setIsPrivate(task.is_private);
    setShowForm(true);
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this self task?')) return;

    try {
      await selfTasksAPI.delete(taskId);
      toast.success('Self task deleted successfully!');
      fetchSelfTasks();
    } catch (error: any) {
      console.error('Error deleting self task:', error);
      toast.error('Failed to delete self task');
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setDetails('');
    setTaskDate(new Date().toISOString().split('T')[0]);
    setIsPrivate(false);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter self tasks based on employee ID and date
  const filteredSelfTasks = selfTasks.filter((task) => {
    // Filter by employee ID (CEO only)
    if (isCEO && filterEmployeeName) {
      if (task.employee_id !== filterEmployeeName) {
        return false;
      }
    }

    // Filter by date
    if (filterDate) {
      if (task.task_date !== filterDate) {
        return false;
      }
    }

    return true;
  });

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
        <title>Self Tasks - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isCEO ? 'All Employee Self Tasks' : 'My Self Tasks'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {isCEO ? 'View self-tasks logged by all employees' : 'Log and track your daily activities'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn btn-primary text-sm whitespace-nowrap flex-1 sm:flex-none"
                >
                  {showForm ? 'Cancel' : '+ Log Task'}
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-secondary text-sm whitespace-nowrap flex-1 sm:flex-none"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Banner for Non-CEO Users */}
          {!isCEO && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Viewing Your Self-Tasks Only
                </h3>
                <p className="text-sm text-blue-700">
                  For privacy and security, you can only view and manage self-tasks that you have created. 
                  Other employees' self-tasks are not visible to you.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔍</span>
              Filter Self Tasks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isCEO && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <select
                    value={filterEmployeeName}
                    onChange={(e) => setFilterEmployeeName(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Logged On
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
            {(filterEmployeeName || filterDate) && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterEmployeeName('');
                    setFilterDate('');
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
                <span className="text-sm text-gray-500">
                  ({filteredSelfTasks.length} of {selfTasks.length} tasks shown)
                </span>
              </div>
            )}
          </div>

          {/* Task Form */}
          {showForm && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTask ? 'Edit Self Task' : 'Log New Self Task'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Details *
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="input w-full min-h-[120px]"
                    placeholder="Describe what you worked on today..."
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_private" className="ml-2 text-sm text-gray-700">
                    Mark as private (only CEO can see)
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Log Task'}
                  </button>
                  {editingTask && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Tasks List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : selfTasks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No self tasks logged yet
              </h3>
              <p className="text-gray-600 mb-4">
                {isCEO 
                  ? 'No employees have logged any self-tasks yet'
                  : 'Start logging your daily activities to track your work'}
              </p>
              {!isCEO && (
                <>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary mb-3"
                  >
                    + Log Your First Task
                  </button>
                  <p className="text-sm text-gray-500 italic">
                    💡 You can only view self-tasks created by you
                  </p>
                </>
              )}
            </div>
          ) : filteredSelfTasks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tasks match your filters
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting or clearing your filters to see more tasks
              </p>
              <button
                onClick={() => {
                  setFilterEmployeeName('');
                  setFilterDate('');
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  {isCEO ? 'All Employee Self Tasks' : 'My Self Tasks Log'}
                  <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
                    {filteredSelfTasks.length} {filteredSelfTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      {isCEO && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Employee
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Task Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Logged On
                      </th>
                      {!isCEO && (
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSelfTasks.map((task, index) => (
                      <tr 
                        key={task.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📅</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(task.task_date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(task.task_date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        {isCEO && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-700">
                                  {task.employee?.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {task.employee?.full_name || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            <p className="line-clamp-2">{task.details}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.is_private ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <span className="mr-1">🔒</span>
                              Private
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <span className="mr-1">👁️</span>
                              Public
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(task.created_at)}
                        </td>
                        {!isCEO && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-primary-600 hover:text-primary-900 mr-4 inline-flex items-center gap-1 transition-colors"
                            >
                              <span>✏️</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 transition-colors"
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredSelfTasks.map(task => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Date and Status Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(task.task_date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(task.task_date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      </div>
                      {task.is_private ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <span className="mr-1">🔒</span>
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="mr-1">👁️</span>
                          Public
                        </span>
                      )}
                    </div>

                    {/* Employee (CEO view) */}
                    {isCEO && task.employee && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {task.employee.full_name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {task.employee.full_name}
                        </span>
                      </div>
                    )}

                    {/* Task Details */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {task.details}
                      </p>
                    </div>

                    {/* Footer with logged date and actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Logged: {formatDate(task.created_at)}
                      </span>
                      {!isCEO && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <span>✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <span>🗑️</span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
