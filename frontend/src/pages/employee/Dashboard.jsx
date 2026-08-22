import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard';
import StatCard from '../../components/common/StatCard';
import { 
  CalendarCheck, 
  CalendarOff, 
  Clock, 
  Wallet,
  Activity,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getEmployeeStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="text-primary font-medium">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  // Fallback data structure in case backend doesn't return everything yet
  const displayStats = stats || {
    attendance: { present_days: 0, absent_days: 0 },
    leave: { pending_requests: 0, available_leaves: 0 },
    payroll: { latest_net_salary: 0 },
    recent_activity: [],
    recent_notifications: []
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Good morning, {user?.full_name || user?.username}</h1>
        <p className="text-gray-500 text-sm mt-1">Here is what's happening today.</p>
      </header>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Attendance" 
          value={`${displayStats.attendance?.present_days || 0} days`} 
          subtitle="This month"
          icon={<CalendarCheck size={24} />}
          color="success"
        />
        <StatCard 
          title="Leave Balance" 
          value={`${displayStats.leave?.available_leaves || 0} days`} 
          subtitle="Available paid leave"
          icon={<CalendarOff size={24} />}
          color="info"
        />
        <StatCard 
          title="Pending Requests" 
          value={displayStats.leave?.pending_requests || 0}
          subtitle="Leave requests"
          icon={<Clock size={24} />}
          color="warning"
        />
        <StatCard 
          title="Salary" 
          value={`$${displayStats.payroll?.latest_net_salary || 0}`}
          subtitle="Latest net salary"
          icon={<Wallet size={24} />}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-gray-400" />
            Today's Attendance
          </h2>
          {displayStats.today_attendance ? (
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  displayStats.today_attendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                  displayStats.today_attendance.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {displayStats.today_attendance.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check In</p>
                <p className="font-medium text-gray-900 mt-1">{displayStats.today_attendance.check_in || '--:--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check Out</p>
                <p className="font-medium text-gray-900 mt-1">{displayStats.today_attendance.check_out || '--:--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Work Hours</p>
                <p className="font-medium text-gray-900 mt-1">{displayStats.today_attendance.work_hours || '0h'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
              <p className="text-gray-500">You haven't checked in yet today.</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-gray-400" />
            Recent Notifications
          </h2>
          {displayStats.recent_notifications && displayStats.recent_notifications.length > 0 ? (
            <ul className="space-y-4">
              {displayStats.recent_notifications.slice(0, 4).map((notification, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed h-32 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
