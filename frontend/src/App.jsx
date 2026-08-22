import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            {/* Add more protected routes here later */}
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
