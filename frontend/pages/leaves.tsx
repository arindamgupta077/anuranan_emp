import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Head from 'next/head';
import { leavesAPI } from '../lib/api';
import Navbar from '../components/Navbar';

interface Leave {
  id: number;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    roles?: {
      name: string;
    };
  };
  approver?: {
    id: string;
    full_name: string;
  };
}

export default function LeavesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, employee, isCEO, sessionReady } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
  });

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
      loadLeaves();
    }
  }, [sessionReady, isAuthenticated, mounted, startDateFilter, endDateFilter]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (startDateFilter) params.start_date = startDateFilter;
      if (endDateFilter) params.end_date = endDateFilter;
      
      const response = await leavesAPI.list(params);
      setLeaves(response.data.leaves || []);
    } catch (err: any) {
      console.error('Failed to load leaves:', err);
      setError(err.response?.data?.error || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  const totalLeaveDays = leaves.reduce((total, leave) => {
    return total + calculateDays(leave.start_date, leave.end_date);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) {
      setError('Please provide both start and end dates');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Start date must be before or equal to end date');
      return;
    }

    try {
      setError('');
      if (editingLeave) {
        await leavesAPI.update(editingLeave.id, formData);
      } else {
        await leavesAPI.create(formData);
      }
      
      setShowModal(false);
      setEditingLeave(null);
      setFormData({ start_date: '', end_date: '', reason: '' });
      loadLeaves();
    } catch (err: any) {
      console.error('Failed to save leave:', err);
      setError(err.response?.data?.error || 'Failed to save leave request');
    }
  };

  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave);
    setFormData({
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      setError('');
      await leavesAPI.delete(id);
      loadLeaves();
    } catch (err: any) {
      console.error('Failed to delete leave:', err);
      setError(err.response?.data?.error || 'Failed to cancel leave request');
    }
  };

  const handleApproveReject = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this leave request?`)) {
      return;
    }

    try {
      setError('');
      await leavesAPI.updateStatus(id, status);
      loadLeaves();
    } catch (err: any) {
      console.error(`Failed to ${action} leave:`, err);
      setError(err.response?.data?.error || `Failed to ${action} leave request`);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED': return '✓';
      case 'REJECTED': return '✗';
      case 'PENDING':
      default: return '⏳';
    }
  };

  const openNewLeaveModal = () => {
    setEditingLeave(null);
    setFormData({ start_date: '', end_date: '', reason: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLeave(null);
    setFormData({ start_date: '', end_date: '', reason: '' });
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <title>Leave Requests - Anuranan Employee Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar 
          title={isCEO ? 'All Leave Requests' : 'My Leave Requests'}
          subtitle={isCEO ? 'View all employee leave applications' : 'Manage your leave applications'}
          currentPage="leaves"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Banner for Non-CEO Users */}
          {!isCEO && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Viewing Your Leave Requests Only
                </h3>
                <p className="text-sm text-blue-700">
                  For privacy and security, you can only view and manage leave requests that you have submitted. 
                  Other employees' leave requests are not visible to you.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Summary Card */}
          <div className="card mb-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🏖️</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Leave Management</h3>
              <p className="text-sm sm:text-base text-teal-100 mb-3 sm:mb-4">
                Request and manage your leave applications
              </p>
              <div className="inline-block bg-white/20 rounded-lg px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-teal-100">Total Leave Days Taken</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalLeaveDays}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                  className="btn btn-secondary w-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
              <div className="flex items-end">
                <button onClick={openNewLeaveModal} className="btn btn-primary w-full text-sm">
                  + Request Leave
                </button>
              </div>
            </div>
          </div>

          {/* Leaves List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No leave requests found
              </h3>
              <p className="text-gray-600 mb-4">
                {isCEO 
                  ? 'No employees have submitted leave requests yet'
                  : 'Start by requesting your first leave'}
              </p>
              {!isCEO && (
                <button
                  onClick={openNewLeaveModal}
                  className="btn btn-primary"
                >
                  + Request Leave
                </button>
              )}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">🏖️</span>
                  {isCEO ? 'All Leave Requests' : 'My Leave Requests'}
                  <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
                    {leaves.length} {leaves.length === 1 ? 'request' : 'requests'}
                  </span>
                </h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      {isCEO && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Employee
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors duration-150">
                        {isCEO && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-teal-700">
                                  {leave.employee?.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {leave.employee?.full_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {leave.employee?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(leave.start_date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                to {formatDate(leave.end_date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                            <span className="mr-1">⏱️</span>
                            {calculateDays(leave.start_date, leave.end_date)} {calculateDays(leave.start_date, leave.end_date) === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {leave.reason || <span className="text-gray-400 italic">No reason provided</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                              <span className="mr-1">{getStatusIcon(leave.status)}</span>
                              {leave.status || 'PENDING'}
                            </span>
                            {leave.approver && (
                              <span className="text-xs text-gray-500">
                                by {leave.approver.full_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isCEO && leave.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleApproveReject(leave.id, 'APPROVED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                  title="Approve"
                                >
                                  <span>✓</span>
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveReject(leave.id, 'REJECTED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                                  title="Reject"
                                >
                                  <span>✗</span>
                                  Reject
                                </button>
                              </>
                            ) : !isCEO && leave.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleEdit(leave)}
                                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(leave.id)}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                >
                                  🗑️ Cancel
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                {leave.status === 'APPROVED' ? 'Approved' : leave.status === 'REJECTED' ? 'Rejected' : '-'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {leaves.map(leave => (
                  <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-1">
                            {calculateDays(leave.start_date, leave.end_date)} {calculateDays(leave.start_date, leave.end_date) === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                        <span className="mr-1">{getStatusIcon(leave.status)}</span>
                        {leave.status || 'PENDING'}
                      </span>
                    </div>

                    {/* Employee (CEO view) */}
                    {isCEO && leave.employee && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-teal-700">
                            {leave.employee.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.employee.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave.employee.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    {leave.reason && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {leave.reason}
                        </p>
                      </div>
                    )}

                    {/* Approver Info */}
                    {leave.approver && (
                      <div className="mb-3 text-xs text-gray-500">
                        {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leave.approver.full_name}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                      {isCEO && leave.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleApproveReject(leave.id, 'APPROVED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                          >
                            <span>✓</span>
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(leave.id, 'REJECTED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                          >
                            <span>✗</span>
                            Reject
                          </button>
                        </>
                      ) : !isCEO && leave.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleEdit(leave)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            🗑️ Cancel
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              {editingLeave ? 'Edit Leave Request' : 'New Leave Request'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {formData.start_date && formData.end_date && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-sm text-teal-800">
                    <strong>Duration:</strong> {calculateDays(formData.start_date, formData.end_date)} day(s)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Enter reason for leave..."
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingLeave ? 'Update' : 'Submit'} Request
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
