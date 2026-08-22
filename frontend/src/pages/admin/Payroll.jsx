import { useState, useEffect } from 'react';
import { payrollService } from '../../services/payroll';
import { Wallet, Edit2, X, Check, Save } from 'lucide-react';

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    basic_salary: 0,
    allowances: 0,
    deductions: 0
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchPayrolls = async () => {
    try {
      const data = await payrollService.getAllPayroll();
      setPayrolls(data);
    } catch (err) {
      setError('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
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

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const calculateNet = (basic, allowances, deductions) => {
    return parseFloat(basic) + parseFloat(allowances) - parseFloat(deductions);
  };

  const handleSave = async (id) => {
    setSaveLoading(true);
    try {
      await payrollService.updatePayroll(id, editForm);
      setEditingId(null);
      fetchPayrolls();
    } catch (err) {
      setError('Failed to update payroll.');
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
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
          {error}
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
                          <input type="number" name="basic_salary" value={editForm.basic_salary} onChange={handleInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="number" name="allowances" value={editForm.allowances} onChange={handleInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="number" name="deductions" value={editForm.deductions} onChange={handleInputChange} className="w-full text-right border-gray-300 rounded focus:ring-primary focus:border-primary sm:text-sm px-2 py-1 border" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                          {formatCurrency(calculateNet(editForm.basic_salary, editForm.allowances, editForm.deductions))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleSave(payroll.id)} disabled={saveLoading} className="text-green-600 hover:text-green-900">
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
    </div>
  );
};

export default AdminPayroll;
