import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';
import { tasksAPI, adminAPI } from '../lib/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

interface Task {
  id: number;
  task_number: number;
  title: string;
  details: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  due_date: string;
  created_at: string;
  assigned_employee?: {
    id: string;
    full_name: string;
    email: string;
  };
  creator?: {
    id: string;
    full_name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
  active: boolean;
  roles?: {
    id: number;
    name: string;
  };
}

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, employee, isCEO } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>(['OPEN', 'IN_PROGRESS']);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Assign Task Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

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
      fetchTasks();
      
      // Check if we should open the assign task modal
      if (router.query.action === 'assign' && isCEO) {
        openAssignModal();
        // Remove the query parameter from URL
        router.replace('/tasks', undefined, { shallow: true });
      }
    }
  }, [isAuthenticated, mounted, statusFilter, router.query.action]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.list({
        status: statusFilter.join(','),
      });
      setTasks(response.data.tasks || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
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
      toast.error('Failed to load employees');
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle || !newTaskDetails || !newTaskAssignedTo || !newTaskDueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      await tasksAPI.create({
        title: newTaskTitle,
        details: newTaskDetails,
        assigned_to: newTaskAssignedTo,
        due_date: newTaskDueDate,
      });
      
      toast.success('Task assigned successfully!');
      setShowAssignModal(false);
      setNewTaskTitle('');
      setNewTaskDetails('');
      setNewTaskAssignedTo('');
      setNewTaskDueDate('');
      fetchTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to assign task');
    }
  };

  const openAssignModal = () => {
    setShowAssignModal(true);
    if (employees.length === 0) {
      fetchEmployees();
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated!');
      fetchTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, taskId: number) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus) {
      await updateTaskStatus(taskId, newStatus);
    }
  };

  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'badge-info';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'COMPLETED': return 'badge-success';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  };

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
        <title>Tasks - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar 
          title={isCEO ? 'All Employee Tasks' : 'My Assigned Tasks'}
          subtitle={isCEO ? 'View and manage tasks assigned to all employees' : 'View and update your assigned tasks only'}
          currentPage="tasks"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* CEO Quick Actions */}
          {isCEO && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={openAssignModal}
                className="btn btn-primary text-sm"
              >
                + Assign New Task
              </button>
            </div>
          )}

          {/* Info Banner for Non-CEO Users */}
          {!isCEO && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Viewing Your Assigned Tasks Only
                </h3>
                <p className="text-sm text-blue-700">
                  For privacy and security, you can only view and manage tasks that have been assigned to you. 
                  Other employees' tasks are not visible to you.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status:</h3>
            <div className="flex flex-wrap gap-2">
              {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter.includes(status)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-2">
                {statusFilter.length === 0
                  ? 'Select at least one status filter to view tasks'
                  : 'No tasks match the selected filters'}
              </p>
              {!isCEO && (
                <p className="text-sm text-gray-500 mt-4 italic">
                  💡 You can only view tasks assigned to you
                </p>
              )}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  {isCEO ? 'All Assigned Tasks' : 'My Assigned Tasks'}
                  <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Task ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Title & Details
                      </th>
                      {isCEO && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Assigned To
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            <span className="text-sm font-mono font-medium text-primary-600">
                              #{task.task_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {task.title}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {task.details}
                            </p>
                          </div>
                        </td>
                        {isCEO && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.assigned_employee ? (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-700">
                                    {task.assigned_employee.full_name.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {task.assigned_employee.full_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {task.assigned_employee.email}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Unassigned</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              task.status === 'OPEN' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {task.status === 'OPEN' && '📌'}
                              {task.status === 'IN_PROGRESS' && '⚡'}
                              {task.status === 'COMPLETED' && '✓'}
                              <span className="ml-1">{task.status.replace('_', ' ')}</span>
                            </span>
                            {isOverdue(task.due_date, task.status) && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                ⚠️ OVERDUE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <div>
                              <div className={`text-sm font-medium ${
                                isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {formatDate(task.due_date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(e, task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center px-3 py-1.5 bg-white border-2 border-primary-600 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                          >
                            <option value="OPEN">� OPEN</option>
                            <option value="IN_PROGRESS">⚡ IN PROGRESS</option>
                            <option value="COMPLETED">✓ COMPLETED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet/Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <span className="text-sm font-mono font-semibold text-primary-600">
                          #{task.task_number}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          task.status === 'OPEN' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {task.status === 'OPEN' && '📌'}
                          {task.status === 'IN_PROGRESS' && '⚡'}
                          {task.status === 'COMPLETED' && '✓'}
                          <span className="ml-1">{task.status.replace('_', ' ')}</span>
                        </span>
                        {isOverdue(task.due_date, task.status) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            ⚠️ OVERDUE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title and Details */}
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {task.details}
                      </p>
                    </div>

                    {/* Employee (CEO view) */}
                    {isCEO && task.assigned_employee && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {task.assigned_employee.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.assigned_employee.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.assigned_employee.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📅</span>
                        <div className="text-sm">
                          <span className={`font-medium ${
                            isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e, task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-white border-2 border-primary-600 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="OPEN">� OPEN</option>
                        <option value="IN_PROGRESS">⚡ IN PROGRESS</option>
                        <option value="COMPLETED">✓ COMPLETED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      #{selectedTask.task_number}
                    </span>
                    <span className={`badge ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTask.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Details</h4>
                  <p className="text-gray-900">{selectedTask.details}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Due Date</h4>
                    <p className="text-gray-900">{formatDate(selectedTask.due_date)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                    <p className="text-gray-900">{formatDate(selectedTask.created_at)}</p>
                  </div>
                  {isCEO && selectedTask.assigned_employee && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h4>
                      <p className="text-gray-900">{selectedTask.assigned_employee.full_name}</p>
                    </div>
                  )}
                  {selectedTask.creator && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Created By</h4>
                      <p className="text-gray-900">{selectedTask.creator.full_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">Change status to:</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      handleStatusChange(e, selectedTask.id);
                      setSelectedTask(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white border-2 border-primary-600 text-primary-700 text-base font-medium rounded-lg hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="OPEN">📌 OPEN</option>
                    <option value="IN_PROGRESS">⚡ IN PROGRESS</option>
                    <option value="COMPLETED">✓ COMPLETED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Assign New Task</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Create and assign a task to an employee</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="input w-full"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Details *
                  </label>
                  <textarea
                    value={newTaskDetails}
                    onChange={(e) => setNewTaskDetails(e.target.value)}
                    className="input w-full min-h-[120px]"
                    placeholder="Describe the task in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To *
                    </label>
                    <select
                      value={newTaskAssignedTo}
                      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.filter(emp => emp.active).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.roles?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="input w-full"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    ✓ Assign Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
