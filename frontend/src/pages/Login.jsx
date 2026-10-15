import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi, getErrorMessage, setSession, useAuth } from '../services/api.js';

export default function Login() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const { token: jwt, user } = await authApi.login({ email: form.email, password: form.password });
      setSession(jwt, user);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        <p className="muted">Welcome back. Log in to see your profile.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={change} autoComplete="current-password" required />
        </label>
        <button className="btn btn-block" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="small center">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
