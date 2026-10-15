import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard.jsx';
import TeamCard from '../components/TeamCard.jsx';
import PlayerCard from '../components/PlayerCard.jsx';
import NewsCard from '../components/NewsCard.jsx';
import { SPORTS, dashboardApi, formatDate, formatTime, matchApi, newsApi, playerApi, teamApi, useFetch } from '../services/api.js';

const SPORT_BLURB = {
  Cricket: 'Tests, ODIs and T20 leagues',
  Football: 'Leagues and cup competitions',
  Basketball: 'Pro leagues and playoffs',
  Tennis: 'Grand Slams and Davis Cup',
  Hockey: 'Pro League and Olympic play',
  Badminton: 'World Tour and team events',
};

const loadHome = async () => {
  const [stats, live, upcoming, completed, news, teams, players] = await Promise.all([
    dashboardApi.stats(),
    matchApi.list({ status: 'Live', sort: 'dateAsc', limit: 3 }),
    matchApi.list({ status: 'Upcoming', sort: 'dateAsc', limit: 6 }),
    matchApi.list({ status: 'Completed', sort: 'dateDesc', limit: 6 }),
    newsApi.list({ limit: 6 }),
    teamApi.list({ limit: 6 }),
    playerApi.list({ limit: 6 }),
  ]);
  return { stats, live, upcoming, completed, news, teams, players };
};

export default function Home() {
  const { data, loading, error, reload } = useFetch(loadHome, []);
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Scroll to #about once the page content exists
  useEffect(() => {
    if (hash === '#about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, loading]);

  const next = data?.upcoming?.[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Sports Information Portal</h1>
            <p>
              Follow fixtures, scores, squads and stories across cricket, football, basketball, tennis, hockey and badminton.
            </p>
            <div className="hero-actions">
              <Link to="/matches" className="btn btn-accent">Browse matches</Link>
              <Link to="/news" className="btn btn-ghost">Read the news</Link>
            </div>
          </div>
          <div className="hero-panel">
            {next ? (
              <>
                <p className="panel-label">Next match</p>
                <h3>{next.team1} vs {next.team2}</h3>
                <p>{next.sport} &middot; {next.tournament}</p>
                <p>{formatDate(next.date)}, {formatTime(next.time)}</p>
                <p>{next.venue}</p>
              </>
            ) : (
              <>
                <p className="panel-label">Next match</p>
                <h3>{loading ? 'Loading...' : 'No upcoming matches'}</h3>
                <p>Scheduled fixtures will appear here.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {loading && <div className="state"><div className="spinner" /><p>Loading the latest sports data...</p></div>}

        {error && (
          <div className="state error">
            <h3>Could not load the home page</h3>
            <p>{error}</p>
            <button className="btn" onClick={reload}>Try again</button>
          </div>
        )}

        {data && (
          <>
            <section className="section">
              <div className="section-head"><h2>Sports categories</h2></div>
              <div className="grid cols-3">
                {SPORTS.map((s) => (
                  <Link key={s} to={`/matches?sport=${s}`} className="card category-card">
                    <h3>{s}</h3>
                    <p className="muted">{SPORT_BLURB[s]}</p>
                    <span className="small">{data.stats.matchesBySport[s] || 0} matches</span>
                  </Link>
                ))}
              </div>
            </section>

            {data.live.length > 0 && (
              <section className="section">
                <div className="section-head"><h2>Live now</h2><Link to="/matches?status=Live">All live matches</Link></div>
                <div className="grid cols-3">
                  {data.live.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              </section>
            )}

            <section className="section">
              <div className="section-head"><h2>Upcoming matches</h2><Link to="/matches?status=Upcoming">View all</Link></div>
              {data.upcoming.length === 0 ? (
                <p className="muted">No upcoming matches scheduled.</p>
              ) : (
                <div className="grid cols-3">
                  {data.upcoming.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Recent results</h2><Link to="/matches?status=Completed">View all</Link></div>
              {data.completed.length === 0 ? (
                <p className="muted">No completed matches yet.</p>
              ) : (
                <div className="grid cols-3">
                  {data.completed.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Latest news</h2><Link to="/news">All news</Link></div>
              {data.news.length === 0 ? (
                <p className="muted">No news published yet.</p>
              ) : (
                <div className="grid cols-3">
                  {data.news.map((a) => (
                    <NewsCard key={a._id} article={a} onRead={(art) => navigate(`/news?read=${art._id}`)} />
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Popular teams</h2><Link to="/teams">All teams</Link></div>
              {data.teams.length === 0 ? (
                <p className="muted">No teams added yet.</p>
              ) : (
                <div className="grid cols-3">
                  {data.teams.map((t) => <TeamCard key={t._id} team={t} />)}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Top players</h2><Link to="/players">All players</Link></div>
              {data.players.length === 0 ? (
                <p className="muted">No players added yet.</p>
              ) : (
                <div className="grid cols-3">
                  {data.players.map((p) => <PlayerCard key={p._id} player={p} />)}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-head"><h2>Portal statistics</h2></div>
              <div className="stat-row">
                <div className="stat"><strong>{data.stats.matches}</strong><span>Matches</span></div>
                <div className="stat"><strong>{data.stats.matchStatus.live}</strong><span>Live now</span></div>
                <div className="stat"><strong>{data.stats.teams}</strong><span>Teams</span></div>
                <div className="stat"><strong>{data.stats.players}</strong><span>Players</span></div>
                <div className="stat"><strong>{data.stats.news}</strong><span>News articles</span></div>
              </div>
            </section>
          </>
        )}

        <section className="section about" id="about">
          <div className="section-head"><h2>About the portal</h2></div>
          <p>
            Sports Information Portal brings fixtures, results, team profiles, player profiles and news for six sports into one searchable site.
            Anyone can browse. Registered users get a profile, and administrators keep the data up to date from the admin panel.
          </p>
        </section>
      </div>
    </>
  );
}
