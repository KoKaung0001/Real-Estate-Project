import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, Shield, Compass, Bell, Home as HomeIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { YANGON_TOWNSHIPS, MYANMAR_PROPERTIES } from '../data/myanmarProperties';
import type { MyanmarProperty } from '../types';

const FEATURES = [
  { icon: Search, titleEn: 'Smart Search', titleMy: 'ဉာဏ်ရည်တု ရှာဖွေမှု', descEn: 'AI-powered filters match your lifestyle preferences with the right home.', descMy: 'AI-powered filters match your lifestyle preferences with the right home.' },
  { icon: Compass, titleEn: 'Virtual Tours', titleMy: 'Virtual Tours', descEn: 'Explore every room in 3D from your device before scheduling a visit.', descMy: 'Explore every room in 3D from your device before scheduling a visit.' },
  { icon: Bell, titleEn: 'Instant Alerts', titleMy: 'ချက်ချင်း သတိပေးချက်', descEn: 'Get notified the moment a home matching your criteria hits the market.', descMy: 'Get notified the moment a home matching your criteria hits the market.' },
  { icon: Shield, titleEn: 'Secure Transactions', titleMy: 'လုံခြုံသော ငွေပေးချေမှု', descEn: 'Encrypted documents and verified agents for a trusted buying experience.', descMy: 'Encrypted documents and verified agents for a trusted buying experience.' },
];

function PropertyCard({ property, language }: { property: MyanmarProperty; language: string }) {
  const [isFav, setIsFav] = useState(property.favorite);
  const title = language === 'my' ? property.titleMy : property.titleEn;
  const type = language === 'my' ? property.typeMy : property.typeEn;
  const badge = language === 'my' ? property.badgeMy : property.badgeEn;
  const isForRent = badge === 'For Rent' || badge === 'ငှားရန်';

  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img src={property.image} alt={title} className="property-image" loading="lazy" />
        <span className={`property-badge ${isForRent ? 'rent' : 'sale'}`}>{badge}</span>
        <button onClick={() => setIsFav(!isFav)} className="property-favorite" aria-label="Favorite">
          <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3 className="property-title">{title}</h3>
          <span className="property-type-badge">{type}</span>
        </div>
        <p className="property-address">
          <MapPin className="w-4 h-4" />
          {language === 'my' ? property.addressMy : property.addressEn}
        </p>
        <div className="property-specs">
          <span className="property-spec">
            <Bed className="w-4 h-4" /> {property.beds} beds
          </span>
          <span className="property-spec">
            <Bath className="w-4 h-4" /> {property.baths} baths
          </span>
          <span className="property-spec">
            <Square className="w-4 h-4" /> {property.sqft.toLocaleString()} sqft
          </span>
        </div>
        <div className="property-footer">
          <span className="property-price">K {property.price.toLocaleString()}</span>
          <Link to={`/property/${property.id}`} className="property-details-link">
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [listingType, setListingType] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?q=${searchQuery}&listing=${listingType}`);
  };

  return (
    <div className="min-h-screen">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            12,400+ active listings nationwide
          </div>
          <h1 className="hero-title">Find Your Perfect Home, Smarter.</h1>
          <p className="hero-subtitle">
            Search millions of listings with intelligent filters, instant alerts, and verified agents — all in one place.
          </p>
          <form onSubmit={handleSearch} className="search-box">
            <div className="search-toggle">
              <button type="button" onClick={() => setListingType('buy')} className={`search-toggle-btn ${listingType === 'buy' ? 'active' : ''}`}>Buy</button>
              <button type="button" onClick={() => setListingType('rent')} className={`search-toggle-btn ${listingType === 'rent' ? 'active' : ''}`}>Rent</button>
            </div>
            <div className="search-input-row">
              <MapPin className="search-input-icon w-5 h-5" />
              <input type="text" placeholder="City, neighborhood, or ZIP code" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" className="search-btn">Search Homes</button>
            </div>
            <div className="search-locations">
              {YANGON_TOWNSHIPS.slice(0, 4).map((town) => (
                <button key={town.id} type="button" onClick={() => setSearchQuery(language === 'my' ? town.nameMy : town.nameEn)} className="search-location-tag">
                  {language === 'my' ? town.nameMy : town.nameEn}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value">12,400+</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">280</div>
            <div className="stat-label">Cities Covered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">48K+</div>
            <div className="stat-label">Happy Buyers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">3,200</div>
            <div className="stat-label">Agent Partners</div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <div>
            <div className="featured-label">Hand-Picked</div>
            <h2 className="featured-title">Featured Properties</h2>
          </div>
          <Link to="/" className="featured-link">
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="properties-grid">
          {MYANMAR_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} language={language} />
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <div className="features-label">Why UrbanNest</div>
            <h2 className="features-title">Everything you need to find home</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3 className="feature-name">{language === 'my' ? feature.titleMy : feature.titleEn}</h3>
                <p className="feature-desc">{language === 'my' ? feature.descMy : feature.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">Ready to list your property?</h2>
            <p className="cta-desc">
              Join 3,200+ agents and sellers using UrbanNest to connect with qualified buyers nationwide.
            </p>
          </div>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn-primary">Create Free Account</Link>
            <Link to="/" className="cta-btn-secondary">Browse Listings</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span className="footer-brand-icon">
                  <HomeIcon className="w-5 h-5" />
                </span>
                <span className="footer-brand-name">UrbanNest</span>
              </div>
              <p className="footer-brand-desc">
                Your trusted partner in finding and managing real estate.
              </p>
            </div>
            <div>
              <h4 className="footer-col-title">Explore</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/?type=buy">Buy a Home</a></li>
                <li className="footer-link"><a href="/?type=rent">Rent a Home</a></li>
                <li className="footer-link"><a href="/">New Listings</a></li>
                <li className="footer-link"><a href="/">Price Trends</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Sellers</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/property/add">List a Property</a></li>
                <li className="footer-link"><a href="/dashboard">Agent Tools</a></li>
                <li className="footer-link"><a href="/">Market Analysis</a></li>
                <li className="footer-link"><a href="/">Pricing Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/about">About Us</a></li>
                <li className="footer-link"><a href="/careers">Careers</a></li>
                <li className="footer-link"><a href="/press">Press</a></li>
                <li className="footer-link"><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 UrbanNest, Inc. All rights reserved.</p>
            <div className="footer-legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
