import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/categories';
import { API_BASE_URL } from '../services/api';
import {
  User,
  Phone,
  Wallet,
  Lock,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, uploadAvatar, changePassword, deleteAccount, theme, toggleTheme } = useAuth();
  const fileInputRef = useRef(null);

  // Profile fields states
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Avatar states
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);
    try {
      await updateProfile({ phone, currency });
      setProfileSuccess('Profile details synchronized successfully');
    } catch (err) {
      console.error(err);
      setProfileError('Failed to synchronize profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPassSuccess('Credentials changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.message || 'Incorrect old password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await uploadAvatar(file);
      setProfileSuccess('Profile picture updated successfully');
    } catch (err) {
      console.error(err);
      setProfileError('Avatar upload failed. Max limit is 5MB.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'WARNING: This will permanently delete your user profile and purge all transaction records. This action is irreversible. Continue?'
    );
    if (!confirm) return;

    try {
      await deleteAccount();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Could not purge user profile');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Details */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            {/* Avatar display with custom click uploader trigger */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <img
                src={user?.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-emerald-500/20 group-hover:opacity-75 transition duration-150"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl transition duration-150">
                {avatarLoading ? (
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-white" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.username}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          {/* Theme card switcher */}
          <div className="w-full bg-slate-200/5 border border-slate-200/5 p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold uppercase">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/10 border border-slate-200/5 hover:bg-slate-200/25 transition text-slate-700 dark:text-slate-200 font-bold"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Dark Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Theme</span>
                </>
              )}
            </button>
          </div>

          {/* Danger zone delete */}
          <div className="w-full border-t border-slate-200/10 pt-4 space-y-2 text-center">
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 border border-dashed border-rose-500/30 hover:border-rose-500 text-rose-500 hover:bg-rose-500/5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge My Account</span>
            </button>
            <p className="text-[9px] text-slate-500">Warning: Erases all savings and transactions files.</p>
          </div>
        </div>

        {/* Right Column: Update details forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-emerald-500" />
              <span>Profile Settings</span>
            </h3>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs">
                <CheckCircle className="w-4.5 h-4.5" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase pl-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 glass-input text-xs"
                      placeholder="+1 555-0199"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase pl-1">Default Currency</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-9 glass-input text-xs"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={profileLoading} className="btn-emerald text-xs cursor-pointer">
                  {profileLoading ? 'Synchronizing...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-emerald-500" />
              <span>Change Security Credentials</span>
            </h3>

            {passSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs">
                <CheckCircle className="w-4.5 h-4.5" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase pl-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full glass-input text-xs"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase pl-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-input text-xs"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase pl-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-input text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={passLoading} className="btn-emerald text-xs cursor-pointer">
                  {passLoading ? 'Updating credentials...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
