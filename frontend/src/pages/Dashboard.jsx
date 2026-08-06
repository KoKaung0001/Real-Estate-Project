import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Edit, Trash2, Heart, MapPin, Bed, Bath, Square, Plus, Home, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOCK_MY_PROPERTIES = [
  { id: '1', title: 'Modern Waterfront Residence', type: 'House', township: 'Austin, TX', price: 1250000, beds: 5, baths: 4, sqft: 4200, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', status: 'approved', date: '2024-01-15' },
  { id: '2', title: 'Downtown Luxury Apartment', type: 'Apartment', township: 'New York, NY', price: 850000, beds: 2, baths: 2, sqft: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', status: 'pending', date: '2024-01-18' },
  { id: '3', title: 'Beachfront Villa Paradise', type: 'Villa', township: 'Malibu, CA', price: 3200000, beds: 6, baths: 5, sqft: 5800, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', status: 'rejected', date: '2024-01-10' },
];

const MOCK_FAVORITES = [
  { id: '4', title: 'Cozy Mountain Cabin', type: 'House', township: 'Denver, CO', price: 425000, beds: 3, baths: 2, sqft: 1800, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
  { id: '5', title: 'Urban Studio Loft', type: 'Apartment', township: 'Seattle, WA', price: 320000, beds: 1, baths: 1, sqft: 650, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites'>('properties');
  const [myProperties, setMyProperties] = useState(MOCK_MY_PROPERTIES);
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const stats = {
    total: myProperties.length,
    active: myProperties.filter(p => p.status === 'approved').length,
    pending: myProperties.filter(p => p.status === 'pending').length,
    rejected: myProperties.filter(p => p.status === 'rejected').length,
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setMyProperties(myProperties.filter(p => p.id !== id));
    }
  };

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(p => p.id !== id));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'pending': return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'rejected': return <span className="badge badge-error"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Profile Header */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="section-container relative h-full flex items-end pb-6">
          <div className="flex items-end gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name}</h1>
                <span className={`badge ${user?.role === 'admin' ? 'bg-violet-500 text-white' : user?.role === 'seller' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <p className="text-blue-100 text-sm sm:text-base">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container">
        {/* Quick Stats */}
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

        {/* Tab Views */}
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
              Saved Favorites ({favorites.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'properties' ? (
              <div className="space-y-4">
                {user?.role === 'seller' && (
                  <div className="flex justify-end mb-4">
                    <Link to="/property/add" className="btn-primary flex items-center gap-2">
                      <Plus className="w-5 h-5" /> Add New Property
                    </Link>
                  </div>
                )}
                {myProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No properties yet</p>
                    {user?.role === 'seller' && (
                      <Link to="/property/add" className="btn-primary">Add Your First Property</Link>
                    )}
                  </div>
                ) : (
                  myProperties.map((property) => (
                    <div key={property.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <img src={property.image} alt={property.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800">{property.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {property.township}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600">${property.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds}</span>
                          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths}</span>
                          <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.sqft.toLocaleString()} sqft</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          {getStatusBadge(property.status)}
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
              <div className="space-y-4">
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No saved favorites yet</p>
                    <Link to="/" className="btn-primary">Browse Properties</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((property) => (
                      <div key={property.id} className="card card-hover overflow-hidden">
                        <div className="relative h-40">
                          <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveFavorite(property.id)}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                            aria-label="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-800">{property.title}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {property.township}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds}</span>
                            <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <p className="font-bold text-blue-600">${property.price.toLocaleString()}</p>
                            <Link to={`/property/${property.id}`} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}