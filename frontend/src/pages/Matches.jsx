import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MatchCard from '../components/MatchCard.jsx';
import { MATCH_STATUSES, SPORTS, matchApi, useDebounce, useFetch } from '../services/api.js';

export default function Matches() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState(params.get('sport') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState('dateAsc');
  const debouncedSearch = useDebounce(search);

  // Footer and home page links change the query string while this page is open
  useEffect(() => {
    setSport(params.get('sport') || '');
    setStatus(params.get('status') || '');
  }, [params]);

  const { data: matches, loading, error, reload } = useFetch(
    () => matchApi.list({ search: debouncedSearch, sport, status, date, sort }),
    [debouncedSearch, sport, status, date, sort]
  );

  const reset = () => {
    setSearch('');
    setSport('');
    setStatus('');
    setDate('');
    setSort('dateAsc');
  };

  return (
    <div className="container page">
      <h1>Matches</h1>
      <p className="muted">Fixtures, live scores and results.</p>

      <div className="filters">
        <input type="search" placeholder="Search team, tournament or venue" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search matches" />
        <select value={sport} onChange={(e) => setSport(e.target.value)} aria-label="Filter by sport">
          <option value="">All sports</option>
          {SPORTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {MATCH_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort matches">
          <option value="dateAsc">Date: earliest first</option>
          <option value="dateDesc">Date: latest first</option>
          <option value="sport">Sport (A-Z)</option>
          <option value="tournament">Tournament (A-Z)</option>
        </select>
        <button className="btn btn-outline" onClick={reset}>Clear filters</button>
      </div>

      {loading && <div className="state"><div className="spinner" /><p>Loading matches...</p></div>}
      {error && (
        <div className="state error">
          <h3>Could not load matches</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && matches && matches.length === 0 && (
        <div className="state">
          <h3>No matches found</h3>
          <p>Try a different search or clear the filters.</p>
          <button className="btn" onClick={reset}>Clear filters</button>
        </div>
      )}
      {!loading && !error && matches && matches.length > 0 && (
        <>
          <p className="muted small">{matches.length} match{matches.length === 1 ? '' : 'es'}</p>
          <div className="grid cols-3">
            {matches.map((m) => <MatchCard key={m._id} match={m} />)}
          </div>
        </>
      )}
    </div>
  );
}
