import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MATCH_STATUSES,
  NEWS_CATEGORIES,
  SPORTS,
  authApi,
  clearSession,
  dashboardApi,
  formatDate,
  formatTime,
  getErrorMessage,
  matchApi,
  newsApi,
  playerApi,
  teamApi,
  useAuth,
  useFetch,
} from '../services/api.js';

const today = () => new Date().toISOString().slice(0, 10);
const clip = (text = '', n = 60) => (text.length > n ? `${text.slice(0, n)}...` : text);

/* ---------- Entity definitions: drive the tables and the add/edit forms ---------- */

const ENTITIES = {
  matches: {
    label: 'Matches',
    singular: 'match',
    api: matchApi,
    params: { sort: 'dateDesc' },
    title: (r) => `${r.team1} vs ${r.team2}`,
    searchText: (r) => [r.team1, r.team2, r.tournament, r.venue, r.sport, r.status].join(' '),
    defaults: () => ({ sport: SPORTS[0], status: 'Upcoming' }),
    columns: [
      { label: 'Match', render: (r) => `${r.team1} vs ${r.team2}` },
      { label: 'Sport', render: (r) => r.sport },
      { label: 'Tournament', render: (r) => r.tournament },
      { label: 'When', render: (r) => `${formatDate(r.date)}, ${formatTime(r.time)}` },
      { label: 'Status', render: (r) => r.status },
      { label: 'Score', render: (r) => (r.status === 'Upcoming' ? '-' : `${r.team1Score || '-'} : ${r.team2Score || '-'}`) },
    ],
    fields: [
      { name: 'sport', label: 'Sport', type: 'select', options: SPORTS },
      { name: 'tournament', label: 'Tournament' },
      { name: 'team1', label: 'Team 1' },
      { name: 'team2', label: 'Team 2' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'venue', label: 'Venue' },
      { name: 'status', label: 'Status', type: 'select', options: MATCH_STATUSES },
      { name: 'team1Score', label: 'Team 1 score', optional: true, placeholder: 'e.g. 250/6 or 2' },
      { name: 'team2Score', label: 'Team 2 score', optional: true, placeholder: 'e.g. 248/9 or 1' },
    ],
  },
  teams: {
    label: 'Teams',
    singular: 'team',
    api: teamApi,
    params: {},
    title: (r) => r.name,
    searchText: (r) => [r.name, r.sport, r.country, r.coach].join(' '),
    defaults: () => ({ sport: SPORTS[0] }),
    columns: [
      { label: 'Name', render: (r) => r.name },
      { label: 'Sport', render: (r) => r.sport },
      { label: 'Country', render: (r) => r.country },
      { label: 'Coach', render: (r) => r.coach },
      { label: 'Founded', render: (r) => r.founded },
    ],
    fields: [
      { name: 'name', label: 'Team name' },
      { name: 'sport', label: 'Sport', type: 'select', options: SPORTS },
      { name: 'country', label: 'Country' },
      { name: 'coach', label: 'Coach' },
      { name: 'founded', label: 'Founded year', type: 'number' },
      { name: 'logo', label: 'Logo URL', optional: true, placeholder: 'https://...' },
      { name: 'description', label: 'Description', type: 'textarea', optional: true },
    ],
  },
  players: {
    label: 'Players',
    singular: 'player',
    api: playerApi,
    params: {},
    title: (r) => r.name,
    searchText: (r) => [r.name, r.sport, r.team, r.country, r.position].join(' '),
    defaults: () => ({ sport: SPORTS[0] }),
    columns: [
      { label: 'Name', render: (r) => r.name },
      { label: 'Sport', render: (r) => r.sport },
      { label: 'Team', render: (r) => r.team },
      { label: 'Country', render: (r) => r.country },
      { label: 'Position', render: (r) => r.position },
      { label: 'Age', render: (r) => r.age },
      { label: '#', render: (r) => r.jerseyNumber },
    ],
    fields: [
      { name: 'name', label: 'Player name' },
      { name: 'sport', label: 'Sport', type: 'select', options: SPORTS },
      { name: 'country', label: 'Country' },
      { name: 'team', label: 'Team' },
      { name: 'position', label: 'Position' },
      { name: 'age', label: 'Age', type: 'number' },
      { name: 'jerseyNumber', label: 'Jersey number', type: 'number' },
      { name: 'image', label: 'Image URL', optional: true, placeholder: 'https://...' },
      { name: 'biography', label: 'Biography', type: 'textarea', optional: true },
      { name: 'statistics', label: 'Statistics (one per line)', type: 'textarea', optional: true },
    ],
  },
  news: {
    label: 'News',
    singular: 'article',
    api: newsApi,
    params: {},
    title: (r) => r.title,
    searchText: (r) => [r.title, r.category, r.author].join(' '),
    defaults: () => ({ category: 'General', publishedAt: today() }),
    columns: [
      { label: 'Title', render: (r) => clip(r.title) },
      { label: 'Category', render: (r) => r.category },
      { label: 'Author', render: (r) => r.author },
      { label: 'Published', render: (r) => formatDate(r.publishedAt, false) },
    ],
    fields: [
      { name: 'title', label: 'Title', full: true },
      { name: 'description', label: 'Short description', type: 'textarea', rows: 2, full: true },
      { name: 'content', label: 'Full content', type: 'textarea', rows: 6, full: true },
      { name: 'category', label: 'Category', type: 'select', options: NEWS_CATEGORIES },
      { name: 'author', label: 'Author' },
      { name: 'publishedAt', label: 'Published date', type: 'date' },
      { name: 'image', label: 'Image URL', optional: true, placeholder: 'https://...' },
    ],
  },
};

