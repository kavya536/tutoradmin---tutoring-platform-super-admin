import * as React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  Save,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { AdminSettingsData } from '../types';

interface SettingsProps {
  settings: AdminSettingsData;
  currentAdminName: string;
  onSaveSettings: (next: AdminSettingsData) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ ok: boolean; message: string }>;
}

export const Settings = ({ settings, currentAdminName, onSaveSettings, onUpdatePassword }: SettingsProps) => {
  const [activeTab, setActiveTab] = React.useState('Profile');
  const [toast, setToast] = React.useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profileData, setProfileData] = React.useState(settings.profile);
  const [notifPrefs, setNotifPrefs] = React.useState(settings.notifications);
  const [permissions, setPermissions] = React.useState(settings.permissions);
  const [generalConfig, setGeneralConfig] = React.useState(settings.general);
  const [securityData, setSecurityData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    setProfileData(settings.profile);
    setNotifPrefs(settings.notifications);
    setPermissions(settings.permissions);
    setGeneralConfig(settings.general);
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (message: string, updater: (s: AdminSettingsData) => AdminSettingsData) => {
    try {
      setIsSaving(true);
      await onSaveSettings(updater(settings));
      setToast(message);
      setTimeout(() => setToast(null), 2000);
    } catch (e: any) {
      setToast(e?.message || 'Failed to save settings');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { label: 'Profile', icon: User },
    { label: 'Security', icon: Lock },
    { label: 'Notifications', icon: Bell },
    { label: 'Permissions', icon: Shield },
    { label: 'General', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
        <p className="text-gray-500 font-medium">Manage your account preferences and platform configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {tabs.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap min-w-max md:min-w-0 md:w-full',
                activeTab === item.label 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'Profile' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Admin Profile</h3>
              
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
                <div className="w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                  {currentAdminName.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-bold text-gray-900">{profileData.fullName || currentAdminName || 'Super Admin'}</h4>
                  <p className="text-sm text-gray-500 font-medium">{profileData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                  <input 
                    type="text" 
                    value={profileData.role}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Timezone</label>
                  <select 
                    value={profileData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  >
                    <option>UTC +00:00 (GMT)</option>
                    <option>UTC +05:30 (IST)</option>
                    <option>UTC -08:00 (PST)</option>
                  </select>
                </div>
              </div>

               <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button className="font-bold" disabled={isSaving} onClick={() => handleSave('Profile changes saved successfully!', (prev) => ({ ...prev, profile: profileData }))}>
                  <Save size={18} className="mr-2" />
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'Security' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Security & Password</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                  <Shield size={14} />
                  <span>{settings.security.lastPasswordChangedAt ? `Last changed ${new Date(settings.security.lastPasswordChangedAt).toLocaleDateString()}` : 'Last changed not available'}</span>
                </div>
                <Button
                  variant="inverted"
                  className="font-bold"
                  disabled={isSaving}
                  onClick={async () => {
                    const result = await onUpdatePassword(securityData.currentPassword, securityData.newPassword, securityData.confirmPassword);
                    setToast(result.message);
                    setTimeout(() => setToast(null), 2500);
                    if (result.ok) {
                      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      await handleSave('Password metadata updated', (prev) => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          lastPasswordChangedAt: new Date().toISOString()
                        }
                      }));
                    }
                  }}
                >
                  Update Password
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'Notifications' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive updates via email about platform activity.' },
                  { key: 'pushNotifications', title: 'Push Notifications', desc: 'Get real-time alerts on your browser or mobile device.' },
                  { key: 'newTutorApplications', title: 'New Tutor Applications', desc: 'Notify when a new tutor submits an application.' },
                  { key: 'bookingConfirmations', title: 'Booking Confirmations', desc: 'Alert when a booking is confirmed by a tutor.' },
                  { key: 'inAppAlerts', title: 'In-App Alerts', desc: 'Show toast alert messages in the admin panel.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const key = item.key as keyof typeof notifPrefs;
                        const newPrefs = { ...notifPrefs, [key]: !notifPrefs[key] };
                        setNotifPrefs(newPrefs);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-primary' : 'bg-gray-200'} cursor-pointer`}
                    >
                      <motion.span 
                        animate={{ x: notifPrefs[item.key as keyof typeof notifPrefs] ? '1.5rem' : '0.25rem' }}
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm" 
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button disabled={isSaving} className="font-bold" onClick={() => handleSave('Notification preferences saved', (prev) => ({ ...prev, notifications: notifPrefs }))}>
                  <Save size={18} className="mr-2" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'Permissions' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Role Permissions</h3>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start space-x-3">
                  <Shield className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Administrator Access</p>
                    <p className="text-xs text-blue-700 font-medium mt-1">You have full access to all platform features and data management tools.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Permissions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'manageTutors', label: 'Manage Tutors' },
                      { key: 'manageStudents', label: 'Manage Students' },
                      { key: 'viewFinancials', label: 'View Financials' },
                      { key: 'systemSettings', label: 'System Settings' },
                      { key: 'userSupport', label: 'User Support' },
                      { key: 'contentModeration', label: 'Content Moderation' }
                    ].map((p) => (
                      <label key={p.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">{p.label}</span>
                        <input
                          type="checkbox"
                          checked={permissions[p.key as keyof typeof permissions]}
                          onChange={(e) => setPermissions({ ...permissions, [p.key]: e.target.checked })}
                          className="h-4 w-4 text-primary rounded border-gray-300"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button disabled={isSaving} className="font-bold" onClick={() => handleSave('Permissions saved', (prev) => ({ ...prev, permissions }))}>
                  <Save size={18} className="mr-2" />
                  Save Permissions
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'General' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">General Configuration</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Platform Language</label>
                  <select
                    value={generalConfig.platformLanguage}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, platformLanguage: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  >
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Currency</label>
                  <select
                    value={generalConfig.currency}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>INR (₹)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Maintenance Mode</p>
                    <p className="text-xs text-gray-500 font-medium">Disable platform access for regular users during updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralConfig({ ...generalConfig, maintenanceMode: !generalConfig.maintenanceMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${generalConfig.maintenanceMode ? 'bg-primary' : 'bg-gray-200'} cursor-pointer`}
                  >
                    <motion.span
                      animate={{ x: generalConfig.maintenanceMode ? '1.5rem' : '0.25rem' }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm"
                    />
                  </button>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button disabled={isSaving} className="font-bold" onClick={() => handleSave('General configuration saved', (prev) => ({ ...prev, general: generalConfig }))}>
                  <Save size={18} className="mr-2" />
                  Save Configuration
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-green-500" />
            <p className="text-sm font-bold tracking-tight">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
