import { useState, useEffect } from 'react';
import { payrollService } from '../../services/payroll';
import { useAuth } from '../../context/AuthContext';
import { Wallet, DollarSign, Calendar, Info, TrendingUp, TrendingDown } from 'lucide-react';

const EmployeePayroll = () => {
  const { user } = useAuth();
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const data = await payrollService.getMyPayroll();
        setPayrollData(data);
      } catch (err) {
        setError('Failed to load payroll details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
        <div className="text-primary font-medium">Loading payroll...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Salary Statement</h1>
        <p className="text-gray-500 text-sm mt-1">View your current salary breakdown and effective date.</p>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {payrollData ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-xl shadow-sm text-white overflow-hidden">
            <div className="px-8 py-10 relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-1">Net Salary</p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {formatCurrency(payrollData.net_salary)}
                  </h2>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm inline-flex items-center gap-2 self-start md:self-auto">
                  <Calendar size={18} className="text-white" />
                  <span className="text-sm font-medium">Effective: {formatDate(payrollData.effective_date)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Earnings</h3>
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-medium text-gray-900">{formatCurrency(payrollData.basic_salary)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-600">Allowances</span>
                  <span className="font-medium text-green-600">+{formatCurrency(payrollData.allowances)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">Gross Total</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(parseFloat(payrollData.basic_salary) + parseFloat(payrollData.allowances))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Deductions</h3>
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-600">Taxes & Deductions</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payrollData.deductions)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">Total Deductions</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(payrollData.deductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-700 text-sm">
            <Info className="flex-shrink-0 mt-0.5" size={18} />
            <p>
              Your salary statement is strictly confidential. If you have any questions regarding your payroll breakdown, 
              please contact the HR department.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
          <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Payroll Information Available</h3>
          <p className="text-gray-500 mt-2">
            Your payroll details have not been set up yet. Please contact HR.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;
