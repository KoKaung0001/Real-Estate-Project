import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Clock, CheckCircle, XCircle, Eye, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Property } from '../types';

const DEMO_PENDING: Property[] = [
  { id: 101, title: 'Luxury Penthouse Suite', description: 'Premium penthouse', price: 2800000, location: 'Bahan', propertyType: 'APARTMENT', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 4, bathrooms: 3, area: 3500, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-07T00:00:00Z' },
  { id: 102, title: 'Cozy Family Home', description: 'Family house', price: 650000, location: 'Hlaing', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 3, bathrooms: 2, area: 2200, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', owner: 'buyer', ownerPhone: '09-123456789', createdAt: '2026-08-06T00:00:00Z' },
];

const DEMO_APPROVED: Property[] = [
  { id: 201, title: 'Beachfront Villa', description: 'Villa', price: 3500000, location: 'Tamwe', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 6, bathrooms: 5, area: 5800, imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-04T00:00:00Z' },
  { id: 202, title: 'Mountain Retreat', description: 'Retreat', price: 780000, location: 'Kamaryut', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 3, bathrooms: 2, area: 1800, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', owner: 'buyer', ownerPhone: '09-123456789', createdAt: '2026-08-02T00:00:00Z' },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [pendingProperties, setPendingProperties] = useState<Property[]>(DEMO_PENDING);
  const [recentApproved, setRecentApproved] = useState<Property[]>(DEMO_APPROVED);

  const stats = [
    { icon: Users, label: 'Total Users', value: '5', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Home, label: 'Total Properties', value: '10', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Clock, label: 'Pending Approvals', value: pendingProperties.length.toString(), color: 'text-amber-600', bg: 'bg-amber-100', urgent: true },
  ];

  const handleApprove = (id: number) => {
    const property = pendingProperties.find((p) => p.id === id);
    if (property) {
      setRecentApproved([{ ...property, approvalStatus: 'APPROVED' }, ...recentApproved]);
      setPendingProperties(pendingProperties.filter((p) => p.id !== id));
    }
  };

  const handleReject = (id: number) => {
    setPendingProperties(pendingProperties.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.username}</p>
          </div>
          <Link to="/admin/data" className="btn-secondary flex items-center gap-2">
            <Settings className="w-5 h-5" /> Manage Data
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`bg-white rounded-2xl shadow-md p-6 ${stat.urgent ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Pending Approvals</h2>
                  <span className="badge badge-warning">{pendingProperties.length} pending</span>
                </div>
              </div>
              {pendingProperties.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-500">All caught up! No pending approvals.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingProperties.map((property) => (
                    <div key={property.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img src={property.imageUrl} alt={property.title} className="w-full sm:w-24 h-24 object-cover rounded-xl" />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-800">{property.title}</h3>
                              <p className="text-sm text-slate-500">Submitted: {property.createdAt}</p>
                            </div>
                            <p className="font-bold text-blue-600">K {property.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-sm text-slate-600">{property.owner}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(property.id)}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(property.id)}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <Link to={`/property/${property.id}`} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
                              <Eye className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Recently Approved</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {recentApproved.map((property) => (
                  <div key={property.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={property.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{property.title}</p>
                        <p className="text-sm text-slate-500">{property.location}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
