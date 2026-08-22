import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employees';
import { attendanceService } from '../../services/attendance';
import { leaveService } from '../../services/leaves';
import { BarChart3, Users, Clock, Calendar, Download, AlertCircle } from 'lucide-react';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingLeaves: 0,
  });

  const fetchReportData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [employees, attendance, leaves] = await Promise.all([
        employeeService.getAllEmployees().catch(() => []),
        attendanceService.getAllAttendance({ date: today }).catch(() => []),
        leaveService.getAllLeaves().catch(() => [])
      ]);

      const activeEmps = employees.filter(e => e.is_active !== false).length;
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
      const onLeave = attendance.filter(a => a.status === 'LEAVE').length;
      const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmps,
        presentToday: present,
        onLeaveToday: onLeave,
        pendingLeaves: pendingLeaves
      });

    } catch (err) {
      setError('Failed to aggregate report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExport = () => {
    // In a real application, this would call an API endpoint to generate a CSV/PDF
    alert("Export functionality would trigger a file download here.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="text-primary font-medium">Aggregating report data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of company HR metrics and statistics.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Download size={16} className="mr-2 text-gray-500" />
          Export Report
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="font-medium text-gray-600 text-sm">Active Employees</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeEmployees}</p>
          <p className="text-xs text-gray-500 mt-2">Out of {stats.totalEmployees} total registered</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-medium text-gray-600 text-sm">Present Today</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.presentToday}</p>
          <p className="text-xs text-green-600 font-medium mt-2">Current Check-ins</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h3 className="font-medium text-gray-600 text-sm">On Leave Today</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.onLeaveToday}</p>
          <p className="text-xs text-gray-500 mt-2">Approved leaves active</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-medium text-gray-600 text-sm">Pending Leaves</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingLeaves}</p>
          <p className="text-xs text-yellow-600 font-medium mt-2">Requires admin action</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
        <p>In a production environment, interactive charts (using Chart.js or Recharts) would be rendered here, displaying attendance trends over time and departmental breakdowns.</p>
      </div>
    </div>
  );
};

export default AdminReports;
