import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, useAuth } from '../services/api.js';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = Boolean(token && user);

  // Close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const logout = () => {
    clearSession();
    setOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">SP</span>
          Sports Portal
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/matches" className={linkClass}>Matches</NavLink>
          <NavLink to="/teams" className={linkClass}>Teams</NavLink>
          <NavLink to="/players" className={linkClass}>Players</NavLink>
          <NavLink to="/news" className={linkClass}>News</NavLink>

          {!loggedIn && (
            <>
              <Link to="/#about" className="nav-link">About</Link>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className="btn btn-sm nav-cta">Register</NavLink>
            </>
          )}

          {loggedIn && (
            <>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>
              )}
              <button className="btn btn-sm btn-outline nav-cta" onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
