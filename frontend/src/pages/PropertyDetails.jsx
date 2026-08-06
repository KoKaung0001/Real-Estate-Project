import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Car, Phone, MessageCircle, Star, ChevronLeft, ChevronRight, Copy, Mail, Save, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MYANMAR_PROPERTIES } from '../data/myanmarProperties';

export function PropertyDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhone, setShowPhone] = useState(false);

  const property = MYANMAR_PROPERTIES.find((p) => p.id === id) || MYANMAR_PROPERTIES[0];

  const getName = () => language === 'my' ? property.titleMy : property.titleEn;
  const getAddress = () => language === 'my' ? property.addressMy : property.addressEn;
  const getType = () => language === 'my' ? property.typeMy : property.typeEn;
  const getBadge = () => language === 'my' ? property.badgeMy : property.badgeEn;
  const getOwner = () => language === 'my' ? property.ownerMy : property.ownerEn;

  const images = property.images || [property.image];
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const similarProperties = MYANMAR_PROPERTIES.filter((p) => p.id !== property.id).slice(0, 3);

  const features = language === 'my'
    ? ['စမတ်အိမ် စနစ်', 'Infinity Pool', 'ကိုယ်ပိုင် ဆိပ်ကမ်း', 'မီးဖိုချောင်', 'ရုံးခန်း', 'ဝိုင် Cellar', 'ကား ၃ စီး Garage', 'ပြင်ပ မီးဖိုချောင်']
    : ['Smart Home System', 'Infinity Pool', 'Private Dock', 'Gourmet Kitchen', 'Home Office', 'Wine Cellar', '3-Car Garage', 'Outdoor Kitchen'];

  const priceFormatted = `K ${property.price.toLocaleString()}`;

  return (
    <div className="property-detail-page">
      <div className="property-detail-container">
        <div className="breadcrumb">
          <Link to="/">{t('home')}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/">{t('buy')}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{getName()}</span>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-gallery">
              <span className={`detail-badge ${property.badgeEn === 'For Sale' ? 'sale' : 'rent'}`}>
                {getBadge()}
              </span>
              <img
                src={images[currentImage]}
                alt={`${getName()} - Image ${currentImage + 1}`}
                className="detail-main-image"
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} aria-label="Previous image">
                    <ChevronLeft className="w-6 h-6 text-slate-700" />
                  </button>
                  <button onClick={nextImage} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} aria-label="Next image">
                    <ChevronRight className="w-6 h-6 text-slate-700" />
                  </button>
                </>
              )}
              {images.length > 1 && (
                <div className="detail-thumbnails">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`detail-thumb ${currentImage === index ? 'active' : ''}`}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-header">
              <div className="detail-type-row">
                <span className="detail-type-badge">{getType()}</span>
                <span className="detail-built">{t('built')}: {property.yearBuilt || 2020}</span>
              </div>
              <div className="detail-title-row">
                <h1 className="detail-title">{getName()}</h1>
                <span className="detail-price">{priceFormatted}</span>
              </div>
              <p className="detail-address">
                <MapPin className="w-4 h-4" /> {getAddress()}
              </p>
            </div>

            <div className="detail-stats">
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bed className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.beds}</div>
                <div className="detail-stat-label">{t('beds')}</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bath className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.baths}</div>
                <div className="detail-stat-label">{t('baths')}</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Square className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.sqft.toLocaleString()}</div>
                <div className="detail-stat-label">{t('sqft')}</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Car className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">2</div>
                <div className="detail-stat-label">{t('parking')}</div>
              </div>
            </div>

            <div className="detail-tabs">
              <button className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                {t('overview')}
              </button>
              <button className={`detail-tab ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
                {t('features')}
              </button>
              <button className={`detail-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
                {t('contact')}
              </button>
            </div>

            <div className="detail-tab-content">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="detail-section-title">{t('aboutThisProperty')}</h2>
                  <p className="detail-description">
                    {language === 'my'
                      ? 'ဤဇိမ်ခံအိမ်ခြံမြေသည် အံ့ဩဖွယ်ကောင်းသော မြင်ကွင်းများနှင့် ဇိမ်ခံနေထိုင်မှုကို ပေးစွမ်းပါသည်။ ကြမ်းပြင်မှ မျက်နှာကြက်အထိ ပြတင်ပေါက်များ၊ ထိပ်တန်းအဆင့် ကိရိယာမျာ�ဖြင့် မီးဖိုချောင်၊ နှင့် ရေကန်ကြည့်ရန် ကိုယ်ပိုင် balcony ပါရှိသည့် အိပ်ခန်းကြီး ပါဝင်ပါသည်။'
                      : 'This stunning modern residence offers breathtaking views and luxurious living. Featuring an open floor plan with floor-to-ceiling windows, a gourmet kitchen with top-of-the-line appliances, and a spacious primary suite with a private balcony overlooking the lake.'}
                  </p>
                </div>
              )}
              {activeTab === 'features' && (
                <div>
                  <h2 className="detail-section-title">{t('featuresAmenities')}</h2>
                  <div className="detail-features-grid">
                    {features.map((feature) => (
                      <div key={feature} className="detail-feature-item">
                        <span className="detail-feature-check">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'contact' && (
                <div>
                  <h2 className="detail-section-title">{t('contactOwner')}</h2>
                  <div className="agent-info">
                    <img src={property.ownerAvatar} alt={getOwner()} className="agent-avatar" />
                    <div>
                      <div className="agent-name">{getOwner()}</div>
                      <div className="agent-verified">{t('verifiedAgent')}</div>
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <a href="tel:+959789123456" className="agent-schedule-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Phone className="w-5 h-5" /> {t('callOwner')}
                      </a>
                      <button className="agent-schedule-btn" style={{ background: '#7c3aed' }}>
                        <MessageCircle className="w-5 h-5" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> {t('chatOnViber')}
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>{t('signInToContact')}</p>
                      <Link to="/login" className="agent-schedule-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                        {t('signIn')}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="agent-card">
              <div className="agent-card-title">{t('listedBy')}</div>
              <div className="agent-info">
                <img src={property.ownerAvatar} alt={getOwner()} className="agent-avatar" />
                <div>
                  <div className="agent-name">{getOwner()}</div>
                  <div className="agent-verified">{t('verifiedAgent')}</div>
                  <div className="agent-rating">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.9</span>
                    <span>(128)</span>
                  </div>
                </div>
              </div>
              <div className="agent-contact-item">
                <Phone className="w-5 h-5" />
                <span>+95 9 789 123 456</span>
              </div>
              <div className="agent-contact-item">
                <Mail className="w-5 h-5" />
                <span>agent@urbannest.mm</span>
              </div>
              <button className="agent-schedule-btn">
                <Calendar className="w-5 h-5" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> {t('scheduleViewing')}
              </button>
            </div>

            <div className="mortgage-card">
              <div className="mortgage-title">{t('mortgageEstimate')}</div>
              <div className="mortgage-subtitle">{t('mortgageSubtitle')}</div>
              <div className="mortgage-amount-box">
                <div className="mortgage-amount">K {Math.round(property.price * 0.005).toLocaleString()}</div>
                <div className="mortgage-period">{t('perMonth')}</div>
              </div>
              <div className="mortgage-disclaimer">{t('estimateDisclaimer')}</div>
            </div>

            <div className="share-card">
              <div className="share-title">{t('shareThisProperty')}</div>
              <div className="share-btns">
                <button className="share-btn"><Copy className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {t('copyLink')}</button>
                <button className="share-btn"><Mail className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {t('email')}</button>
                <button className="share-btn"><Save className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {t('save')}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="similar-section">
          <h2 className="similar-title">{t('similarProperties')}</h2>
          <div className="similar-grid">
            {similarProperties.map((prop) => (
              <Link key={prop.id} to={`/property/${prop.id}`} style={{ textDecoration: 'none' }}>
                <div className="home-card">
                  <div className="home-card-img-wrap">
                    <img src={prop.image} alt={language === 'my' ? prop.titleMy : prop.titleEn} className="home-card-img" />
                    <span className={`home-card-badge ${prop.badgeEn === 'For Sale' ? 'sale' : 'rent'}`}>
                      {language === 'my' ? prop.badgeMy : prop.badgeEn}
                    </span>
                  </div>
                  <div className="home-card-body">
                    <div className="home-card-price">K {prop.price.toLocaleString()}</div>
                    <div className="home-card-title">{language === 'my' ? prop.titleMy : prop.titleEn}</div>
                    <div className="home-card-address">
                      <MapPin className="w-4 h-4" /> {language === 'my' ? prop.addressMy : prop.addressEn}
                    </div>
                    <div className="home-card-stats">
                      <span>{prop.beds} {t('beds')}</span>
                      <span>{prop.baths} {t('baths')}</span>
                      <span>{prop.sqft.toLocaleString()} {t('sqft')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}