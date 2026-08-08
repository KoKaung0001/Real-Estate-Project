import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Heart, MapPin, Bed, Bath, Square, Plus, Home, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Property } from '../types';

const DEMO_MY_PROPERTIES: Property[] = [
  { id: 1, title: 'Luxury Apartment in Bahan', description: 'Beautiful apartment', price: 250000, location: 'Bahan', propertyType: 'APARTMENT', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 3, bathrooms: 2, area: 1800, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-01T00:00:00Z' },
  { id: 2, title: 'Modern Villa in Dagon', description: 'Spacious villa', price: 850000, location: 'Dagon', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 5, bathrooms: 4, area: 4200, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-05T00:00:00Z' },
  { id: 3, title: 'Cozy Condo in Mayangone', description: 'Nice condo', price: 180000, location: 'Mayangone', propertyType: 'CONDO', status: 'FOR_SALE', approvalStatus: 'REJECTED', bedrooms: 2, bathrooms: 2, area: 1200, imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-03T00:00:00Z' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites'>('properties');
  const [myProperties, setMyProperties] = useState<Property[]>(DEMO_MY_PROPERTIES);

  const stats = {
    total: myProperties.length,
    active: myProperties.filter(p => p.approvalStatus === 'APPROVED').length,
    pending: myProperties.filter(p => p.approvalStatus === 'PENDING').length,
    rejected: myProperties.filter(p => p.approvalStatus === 'REJECTED').length,
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setMyProperties(myProperties.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'PENDING': return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'REJECTED': return <span className="badge badge-error"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="section-container relative h-full flex items-end pb-6">
          <div className="flex items-end gap-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.username}</h1>
                <span className={`badge ${user?.role === 'ADMIN' ? 'bg-violet-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-blue-100 text-sm sm:text-base">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-8 relative z-10 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
            <Home className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Posted</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
            <p className="text-sm text-slate-500">Active Listings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.rejected}</p>
            <p className="text-sm text-slate-500">Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-4 px-6 font-semibold text-sm transition-colors ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Properties ({myProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-4 px-6 font-semibold text-sm transition-colors ${activeTab === 'favorites' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Saved Favorites (0)
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'properties' ? (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <Link to="/property/add" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Property
                  </Link>
                </div>
                {myProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No properties yet</p>
                    <Link to="/property/add" className="btn-primary">Add Your First Property</Link>
                  </div>
                ) : (
                  myProperties.map((property) => (
                    <div key={property.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <img src={property.imageUrl} alt={property.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800">{property.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {property.location}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600">K {property.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms}</span>
                          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms}</span>
                          <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.area?.toLocaleString()} sqft</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          {getStatusBadge(property.approvalStatus)}
                          <div className="flex items-center gap-2">
                            <Link to={`/property/${property.id}`} className="p-2 rounded-lg hover:bg-white transition-colors text-slate-600" aria-label="View">
                              <Eye className="w-5 h-5" />
                            </Link>
                            <Link to={`/property/edit/${property.id}`} className="p-2 rounded-lg hover:bg-white transition-colors text-slate-600" aria-label="Edit">
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button onClick={() => handleDelete(property.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600" aria-label="Delete">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No saved favorites yet</p>
                <Link to="/" className="btn-primary">Browse Properties</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
