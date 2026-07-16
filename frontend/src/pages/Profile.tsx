import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/auth'
import { User, Wallet, Lock, Check } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  const [profileForm, setProfileForm] = useState({
    salary: '',
    monthly_budget: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Load current values from database on page open
  useEffect(() => {
    authApi.getMe().then(data => {
      setProfileForm({
        salary: data.salary ? String(data.salary) : '',
        monthly_budget: data.monthly_budget ? String(data.monthly_budget) : '',
      })
    }).catch(() => {})
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess(false)
    try {
      await authApi.updateProfile({
        salary: profileForm.salary ? Number(profileForm.salary) : undefined,
        monthly_budget: profileForm.monthly_budget ? Number(profileForm.monthly_budget) : undefined,
      })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#021526]">Profile</h1>
        <p className="text-[#021526]/60 mt-1">Manage your account settings</p>
      </div>

      {/* Account Info — read only */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#DAE2B6] rounded-lg flex items-center justify-center">
            <User size={16} className="text-[#03346E]" />
          </div>
          <h2 className="font-semibold text-[#021526]">Account Info</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#021526]/50 mb-1">Full Name</label>
            <div className="bg-[#DAE2B6]/30 border border-[#6EACDA]/30 rounded-lg px-4 py-3 text-[#021526] text-sm">
              {user?.name}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#021526]/50 mb-1">Email</label>
            <div className="bg-[#DAE2B6]/30 border border-[#6EACDA]/30 rounded-lg px-4 py-3 text-[#021526] text-sm">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#DAE2B6] rounded-lg flex items-center justify-center">
            <Wallet size={16} className="text-[#03346E]" />
          </div>
          <h2 className="font-semibold text-[#021526]">Financial Settings</h2>
        </div>

        {profileError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {profileError}
          </div>
        )}

        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm flex items-center gap-2">
            <Check size={14} />
            Settings saved successfully
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">
                Monthly Salary (₹)
              </label>
              <input
                type="number"
                value={profileForm.salary}
                onChange={e => setProfileForm({ ...profileForm, salary: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                placeholder="60000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">
                Monthly Budget (₹)
              </label>
              <input
                type="number"
                value={profileForm.monthly_budget}
                onChange={e => setProfileForm({ ...profileForm, monthly_budget: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                placeholder="40000"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="bg-[#03346E] hover:bg-[#021526] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#DAE2B6] rounded-lg flex items-center justify-center">
            <Lock size={16} className="text-[#03346E]" />
          </div>
          <h2 className="font-semibold text-[#021526]">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#021526]/70 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            className="bg-[#03346E] hover:bg-[#021526] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}