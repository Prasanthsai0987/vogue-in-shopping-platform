import { useState, useEffect } from "react";
import heroImage from "../public/images/vogue-hero.png";
import "./Hero.css";

/* Image lives at  src/public/images/vogue-hero.png  and is imported so Vite bundles it.
   If it ever fails to load, the hero falls back to a solid dark background. */
const HERO_IMAGE = heroImage;

const motion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

function scrollToFirst(ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: motion(), block: "start" }); return; }
  }
}

export default function Hero() {
  const [imgFailed, setImgFailed] = useState(false);

  // Lets the navbar know it should float transparently over the hero
  useEffect(() => {
    document.body.classList.add("has-hero");
    return () => document.body.classList.remove("has-hero");
  }, []);

  return (
    <section id="hero" className={`hero ${imgFailed ? "no-image" : ""}`} aria-labelledby="hero-title">
      {!imgFailed && (
        <img className="hero-img" src={HERO_IMAGE} alt="" aria-hidden="true"
          decoding="async" onError={() => setImgFailed(true)} />
      )}
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-inner">
        <h1 id="hero-title" className="hero-title">
          <span>Your style.</span>{" "}
          <span>Your story.</span>{" "}
          <span>Your Vogue.</span>
        </h1>

        <p className="hero-sub">
          Discover timeless essentials and new-season styles designed around you.
        </p>

        <div className="hero-actions">
          <button className="hero-btn" onClick={() => scrollToFirst(["offers", "all-products"])}>
            Explore collection
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button className="hero-link" onClick={() => scrollToFirst(["new-arrivals", "all-products"])}>
            Shop new arrivals
          </button>
        </div>
      </div>
    </section>
  );
}