import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard';
import api from '../../services/api';
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
      const data = await dashboardService.getAdminStats();
      setStats({
        totalEmployees: data.total_employees || 0,
        activeEmployees: data.total_employees || 0,
        presentToday: data.attendance_today || 0,
        onLeaveToday: 0,
        pendingLeaves: data.pending_leave_requests || 0
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

  const handleExport = async (type = 'attendance') => {
    try {
      const response = await api.get(`/api/reports/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to generate report export.");
      console.error(err);
    }
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
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('attendance')}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download size={16} className="mr-2 text-gray-500" />
            Attendance CSV
          </button>
          <button
            onClick={() => handleExport('payroll')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download size={16} className="mr-2 text-white" />
            Payroll CSV
          </button>
        </div>
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
