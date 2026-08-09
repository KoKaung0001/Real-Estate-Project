import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, X, MapPin, FileText, Image as ImageIcon, Home, Map, Camera, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { YANGON_TOWNSHIPS, FEATURES_EN, FEATURES_MY } from '../data/myanmarProperties';
import type { Property, PropertyType, SaleStatus, User } from '../types';

const PROPERTY_TYPES: { value: PropertyType; labelEn: string; labelMy: string }[] = [
  { value: 'APARTMENT', labelEn: 'Apartment', labelMy: 'အခန်း' },
  { value: 'HOUSE', labelEn: 'House', labelMy: 'အိမ်' },
  { value: 'CONDO', labelEn: 'Condo', labelMy: 'ကွန်ဒို' },
  { value: 'LAND', labelEn: 'Land', labelMy: 'မြေ' },
  { value: 'TOWNHOUSE', labelEn: 'Townhouse', labelMy: 'တိုက်ခန်း' },
];

const OWNERSHIP_TYPES = [
  { value: 'FREEHOLD', labelEn: 'Freehold', labelMy: 'အမြဲတမ်းပိုင်ဆိုင်မှု' },
  { value: 'LEASEHOLD', labelEn: 'Leasehold', labelMy: 'ဌာနခွဲပိုင်ဆိုင်မှု' },
  { value: 'GOVERNMENT', labelEn: 'Government Grant', labelMy: 'အစိုးရ ခွင့်ပြုချက်' },
  { value: 'PERMIT', labelEn: 'Permit Land', labelMy: 'ခွင့်ပြုမြေ' },
  { value: 'OTHER', labelEn: 'Other', labelMy: 'အခြား' },
];

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const BATHROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const PARKING_OPTIONS = [0, 1, 2, 3, 4, 5];

interface FormData {
  title: string;
  propertyType: PropertyType | '';
  status: SaleStatus;
  price: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  yearBuilt: string;
  area: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  township: string;
  description: string;
  features: string[];
  imageUrl: string;
  additionalImages: string[];
  ownershipType: string;
  contactPhone: string;
  contactEmail: string;
  hasGrant: boolean;
  hasPermit: boolean;
  plotDimension: string;
  landShape: string;
  roadWidth: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  propertyType: '',
  status: 'FOR_SALE',
  price: '',
  bedrooms: 2,
  bathrooms: 1,
  parking: 1,
  yearBuilt: '',
  area: '',
  streetAddress: '',
  city: 'Yangon',
  state: 'Yangon Region',
  zipCode: '',
  township: '',
  description: '',
  features: [],
  imageUrl: '',
  additionalImages: [],
  ownershipType: '',
  contactPhone: '',
  contactEmail: '',
  hasGrant: false,
  hasPermit: false,
  plotDimension: '',
  landShape: '',
  roadWidth: '',
};

function formFromProperty(p: Property, user: User | null): FormData {
  const tw = YANGON_TOWNSHIPS.find(t => t.nameEn.toLowerCase() === p.location.toLowerCase());
  return {
    title: p.title,
    propertyType: p.propertyType,
    status: p.status,
    price: String(p.price),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parking: 1,
    yearBuilt: '',
    area: String(p.area),
    streetAddress: '',
    city: 'Yangon',
    state: 'Yangon Region',
    zipCode: '',
    township: tw ? tw.id : '',
    description: p.description,
    features: [],
    imageUrl: p.imageUrl,
    additionalImages: [],
    ownershipType: '',
    contactPhone: p.ownerPhone || user?.phone || '',
    contactEmail: user?.email || '',
    hasGrant: false,
    hasPermit: false,
    plotDimension: '',
    landShape: '',
    roadWidth: '',
  };
}

