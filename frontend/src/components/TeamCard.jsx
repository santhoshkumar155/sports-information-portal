import { useState } from 'react';
import { initials } from '../services/api.js';

export default function TeamCard({ team }) {
  const [broken, setBroken] = useState(false);

  return (
    <article className="card team-card">
      <div className="team-head">
        {team.logo && !broken ? (
          <img className="team-logo" src={team.logo} alt={`${team.name} logo`} onError={() => setBroken(true)} />
        ) : (
          <div className="team-logo fallback">{initials(team.name)}</div>
        )}
        <div>
          <h3>{team.name}</h3>
          <span className="badge sport">{team.sport}</span>
        </div>
      </div>
      <dl className="facts">
        <div><dt>Country</dt><dd>{team.country}</dd></div>
        <div><dt>Coach</dt><dd>{team.coach}</dd></div>
        <div><dt>Founded</dt><dd>{team.founded}</dd></div>
      </dl>
      {team.description && <p className="muted">{team.description}</p>}
    </article>
  );
}
