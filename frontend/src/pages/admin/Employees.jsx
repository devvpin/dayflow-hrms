import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employees';
import { Users, Search, Edit2, UserPlus, XCircle, CheckCircle, MapPin, Phone, Mail, Briefcase, Calendar } from 'lucide-react';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // View/Edit Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (departmentFilter) params.department = departmentFilter;
      
      const data = await employeeService.getAllEmployees(params);
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly in a real app, here we just fetch on change
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, departmentFilter]);

  const openEmployeeDetails = async (id) => {
    try {
      const data = await employeeService.getEmployeeById(id);
      setSelectedEmployee(data);
      setEditForm({
        full_name: data.full_name || '',
        department: data.department || '',
        designation: data.designation || '',
        role: data.role || 'employee',
        phone: data.phone || '',
        address: data.address || '',
        is_active: data.is_active !== false
      });
      setIsEditing(false);
      setActionSuccess('');
      setActionError('');
    } catch (err) {
      setError('Failed to fetch employee details.');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditForm({
      ...editForm,
      [e.target.name]: value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await employeeService.updateEmployee(selectedEmployee.id, editForm);
      setActionSuccess('Employee updated successfully.');
      setIsEditing(false);
      fetchEmployees(); // Refresh list
      
      // Update local selected employee state
      setSelectedEmployee({ ...selectedEmployee, ...editForm });
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to update employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage personnel, roles, and access.</p>
        </div>
        <button
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          disabled
          title="Create Employee API may not exist yet, UI disabled for now"
        >
          <UserPlus size={16} className="mr-2" />
          Add Employee
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <XCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="sm:w-64">
            <input
              type="text"
              placeholder="Filter by Department..."
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 w-full">
            <div className="text-primary font-medium">Loading employees...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Dept</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                            <span className="font-medium text-gray-600">
                              {emp.full_name ? emp.full_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{emp.full_name}</div>
                            <div className="text-sm text-gray-500">{emp.employee_id || 'ID N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.email}</div>
                        <div className="text-sm text-gray-500">{emp.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.designation || 'Employee'}</div>
                        <div className="text-sm text-gray-500">{emp.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEmployeeDetails(emp.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="h-10 w-10 text-gray-300 mb-3" />
                        <p>No employees found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl leading-6 font-semibold text-gray-900" id="modal-title">
                    {isEditing ? 'Edit Employee' : 'Employee Details'}
                  </h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-primary hover:text-primary/80 flex items-center text-sm font-medium">
                      <Edit2 size={16} className="mr-1" /> Edit
                    </button>
                  )}
                </div>
              </div>
              
              <div className="px-4 py-5 sm:p-6 bg-gray-50/50">
                {actionError && (
                  <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
                    <XCircle size={16} /> {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100 flex items-center gap-2">
                    <CheckCircle size={16} /> {actionSuccess}
                  </div>
                )}

                {isEditing ? (
                  <form id="edit-employee-form" onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="full_name" value={editForm.full_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input type="text" name="department" value={editForm.department} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <input type="text" name="designation" value={editForm.designation} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" value={editForm.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm bg-white">
                          <option value="employee">Employee</option>
                          <option value="hr">HR</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="text" name="phone" value={editForm.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input type="text" name="address" value={editForm.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                      </div>
                      <div className="md:col-span-2 flex items-center mt-2">
                        <input type="checkbox" id="is_active" name="is_active" checked={editForm.is_active} onChange={handleInputChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Active Account</label>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Identity</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Briefcase className="text-gray-400 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Employee ID</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.employee_id || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 mt-0.5 rounded-full bg-gray-200 flex items-center justify-center text-[8px]">ID</div>
                          <div>
                            <p className="text-xs text-gray-500">Username</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.username}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="text-gray-400 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Join Date</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.join_date || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Mail className="text-gray-400 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="text-gray-400 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.phone || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="text-gray-400 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.address || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      form="edit-employee-form"
                      disabled={actionLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={actionLoading}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