const buildForm = (config, row) => {
  const defaults = config.defaults();
  const form = {};
  config.fields.forEach((f) => {
    let v = row ? row[f.name] : defaults[f.name];
    if (v === undefined || v === null) v = '';
    if (f.type === 'date' && v) v = String(v).slice(0, 10);
    form[f.name] = v;
  });
  return form;
};

const toPayload = (config, form) => {
  const payload = {};
  config.fields.forEach((f) => {
    const v = form[f.name];
    if (f.type === 'number') payload[f.name] = v === '' ? '' : Number(v);
    else payload[f.name] = typeof v === 'string' ? v.trim() : v;
  });
  return payload;
};

/* ---------- Small shared pieces ---------- */

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop">
      <div className={wide ? 'modal wide' : 'modal'} role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Loading({ text }) {
  return <div className="state"><div className="spinner" /><p>{text}</p></div>;
}

function ErrorState({ title, message, onRetry }) {
  return (
    <div className="state error">
      <h3>{title}</h3>
      <p>{message}</p>
      <button className="btn" onClick={onRetry}>Try again</button>
    </div>
  );
}

/* ---------- Dashboard ---------- */

function Dashboard({ go }) {
  const { data, loading, error, reload } = useFetch(() => dashboardApi.adminStats(), []);

  if (loading) return <Loading text="Loading statistics..." />;
  if (error) return <ErrorState title="Could not load statistics" message={error} onRetry={reload} />;

  const cards = [
    { key: 'matches', label: 'Total Matches', value: data.matches },
    { key: 'teams', label: 'Total Teams', value: data.teams },
    { key: 'players', label: 'Total Players', value: data.players },
    { key: 'news', label: 'Total News', value: data.news },
    { key: 'users', label: 'Total Users', value: data.users },
  ];

  return (
    <>
      <h2>Dashboard</h2>
      <div className="admin-stats">
        {cards.map((c) => (
          <button key={c.key} className="admin-stat" onClick={() => go(c.key)}>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      <p className="muted">Select a card or use the sidebar to manage that data.</p>
    </>
  );
}

/* ---------- Users (read only) ---------- */

function Users() {
  const { data, loading, error, reload } = useFetch(() => authApi.users(), []);

  if (loading) return <Loading text="Loading users..." />;
  if (error) return <ErrorState title="Could not load users" message={error} onRetry={reload} />;

  return (
    <>
      <h2>Users</h2>
      {data.length === 0 ? (
        <div className="state"><h3>No users yet</h3><p>Registered users appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={u.role === 'admin' ? 'badge status-live' : 'badge sport'}>{u.role}</span></td>
                  <td>{formatDate(u.createdAt, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ---------- Generic CRUD manager ---------- */

function EntityManager({ config }) {
  const { data, loading, error, reload } = useFetch(() => config.api.list(config.params), [config]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [editor, setEditor] = useState(null); // { row } where row is null when creating
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const q = search.trim().toLowerCase();
  const rows = (data || []).filter((r) => !q || config.searchText(r).toLowerCase().includes(q));

  const openCreate = () => {
    setForm(buildForm(config, null));
    setFormError('');
    setEditor({ row: null });
  };

  const openEdit = (row) => {
    setForm(buildForm(config, row));
    setFormError('');
    setEditor({ row });
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const missing = config.fields.find((f) => !f.optional && String(form[f.name] ?? '').trim() === '');
    if (missing) {
      setFormError(`${missing.label} is required`);
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const payload = toPayload(config, form);
      if (editor.row) {
        await config.api.update(editor.row._id, payload);
        setNotice({ type: 'success', text: `${config.singular[0].toUpperCase()}${config.singular.slice(1)} updated` });
      } else {
        await config.api.create(payload);
        setNotice({ type: 'success', text: `${config.singular[0].toUpperCase()}${config.singular.slice(1)} added` });
      }
      setEditor(null);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await config.api.remove(toDelete._id);
      setNotice({ type: 'success', text: `${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted` });
      setToDelete(null);
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: getErrorMessage(err) });
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-head">
        <h2>{config.label}</h2>
        <button className="btn" onClick={openCreate}>Add {config.singular}</button>
      </div>

      {notice.text && (
        <div className={`alert ${notice.type}`} role="status">
          {notice.text}
          <button className="alert-close" onClick={() => setNotice({ type: '', text: '' })} aria-label="Dismiss">&times;</button>
        </div>
      )}

      <div className="filters">
        <input type="search" placeholder={`Search ${config.label.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} aria-label={`Search ${config.label}`} />
      </div>

      {loading && <Loading text={`Loading ${config.label.toLowerCase()}...`} />}
      {error && <ErrorState title={`Could not load ${config.label.toLowerCase()}`} message={error} onRetry={reload} />}

      {!loading && !error && rows.length === 0 && (
        <div className="state">
          <h3>{data && data.length > 0 ? 'No matching results' : `No ${config.label.toLowerCase()} yet`}</h3>
          <p>{data && data.length > 0 ? 'Try a different search.' : `Add the first ${config.singular} to get started.`}</p>
          {(!data || data.length === 0) && <button className="btn" onClick={openCreate}>Add {config.singular}</button>}
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map((c) => <th key={c.label}>{c.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  {config.columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setToDelete(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor && (
        <Modal title={`${editor.row ? 'Edit' : 'Add'} ${config.singular}`} onClose={() => setEditor(null)} wide>
          <form onSubmit={save} noValidate>
            {formError && <div className="alert error" role="alert">{formError}</div>}
            <div className="form-grid">
              {config.fields.map((f) => (
                <label key={f.name} className={f.type === 'textarea' || f.full ? 'full' : ''}>
                  {f.label}{f.optional ? ' (optional)' : ''}
                  {f.type === 'select' ? (
                    <select name={f.name} value={form[f.name]} onChange={change}>
                      {f.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea name={f.name} rows={f.rows || 3} value={form[f.name]} onChange={change} />
                  ) : (
                    <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={change} placeholder={f.placeholder || ''} />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditor(null)}>Cancel</button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? 'Saving...' : editor.row ? 'Save changes' : `Add ${config.singular}`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <Modal title={`Delete ${config.singular}?`} onClose={() => setToDelete(null)}>
          <p>
            You are about to delete <strong>{config.title(toDelete)}</strong>. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : `Delete ${config.singular}`}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------- Admin page ---------- */

const MENU = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'matches', label: 'Matches' },
  { key: 'teams', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'news', label: 'News' },
  { key: 'users', label: 'Users' },
];

export default function Admin() {
  const [section, setSection] = useState('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-user">Signed in as<br /><strong>{user?.name}</strong></p>
        <nav>
          {MENU.map((m) => (
            <button key={m.key} className={section === m.key ? 'side-link active' : 'side-link'} onClick={() => setSection(m.key)}>
              {m.label}
            </button>
          ))}
          <button className="side-link" onClick={logout}>Logout</button>
        </nav>
      </aside>

      <section className="admin-main">
        {section === 'dashboard' && <Dashboard go={setSection} />}
        {section === 'users' && <Users />}
        {ENTITIES[section] && <EntityManager key={section} config={ENTITIES[section]} />}
      </section>
    </div>
  );
}
