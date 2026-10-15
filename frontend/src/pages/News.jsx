import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard.jsx';
import { NEWS_CATEGORIES, formatDate, newsApi, useDebounce, useFetch } from '../services/api.js';

export default function News() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [reading, setReading] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data: articles, loading, error, reload } = useFetch(
    () => newsApi.list({ search: debouncedSearch, category }),
    [debouncedSearch, category]
  );

  // Open an article directly from /news?read=<id> (used by the home page)
  const readId = params.get('read');
  useEffect(() => {
    if (!readId) return;
    let cancelled = false;
    newsApi.get(readId).then((a) => !cancelled && setReading(a)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [readId]);

  const openArticle = (article) => setReading(article);
  const closeArticle = () => {
    setReading(null);
    if (readId) setParams({}, { replace: true });
  };

  const isFiltered = Boolean(debouncedSearch || category);
  const featured = !isFiltered && articles && articles.length > 0 ? articles[0] : null;
  const rest = featured ? articles.slice(1) : articles || [];

  const reset = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <div className="container page">
      <h1>News</h1>
      <p className="muted">The latest stories from across the sports world.</p>

      <div className="filters">
        <input type="search" placeholder="Search headlines or authors" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search news" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {NEWS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-outline" onClick={reset}>Clear filters</button>
      </div>

      {loading && <div className="state"><div className="spinner" /><p>Loading news...</p></div>}
      {error && (
        <div className="state error">
          <h3>Could not load news</h3>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && articles && articles.length === 0 && (
        <div className="state">
          <h3>No articles found</h3>
          <p>Try a different search or clear the filters.</p>
          <button className="btn" onClick={reset}>Clear filters</button>
        </div>
      )}

      {!loading && !error && featured && (
        <section className="section tight">
          <h2>Featured</h2>
          <NewsCard article={featured} onRead={openArticle} featured />
        </section>
      )}
      {!loading && !error && rest.length > 0 && (
        <section className="section tight">
          <h2>{featured ? 'Latest news' : 'Results'}</h2>
          <div className="grid cols-3">
            {rest.map((a) => <NewsCard key={a._id} article={a} onRead={openArticle} />)}
          </div>
        </section>
      )}

      {reading && (
        <div className="modal-backdrop" onClick={closeArticle}>
          <div className="modal article-modal" role="dialog" aria-modal="true" aria-label={reading.title} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeArticle} aria-label="Close article">&times;</button>
            {reading.image && <img className="article-img" src={reading.image} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
            <span className="badge sport">{reading.category}</span>
            <h2>{reading.title}</h2>
            <p className="muted small">By {reading.author} &middot; {formatDate(reading.publishedAt, false)}</p>
            <p className="lead">{reading.description}</p>
            <div className="article-content">
              {reading.content.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
