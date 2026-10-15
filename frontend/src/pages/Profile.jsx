import { useEffect, useState } from 'react';
import { authApi, formatDate, getErrorMessage, setSession, useAuth, useFetch } from '../services/api.js';

export default function Profile() {
  const { token } = useAuth();
  const { data: profile, loading, error, reload } = useFetch(() => authApi.profile(), []);

  const [name, setName] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const saveName = async (e) => {
    e.preventDefault();
    setNameMsg({ type: '', text: '' });
    if (name.trim().length < 2) {
      setNameMsg({ type: 'error', text: 'Name must be at least 2 characters' });
      return;
    }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ name });
      setSession(token, updated);
      setNameMsg({ type: 'success', text: 'Profile updated' });
      reload();
    } catch (err) {
      setNameMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (!pw.currentPassword || !pw.newPassword) {
      setPwMsg({ type: 'error', text: 'Fill in your current and new password' });
      return;
    }
    if (pw.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSaving(true);
    try {
      await authApi.updateProfile({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password changed' });
    } catch (err) {
      setPwMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page">
      <h1>Your profile</h1>

      {loading && <div className="state"><div className="spinner" /><p>Loading profile...</p></div>}
      {error && (
        <div className="state error">
          <h3>Could not load your profile</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Try again</button>
        </div>
      )}

      {profile && (
        <div className="profile-grid">
          <section className="card profile-card">
            <div className="avatar">{profile.name.charAt(0).toUpperCase()}</div>
            <h2>{profile.name}</h2>
            <dl className="facts stacked">
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
              <div><dt>Role</dt><dd>{profile.role === 'admin' ? 'Administrator' : 'User'}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(profile.createdAt, false)}</dd></div>
            </dl>
          </section>

          <div className="stack">
            <form className="card form-card" onSubmit={saveName} noValidate>
              <h3>Edit name</h3>
              {nameMsg.text && <div className={`alert ${nameMsg.type}`} role="status">{nameMsg.text}</div>}
              <label>
                Name
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <button className="btn" type="submit" disabled={saving}>Save name</button>
            </form>

            <form className="card form-card" onSubmit={savePassword} noValidate>
              <h3>Change password</h3>
              {pwMsg.text && <div className={`alert ${pwMsg.type}`} role="status">{pwMsg.text}</div>}
              <label>
                Current password
                <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
              </label>
              <label>
                New password
                <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
              </label>
              <label>
                Confirm new password
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
              </label>
              <button className="btn" type="submit" disabled={saving}>Change password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