export function AddEditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { properties, addProperty, updateProperty } = useProperties();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const existing = id ? properties.find((p) => String(p.id) === id) : undefined;
  const isEditing = !!existing;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(() =>
    existing
      ? formFromProperty(existing, user)
      : {
          ...INITIAL_FORM,
          contactPhone: user?.phone || '',
          contactEmail: user?.email || '',
        }
  );

  const featureLabels = language === 'my' ? FEATURES_MY : FEATURES_EN;
  const isLand = formData.propertyType === 'LAND';

  const steps = [
    { id: 1, label: language === 'my' ? 'အခြေခံ အချက်အလက်' : 'Basic Info', icon: Home },
    { id: 2, label: language === 'my' ? 'တည်နေရာ' : 'Location', icon: Map },
    { id: 3, label: language === 'my' ? 'အသေးစိတ်နှင့် လုပ်ဆောင်ချက်များ' : 'Details & Features', icon: FileText },
    { id: 4, label: language === 'my' ? 'ဓာတ်ပုံနှင့် ပြန်လည်သုံးသပ်ခြင်း' : 'Photos & Review', icon: Camera },
  ];

  const updateForm = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = language === 'my' ? 'ခေါင်းစဉ် လိုအပ်သည်' : 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = language === 'my' ? 'အိမ်ခြံမြေ အမျိုးအစား ရွေးပါ' : 'Property type is required';
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = language === 'my' ? 'စျေးနှုန်း ထည့်ပါ' : 'Price is required';
      if (!formData.area || Number(formData.area) <= 0) newErrors.area = language === 'my' ? 'အကျယ်အဝန်း ထည့်ပါ' : 'Area is required';
    }

    if (step === 2) {
      if (!formData.township) newErrors.township = language === 'my' ? 'မြို့နယ် ရွေးပါ' : 'Township is required';
      if (!formData.streetAddress.trim()) newErrors.streetAddress = language === 'my' ? 'လိပ်စာ ထည့်ပါ' : 'Street address is required';
    }

    if (step === 3) {
      if (!formData.description.trim()) newErrors.description = language === 'my' ? 'ဖော်ပြချက် ထည့်ပါ' : 'Description is required';
      if (formData.description.length > 2000) newErrors.description = language === 'my' ? 'ဖော်ပြချက် ၂၀၀၀ စာလုံးထက် မကျော်ရ' : 'Description must be under 2000 characters';
      if (!formData.ownershipType) newErrors.ownershipType = language === 'my' ? 'ပိုင်ဆိုင်မှု အမျိုးအစား ရွေးပါ' : 'Ownership type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFeatureToggle = (feature: string) => {
    const updated = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    updateForm({ features: updated });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ imageUrl: language === 'my' ? 'ဖိုင်အရွယ်အစား 10MB ထက် မကြီးရ' : 'File size must be under 10MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateForm({ imageUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024).slice(0, 20 - formData.additionalImages.length);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ imageUrl: language === 'my' ? 'ဖိုင်အရွယ်အစား 10MB ထက် မကြီးရ' : 'File size must be under 10MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateForm({ imageUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const jumpToStep = (target: number) => {
    setCurrentStep(target);
    setErrors({});
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const selectedTownship = YANGON_TOWNSHIPS.find(tw => tw.id === formData.township);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const location = selectedTownship ? selectedTownship.nameEn : formData.city || 'Yangon';
    const payload: Omit<Property, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price) || 0,
      location,
      propertyType: (formData.propertyType || 'APARTMENT') as PropertyType,
      status: formData.status,
      approvalStatus: existing?.approvalStatus ?? 'PENDING',
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      area: Number(formData.area) || 0,
      imageUrl: formData.imageUrl,
      owner: existing?.owner ?? user?.username ?? 'seller',
      ownerPhone: formData.contactPhone || user?.phone || '',
    };

    if (existing) {
      updateProperty(existing.id, payload);
    } else {
      addProperty(payload);
    }

    setSubmitted(true);
    setLoading(false);
  };

  const formatPrice = (price: string): string => {
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString();
  };

  const getProgressTransform = (): string => {
    return `scaleX(${(currentStep - 1) / (steps.length - 1)})`;
  };

  if (submitted) {
    return (
      <div className="form-success">
        <div className="form-success-content">
          <div className="form-success-icon">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="form-success-title">
            {language === 'my' ? 'အိမ်ခြံမြေ တင်သွင်းပြီးပါပြီ!' : 'Property Submitted!'}
          </h2>
          <p className="form-success-desc">
            {language === 'my' ? 'သင့်အိမ်ခြံမြေကို အတည်ပြုချက်အတွက် တင်သွင်းပြီးပါပြီ။' : 'Your property has been submitted for approval.'}
          </p>
          <p className="form-success-desc" style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            {language === 'my' ? 'Admin မှ အတည်ပြုပြီးနောက် သင့်ပိုင်ဆိုင်မှု စာရင်းတွင် ပေါ်လာပါမည်။' : 'After admin approval, your listing will appear in your ownership records.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 32px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            {language === 'my' ? 'ဒက်ရှ်ဘုတ်သို့ သွားရန်' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <button onClick={() => navigate(-1)} className="form-back-btn">
          <ArrowLeft className="w-5 h-5" />
          {language === 'my' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်ရန်' : 'Back to Dashboard'}
        </button>

        <h1 className="form-page-title">
          {isEditing
            ? (language === 'my' ? 'အိမ်ခြံမြေ ပြင်ဆင်ပါ' : 'Edit Property')
            : (language === 'my' ? 'အိမ်ခြံမြေအသစ် ထည့်ပါ' : 'Add New Property')}
        </h1>
        <p className="form-page-subtitle">
          {language === 'my'
            ? 'သင့်အိမ်ခြံမြေကို စာရင်းတင်ရန် အောက်ပါဖောင်ကို ဖြည့်ပါ'
            : 'Complete the form below to list your property on UrbanNest'}
        </p>

        <div className="step-indicator">
          <div className="step-indicator-progress" style={{ transform: getProgressTransform() }} />
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => jumpToStep(step.id)}
              className="step-item"
              aria-label={step.label}
            >
              <div className={`step-circle ${currentStep > step.id ? 'completed' : currentStep === step.id ? 'active' : ''}`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={`step-label ${currentStep >= step.id ? 'active' : ''}`}>
                {step.label}
              </span>
            </button>
          ))}
        </div>

        <div className="form-card">
          <div onKeyDown={handleFormKeyDown}>
            <div className="form-card-body">
              {currentStep === 1 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon blue">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        {language === 'my' ? 'အခြေခံ အချက်အလက်' : 'Basic Information'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေ၏ အခြေခံ အချက်အလက်များ' : 'Fundamental details about your property'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ခေါင်းစဉ်' : 'Listing Title'} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder={language === 'my' ? 'ဥပမာ - မြို့တော် ကမ်းခြေ နေအိမ်' : 'e.g., Modern Waterfront Residence'}
                    />
                    {errors.title && <p className="form-error">{errors.title}</p>}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'အိမ်ခြံမြေ အမျိုးအစား' : 'Property Type'} <span className="required">*</span>
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => updateForm({ propertyType: e.target.value as PropertyType })}
                        className={`form-select ${errors.propertyType ? 'error' : ''}`}
                      >
                        <option value="">{language === 'my' ? 'အမျိုးအစား ရွေးပါ' : 'Select Type'}</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {language === 'my' ? type.labelMy : type.labelEn}
                          </option>
                        ))}
                      </select>
                      {errors.propertyType && <p className="form-error">{errors.propertyType}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'စာရင်း အမျိုးအစား' : 'Listing Status'}
                      </label>
                      <div className="status-toggle">
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_SALE' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_SALE' ? 'active' : ''}`}
                        >
                          {language === 'my' ? 'ရောင်းရန်' : 'For Sale'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_RENT' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_RENT' ? 'active' : ''}`}
                        >
                          {language === 'my' ? 'ငှားရန်' : 'For Rent'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'စျေးနှုန်း (MMK)' : 'Asking Price (MMK)'} <span className="required">*</span>
                    </label>
                    <div className="price-input-wrapper">
                      <span className="price-input-prefix">K</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateForm({ price: e.target.value })}
                        className={`form-input ${errors.price ? 'error' : ''}`}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {errors.price && <p className="form-error">{errors.price}</p>}
                  </div>

                  {isLand ? (
                    <div className="form-grid-4">
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'မြေအကျယ်' : 'Land Area'} <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder={language === 'my' ? 'ဥပမာ - 2400' : 'e.g., 2400'}
                          min="0"
                        />
                        {errors.area && <p className="form-error">{errors.area}</p>}
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'ဖေါက်လမ်း နံပါတ်' : 'Plot/Frontage Width'}
                        </label>
                        <input
                          type="number"
                          value={formData.plotDimension}
                          onChange={(e) => updateForm({ plotDimension: e.target.value })}
                          className="form-input"
                          placeholder={language === 'my' ? 'ဥပမာ - 20' : 'e.g., 20'}
                          min="0"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'ဖော' : 'Land Shape'}
                        </label>
                        <select
                          value={formData.landShape}
                          onChange={(e) => updateForm({ landShape: e.target.value })}
                          className="form-select"
                        >
                          <option value="">{language === 'my' ? 'ရွေးပါ' : 'Select'}</option>
                          <option value="RECTANGLE">{language === 'my' ? 'စတုဂံ' : 'Rectangular'}</option>
                          <option value="SQUARE">{language === 'my' ? 'စတုရန်း' : 'Square'}</option>
                          <option value="CORNER">{language === 'my' ? 'ထောင့်' : 'Corner plot'}</option>
                          <option value="IRREGULAR">{language === 'my' ? 'ပုံစံမမှန်' : 'Irregular'}</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'လမ်းအကျယ် (ပေ)' : 'Road Width (ft)'}
                        </label>
                        <input
                          type="number"
                          value={formData.roadWidth}
                          onChange={(e) => updateForm({ roadWidth: e.target.value })}
                          className="form-input"
                          placeholder="30"
                          min="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-grid-4">
                        <div className="form-field">
                          <label className="form-label">
                            {language === 'my' ? 'အိပ်ခန်း' : 'Bedrooms'}
                          </label>
                          <select
                            value={formData.bedrooms}
                            onChange={(e) => updateForm({ bedrooms: Number(e.target.value) })}
                            className="form-select"
                          >
                            {BEDROOM_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            {language === 'my' ? 'ရေချိုခန်း' : 'Bathrooms'}
                          </label>
                          <select
                            value={formData.bathrooms}
                            onChange={(e) => updateForm({ bathrooms: Number(e.target.value) })}
                            className="form-select"
                          >
                            {BATHROOM_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            {language === 'my' ? 'ကားရပ်နား' : 'Parking'}
                          </label>
                          <select
                            value={formData.parking}
                            onChange={(e) => updateForm({ parking: Number(e.target.value) })}
                            className="form-select"
                          >
                            {PARKING_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            {language === 'my' ? 'ဆောက်လုပ်သည့်နှစ်' : 'Year Built'}
                          </label>
                          <input
                            type="number"
                            value={formData.yearBuilt}
                            onChange={(e) => updateForm({ yearBuilt: e.target.value })}
                            className="form-input"
                            placeholder="2024"
                            min="1900"
                            max="2030"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'အကျယ်အဝန်း (sqft)' : 'Total Area (sqft)'} <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder={language === 'my' ? 'ဥပမာ - 2400' : 'e.g., 2400'}
                          min="0"
                        />
                        {errors.area && <p className="form-error">{errors.area}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon green">
                      <Map className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        {language === 'my' ? 'တည်နေရာ' : 'Property Location'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေ၏ တည်နေရာ' : 'Where is your property located?'}
                      </p>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'မြို့နယ်' : 'Township'} <span className="required">*</span>
                      </label>
                      <select
                        value={formData.township}
                        onChange={(e) => updateForm({ township: e.target.value })}
                        className={`form-select ${errors.township ? 'error' : ''}`}
                      >
                        <option value="">{language === 'my' ? 'မြို့နယ် ရွေးပါ' : 'Select Township'}</option>
                        {YANGON_TOWNSHIPS.map((tw) => (
                          <option key={tw.id} value={tw.id}>
                            {language === 'my' ? tw.nameMy : tw.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.township && <p className="form-error">{errors.township}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'မြို့' : 'City'}
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateForm({ city: e.target.value })}
                        className="form-input"
                        placeholder="Yangon"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'ပြည်နယ်/ဒေသ' : 'State / Region'}
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateForm({ state: e.target.value })}
                        className="form-input"
                        placeholder="Yangon Region"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'ZIP Code' : 'ZIP Code'}
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateForm({ zipCode: e.target.value })}
                        className="form-input"
                        placeholder="11181"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'လိပ်စာ' : 'Street Address'} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => updateForm({ streetAddress: e.target.value })}
                      className={`form-input ${errors.streetAddress ? 'error' : ''}`}
                      placeholder={language === 'my' ? 'ဥပမာ - အမှတ် ၄၅၊ ရွှေကုန်းဒင်လမ်း' : 'e.g., No. 45, Shwegondine Road'}
                    />
                    {errors.streetAddress && <p className="form-error">{errors.streetAddress}</p>}
                  </div>

                  <div className="map-preview">
                    <div className="map-preview-icon">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <p className="map-preview-title">
                      {language === 'my' ? 'မြေပုံ ကြိုကြည့်' : 'Map Preview'}
                    </p>
                    <p className="map-preview-desc">
                      {language === 'my' ? 'တည်နေရာကို ပြပေးရန် အပေါ်တွင် လိပ်စာ ထည့်ပါ' : 'Enter your address above to pin the location'}
                    </p>
                    {formData.township && selectedTownship && (
                      <div className="map-preview-badge">
                        <MapPin className="w-4 h-4" />
                        {language === 'my' ? selectedTownship.nameMy : selectedTownship.nameEn}, Yangon
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon purple">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        {language === 'my' ? 'အသေးစိတ်နှင့် လုပ်ဆောင်ချက်များ' : 'Details & Features'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေကို ပိုမိုဖော်ပြပါ' : 'Describe your property in detail'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ဖော်ပြချက်' : 'Property Description'} <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm({ description: e.target.value })}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder={language === 'my'
                        ? 'သင့်အိမ်ခြံမြေကို ဖော်ပြပါ — ဘာကြောင့် အထူးဖြစ်သည်ကို ပြောပြပါ။ ရှုခင်းများ၊ ပြန်လည်ပြင်ဆင်ထားမှုများ၊ ထင်ရှားသည့် လုပ်ဆောင်ချက်များနှင့် ပတ်ဝန်းကျင် အကြောင်းအရာများကို ထည့်သွင်းပါ။'
                        : 'Describe your property — highlight what makes it special. Mention views, recent renovations, standout features, and neighborhood character.'}
                      maxLength={2000}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {errors.description && <p className="form-error">{errors.description}</p>}
                      <p className={`form-char-count ${formData.description.length > 1800 ? 'warning' : ''}`} style={{ marginLeft: 'auto' }}>
                        {formData.description.length} / 2000 characters
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ပိုင်ဆိုင်မှု အမျိုးအစား' : 'Ownership Type'} <span className="required">*</span>
                    </label>
                    <select
                      value={formData.ownershipType}
                      onChange={(e) => updateForm({ ownershipType: e.target.value })}
                      className={`form-select ${errors.ownershipType ? 'error' : ''}`}
                    >
                      <option value="">{language === 'my' ? 'ပိုင်ဆိုင်မှု အမျိုးအစား ရွေးပါ' : 'Select Ownership Type'}</option>
                      {OWNERSHIP_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {language === 'my' ? type.labelMy : type.labelEn}
                        </option>
                      ))}
                    </select>
                    {errors.ownershipType && <p className="form-error">{errors.ownershipType}</p>}
                    <p className="form-hint">
                      {language === 'my' ? 'ဥပမာ - Freehold, Leasehold, စသည်' : 'Example: Freehold, Leasehold, etc.'}
                    </p>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'လုပ်ဆောင်ချက်များ' : 'Property Features'}
                    </label>
                    <div className="feature-tags">
                      {featureLabels.map((feature, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className={`feature-tag ${formData.features.includes(feature) ? 'active' : ''}`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                    <p className="feature-count">
                      {formData.features.length} {language === 'my' ? 'လုပ်ဆောင်ချက် ရွေးချယ်ထားသည်' : 'features selected'}
                    </p>
                  </div>

                  <div className="docs-section">
                    <h3 className="docs-title">
                      <FileText className="w-5 h-5" />
                      {language === 'my' ? 'စာရွက်စာတမ်းများ' : 'Documents'}
                    </h3>
                    <div className="docs-checks">
                      <button
                        type="button"
                        onClick={() => updateForm({ hasGrant: !formData.hasGrant })}
                        className={`doc-check ${formData.hasGrant ? 'is-checked' : ''}`}
                      >
                        <div className={`doc-checkbox ${formData.hasGrant ? 'checked' : ''}`}>
                          {formData.hasGrant && <Check className="doc-check-icon" />}
                        </div>
                        <span className="doc-checkbox-label">
                          <span className="doc-check-title">
                            {language === 'my' ? 'ခွင့်ပြုချက်' : 'Has Grant'}
                          </span>
                          <span className="doc-check-sub">
                            {language === 'my' ? 'ဂရန်ရှိ' : 'Grant title'}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateForm({ hasPermit: !formData.hasPermit })}
                        className={`doc-check ${formData.hasPermit ? 'is-checked' : ''}`}
                      >
                        <div className={`doc-checkbox ${formData.hasPermit ? 'checked' : ''}`}>
                          {formData.hasPermit && <Check className="doc-check-icon" />}
                        </div>
                        <span className="doc-checkbox-label">
                          <span className="doc-check-title">
                            {language === 'my' ? 'ခွင့်ပြုချက် လိုင်စင်' : 'Has Permit'}
                          </span>
                          <span className="doc-check-sub">
                            {language === 'my' ? 'ဆောက်လုပ်ခွင့်' : 'Building permit'}
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon orange">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        {language === 'my' ? 'ဓာတ်ပုံနှင့် ပြန်လည်သုံးသပ်ခြင်း' : 'Photos & Review'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေ ဓာတ်ပုံများနှင့် နောက်ဆုံး ပြန်လည်သုံးသပ်ပါ' : 'Upload photos and review your listing'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'အဓိက ဓာတ်ပုံ' : 'Main Image'}
                    </label>
                    {formData.imageUrl ? (
                      <div className="image-preview">
                        <img src={formData.imageUrl} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => updateForm({ imageUrl: '' })}
                          className="image-preview-remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="image-upload-zone"
                      >
                        <div className="image-upload-icon">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="image-upload-title">
                          {language === 'my' ? 'ဓာတ်ပုံကို ဒီမှာ ဆွဲထည့်ပါ' : 'Drag & drop photos here'}
                        </p>
                        <p className="image-upload-desc">
                          JPG, PNG {language === 'my' ? 'တစ်ပုံလျှင် 10MB ထက်မကြီးရ · ဓာတ်ပုံ ၂၀ ပုံအထိ' : 'up to 10MB each · Max 20 photos'}
                        </p>
                        <button type="button" className="image-upload-btn">
                          {language === 'my' ? 'ဖိုင်များ ရွေးပါ' : 'Browse Files'}
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    {errors.imageUrl && <p className="form-error">{errors.imageUrl}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ထပ်ဆင့် ဓာတ်ပုံများ' : 'Additional Images'}
                    </label>
                    <div className="additional-images-grid">
                      {formData.additionalImages.map((img, index) => (
                        <div key={index} className="additional-image-thumb">
                          <img src={img} alt="" />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="additional-image-remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {formData.additionalImages.length < 20 && (
                        <div
                          onClick={() => additionalFileInputRef.current?.click()}
                          className="additional-upload-btn"
                        >
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="additional-upload-btn-text">
                            {language === 'my' ? 'ထည့်ရန်' : 'Add'}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={additionalFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="summary-card" style={{ marginBottom: '16px' }}>
                    <h3 className="summary-title">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      {language === 'my' ? 'စာရင်း အနှစ်ချုပ်' : 'Listing Summary'}
                    </h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'ခေါင်းစဉ်' : 'Title'}
                        </p>
                        <p className="summary-item-value">
                          {formData.title || '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အမျိုးအစား' : 'Type'}
                        </p>
                        <p className="summary-item-value">
                          {formData.propertyType
                            ? (language === 'my'
                                ? PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.labelMy
                                : PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.labelEn)
                            : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'စာရင်း' : 'Status'}
                        </p>
                        <p className="summary-item-value">
                          {formData.status === 'FOR_SALE'
                            ? (language === 'my' ? 'ရောင်းရန်' : 'For Sale')
                            : (language === 'my' ? 'ငှားရန်' : 'For Rent')}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'စျေးနှုန်း' : 'Price'}
                        </p>
                        <p className="summary-item-value">
                          {formData.price ? `MMK ${formatPrice(formData.price)}` : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အိပ်ခန်း / ရေချိုခန်း' : 'Beds / Baths'}
                        </p>
                        <p className="summary-item-value">
                          {formData.bedrooms} / {formData.bathrooms}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အကျယ်အဝန်း' : 'Area'}
                        </p>
                        <p className="summary-item-value">
                          {formData.area ? `${formData.area} sqft` : '—'}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          {language === 'my' ? 'တည်နေရာ' : 'Location'}
                        </p>
                        <p className="summary-item-value">
                          {selectedTownship
                            ? (language === 'my' ? selectedTownship.nameMy : selectedTownship.nameEn)
                            : '—'}
                          {formData.city ? `, ${formData.city}` : ''}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          {language === 'my' ? 'လုပ်ဆောင်ချက်များ' : 'Features'}
                        </p>
                        <p className="summary-item-value">
                          {formData.features.length} {language === 'my' ? 'ခု ရွေးချယ်ထားသည်' : 'selected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="contact-card">
                    <h3 className="contact-card-title">
                      {language === 'my' ? 'ဆက်သွယ်ရန် အချက်အလက်' : 'Contact Information'}
                    </h3>
                    <div className="form-grid-2">
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          {language === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone Number'} <span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => updateForm({ contactPhone: e.target.value })}
                          className="form-input"
                          placeholder="09-xxxxxxxxx"
                        />
                      </div>
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          {language === 'my' ? 'အီးမေးလ်' : 'Email'}
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => updateForm({ contactEmail: e.target.value })}
                          className="form-input"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-footer">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className="form-btn-back">
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'my' ? 'နောက်သို့' : 'Back'}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="form-btn-next">
                  {language === 'my' ? 'ရှေ့သို့' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="form-btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="auth-loading" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {language === 'my' ? 'စာရင်းတင်ပါ' : 'Submit Listing'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
