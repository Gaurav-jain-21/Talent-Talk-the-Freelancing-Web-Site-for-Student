import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/authApi'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      loginUser(res.data)
      const role = res.data.role
      if (role === 'STUDENT') navigate('/student/dashboard')
      else if (role === 'COMPANY') navigate('/company/dashboard')
      else if (role === 'ADMIN') navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex
      items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center
          text-blue-600 mb-6">
          Login to Talent Talk
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3
            rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium
              text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({
                ...form, email: e.target.value
              })}
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium
              text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({
                ...form, password: e.target.value
              })}
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700
              text-white py-2 rounded-lg font-medium
              disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/register"
            className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login