import { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaves';
import { Calendar, Plus, XCircle, CheckCircle, Clock } from 'lucide-react';

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

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    leave_type: 'PAID',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      setError('Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Basic frontend validation
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Start date cannot be after end date.');
      setSubmitting(false);
      return;
    }

    try {
      await leaveService.applyLeave(formData);
      setSuccess('Leave request submitted successfully.');
      setShowApplyModal(false);
      setFormData({ leave_type: 'PAID', start_date: '', end_date: '', reason: '' });
      fetchLeaves(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate duration in days (inclusive)
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 text-sm mt-1">Apply for leave and view your request history.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus size={16} className="mr-2" />
          Apply Leave
        </button>
      </header>

      {error && !showApplyModal && (
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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            Leave History
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32 w-full">
            <div className="text-primary font-medium">Loading leaves...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Comment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.length > 0 ? (
                  leaves.map((leave, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leave.leave_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(leave.start_date, leave.end_date)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.admin_comment}>
                        {leave.admin_comment || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Clock className="h-10 w-10 text-gray-300 mb-3" />
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !submitting && setShowApplyModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Apply for Leave
                    </h3>
                    <div className="mt-4">
                      
                      {error && showApplyModal && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
                          <XCircle size={16} />
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleApplyLeave} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                          <select
                            name="leave_type"
                            value={formData.leave_type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border"
                          >
                            <option value="PAID">Paid Leave</option>
                            <option value="SICK">Sick Leave</option>
                            <option value="UNPAID">Unpaid Leave</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                              type="date"
                              name="start_date"
                              required
                              value={formData.start_date}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                              type="date"
                              name="end_date"
                              required
                              min={formData.start_date}
                              value={formData.end_date}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reason</label>
                          <textarea
                            name="reason"
                            rows="3"
                            required
                            value={formData.reason}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            placeholder="Please provide a reason for your leave request..."
                          ></textarea>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleApplyLeave}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowApplyModal(false);
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

export default Leaves;
