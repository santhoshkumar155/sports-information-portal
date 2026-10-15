import { formatDate, formatTime } from '../services/api.js';

export default function MatchCard({ match }) {
  const showScore = match.status !== 'Upcoming';
  const statusClass = `badge status-${match.status.toLowerCase()}`;

  return (
    <article className="card match-card">
      <div className="card-top">
        <span className="badge sport">{match.sport}</span>
        <span className={statusClass}>
          {match.status === 'Live' && <span className="live-dot" />}
          {match.status}
        </span>
      </div>
      <p className="tournament">{match.tournament}</p>

      <div className="versus">
        <div className="side">
          <span className="team-name">{match.team1}</span>
          {showScore && <span className="score">{match.team1Score || '-'}</span>}
        </div>
        <span className="vs">vs</span>
        <div className="side">
          <span className="team-name">{match.team2}</span>
          {showScore && <span className="score">{match.team2Score || '-'}</span>}
        </div>
      </div>

      <ul className="meta">
        <li>{formatDate(match.date)}</li>
        <li>{formatTime(match.time)}</li>
        <li>{match.venue}</li>
      </ul>
    </article>
  );
}
