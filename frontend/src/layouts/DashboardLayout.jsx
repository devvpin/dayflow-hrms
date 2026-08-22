import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="text-xl font-bold text-primary">DAYFLOW</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {user?.full_name || user?.username || 'User'}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-1">
            <Link to="/" className="block px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary">Dashboard</Link>
            <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">Profile</div>
            <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">Attendance</div>
            <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">Leave</div>
            <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">Payroll</div>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
