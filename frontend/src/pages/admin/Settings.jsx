import { useState } from 'react';
import { Settings as SettingsIcon, Building, Shield, Bell, Save, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Mock settings state
  import api from '../../services/api';

  const [companySettings, setCompanySettings] = useState({
    name: '',
    email: '',
    address: '',
    workingHours: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    allowEmployeeRegistration: true,
    requireApprovalForLeaves: true,
    maintenanceMode: false
  });

  const [loading, setLoading] = useState(true);

  import { useEffect } from 'react';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setCompanySettings({
          name: response.data.company_name,
          email: response.data.company_email,
          address: response.data.company_address,
          workingHours: response.data.working_hours
        });
        setSystemSettings({
          allowEmployeeRegistration: response.data.allow_employee_registration,
          requireApprovalForLeaves: response.data.require_approval_for_leaves,
          maintenanceMode: response.data.maintenance_mode
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleCompanyChange = (e) => {
    setCompanySettings({
      ...companySettings,
      [e.target.name]: e.target.value
    });
  };

  const handleSystemChange = (e) => {
    setSystemSettings({
      ...systemSettings,
      [e.target.name]: e.target.checked
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      await api.put('/settings', {
        company_name: companySettings.name,
        company_email: companySettings.email,
        company_address: companySettings.address,
        working_hours: companySettings.workingHours,
        allow_employee_registration: systemSettings.allowEmployeeRegistration,
        require_approval_for_leaves: systemSettings.requireApprovalForLeaves,
        maintenance_mode: systemSettings.maintenanceMode
      });
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <SettingsIcon size={24} className="text-primary" />
            System Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure global application preferences.</p>
        </div>
      </header>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100 flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">

        {/* Settings Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50">
          <nav className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1 p-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'company'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Building size={18} />
              Company Info
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'system'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Shield size={18} />
              System Config
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'notifications'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Bell size={18} />
              Notifications
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 sm:p-8">
          <form onSubmit={handleSave}>

            {activeTab === 'company' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Details displayed on reports and invoices.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" name="name" value={companySettings.name} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input type="email" name="email" value={companySettings.email} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registered Address</label>
                    <textarea name="address" rows="3" value={companySettings.address} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Official Working Hours</label>
                    <input type="text" name="workingHours" value={companySettings.workingHours} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">System Configuration</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage core HRMS behaviors and access.</p>
                </div>

                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Allow Employee Self-Registration</p>
                      <p className="text-sm text-gray-500">If disabled, only admins can create new accounts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="allowEmployeeRegistration" checked={systemSettings.allowEmployeeRegistration} onChange={handleSystemChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Require Approval for Leaves</p>
                      <p className="text-sm text-gray-500">Leaves must be approved by an admin before taking effect.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="requireApprovalForLeaves" checked={systemSettings.requireApprovalForLeaves} onChange={handleSystemChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Disable access for non-admin users.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="maintenanceMode" checked={systemSettings.maintenanceMode} onChange={handleSystemChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure automated alerts and emails.</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-md text-sm text-blue-700">
                  Email integration is currently configured via environment variables. Contact DevOps to update SMTP credentials.
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
