import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employees';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Image as ImageIcon } from 'lucide-react';

const Profile = () => {
  const { user, setError: setAuthError } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields state
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    profile_picture_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await employeeService.getProfile();
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          address: data.address || '',
          profile_picture_url: data.profile_picture_url || ''
        });
      } catch (err) {
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const updatedProfile = await employeeService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to current profile
    setFormData({
      phone: profile?.phone || '',
      address: profile?.address || '',
      profile_picture_url: profile?.profile_picture_url || ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="text-primary font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90"
          >
            Edit Profile
          </button>
        )}
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="-mt-12 relative flex-shrink-0">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden flex items-center justify-center">
                {profile?.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="pt-2 sm:pt-4 flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || user?.full_name}</h2>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <Briefcase size={16} />
                {profile?.designation || 'Employee'}
                {profile?.department && <span className="mx-2">•</span>}
                {profile?.department && <span>{profile.department}</span>}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="url"
                          name="profile_picture_url"
                          value={formData.profile_picture_url}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contact Information</h3>
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Address</p>
                      <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Number</p>
                      <p className="text-sm text-gray-500">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-500">{profile?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Employment Details</h3>
                  <div className="flex items-start gap-3">
                    <Briefcase className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Employee ID</p>
                      <p className="text-sm text-gray-500">{profile?.employee_id || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Join Date</p>
                      <p className="text-sm text-gray-500">{profile?.join_date || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
