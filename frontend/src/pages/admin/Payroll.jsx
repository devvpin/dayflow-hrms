import { useState, useEffect } from 'react';
import { payrollService } from '../../services/payroll';
import { employeeService } from '../../services/employees';
import { Wallet, Edit2, X, Check, Save, Plus } from 'lucide-react';

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    basic_salary: 0,
    allowances: 0,
    deductions: 0
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    employee_id: '',
    effective_from: new Date().toISOString().split('T')[0],
    basic_salary: '',
    allowances: '',
    deductions: ''
  });

  const openAddModal = () => {
    setError(null);
    setSuccess(null);
    setShowAddModal(true);
  };

  const fetchData = async () => {
    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getAllPayroll(),
        employeeService.getAllEmployees()
      ]);
      setPayrolls(Array.isArray(payrollData) ? payrollData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      setError('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (payroll) => {
    setEditingId(payroll.id);
    setEditForm({
      basic_salary: payroll.basic_salary,
      allowances: payroll.allowances,
      deductions: payroll.deductions
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleEditInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleAddInputChange = (e) => {
    setAddForm({
      ...addForm,
      [e.target.name]: e.target.value
    });
  };

  const calculateNet = (basic, allowances, deductions) => {
    return parseFloat(basic || 0) + parseFloat(allowances || 0) - parseFloat(deductions || 0);
  };

  const handleSaveEdit = async (id) => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await payrollService.updatePayroll(id, editForm);
      setSuccess('Payroll updated successfully.');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError('Failed to update payroll.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!addForm.employee_id) throw new Error("Please select an employee");

      const payload = {
        employee_id: parseInt(addForm.employee_id, 10),
        effective_from: addForm.effective_from,
        basic_salary: parseFloat(addForm.basic_salary || 0),
        allowances: parseFloat(addForm.allowances || 0),
        deductions: parseFloat(addForm.deductions || 0)
      };

      await payrollService.createPayroll(payload);
      setSuccess('Payroll created successfully.');
      setShowAddModal(false);
      setAddForm({
        employee_id: '',
        effective_from: new Date().toISOString().split('T')[0],
        basic_salary: '',
        allowances: '',
        deductions: ''
      });
      fetchData();
    } catch (err) {
      setError(err.message || err.response?.data?.detail || 'Failed to create payroll.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="text-primary font-medium">Loading payroll records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee salary structures and records.</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Payroll
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100 flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.length > 0 ? (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className={editingId === payroll.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payroll.employee?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{payroll.employee?.employee_id || 'ID N/A'}</div>
                    </td>

                    {editingId === payroll.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="number" name="basic_salary" value={editForm.basic_salary} onChange={handleEditInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="number" name="allowances" value={editForm.allowances} onChange={handleEditInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="number" name="deductions" value={editForm.deductions} onChange={handleEditInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                          {formatCurrency(calculateNet(editForm.basic_salary, editForm.allowances, editForm.deductions))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleSaveEdit(payroll.id)} disabled={saveLoading} className="text-green-600 hover:text-green-900">
                            <Save size={18} />
                          </button>
                          <button onClick={handleCancelEdit} disabled={saveLoading} className="text-red-600 hover:text-red-900">
                            <X size={18} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(payroll.basic_salary)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">+{formatCurrency(payroll.allowances)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">-{formatCurrency(payroll.deductions)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{formatCurrency(payroll.net_salary)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditClick(payroll)} className="text-primary hover:text-primary/80">
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <Wallet className="h-10 w-10 text-gray-300 mb-3" />
                      <p>No payroll records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payroll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <form onSubmit={handleAddSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create New Payroll Record
                      </h3>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Select Employee</label>
                          <select
                            name="employee_id"
                            value={addForm.employee_id}
                            onChange={handleAddInputChange}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border"
                          >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Effective Date</label>
                          <input
                            type="date"
                            name="effective_from"
                            value={addForm.effective_from}
                            onChange={handleAddInputChange}
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Basic Salary ($)</label>
                            <input
                              type="number"
                              name="basic_salary"
                              value={addForm.basic_salary}
                              onChange={handleAddInputChange}
                              required
                              placeholder="0.00"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Allowances ($)</label>
                            <input
                              type="number"
                              name="allowances"
                              value={addForm.allowances}
                              onChange={handleAddInputChange}
                              required
                              placeholder="0.00"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Deductions ($)</label>
                          <input
                            type="number"
                            name="deductions"
                            value={addForm.deductions}
                            onChange={handleAddInputChange}
                            required
                            placeholder="0.00"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Computed Net Salary:</span>
                            <span>{formatCurrency(calculateNet(addForm.basic_salary, addForm.allowances, addForm.deductions))}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors ${saveLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saveLoading ? 'Processing...' : 'Create Payroll'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;
