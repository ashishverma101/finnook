import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authApi.login(form)
      login(response.access_token, response.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#DAE2B6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/finnook-logo.png" alt="Finnook" className="w-10 h-10 object-contain" />
            <h1 className="text-3xl font-bold text-[#021526]">Finnook</h1>
          </div>
          <p className="text-[#021526]/60">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-3 text-[#021526] placeholder-[#021526]/30 focus:outline-none focus:border-[#03346E]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#021526]/70 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-3 text-[#021526] placeholder-[#021526]/30 focus:outline-none focus:border-[#03346E]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#03346E] hover:bg-[#021526] disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[#021526]/50 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#03346E] hover:text-[#6EACDA] font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}