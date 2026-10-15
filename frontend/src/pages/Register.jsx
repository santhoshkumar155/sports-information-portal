import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi, getErrorMessage, setSession, useAuth } from '../services/api.js';

export default function Register() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token: jwt, user } = await authApi.register(form);
      setSession(jwt, user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Register to get your own profile.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        <label>
          Name
          <input type="text" name="name" value={form.name} onChange={change} autoComplete="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={change} autoComplete="new-password" required />
        </label>
        <label>
          Confirm password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} autoComplete="new-password" required />
        </label>
        <button className="btn btn-block" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="small center">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
