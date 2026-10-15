import { useState } from 'react';
import { initials } from '../services/api.js';

export default function PlayerCard({ player }) {
  const [broken, setBroken] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <article className="card player-card">
      <div className="player-head">
        {player.image && !broken ? (
          <img className="player-img" src={player.image} alt={player.name} onError={() => setBroken(true)} />
        ) : (
          <div className="player-img fallback">{initials(player.name)}</div>
        )}
        <div>
          <h3>{player.name}</h3>
          <span className="badge sport">{player.sport}</span>
          <p className="muted small">{player.position}</p>
        </div>
        <span className="jersey" title="Jersey number">#{player.jerseyNumber}</span>
      </div>

      <dl className="facts">
        <div><dt>Team</dt><dd>{player.team}</dd></div>
        <div><dt>Country</dt><dd>{player.country}</dd></div>
        <div><dt>Age</dt><dd>{player.age}</dd></div>
      </dl>

      {open && (
        <div className="player-more">
          {player.biography && (
            <>
              <h4>Biography</h4>
              <p>{player.biography}</p>
            </>
          )}
          {player.statistics && (
            <>
              <h4>Statistics</h4>
              <p className="pre">{player.statistics}</p>
            </>
          )}
          {!player.biography && !player.statistics && <p className="muted">No extra details yet.</p>}
        </div>
      )}

      <button className="link-btn" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide details' : 'View details'}
      </button>
    </article>
  );
}
