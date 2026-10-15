import { useState } from 'react';
import { formatDate } from '../services/api.js';

export default function NewsCard({ article, onRead, featured = false }) {
  const [broken, setBroken] = useState(false);
  const showImage = article.image && !broken;

  return (
    <article className={featured ? 'card news-card featured' : 'card news-card'}>
      {showImage ? (
        <img className="news-img" src={article.image} alt="" onError={() => setBroken(true)} />
      ) : (
        <div className={`news-img placeholder cat-${article.category.toLowerCase()}`}>{article.category}</div>
      )}
      <div className="news-body">
        <div className="card-top">
          <span className="badge sport">{article.category}</span>
          <span className="muted small">{formatDate(article.publishedAt, false)}</span>
        </div>
        <h3>{article.title}</h3>
        <p className="muted">{article.description}</p>
        <div className="news-foot">
          <span className="small">By {article.author}</span>
          <button className="link-btn" onClick={() => onRead(article)}>Read more</button>
        </div>
      </div>
    </article>
  );
}
