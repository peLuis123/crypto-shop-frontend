import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import userService from '../api/userService';

const AccountSettings = () => {
    const { user } = useAuth();
    const { walletAddress } = useCart();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('account');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        country: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                country: user.country || ''
            });
            setTwoFAEnabled(user.twoFactorEnabled || false);
        }
    }, [user]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            await userService.updateProfile(formData);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        try {
            setLoading(true);
            await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Password changed successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        try {
            setLoading(true);
            await userService.enable2FA();
            showToast('Verification code sent to your email', 'success');
        } catch (error) {
            showToast('Failed to enable 2FA', 'error');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'wallet', label: 'Wallet & Security', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { id: 'security', label: 'Security Settings', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
    ];

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-500">Manage your account information, wallet, and security preferences.</p>
            </div>

            <div className="flex gap-6">
                <div className="w-64 bg-white rounded-xl border border-gray-100 p-4 h-fit">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeTab === tab.id
                                        ? 'bg-emerald-50 text-emerald-600 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1">
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleFormChange}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                        <select 
                                            name="country"
                                            value={formData.country}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                            <option value="">Select a country</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Wallet Management</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-700">TRC-20 Wallet Address</span>
                                            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">CONNECTED</span>
                                        </div>
                                        <p className="font-mono text-sm text-gray-900 break-all">
                                            {walletAddress || user?.wallet || 'Not connected'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Network Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Network:</span>
                                                <span className="font-semibold text-gray-900">TRON (TRC-20)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="text-emerald-600 font-semibold">● Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <div className="flex gap-3">
                                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Security Tip</h4>
                                        <p className="text-sm text-gray-700">Never share your private keys or seed phrase with anyone. CryptoShop will never ask for this information.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h3>
                                            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                                        </div>
                                        <button 
                                            onClick={handleEnable2FA}
                                            disabled={twoFAEnabled || loading}
                                            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
                                            {twoFAEnabled ? 'Enabled' : (loading ? 'Enabling...' : 'Enable')}
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                />
                                            </div>
                                            <button 
                                                onClick={handleChangePassword}
                                                disabled={loading}
                                                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
