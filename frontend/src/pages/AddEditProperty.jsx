import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, X, Home, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TOWNSHIPS = ['Austin, TX', 'Malibu, CA', 'New York, NY', 'Portland, OR', 'Denver, CO', 'Miami, FL', 'Seattle, WA', 'San Diego, CA'];
const PROPERTY_TYPES = ['House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Land'];

export function AddEditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'buy',
    type: '',
    price: '',
    township: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    address: '',
    description: '',
    features: [],
    images: [],
  });

  const [dragActive, setDragActive] = useState(false);

  const steps = [
    { id: 1, title: 'Property Info', description: 'Basic property details' },
    { id: 2, title: 'Specifications', description: 'Size and layout' },
    { id: 3, title: 'Description', description: 'Tell us more' },
    { id: 4, title: 'Media', description: 'Upload photos' },
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const toggleFeature = (feature) => {
    setFormData({
      ...formData,
      features: formData.features.includes(feature)
        ? formData.features.filter((f) => f !== feature)
        : [...formData.features, feature],
    });
  };

  const AVAILABLE_FEATURES = [
    'Parking', 'Pool', 'Garden', 'Gym', 'Security', 'Balcony',
    'Air Conditioning', 'Heating', 'Laundry', 'Storage',
    'Smart Home', 'Fireplace', 'Wine Cellar', 'Home Office',
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center animate-bounce">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Property Submitted!</h2>
          <p className="text-slate-500">Your property has been submitted for approval.</p>
          <p className="text-sm text-slate-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-slate-500 mt-1">Fill in the details to list your property</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Property Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Property Information</h2>
                
                <div>
                  <label className="label">Property Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Modern Waterfront Residence"
                    required
                  />
                </div>

                <div>
                  <label className="label">Listing Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'buy' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${formData.listingType === 'buy' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'rent' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${formData.listingType === 'rent' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Property Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.type === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Township</label>
                    <select
                      value={formData.township}
                      onChange={(e) => setFormData({ ...formData, township: e.target.value })}
                      className="input-field appearance-none bg-white"
                      required
                    >
                      <option value="">Select location</option>
                      {TOWNSHIPS.map((town) => (
                        <option key={town} value={town}>{town}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specifications */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Specifications</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="input-field text-center"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="input-field text-center"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Sq Ft</label>
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      className="input-field text-center"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    placeholder="Full property address"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Description & Features */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Description & Features</h2>
                
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field min-h-[150px] resize-y"
                    placeholder="Describe your property in detail..."
                    required
                  />
                </div>

                <div>
                  <label className="label">Features & Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.features.includes(feature) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Media Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Media Upload</h2>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">Drag and drop your photos here</p>
                  <p className="text-sm text-slate-500 mb-4">or click to browse</p>
                  <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                    Choose Files
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={image} alt="" className="w-full h-32 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-slate-500 text-center">Upload at least 1 photo. Recommended size: 1200x800px</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className="btn-secondary flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" /> Previous
                </button>
              ) : (
                <div></div>
              )}
              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="submit" className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Check className="w-5 h-5" /> Submit for Approval
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}