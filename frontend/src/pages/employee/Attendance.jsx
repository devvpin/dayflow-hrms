import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance';
import { Clock, MapPin, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    HALF_DAY: 'bg-yellow-100 text-yellow-800',
    LEAVE: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const Attendance = () => {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [view, setView] = useState('weekly'); // daily, weekly
  const [dateFilter, setDateFilter] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Use Promise.all to fetch both endpoints
      const [todayData, historyData] = await Promise.all([
        attendanceService.getTodayAttendance().catch(() => null),
        attendanceService.getHistory({ view, date: dateFilter }).catch(() => [])
      ]);
      setToday(todayData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [view, dateFilter]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // In a real app, you might capture geolocation here
      const result = await attendanceService.checkIn({ location: 'Office' });
      setSuccess('Checked in successfully.');
      fetchAttendance(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await attendanceService.checkOut({ location: 'Office' });
      setSuccess('Checked out successfully.');
      fetchAttendance(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading && !today && history.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="text-primary font-medium">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your daily working hours and attendance history.</p>
      </header>

      {error && (
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

      {/* Today's Attendance Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          Today's Attendance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {today?.status ? (
              <StatusBadge status={today.status} />
            ) : (
              <span className="text-gray-400 font-medium text-sm">NOT CHECKED IN</span>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Check In</p>
            <p className="text-xl font-bold text-gray-900">{formatTime(today?.check_in)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Check Out</p>
            <p className="text-xl font-bold text-gray-900">{formatTime(today?.check_out)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Work Hours</p>
            <p className="text-xl font-bold text-primary">{today?.work_hours || '0h 0m'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-100 pt-6">
          <button
            onClick={handleCheckIn}
            disabled={actionLoading || today?.check_in}
            className={`px-8 py-3 rounded-md font-medium text-white flex items-center gap-2 justify-center transition-colors ${
              actionLoading || today?.check_in 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 shadow-sm'
            }`}
          >
            <MapPin size={18} />
            {actionLoading ? 'Processing...' : 'CHECK IN'}
          </button>
          
          <button
            onClick={handleCheckOut}
            disabled={actionLoading || !today?.check_in || today?.check_out}
            className={`px-8 py-3 rounded-md font-medium flex items-center gap-2 justify-center transition-colors ${
              actionLoading || !today?.check_in || today?.check_out
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-white text-gray-800 hover:bg-gray-50 shadow-sm border border-gray-300'
            }`}
          >
            <Clock size={18} />
            {actionLoading ? 'Processing...' : 'CHECK OUT'}
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <CalendarIcon size={20} className="text-gray-400" />
            Attendance History
          </h2>
          
          <div className="flex gap-2">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setView('daily')}
                className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                  view === 'daily' 
                    ? 'bg-gray-100 text-gray-900 border-gray-300 z-10' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setView('weekly')}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
                  view === 'weekly' 
                    ? 'bg-gray-100 text-gray-900 border-gray-300 z-10' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Weekly
              </button>
            </div>
            
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history && history.length > 0 ? (
                history.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{formatDate(record.date)}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{formatTime(record.check_in)}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{formatTime(record.check_out)}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{record.work_hours || '0h'}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-sm text-gray-500">
                    No attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
