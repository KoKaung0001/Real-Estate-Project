import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, Compass, Bell, Home as HomeIcon, ChevronDown, Building2, Landmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { YANGON_TOWNSHIPS, MYANMAR_PROPERTIES } from '../data/myanmarProperties';
import type { MyanmarProperty } from '../types';

const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Villa', 'Townhouse', 'Land'];

const formatMMK = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')}B MMK`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M MMK`;
  return `${value.toLocaleString()} MMK`;
};

const FEATURES = [
  { icon: Search, titleEn: 'Smart Search', titleMy: 'ဉာဏ်ရည်တု ရှာဖွေမှု', descEn: 'Search by township, property type, and budget to find the right home in Yangon.', descMy: 'မြို့နယ်၊ အိမ်အမျိုးအစားနှင့် ဘတ်ဂျက်အလိုက် ရှာဖွေပြီး ရန်ကုန်ရှိ သင့်တော်သောအိမ်ကို ရှာပါ။' },
  { icon: Compass, titleEn: 'Verified Listings', titleMy: 'စစ်ဆေးပြီး ကြော်ငြာများ', descEn: 'Every property is reviewed by our admins before it goes live for buyers.', descMy: 'အိမ်ဝယ်သူများအတွက် မဖော်ပြမီ ကြော်ငြာတိုင်းကို ကျွန်ုပ်တို့၏ အက်ဒမင်များက စစ်ဆေးပါသည်။' },
  { icon: Bell, titleEn: 'Instant Alerts', titleMy: 'ချက်ချင်း သတိပေးချက်', descEn: 'Track your listings and get notified about approval status updates.', descMy: 'သင့်ကြော်ငြာများကို ခြေရာခံပြီး ခွင့်ပြုချက်အခြေအနေ အပ်ဒိတ်များအကြောင်း အသိပေးချက်ရယူပါ။' },
  { icon: Heart, titleEn: 'Save & Shortlist', titleMy: 'သိမ်းဆည်း စာရင်း', descEn: 'Save your favorite homes and compare them anytime from your dashboard.', descMy: 'နှစ်သက်ရာ အိမ်များကို သိမ်းဆည်းပြီး သင့် ဒက်ရှ်ဘုတ်မှ အချိန်မရွေး နှိုင်းယှဉ်ကြည့်နိုင်ပါသည်။' },
];

function PropertyCard({ property, language }: { property: MyanmarProperty; language: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(property.id);
  const title = language === 'my' ? property.titleMy : property.titleEn;
  const type = language === 'my' ? property.typeMy : property.typeEn;
  const badge = language === 'my' ? property.badgeMy : property.badgeEn;
  const isForRent = badge === 'For Rent' || badge === 'ငှားရန်';

  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img src={property.image} alt={title} className="property-image" loading="lazy" />
        <span className={`property-badge ${isForRent ? 'rent' : 'sale'}`}>{badge}</span>
        <button onClick={() => toggleFavorite(property.id)} className="property-favorite" aria-label="Favorite">
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
          <span className="property-price">MMK {property.price.toLocaleString()}</span>
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
  const [selectedTown, setSelectedTown] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleListingTypeChange = (type: 'buy' | 'rent') => {
    setListingType(type);
    setMinPrice('');
    setMaxPrice('');
  };

  const filteredProperties = useMemo(() => {
    return MYANMAR_PROPERTIES.filter((property) => {
      const matchesTown =
        !selectedTown ||
        property.townshipEn.toLowerCase() === selectedTown.toLowerCase() ||
        property.townshipMy === selectedTown;
      const matchesType = !propertyType || property.typeEn.toLowerCase() === propertyType.toLowerCase();
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = property.price >= min && property.price <= max;
      return matchesTown && matchesType && matchesPrice;
    });
  }, [selectedTown, propertyType, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?q=${searchQuery}&listing=${listingType}&town=${selectedTown}&type=${propertyType}&min=${minPrice}&max=${maxPrice}`);
  };

  const renderTown = (town: { nameEn: string; nameMy: string }) => (language === 'my' ? town.nameMy : town.nameEn);

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
              <button type="button" onClick={() => handleListingTypeChange('buy')} className={`search-toggle-btn ${listingType === 'buy' ? 'active' : ''}`}>Buy</button>
              <button type="button" onClick={() => handleListingTypeChange('rent')} className={`search-toggle-btn ${listingType === 'rent' ? 'active' : ''}`}>Rent</button>
            </div>
            <div className="search-input-row">
              <MapPin className="search-input-icon w-5 h-5" />
              <input type="text" placeholder="City, neighborhood, or ZIP code" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" className="search-btn">Search Homes</button>
            </div>
            <div className="search-filters">
              <div className="search-filter-field">
                <label className="search-filter-label">Township</label>
                <div className="search-select-wrap">
                  <Building2 className="search-select-icon" />
                  <select
                    className="search-select"
                    value={selectedTown}
                    onChange={(e) => setSelectedTown(e.target.value)}
                  >
                    <option value="">All Townships</option>
{YANGON_TOWNSHIPS.map((town) => (
                      <option key={town.id} value={town.nameEn}>
                        {renderTown(town)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field">
                <label className="search-filter-label">Property Type</label>
                <div className="search-select-wrap">
                  <Landmark className="search-select-icon" />
                  <select
                    className="search-select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field">
                <label className="search-filter-label">
                  {listingType === 'buy' ? 'Price Range' : 'Monthly Price'}
                </label>
                <div className="search-price-row">
                  <div className="search-price-input-wrap">
                    <input
                      type="number"
                      min="0"
                      className="search-price-input"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="search-price-suffix">MMK</span>
                  </div>
                  <span className="search-price-separator">—</span>
                  <div className="search-price-input-wrap">
                    <input
                      type="number"
                      min="0"
                      className="search-price-input"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                    <span className="search-price-suffix">MMK</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="search-locations">
              {YANGON_TOWNSHIPS.slice(0, 4).map((town) => (
                <button key={town.id} type="button" onClick={() => setSelectedTown(town.nameEn)} className={`search-location-tag ${selectedTown === town.nameEn ? 'active' : ''}`}>
                  {language === 'my' ? town.nameMy : town.nameEn}
                </button>
              ))}
            </div>
            <button type="submit" className="search-btn mobile-only-search">Search Homes</button>
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
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} language={language} />
          ))}
        </div>
        {filteredProperties.length === 0 && (
          <div className="no-results">
            <Search className="no-results-icon" />
            <p className="no-results-title">No properties match your search</p>
            <p className="no-results-sub">Try clearing the filters or choose another township.</p>
            <button
              type="button"
              className="no-results-btn"
              onClick={() => { setSelectedTown(''); setPropertyType(''); setMinPrice(''); setMaxPrice(''); }}
            >
              Clear Filters
            </button>
          </div>
        )}
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
                <li className="footer-link"><Link to="/?type=buy">Buy a Home</Link></li>
                <li className="footer-link"><Link to="/?type=rent">Rent a Home</Link></li>
                <li className="footer-link"><Link to="/">New Listings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Sellers</h4>
              <ul className="footer-links">
                <li className="footer-link"><Link to="/property/add">List a Property</Link></li>
                <li className="footer-link"><Link to="/user/my-properties">My Dashboard</Link></li>
                <li className="footer-link"><Link to="/dashboard">Saved Favorites</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li className="footer-link"><Link to="/about">About Us</Link></li>
                <li className="footer-link"><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 UrbanNest, Inc. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
