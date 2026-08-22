import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/errors/Unauthorized';

// Temporary Dashboard Component
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to Dayflow</h1>
    <p className="text-gray-600 mb-6">Every workday, perfectly aligned.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-500 text-sm">Present Today</h3>
        <p className="text-2xl font-bold mt-2">125</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-500 text-sm">On Leave</h3>
        <p className="text-2xl font-bold mt-2">7</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-500 text-sm">Pending Approvals</h3>
        <p className="text-2xl font-bold mt-2">12</p>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Common Routes */}
            <Route path="notifications" element={<div>Notifications Page</div>} />
            <Route path="profile" element={<div>Profile Page</div>} />
            
            {/* Employee Routes (Default role) */}
            <Route path="attendance" element={<div>Employee Attendance</div>} />
            <Route path="leave" element={<div>Employee Leaves</div>} />
            <Route path="payroll" element={<div>Employee Payroll</div>} />
            
            {/* Admin Routes */}
            <Route path="admin/employees" element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Employees</div>
              </ProtectedRoute>
            } />
            <Route path="admin/attendance" element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Attendance</div>
              </ProtectedRoute>
            } />
            <Route path="admin/leaves" element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Leave Requests</div>
              </ProtectedRoute>
            } />
            <Route path="admin/payroll" element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Payroll</div>
              </ProtectedRoute>
            } />
            <Route path="admin/reports" element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Reports</div>
              </ProtectedRoute>
            } />
            
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
