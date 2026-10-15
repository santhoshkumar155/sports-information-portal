import axios from 'axios';
import { useEffect, useState, useSyncExternalStore } from 'react';

export const SPORTS = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];
export const NEWS_CATEGORIES = [...SPORTS, 'General'];
export const MATCH_STATUSES = ['Upcoming', 'Live', 'Completed'];

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

/* ---------- Auth session (kept in localStorage, shared via a tiny store) ---------- */

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('spUser'));
  } catch {
    return null;
  }
};

let session = { token: localStorage.getItem('spToken'), user: readUser() };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const setSession = (token, user) => {
  localStorage.setItem('spToken', token);
  localStorage.setItem('spUser', JSON.stringify(user));
  session = { token, user };
  emit();
};

export const clearSession = () => {
  localStorage.removeItem('spToken');
  localStorage.removeItem('spUser');
  session = { token: null, user: null };
  emit();
};

export const useAuth = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => session
  );

api.interceptors.request.use((config) => {
  if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

// An expired or invalid token on a protected call logs the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && session.token && !url.includes('/auth/login')) {
      clearSession();
    }
    return Promise.reject(err);
  }
);

/* ---------- Helpers ---------- */

export const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  return err.message || 'Something went wrong';
};

// Match dates are stored as UTC midnight, so they are formatted in UTC
export const formatDate = (value, utc = true) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(utc ? { timeZone: 'UTC' } : {}),
  });
};

export const formatTime = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Runs fetcher() on mount and whenever deps change; reload() refetches
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: getErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}

/* ---------- API endpoints ---------- */

const crud = (base) => ({
  list: (params) => api.get(base, { params }).then((r) => r.data),
  get: (id) => api.get(`${base}/${id}`).then((r) => r.data),
  create: (data) => api.post(base, data).then((r) => r.data),
  update: (id, data) => api.put(`${base}/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`${base}/${id}`).then((r) => r.data),
});

export const matchApi = crud('/matches');
export const teamApi = crud('/teams');
export const playerApi = crud('/players');
export const newsApi = crud('/news');

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
  users: () => api.get('/auth/users').then((r) => r.data),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  adminStats: () => api.get('/dashboard/admin-stats').then((r) => r.data),
};

export default api;
