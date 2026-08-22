import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/errors/Unauthorized';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeaves from './pages/employee/Leaves';
import EmployeePayroll from './pages/employee/Payroll';
import AdminLeaveRequests from './pages/admin/LeaveRequests';
import AdminPayroll from './pages/admin/Payroll';



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
            <Route index element={<EmployeeDashboard />} />
            
            {/* Common Routes */}
            <Route path="notifications" element={<div>Notifications Page</div>} />
            <Route path="profile" element={<EmployeeProfile />} />
            
            {/* Employee Routes (Default role) */}
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leave" element={<EmployeeLeaves />} />
            <Route path="payroll" element={<EmployeePayroll />} />
            
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
                <AdminLeaveRequests />
              </ProtectedRoute>
            } />
            <Route path="admin/payroll" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPayroll />
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
