import { useState, useEffect, useRef } from "react";
import { useCart } from "../pages/CartContext";
import "./Navbar.css";

/* `target` = element id on the home page.
   "Men" currently scrolls to the product list; point it at a men's section once you have men's products. */
const NAV_LINKS = [
  { label: "Women", target: "top" },
  { label: "Men", target: "all-products" },
  { label: "New Arrivals", target: "new-arrivals" },
  { label: "Offers", target: "offers" },
];

const smooth = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Navbar({
  onHomeClick,
  onOrdersClick,
  onCartClick,
  onProfileClick,
  onSearch,          // optional: (text) => void
  onWishlistClick,   // optional: shows the heart only when provided
  wishlistCount = 0,
}) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onKey = (e) => {
      if (e.key === "Escape") { setMenuOpen(false); setSearchOpen(false); }
    };
    const onResize = () => window.innerWidth > 900 && setMenuOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);

  // Over the hero the bar is transparent; it turns solid on scroll or when a panel is open
  const solid = scrolled || menuOpen || searchOpen;

  const run = (fn) => () => { setMenuOpen(false); fn?.(); };

  const goTo = (target) => {
    setMenuOpen(false);
    onHomeClick?.();
    setTimeout(() => {
      const el = target === "top" ? null : document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: smooth(), block: "start" });
      else window.scrollTo({ top: 0, behavior: smooth() });
    }, 80);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    onHomeClick?.();
    onSearch?.(query.trim());
    setTimeout(() => {
      document.getElementById("all-products")?.scrollIntoView({ behavior: smooth(), block: "start" });
    }, 80);
  };

  const closeSearch = () => { setSearchOpen(false); setQuery(""); onSearch?.(""); };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""} ${solid ? "solid" : ""}`}>
      <div className="navbar-inner">
        <button className="nav-icon-btn nav-burger" aria-label="Menu"
          aria-expanded={menuOpen} aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen
            ? <Icon><path d="M6 6l12 12M18 6L6 18" /></Icon>
            : <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>}
        </button>

        <button className="nav-logo" onClick={run(onHomeClick)} aria-label="VOGUE.IN home">
          VOGUE<span className="accent">.</span>IN
        </button>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <button key={l.label} className="nav-link" onClick={() => goTo(l.target)}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <form className={`nav-search ${searchOpen ? "open" : ""}`} role="search" onSubmit={submitSearch}>
            <input ref={inputRef} type="search" placeholder="Search dresses, tops, brands"
              aria-label="Search products" value={query}
              onChange={(e) => setQuery(e.target.value)} tabIndex={searchOpen ? 0 : -1} />
            <button type={searchOpen && query ? "submit" : "button"} className="nav-icon-btn"
              aria-label={searchOpen ? "Search" : "Open search"}
              onClick={() => { if (!searchOpen) setSearchOpen(true); else if (!query) setSearchOpen(false); }}>
              <Icon><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></Icon>
            </button>
            <button type="button" className="nav-icon-btn nav-search-close" aria-label="Close search" onClick={closeSearch}>
              <Icon><path d="M6 6l12 12M18 6L6 18" /></Icon>
            </button>
          </form>

          <button className="nav-icon-btn nav-hide-sm" aria-label="Orders" title="Orders" onClick={run(onOrdersClick)}>
            <Icon><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></Icon>
          </button>

          <button className="nav-icon-btn nav-hide-sm" aria-label="Profile" title="Profile" onClick={run(onProfileClick)}>
            <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></Icon>
          </button>

          {onWishlistClick && (
            <button className="nav-icon-btn nav-hide-sm" aria-label={`Wishlist, ${wishlistCount} items`} title="Wishlist" onClick={run(onWishlistClick)}>
              <Icon><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></Icon>
              {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </button>
          )}

          <button className="nav-icon-btn" aria-label={`Bag, ${totalItems} items`} title="Bag" onClick={run(onCartClick)}>
            <Icon><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></Icon>
            {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <button key={l.label} onClick={() => goTo(l.target)} tabIndex={menuOpen ? 0 : -1}>{l.label}</button>
        ))}
        <button onClick={run(onOrdersClick)} tabIndex={menuOpen ? 0 : -1}>Orders</button>
        <button onClick={run(onProfileClick)} tabIndex={menuOpen ? 0 : -1}>Profile</button>
        {onWishlistClick && <button onClick={run(onWishlistClick)} tabIndex={menuOpen ? 0 : -1}>Wishlist</button>}
      </div>
    </header>
  );
}