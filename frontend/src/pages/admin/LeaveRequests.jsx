import { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaves';
import { Calendar, CheckCircle, XCircle, Search, Filter, MessageSquare } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [actionModal, setActionModal] = useState({ show: false, leaveId: null, action: null }); // action: 'APPROVED' | 'REJECTED'
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const data = await leaveService.getAllLeaves(params);
      setLeaves(data);
    } catch (err) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleActionClick = (leaveId, action) => {
    setActionModal({ show: true, leaveId, action });
    setAdminComment('');
    setError(null);
  };

  const submitAction = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await leaveService.updateLeaveStatus(actionModal.leaveId, {
        status: actionModal.action,
        admin_comment: adminComment
      });

      setSuccess(`Leave request ${actionModal.action.toLowerCase()} successfully.`);
      setActionModal({ show: false, leaveId: null, action: null });
      fetchLeaves(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update leave status.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!statusFilter) return true;
    // Backend returns "APPROVED" but sometimes dropdown might mismatch case if we change it later, 
    // but the dropdown is currently "APPROVED", "PENDING", "REJECTED", exactly matching DB.
    return leave.status === statusFilter;
  });

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee leave applications.</p>
        </div>
      </header>

      {error && !actionModal.show && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <XCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100 flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Filter size={18} />
            <span className="text-sm font-medium">Filter by Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setLoading(true);
              setStatusFilter(e.target.value);
            }}
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border"
          >
            <option value="">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 w-full">
            <div className="text-primary font-medium">Loading requests...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employee?.full_name || 'Unknown Employee'}</div>
                        <div className="text-sm text-gray-500">{leave.employee?.employee_id || 'ID N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.leave_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(leave.start_date, leave.end_date)} days
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {leave.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleActionClick(leave.id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleActionClick(leave.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-10 w-10 text-gray-300 mb-3" />
                        <p>No leave requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !actionLoading && setActionModal({ show: false, leaveId: null, action: null })}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${actionModal.action === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {actionModal.action === 'APPROVED' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {actionModal.action === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to {actionModal.action.toLowerCase()} this leave request? You can add an optional comment below.
                      </p>

                      {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                          {error}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Comment (Optional)</label>
                        <textarea
                          rows="3"
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          placeholder="Add a note for the employee..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={submitAction}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70 ${actionModal.action === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                >
                  {actionLoading ? 'Processing...' : `Confirm ${actionModal.action === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setActionModal({ show: false, leaveId: null, action: null });
                    setError(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
