import { useMemo, useState } from 'react';
import PlayerCard from '../components/PlayerCard.jsx';
import { SPORTS, playerApi, useFetch } from '../services/api.js';

export default function Players() {
  const { data: players, loading, error, reload } = useFetch(() => playerApi.list(), []);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [country, setCountry] = useState('');
  const [team, setTeam] = useState('');

  const countries = useMemo(() => [...new Set((players || []).map((p) => p.country))].sort(), [players]);

  // Team options narrow to the chosen sport
  const teamOptions = useMemo(
    () => [...new Set((players || []).filter((p) => !sport || p.sport === sport).map((p) => p.team))].sort(),
    [players, sport]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (players || []).filter(
      (p) =>
        (!sport || p.sport === sport) &&
        (!country || p.country === country) &&
        (!team || p.team === team) &&
        (!q || [p.name, p.team, p.position, p.country].some((v) => v.toLowerCase().includes(q)))
    );
  }, [players, search, sport, country, team]);

  const changeSport = (value) => {
    setSport(value);
    setTeam('');
  };

  const reset = () => {
    setSearch('');
    setSport('');
    setCountry('');
    setTeam('');
  };

  return (
    <div className="container page">
      <h1>Players</h1>
      <p className="muted">Profiles, positions and career statistics.</p>

      <div className="filters">
        <input type="search" placeholder="Search name, team or position" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search players" />
        <select value={sport} onChange={(e) => changeSport(e.target.value)} aria-label="Filter by sport">
          <option value="">All sports</option>
          {SPORTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Filter by team">
          <option value="">All teams</option>
          {teamOptions.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-outline" onClick={reset}>Clear filters</button>
      </div>

      {loading && <div className="state"><div className="spinner" /><p>Loading players...</p></div>}
      {error && (
        <div className="state error">
          <h3>Could not load players</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="state">
          <h3>No players found</h3>
          <p>Try a different search or clear the filters.</p>
          <button className="btn" onClick={reset}>Clear filters</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid cols-3">
          {filtered.map((p) => <PlayerCard key={p._id} player={p} />)}
        </div>
      )}
    </div>
  );
}
