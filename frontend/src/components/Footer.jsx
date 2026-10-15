import { Link } from 'react-router-dom';
import { SPORTS } from '../services/api.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">SP</span>
            Sports Portal
          </div>
          <p>Matches, teams, players and news across six sports, in one place.</p>
        </div>
        <div>
          <h4>Browse</h4>
          <ul>
            <li><Link to="/matches">Matches</Link></li>
            <li><Link to="/teams">Teams</Link></li>
            <li><Link to="/players">Players</Link></li>
            <li><Link to="/news">News</Link></li>
          </ul>
        </div>
        <div>
          <h4>Sports</h4>
          <ul>
            {SPORTS.map((s) => (
              <li key={s}><Link to={`/matches?sport=${s}`}>{s}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        &copy; {new Date().getFullYear()} Sports Information Portal. Built with React, Express and MongoDB.
      </div>
    </footer>
  );
}
