import { useMemo, useState } from 'react';
import TeamCard from '../components/TeamCard.jsx';
import { SPORTS, teamApi, useFetch } from '../services/api.js';

export default function Teams() {
  const { data: teams, loading, error, reload } = useFetch(() => teamApi.list(), []);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [country, setCountry] = useState('');

  const countries = useMemo(() => [...new Set((teams || []).map((t) => t.country))].sort(), [teams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (teams || []).filter(
      (t) =>
        (!sport || t.sport === sport) &&
        (!country || t.country === country) &&
        (!q || [t.name, t.coach, t.country].some((v) => v.toLowerCase().includes(q)))
    );
  }, [teams, search, sport, country]);

  const reset = () => {
    setSearch('');
    setSport('');
    setCountry('');
  };

  return (
    <div className="container page">
      <h1>Teams</h1>
      <p className="muted">Clubs and national sides across six sports.</p>

      <div className="filters">
        <input type="search" placeholder="Search team, coach or country" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search teams" />
        <select value={sport} onChange={(e) => setSport(e.target.value)} aria-label="Filter by sport">
          <option value="">All sports</option>
          {SPORTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-outline" onClick={reset}>Clear filters</button>
      </div>

      {loading && <div className="state"><div className="spinner" /><p>Loading teams...</p></div>}
      {error && (
        <div className="state error">
          <h3>Could not load teams</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="state">
          <h3>No teams found</h3>
          <p>Try a different search or clear the filters.</p>
          <button className="btn" onClick={reset}>Clear filters</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid cols-3">
          {filtered.map((t) => <TeamCard key={t._id} team={t} />)}
        </div>
      )}
    </div>
  );
}
