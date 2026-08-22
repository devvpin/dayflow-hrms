import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar placeholder */}
        <nav className="bg-white shadow-sm h-16 flex items-center px-6 border-b border-gray-200">
          <div className="text-xl font-bold text-primary">DAYFLOW</div>
        </nav>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar placeholder */}
          <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
            <nav className="space-y-1">
              <div className="px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary">Dashboard</div>
              <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Profile</div>
              <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Attendance</div>
              <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Leave</div>
              <div className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">Payroll</div>
            </nav>
          </aside>

          {/* Main content placeholder */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={
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
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
