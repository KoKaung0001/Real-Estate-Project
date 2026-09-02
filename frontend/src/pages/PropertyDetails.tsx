import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { PropertyMap, type MapCoordinates } from '../components/PropertyMap';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatPropertyPrice } from '../utils/price';
import type { Property } from '../types';

const formatType = (propertyType: Property['propertyType']) =>
  propertyType.charAt(0) + propertyType.slice(1).toLowerCase();

function PhoneNumberDisplay({ phoneNumber }: { phoneNumber?: string | null }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') return;

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  const copyPhoneNumber = async () => {
    if (!phoneNumber) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phoneNumber);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = phoneNumber;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        try {
          document.body.appendChild(textarea);
          textarea.select();
          if (!document.execCommand('copy')) {
            throw new Error('Clipboard copy was not available');
          }
        } finally {
          textarea.remove();
        }
      }
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  if (!phoneNumber) {
    return <div className="phone-number-display phone-number-unavailable">Phone number unavailable</div>;
  }

  const feedback = copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : '';

  return (
    <div className="phone-number-display">
      <span className="phone-number-text">{phoneNumber}</span>
      <button
        type="button"
        className={`phone-copy-btn ${copyStatus}`}
        onClick={copyPhoneNumber}
        aria-label="Copy phone number"
        title={feedback || 'Copy phone number'}
      >
        <Copy className="w-4 h-4" aria-hidden="true" />
        {feedback && <span aria-live="polite">{feedback}</span>}
      </button>
    </div>
  );
}

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { properties, getPropertyById } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contact'>('overview');

  useEffect(() => {
    let cancelled = false;
    const propertyId = Number(id);

    if (!id || !Number.isInteger(propertyId) || propertyId <= 0) {
      setProperty(null);
      setError(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setProperty(null);
    getPropertyById(propertyId)
      .then((result) => {
        if (!cancelled) setProperty(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          const status = typeof requestError === 'object' && requestError !== null && 'response' in requestError
            ? (requestError as { response?: { status?: number } }).response?.status
            : undefined;
          if (status === 404) {
            setNotFound(true);
          } else {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load this property.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, getPropertyById]);

  if (loading) {
    return <div className="property-detail-page"><div className="property-detail-container"><div className="no-results"><p className="no-results-title">Loading property...</p></div></div></div>;
  }

  if (error) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="no-results">
            <p className="no-results-title">Unable to load property</p>
            <p className="no-results-sub">{error}</p>
            <Link to="/" className="no-results-btn">Browse Listings</Link>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="no-results">
            <p className="no-results-title">Property not found</p>
            <p className="no-results-sub">This property is unavailable.</p>
            <Link to="/" className="no-results-btn">Browse Listings</Link>
          </div>
        </div>
      </div>
    );
  }

  const favoriteId = String(property.id);
  const isFav = isFavorite(favoriteId);
  const badge = property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  const priceFormatted = formatPropertyPrice(property.price);
  const similarProperties = properties
    .filter((candidate) => candidate.id !== property.id && candidate.propertyType === property.propertyType)
    .slice(0, 3);
  const propertyPosition: MapCoordinates | null = typeof property.latitude === 'number'
    && Number.isFinite(property.latitude)
    && typeof property.longitude === 'number'
    && Number.isFinite(property.longitude)
    ? [property.latitude, property.longitude]
    : null;

  return (
    <div className="property-detail-page">
      <div className="property-detail-container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/">{property.status === 'FOR_RENT' ? 'Rent' : 'Buy'}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{property.title}</span>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-gallery">
              <span className={`detail-badge ${property.status === 'FOR_SALE' ? 'sale' : 'rent'}`}>{badge}</span>
              <img
                src={resolvePropertyImageUrl(property.imageUrl)}
                alt={property.title}
                className="detail-main-image"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/property-placeholder.svg';
                }}
              />
            </div>

            <div className="detail-header">
              <div className="detail-type-row">
                <span className="detail-type-badge">{formatType(property.propertyType)}</span>
              </div>
              <div className="detail-title-row">
                <h1 className="detail-title">{property.title}</h1>
                <span className="detail-price">{priceFormatted}</span>
              </div>
              <p className="detail-address"><MapPin className="w-4 h-4" /> {property.location}</p>
            </div>

            <div className="detail-stats">
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bed className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.bedrooms}</div>
                <div className="detail-stat-label">beds</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bath className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.bathrooms}</div>
                <div className="detail-stat-label">baths</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Square className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.area.toLocaleString()}</div>
                <div className="detail-stat-label">sqft</div>
              </div>
            </div>

            <div className="detail-tabs">
              <button className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={`detail-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>Contact</button>
            </div>

            <div className="detail-tab-content">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="detail-section-title">About This Property</h2>
                  <p className="detail-description">{property.description}</p>
                </div>
              )}
              {activeTab === 'contact' && (
                <div>
                  <h2 className="detail-section-title">Contact Owner</h2>
                  <div className="agent-info"><div className="agent-name">{property.owner}</div></div>
                  {isAuthenticated ? (
                    <PhoneNumberDisplay phoneNumber={property.ownerPhone} />
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>Sign in to contact</p>
                      <Link to="/login" className="agent-schedule-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>Sign In</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="detail-location-section">
              <h2 className="detail-section-title">Property Location</h2>
              {propertyPosition ? (
                <PropertyMap center={propertyPosition} position={propertyPosition} />
              ) : (
                <p className="detail-location-unavailable">Location not available</p>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="agent-card">
              <div className="agent-card-title">Listed By</div>
              <div className="agent-info"><div className="agent-name">{property.owner}</div></div>
              {isAuthenticated ? (
                <PhoneNumberDisplay phoneNumber={property.ownerPhone} />
              ) : (
                <Link to="/login" className="agent-schedule-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Sign in to contact</Link>
              )}
            </div>

            <div className="share-card">
              <div className="share-title">Share This Property</div>
              <div className="share-btns">
                <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}><Copy className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Copy Link</button>
                <button className={`share-btn ${isFav ? 'saved' : ''}`} onClick={() => toggleFavorite(favoriteId)}>
                  <Heart className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} fill={isFav ? 'currentColor' : 'none'} />
                  {isFav ? 'Saved to Favorites' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {similarProperties.length > 0 && (
          <div className="similar-section">
            <h2 className="similar-title">Similar Properties</h2>
            <div className="similar-grid">
              {similarProperties.map((similar) => (
                <Link key={similar.id} to={`/property/${similar.id}`} style={{ textDecoration: 'none' }}>
                  <div className="home-card">
                    <div className="home-card-img-wrap">
                      <img src={resolvePropertyImageUrl(similar.imageUrl)} alt={similar.title} className="home-card-img" />
                      <span className={`home-card-badge ${similar.status === 'FOR_SALE' ? 'sale' : 'rent'}`}>
                        {similar.status === 'FOR_RENT' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                    <div className="home-card-body">
                      <div className="home-card-price">{formatPropertyPrice(similar.price)}</div>
                      <div className="home-card-title">{similar.title}</div>
                      <div className="home-card-address"><MapPin className="w-4 h-4" /> {similar.location}</div>
                      <div className="home-card-stats">
                        <span>{similar.bedrooms} beds</span>
                        <span>{similar.bathrooms} baths</span>
                        <span>{similar.area.toLocaleString()} sqft</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
