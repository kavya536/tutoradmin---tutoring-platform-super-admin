import * as React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone,
  Save,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Card, Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';

export const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('Profile');
  const [toast, setToast] = React.useState<string | null>(null);

  const handleSave = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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
                <div className="relative group">
                  <div className="w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                    AD
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-all">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-bold text-gray-900">Super Admin</h4>
                  <p className="text-sm text-gray-500 font-medium">kavyachitti818@gmail.com</p>
                  <div className="mt-3 flex items-center justify-center sm:justify-start space-x-2">
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Super Admin" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="kavyachitti818@gmail.com" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                  <input 
                    type="text" 
                    defaultValue="Administrator" 
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Timezone</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all">
                    <option>UTC +00:00 (GMT)</option>
                    <option>UTC +05:30 (IST)</option>
                    <option>UTC -08:00 (PST)</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button className="font-bold" onClick={() => handleSave('Profile changes saved successfully!')}>
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
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                  <Shield size={14} />
                  <span>Last changed 3 months ago</span>
                </div>
                <Button variant="inverted" className="font-bold" onClick={() => handleSave('Password updated successfully!')}>Update Password</Button>
              </div>
            </Card>
          )}

          {activeTab === 'Notifications' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive updates via email about platform activity.' },
                  { title: 'Push Notifications', desc: 'Get real-time alerts on your browser or mobile device.' },
                  { title: 'New Tutor Applications', desc: 'Notify when a new tutor submits an application.' },
                  { title: 'Booking Confirmations', desc: 'Alert when a booking is confirmed by a tutor.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button className="font-bold" onClick={() => handleSave('Notification preferences updated!')}>Save Preferences</Button>
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
                    {['Manage Tutors', 'Manage Students', 'View Financials', 'System Settings', 'User Support', 'Content Moderation'].map(p => (
                      <div key={p} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-bold text-gray-700">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'General' && (
            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-8">General Configuration</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Platform Language</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Currency</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all">
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
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer">
                    <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <Button className="font-bold" onClick={() => handleSave('General configuration saved!')}>Save Configuration</Button>
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
            <p className="text-sm font-bold tracking-tight">Save Changes</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
