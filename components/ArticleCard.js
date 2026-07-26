const FALLBACK_ACCENT = "#3b5bfd";

/**
 * Renders a single result's `display` object as a visual card.
 * This is the only way article/event/person/project data is ever
 * rendered — callers never fall back to printing raw text.
 */
export default function ArticleCard({ article }) {
  const display = article?.display || {};
  const {
    cardTitle,
    cardSubtitle,
    cardDescription,
    badge,
    accentColor,
    icon,
    thumbnail,
    heroImage,
  } = display;

  const image = heroImage || thumbnail;
  const accent = accentColor || FALLBACK_ACCENT;

  return (
    <article className="article-card">
      {image ? (
        <div className="article-card-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={cardTitle || "Article image"}
            className="article-card-image"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="article-card-image-wrap article-card-placeholder"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}88)`,
          }}
        >
          {icon ? <span className="article-card-icon">{icon}</span> : null}
        </div>
      )}

      <div className="article-card-body">
        {badge ? (
          <span
            className="article-card-badge"
            style={{ backgroundColor: accent }}
          >
            {badge}
          </span>
        ) : null}

        <h3 className="article-card-title">{cardTitle || "Untitled"}</h3>

        {cardSubtitle ? (
          <p className="article-card-subtitle">{cardSubtitle}</p>
        ) : null}

        {cardDescription ? (
          <p className="article-card-description">{cardDescription}</p>
        ) : null}
      </div>
    </article>
  );
}

/** Grid wrapper — single card renders full width, multiple cards go compact. */
export function ArticleCardGrid({ articles }) {
  if (!articles || articles.length === 0) return null;
  const compact = articles.length > 1;
  return (
    <div className={compact ? "article-grid" : "article-grid single"}>
      {articles.map((article, i) => (
        <ArticleCard key={article?.id ?? i} article={article} />
      ))}
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="article-card article-card-skeleton" aria-hidden="true">
      <div className="article-card-image-wrap skeleton-block" />
      <div className="article-card-body">
        <div className="skeleton-line skeleton-badge" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-text" />
        <div className="skeleton-line skeleton-text short" />
      </div>
    </div>
  );
}
