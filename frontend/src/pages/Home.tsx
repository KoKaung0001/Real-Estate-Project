import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, ArrowUpDown, Compass, Bell, Home as HomeIcon, ChevronDown, Building2, Landmark } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { YANGON_TOWNSHIPS } from '../data/myanmarProperties';
import { filterProperties, parseOptionalPrice, type BedroomFilter } from '../utils/propertyFilters';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatPropertyPrice } from '../utils/price';
import type { Property, PropertyType } from '../types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'LAND', label: 'Land' },
];

const BEDROOM_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5plus', label: '5+' },
] as const;
const SORT_VALUES = ['price-asc', 'price-desc'] as const;
type PriceSort = '' | typeof SORT_VALUES[number];

function parseBedroomFilter(value: string | null): BedroomFilter | undefined {
  if (value === '5plus') return value;
  if (value === '1' || value === '2' || value === '3' || value === '4') return Number(value) as BedroomFilter;
  return undefined;
}

const FEATURES = [
  { icon: Search, title: 'Smart Search', desc: 'Search by township, property type, and budget to find the right home in Yangon.' },
  { icon: Compass, title: 'Verified Listings', desc: 'Every property is reviewed by our admins before it goes live for buyers.' },
  { icon: Bell, title: 'Listing Updates', desc: 'Stay informed when your listings are approved or rejected.' },
  { icon: Heart, title: 'Save & Shortlist', desc: 'Save your favorite homes and compare them anytime from your dashboard.' },
];

