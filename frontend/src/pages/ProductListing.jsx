import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { fetchProducts } from "../api";
import Hero from "../components/Hero";
import "./ProductListing.css";

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Skirts"];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
];

/* ---------- Field mapping ----------
   If your product fields are named differently, fix them HERE only. */
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

function offerInfo(p) {
  const price = num(p.price ?? p.sale_price);
  const original = num(p.original_price ?? p.originalPrice ?? p.mrp ?? p.old_price);
  let pct = num(p.discount ?? p.discount_percent);
  if (!pct && price && original && original > price) pct = Math.round((1 - price / original) * 100);
  return { price, original, pct: pct > 0 ? pct : null };
}
// Prefer the admin-entered imageUrl, then support older image field names.
// Use the emoji only when no usable image URL is provided.
const imageUrlOf = (p) =>
  p.imageUrl ?? p.image_url ?? p.image ?? p.img ?? "";

const visualOf = (p) => ({
  imageUrl: imageUrlOf(p),
  emoji: p.emoji ?? "🛍️",
});

const badgeOf = (p) => String(p.badge ?? p.tag ?? "").toLowerCase();
const ratingOf = (p) => num(p.rating ?? p.avg_rating);
const reviewsOf = (p) => num(p.reviews ?? p.review_count ?? p.reviews_count);

const money = (n) => `₹${n.toLocaleString("en-IN")}`;
const motion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
const scrollToId = (id) =>
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: motion(), block: "start" }), 60);

