import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import { propertyAPI } from '../utils/api';
import type { PropertyType, SaleStatus } from '../types';

const TOWNSHIPS = ['Bahan', 'Dagon', 'Kamaryut', 'Mayangone', 'Hlaing', 'Yankin', 'Tamwe', 'North Okkalapa'];
const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'HOUSE', 'CONDO', 'LAND', 'TOWNHOUSE'];

interface FormData {
  title: string;
  listingType: SaleStatus;
  type: PropertyType | '';
  price: string;
  township: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
  imageUrl: string;
}

export function AddEditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    listingType: 'FOR_SALE',
    type: '',
    price: '',
    township: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    imageUrl: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await propertyAPI.create({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.township,
        propertyType: formData.type as PropertyType,
        status: formData.listingType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.sqft) || 0,
        imageUrl: formData.imageUrl,
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to create property:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-slate-500 mt-1">Fill in the details to list your property</p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
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
                      onClick={() => setFormData({ ...formData, listingType: 'FOR_SALE' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${formData.listingType === 'FOR_SALE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'FOR_RENT' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${formData.listingType === 'FOR_RENT' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
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
                    <label className="label">Price (MMK)</label>
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Description</h2>
                
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
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Media Upload</h2>
                
                <div>
                  <label className="label">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <p className="text-sm text-slate-500 text-center">Enter an image URL for your property</p>
              </div>
            )}

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
                <button type="submit" className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? <span className="auth-loading"></span> : <><Check className="w-5 h-5" /> Submit for Approval</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