function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favoriteId = String(property.id);
  const isFav = isFavorite(favoriteId);
  const type = property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase();
  const badge = property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  const isForRent = property.status === 'FOR_RENT';

  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img
          src={resolvePropertyImageUrl(property.imageUrl)}
          alt={property.title}
          className="property-image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/property-placeholder.svg';
          }}
        />
        <span className={`property-badge ${isForRent ? 'rent' : 'sale'}`}>{badge}</span>
        <button onClick={() => toggleFavorite(favoriteId)} className="property-favorite" aria-label="Favorite">
          <Heart
            className="w-5 h-5"
            color={isFav ? '#ef4444' : '#94a3b8'}
            fill={isFav ? '#ef4444' : 'none'}
          />
        </button>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3 className="property-title">{property.title}</h3>
          <span className="property-type-badge">{type}</span>
        </div>
        <p className="property-address">
          <MapPin className="w-4 h-4" />
          {property.location}
        </p>
        <div className="property-specs">
          <span className="property-spec">
            <Bed className="w-4 h-4" /> {property.bedrooms} beds
          </span>
          <span className="property-spec">
            <Bath className="w-4 h-4" /> {property.bathrooms} baths
          </span>
          <span className="property-spec">
            <Square className="w-4 h-4" /> {property.area.toLocaleString()} sqft
          </span>
        </div>
        <div className="property-footer">
          <span className="property-price">{formatPropertyPrice(property.price)}</span>
          <Link to={`/property/${property.id}`} className="property-details-link">
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading, error } = useProperties();
  const rawListing = searchParams.get('listing');
  const rawTown = searchParams.get('town');
  const rawPropertyType = searchParams.get('propertyType');
  const rawBedrooms = searchParams.get('bedrooms');
  const rawMinPrice = searchParams.get('minPrice');
  const rawMaxPrice = searchParams.get('maxPrice');
  const rawSort = searchParams.get('sort');
  const listingType: 'buy' | 'rent' = rawListing === 'rent' ? 'rent' : 'buy';
  const selectedTown = YANGON_TOWNSHIPS.some((township) => township.id === rawTown) ? rawTown ?? '' : '';
  const propertyType = PROPERTY_TYPES.some((type) => type.value === rawPropertyType)
    ? rawPropertyType as PropertyType
    : '';
  const bedroomFilter = parseBedroomFilter(rawBedrooms);
  const sort: PriceSort = SORT_VALUES.includes(rawSort as typeof SORT_VALUES[number])
    ? rawSort as typeof SORT_VALUES[number]
    : '';
  const minPriceValue = parseOptionalPrice(rawMinPrice);
  const maxPriceValue = parseOptionalPrice(rawMaxPrice);
  const minPrice = minPriceValue === undefined ? '' : rawMinPrice ?? '';
  const maxPrice = maxPriceValue === undefined ? '' : rawMaxPrice ?? '';
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;
    const remove = (key: string) => {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    };

    if (rawListing !== null && rawListing !== 'buy' && rawListing !== 'rent') remove('listing');
    if (rawTown !== null && !YANGON_TOWNSHIPS.some((township) => township.id === rawTown)) remove('town');
    if (rawPropertyType !== null && !PROPERTY_TYPES.some((type) => type.value === rawPropertyType)) remove('propertyType');
    if (rawBedrooms !== null && bedroomFilter === undefined) remove('bedrooms');
    if (rawMinPrice !== null && (!rawMinPrice.trim() || minPriceValue === undefined)) remove('minPrice');
    if (rawMaxPrice !== null && (!rawMaxPrice.trim() || maxPriceValue === undefined)) remove('maxPrice');
    if (rawSort !== null && !SORT_VALUES.includes(rawSort as typeof SORT_VALUES[number])) remove('sort');
    remove('q');
    remove('type');
    remove('min');
    remove('max');

    if (changed) setSearchParams(next, { replace: true });
  }, [
    maxPriceValue,
    minPriceValue,
    bedroomFilter,
    rawListing,
    rawBedrooms,
    rawMaxPrice,
    rawMinPrice,
    rawPropertyType,
    rawSort,
    rawTown,
    searchParams,
    setSearchParams,
  ]);

  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace });
  };

  const clearOptionalFilters = () => {
    const next = new URLSearchParams(searchParams);
    ['town', 'propertyType', 'bedrooms', 'minPrice', 'maxPrice', 'sort'].forEach((key) => next.delete(key));
    setSearchParams(next);
  };

  const filteredProperties = useMemo(() => {
    const matches = filterProperties(properties, {
      listing: listingType,
      town: selectedTown,
      propertyType,
      bedrooms: bedroomFilter,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
    });

    if (!sort) return matches;

    return [...matches].sort((left, right) => (
      sort === 'price-asc' ? left.price - right.price : right.price - left.price
    ));
  }, [properties, listingType, selectedTown, propertyType, bedroomFilter, minPriceValue, maxPriceValue, sort]);
  const approvedPropertyCount = properties.filter(
    (property) => property.approvalStatus === 'APPROVED',
  ).length;

  const renderTown = (town: { nameEn: string }) => town.nameEn;

  return (
    <div className="min-h-screen">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            {approvedPropertyCount} active {approvedPropertyCount === 1 ? 'listing' : 'listings'} in Yangon
          </div>
          <h1 className="hero-title">Find Your Perfect Home, Smarter.</h1>
          <p className="hero-subtitle">
            Search millions of listings with intelligent filters, instant alerts, and verified agents — all in one place.
          </p>
          <div className="search-box">
            <div className="search-toggle">
              <button type="button" onClick={() => updateFilter('listing', 'buy')} className={`search-toggle-btn ${listingType === 'buy' ? 'active' : ''}`}>Buy</button>
              <button type="button" onClick={() => updateFilter('listing', 'rent')} className={`search-toggle-btn ${listingType === 'rent' ? 'active' : ''}`}>Rent</button>
            </div>
            <div className="search-filters">
              <div className="search-filter-field">
                <label className="search-filter-label">Township</label>
                <div className="search-select-wrap">
                  <Building2 className="search-select-icon" />
                  <select
                    className="search-select"
                    value={selectedTown}
                    onChange={(e) => updateFilter('town', e.target.value)}
                  >
                    <option value="">All Townships</option>
{YANGON_TOWNSHIPS.map((town) => (
                      <option key={town.id} value={town.id}>
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
                    onChange={(e) => updateFilter('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field">
                <label className="search-filter-label">Bedrooms</label>
                <div className="search-select-wrap">
                  <Bed className="search-select-icon" />
                  <select
                    className="search-select"
                    value={rawBedrooms ?? ''}
                    onChange={(e) => updateFilter('bedrooms', e.target.value)}
                  >
                    <option value="">Any Bedrooms</option>
                    {BEDROOM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
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
                      onChange={(e) => updateFilter('minPrice', e.target.value, true)}
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
                      onChange={(e) => updateFilter('maxPrice', e.target.value, true)}
                    />
                    <span className="search-price-suffix">MMK</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="search-sort-row">
              <div className="search-filter-field search-sort-field">
                <label className="search-filter-label">Sort By</label>
                <div className="search-select-wrap">
                  <ArrowUpDown className="search-select-icon" />
                  <select
                    className="search-select"
                    value={sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
            </div>
            <div className="search-locations">
              {YANGON_TOWNSHIPS.slice(0, 4).map((town) => (
                <button key={town.id} type="button" onClick={() => updateFilter('town', town.id)} className={`search-location-tag ${selectedTown === town.id ? 'active' : ''}`}>
                  {town.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value">{approvedPropertyCount}</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">1</div>
            <div className="stat-label">City Covered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Happy Buyers</div>
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
          {!loading && !error && filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {loading && <div className="no-results"><p className="no-results-title">Loading properties...</p></div>}
        {!loading && error && (
          <div className="no-results">
            <p className="no-results-title">Unable to load properties</p>
            <p className="no-results-sub">{error}</p>
          </div>
        )}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="no-results">
            <Search className="no-results-icon" />
            <p className="no-results-title">No properties match your search</p>
            <p className="no-results-sub">Try clearing the filters or choose another township.</p>
            <button
              type="button"
              className="no-results-btn"
              onClick={clearOptionalFilters}
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
                <h3 className="feature-name">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
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
                <li className="footer-link"><Link to="/">Homepage</Link></li>
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
