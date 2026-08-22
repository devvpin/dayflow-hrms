import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance';
import { Clock, Calendar, Search, Filter, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toUpperCase().replace('-', '_').replace(' ', '_') : '';
  const styles = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    HALF_DAY: 'bg-yellow-100 text-yellow-800',
    LEAVE: 'bg-blue-100 text-blue-800',
    ON_LEAVE: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[normalizedStatus] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      // Note: Backend might not support search in this endpoint yet, doing client-side filter as fallback later

      const data = await attendanceService.getAllAttendance(params);
      setRecords(data);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce is not strictly necessary unless search is sent to backend on keystroke
    const timeoutId = setTimeout(() => {
      fetchAttendance();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [dateFilter, statusFilter]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    // Handle cases where time is returned with or without timezone
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return timeStr; // Fallback to raw string if not parseable
    } catch {
      return timeStr;
    }
  };

  // Client-side search filtering
  const filteredRecords = records.filter(record => {
    // Search query filter
    const searchMatch = !searchQuery ||
      record.employee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const statusMatch = !statusFilter || record.status === statusFilter;

    // Date filter
    const dateMatch = !dateFilter || record.date === dateFilter;

    return searchMatch && statusMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Attendance Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor company-wide attendance and check-ins.</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400 hidden sm:block" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="text-primary font-medium">Loading attendance records...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.employee?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{record.employee?.employee_id || 'ID N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(record.check_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.work_hours || '0h 0m'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Clock className="h-10 w-10 text-gray-300 mb-3" />
                        <p>No attendance records found for this period.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