function Visual({ value, alt }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = value?.imageUrl;

  if (imageUrl && !imageFailed) {
    return (
      <img
        className="product-image"
        src={imageUrl}
        alt={alt || "Product"}
        loading="lazy"
        draggable="false"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="product-image-fallback" aria-label={alt || "Product image unavailable"}>
      <span className="visual-emoji" aria-hidden="true">
        {value?.emoji || "🛍️"}
      </span>
    </div>
  );
}

/* ---------- Product tile ---------- */
function ProductTile({ product, index, onClick }) {
  const { price, original, pct } = offerInfo(product);
  const badge = product.badge ?? product.tag;
  const rating = ratingOf(product);
  const reviews = reviewsOf(product);
  return (
    <button type="button" className="ptile" onClick={onClick}>
      <div className={`ptile-visual tone-${index % 5}`}>
        <Visual value={visualOf(product)} alt={product.name} />
        {badge && <span className="ptile-badge">{badge}</span>}
      </div>
      <div className="ptile-info">
        {product.brand && <span className="ptile-brand">{product.brand}</span>}
        <span className="ptile-name">{product.name}</span>
        <span className="ptile-price">
          {price != null && <strong>{money(price)}</strong>}
          {original != null && price != null && original > price && <s>{money(original)}</s>}
          {pct && <em>{pct}% off</em>}
        </span>
        {rating != null && (
          <span className="ptile-rating">
            <span aria-hidden="true">★</span> {rating.toFixed(1)}
            {reviews != null && <span> ({reviews})</span>}
          </span>
        )}
      </div>
    </button>
  );
}

/* ---------- Promo carousel (drag, swipe, trackpad, arrows) ---------- */
function PromoCarousel({ promos, onPick, title, eyebrow }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });

  const updateEdge = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdge();
    window.addEventListener("resize", updateEdge);
    return () => window.removeEventListener("resize", updateEdge);
  }, [updateEdge, promos.length]);

  useEffect(() => {
    const move = (e) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > 5) d.moved = true;
      trackRef.current.scrollLeft = d.startLeft - dx;
    };
    const up = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      setDragging(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    const card = el.querySelector(".promo-tile");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 12), behavior: motion() });
  };

  return (
    <>
      <div className="section-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title" id="offers-title">{title}</h2>
        </div>
        <div className="carousel-arrows">
          <button className="arrow-btn" aria-label="Previous" disabled={edge.start} onClick={() => scrollByCard(-1)}>‹</button>
          <button className="arrow-btn" aria-label="Next" disabled={edge.end} onClick={() => scrollByCard(1)}>›</button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`promo-track ${dragging ? "dragging" : ""}`}
        role="region"
        aria-labelledby="offers-title"
        tabIndex={0}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { active: true, startX: e.clientX, startLeft: trackRef.current.scrollLeft, moved: false };
          setDragging(true);
        }}
        onScroll={updateEdge}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
        }}
      >
        {promos.map((p, i) => (
          <button key={p.key} type="button" className={`promo-tile tone-${i % 5}`} onClick={() => onPick(p.action)}>
            <span className="promo-eyebrow">{p.eyebrow}</span>
            <span className="promo-bottom">
              <span className="promo-title">{p.title}</span>
              <span className="promo-cta">{p.cta} <span className="promo-arrow">↗</span></span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function ProductSection({ id, title, items, onProductClick, onViewAll }) {
  return (
    <section id={id} className="listing-section" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <h2 className="section-title section-title-sm" id={`${id}-title`}>{title}</h2>
        {onViewAll && <button className="view-all" onClick={onViewAll}>View all →</button>}
      </div>
      <div className="products-grid">
        {items.map((p, i) => (
          <ProductTile key={p.id} product={p} index={i} onClick={() => onProductClick(p)} />
        ))}
      </div>
    </section>
  );
}

export default function ProductListing({ onProductClick, searchQuery = "" }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchQuery);
  const [sort, setSort] = useState("featured");

  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchProducts(activeCategory !== "All" ? activeCategory : null)
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const inCategory = useMemo(
    () => (activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory)),
    [products, activeCategory]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? inCategory.filter((p) => [p.name, p.brand, p.category].some((v) => String(v ?? "").toLowerCase().includes(q)))
      : [...inCategory];
    const price = (p) => offerInfo(p).price ?? Number.MAX_SAFE_INTEGER;
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") list.sort((a, b) => (offerInfo(b).price ?? 0) - (offerInfo(a).price ?? 0));
    if (sort === "discount") list.sort((a, b) => (offerInfo(b).pct ?? 0) - (offerInfo(a).pct ?? 0));
    return list;
  }, [inCategory, query, sort]);

  const showcase = activeCategory === "All" && !query.trim();

  const trendingAll = useMemo(() => products.filter((p) => badgeOf(p) === "trending"), [products]);
  const freshAll = useMemo(() => products.filter((p) => badgeOf(p) === "new"), [products]);

  // Promo tiles are built only from real data: real max discount, real badges, real category counts
  const promos = useMemo(() => {
    const list = [];
    const maxPct = Math.max(0, ...products.map((p) => offerInfo(p).pct ?? 0));
    if (maxPct > 0) list.push({ key: "sale", eyebrow: "Sale", title: `Up to ${maxPct}% off`, cta: "Shop the sale", action: { type: "sale" } });
    if (freshAll.length) list.push({ key: "new", eyebrow: "Just in", title: "New arrivals", cta: "Explore the collection", action: { type: "scroll", id: "new-arrivals" } });
    if (trendingAll.length) list.push({ key: "trending", eyebrow: "Trending", title: "What's trending", cta: "Discover more", action: { type: "scroll", id: "trending" } });
    CATEGORIES.slice(1).forEach((cat) => {
      const n = products.filter((p) => p.category === cat).length;
      if (n) list.push({ key: cat, eyebrow: `${n} ${n === 1 ? "style" : "styles"}`, title: cat, cta: `Shop ${cat.toLowerCase()}`, action: { type: "category", cat } });
    });
    return list;
  }, [products, freshAll, trendingAll]);

  const hasSale = promos.some((p) => p.key === "sale");

  const onPromo = (a) => {
    if (a.type === "scroll") scrollToId(a.id);
    if (a.type === "sale") { setActiveCategory("All"); setQuery(""); setSort("discount"); scrollToId("all-products"); }
    if (a.type === "category") { setActiveCategory(a.cat); setQuery(""); setSort("featured"); scrollToId("all-products"); }
  };

  const clearFilters = () => { setActiveCategory("All"); setQuery(""); setSort("featured"); };

  return (
    <>
    <Hero />
    <div className="listing-page" id="top">

      {showcase && promos.length > 0 && (
        <section id="offers" className="offers">
          <PromoCarousel
            promos={promos}
            onPick={onPromo}
            eyebrow="Curated for you"
            title={hasSale ? "Offers you don't want to miss" : "Explore the collections"}
          />
        </section>
      )}

      {showcase && trendingAll.length > 0 && (
        <ProductSection id="trending" title="Trending Offers" items={trendingAll.slice(0, 4)}
          onProductClick={onProductClick} onViewAll={() => scrollToId("all-products")} />
      )}
      {showcase && freshAll.length > 0 && (
        <ProductSection id="new-arrivals" title="New Arrivals" items={freshAll.slice(0, 4)}
          onProductClick={onProductClick} onViewAll={() => scrollToId("all-products")} />
      )}

      <section id="all-products" className="listing-section" aria-labelledby="all-title">
        <div className="section-head">
          <div>
            <h2 className="section-title section-title-sm" id="all-title">{activeCategory === "All" ? "Shop all" : activeCategory}</h2>
            <p className="section-sub">{visible.length} {visible.length === 1 ? "product" : "products"}</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="filter-row" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button key={cat} aria-pressed={activeCategory === cat}
                className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <div className="toolbar-tools">
            <input className="field" type="search" placeholder="Search products" aria-label="Search products"
              value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="field" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="products-grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <p>No products match your search.</p>
            <button className="view-all" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="products-grid">
            {visible.map((product, i) => (
              <ProductTile key={product.id} product={product} index={i} onClick={() => onProductClick(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
}