import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';
import { adminAPI, tasksAPI } from '../lib/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

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

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isCEO, employee: currentEmployee } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'create-task' | 'recurring' | 'reports'>('employees');
  
  // Employees Tab
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Employee Form
  const [empFullName, setEmpFullName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRoleId, setEmpRoleId] = useState<string>(''); // Will be set from dropdown
  
  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskRecurring, setTaskRecurring] = useState(false);
  
  // Recurring Task Form
  const [recType, setRecType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [recDayOfWeek, setRecDayOfWeek] = useState<number>(1);
  const [recDayOfMonth, setRecDayOfMonth] = useState<number>(1);
  const [recStartDate, setRecStartDate] = useState('');
  const [recEndDate, setRecEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isCEO) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isCEO, router]);
  
  useEffect(() => {
    if (isAuthenticated && mounted && isCEO) {
      fetchEmployees();
      fetchRoles();
    }
  }, [isAuthenticated, mounted, isCEO, activeTab]);
  
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await adminAPI.listEmployees();
      console.log('Employees response:', response.data);
      setEmployees(response.data.employees || []);
      console.log('Employees loaded:', response.data.employees?.length || 0);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };
  
  const fetchRoles = async () => {
    try {
      const response = await adminAPI.getRoles();
      console.log('Roles response:', response.data);
      setRoles(response.data.roles || []);
      if (!response.data.roles || response.data.roles.length === 0) {
        toast.error('No roles found in database');
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles. Please refresh the page.');
    }
  };
  
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empFullName || !empEmail || !empPassword || !empRoleId) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      await adminAPI.createEmployee({
        full_name: empFullName,
        email: empEmail,
        password: empPassword,
        role_id: Number(empRoleId),
      });
      
      toast.success('Employee created successfully!');
      setShowEmployeeForm(false);
      setEmpFullName('');
      setEmpEmail('');
      setEmpPassword('');
      setEmpRoleId('');
      fetchEmployees();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  };
  
  const handleDeactivateEmployee = async (empId: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      await adminAPI.updateEmployee(empId, { active: false });
      toast.success('Employee deactivated');
      fetchEmployees();
    } catch (error: any) {
      console.error('Error deactivating employee:', error);
      toast.error('Failed to deactivate employee');
    }
  };
  
  const handleResetPassword = async (empId: string) => {
    const newPassword = prompt('Enter new password for employee:');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      await adminAPI.resetPassword(empId, newPassword);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };
  
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle || !taskDetails || !taskAssignedTo || !taskDueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      await tasksAPI.create({
        title: taskTitle,
        details: taskDetails,
        assigned_to: taskAssignedTo,
        due_date: taskDueDate,
        recurring: taskRecurring,
      });
      
      toast.success('Task created successfully!');
      setTaskTitle('');
      setTaskDetails('');
      setTaskAssignedTo('');
      setTaskDueDate('');
      setTaskRecurring(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleCreateRecurringTask = async () => {
    if (!taskTitle || !taskDetails || !taskAssignedTo || !recStartDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const payload: any = {
        title: taskTitle,
        details: taskDetails,
        assigned_to: taskAssignedTo,
        recurrence_type: recType,
        start_date: recStartDate,
      };

      if (recType === 'WEEKLY') {
        payload.day_of_week = recDayOfWeek;
      } else {
        payload.day_of_month = recDayOfMonth;
      }

      if (recEndDate) {
        payload.end_date = recEndDate;
      }

      await adminAPI.createRecurringTask(payload);
      
      toast.success('Recurring task created successfully! Tasks will be automatically created based on schedule.');
      
      // Clear form
      setTaskTitle('');
      setTaskDetails('');
      setTaskAssignedTo('');
      setRecStartDate('');
      setRecEndDate('');
      setRecType('WEEKLY');
      setRecDayOfWeek(1);
      setRecDayOfMonth(1);
    } catch (error: any) {
      console.error('Error creating recurring task:', error);
      toast.error(error.response?.data?.message || 'Failed to create recurring task');
    }
  };

  if (!mounted || isLoading || !isAuthenticated || !isCEO) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar 
          title="Admin Panel"
          subtitle="Manage employees and system settings"
          currentPage="admin"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Admin Tabs */}
          <div className="mb-4 sm:mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
                <button 
                  onClick={() => setActiveTab('employees')}
                  className={`py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'employees'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👥 Employees
                </button>
                <button 
                  onClick={() => setActiveTab('create-task')}
                  className={`py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'create-task'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Create Task
                </button>
                <button 
                  onClick={() => setActiveTab('recurring')}
                  className={`py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'recurring'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🔄 Recurring
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className={`py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'reports'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Reports
                </button>
              </nav>
            </div>
          </div>

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                  Employee Management
                </h2>
                <button 
                  onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                  className="btn btn-primary text-xs sm:text-sm px-3 py-2 whitespace-nowrap"
                >
                  {showEmployeeForm ? 'Cancel' : '+ Add Employee'}
                </button>
              </div>

              {/* Employee Form */}
              {showEmployeeForm && (
                <form onSubmit={handleCreateEmployee} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Add New Employee</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={empFullName}
                        onChange={(e) => setEmpFullName(e.target.value)}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={empPassword}
                        onChange={(e) => setEmpPassword(e.target.value)}
                        className="input w-full"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        value={empRoleId}
                        onChange={(e) => setEmpRoleId(e.target.value)}
                        className="input w-full"
                        required
                      >
                        <option value="">Select a role...</option>
                        {roles.length > 0 ? (
                          roles
                            .filter(role => role.name !== 'CEO')
                            .map(role => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))
                        ) : (
                          <option value="" disabled>Loading roles...</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">
                    Create Employee
                  </button>
                </form>
              )}

              {/* Employees List */}
              {loadingEmployees ? (
                <div className="flex justify-center py-12">
                  <div className="loading-spinner"></div>
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No employees yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Welcome, {currentEmployee?.full_name}! Start by adding your first employee.
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm text-gray-700">
                      <strong>Available features:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>View all employees</li>
                      <li>Add new employees with roles</li>
                      <li>Deactivate employees</li>
                      <li>Reset passwords</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map(emp => (
                        <tr key={emp.id} className={!emp.active ? 'opacity-50' : ''}>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{emp.full_name}</div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">{emp.email}</div>
                            <div className="sm:hidden mt-1">
                              <span className="badge badge-info text-xs">{emp.roles?.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{emp.email}</div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <span className="badge badge-info">{emp.roles?.name || 'N/A'}</span>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            {emp.active ? (
                              <span className="badge badge-success">Active</span>
                            ) : (
                              <span className="badge bg-gray-200 text-gray-700">Inactive</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">
                            {emp.active && emp.id !== currentEmployee?.id && (
                              <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                                <button
                                  onClick={() => handleResetPassword(emp.id)}
                                  className="text-primary-600 hover:text-primary-900 text-xs sm:text-sm whitespace-nowrap"
                                >
                                  🔑 Reset
                                </button>
                                <button
                                  onClick={() => handleDeactivateEmployee(emp.id)}
                                  className="text-red-600 hover:text-red-900 text-xs sm:text-sm whitespace-nowrap"
                                >
                                  ❌ Deactivate
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Task Tab */}
          {activeTab === 'create-task' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assign New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
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
                    value={taskDetails}
                    onChange={(e) => setTaskDetails(e.target.value)}
                    className="input w-full min-h-[120px]"
                    placeholder="Describe the task..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To *
                    </label>
                    <select
                      value={taskAssignedTo}
                      onChange={(e) => setTaskAssignedTo(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.filter(e => e.active).map(emp => (
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
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="input w-full"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  📋 Create Task
                </button>
              </form>
            </div>
          )}

          {/* Recurring Tasks Tab */}
          {activeTab === 'recurring' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recurring Tasks</h2>
              <p className="text-sm text-gray-600 mb-6">Set up tasks that repeat weekly or monthly. The system will automatically create tasks based on the schedule.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateRecurringTask();
              }} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Task Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="input w-full"
                      placeholder="Enter recurring task title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Details *
                    </label>
                    <textarea
                      value={taskDetails}
                      onChange={(e) => setTaskDetails(e.target.value)}
                      className="input w-full min-h-[100px]"
                      placeholder="Describe the recurring task..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To *
                    </label>
                    <select
                      value={taskAssignedTo}
                      onChange={(e) => setTaskAssignedTo(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.filter(e => e.active).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.roles?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recurrence Pattern */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recurrence Pattern</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repeat *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="WEEKLY"
                          checked={recType === 'WEEKLY'}
                          onChange={(e) => setRecType(e.target.value as 'WEEKLY' | 'MONTHLY')}
                          className="mr-2"
                        />
                        <span>Weekly</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="MONTHLY"
                          checked={recType === 'MONTHLY'}
                          onChange={(e) => setRecType(e.target.value as 'WEEKLY' | 'MONTHLY')}
                          className="mr-2"
                        />
                        <span>Monthly</span>
                      </label>
                    </div>
                  </div>

                  {/* Weekly Options */}
                  {recType === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week *
                      </label>
                      <select
                        value={recDayOfWeek}
                        onChange={(e) => setRecDayOfWeek(Number(e.target.value))}
                        className="input w-full"
                        required
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Task will be created every {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][recDayOfWeek]}
                      </p>
                    </div>
                  )}

                  {/* Monthly Options */}
                  {recType === 'MONTHLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Month *
                      </label>
                      <select
                        value={recDayOfMonth}
                        onChange={(e) => setRecDayOfMonth(Number(e.target.value))}
                        className="input w-full"
                        required
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>
                            {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Task will be created on the {recDayOfMonth}{recDayOfMonth === 1 ? 'st' : recDayOfMonth === 2 ? 'nd' : recDayOfMonth === 3 ? 'rd' : 'th'} day of every month
                      </p>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Period</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={recStartDate}
                        onChange={(e) => setRecStartDate(e.target.value)}
                        className="input w-full"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        When to start creating recurring tasks
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={recEndDate}
                        onChange={(e) => setRecEndDate(e.target.value)}
                        className="input w-full"
                        min={recStartDate || new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for indefinite recurrence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {taskTitle && taskAssignedTo && recStartDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Summary</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Task:</strong> "{taskTitle}"</li>
                      <li>• <strong>Assigned to:</strong> {employees.find(e => e.id === taskAssignedTo)?.full_name}</li>
                      <li>• <strong>Repeats:</strong> {recType === 'WEEKLY' 
                        ? `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][recDayOfWeek]}`
                        : `${recDayOfMonth}${recDayOfMonth === 1 ? 'st' : recDayOfMonth === 2 ? 'nd' : recDayOfMonth === 3 ? 'rd' : 'th'} of every month`
                      }</li>
                      <li>• <strong>Period:</strong> {new Date(recStartDate).toLocaleDateString()} {recEndDate ? `to ${new Date(recEndDate).toLocaleDateString()}` : '(ongoing)'}</li>
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    🔄 Create Recurring Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskTitle('');
                      setTaskDetails('');
                      setTaskAssignedTo('');
                      setRecStartDate('');
                      setRecEndDate('');
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Form
                  </button>
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">ℹ️ How Recurring Tasks Work</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• The system runs a cron job daily at 2 AM to check for tasks to create</li>
                  <li>• Tasks are automatically created based on your schedule (weekly or monthly)</li>
                  <li>• Each created task will have a 7-day due date from creation</li>
                  <li>• Employees will see these tasks in their task list just like regular tasks</li>
                  <li>• You can stop recurring tasks by setting an end date or deactivating the employee</li>
                </ul>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics</h2>
              <p className="text-sm text-gray-600 mb-6">View employee performance and system analytics</p>
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reports Dashboard
                </h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive analytics and performance reports
                </p>
                <button
                  onClick={() => router.push('/reports')}
                  className="btn btn-primary"
                >
                  View Full Reports →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
