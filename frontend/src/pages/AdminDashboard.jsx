import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Clock, CheckCircle, XCircle, Eye, Settings, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOCK_PENDING_PROPERTIES = [
  { id: '1', title: 'Luxury Penthouse Suite', seller: { name: 'Jane Seller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', date: '2024-01-18', price: 2800000 },
  { id: '2', title: 'Cozy Family Home', seller: { name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' }, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', date: '2024-01-17', price: 650000 },
  { id: '3', title: 'Modern Studio Apartment', seller: { name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' }, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80', date: '2024-01-16', price: 320000 },
];

const MOCK_RECENT_APPROVED = [
  { id: '4', title: 'Beachfront Villa', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80', date: '2024-01-15' },
  { id: '5', title: 'Mountain Retreat', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', date: '2024-01-14' },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [pendingProperties, setPendingProperties] = useState(MOCK_PENDING_PROPERTIES);
  const [recentApproved, setRecentApproved] = useState(MOCK_RECENT_APPROVED);

  const stats = [
    { icon: Users, label: 'Total Users', value: '1,247', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Home, label: 'Total Properties', value: '3,892', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Clock, label: 'Pending Approvals', value: pendingProperties.length.toString(), color: 'text-amber-600', bg: 'bg-amber-100', urgent: true },
  ];

  const handleApprove = (id) => {
    const property = pendingProperties.find((p) => p.id === id);
    if (property) {
      setRecentApproved([{ ...property, date: new Date().toISOString().split('T')[0] }, ...recentApproved]);
      setPendingProperties(pendingProperties.filter((p) => p.id !== id));
    }
  };

  const handleReject = (id) => {
    setPendingProperties(pendingProperties.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link to="/admin/data" className="btn-secondary flex items-center gap-2">
            <Settings className="w-5 h-5" /> Manage Data
          </Link>
        </div>

        {/* KPI Cards */}
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
          {/* Pending Approvals Table */}
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
                        <img src={property.image} alt={property.title} className="w-full sm:w-24 h-24 object-cover rounded-xl" />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-800">{property.title}</h3>
                              <p className="text-sm text-slate-500">Submitted: {property.date}</p>
                            </div>
                            <p className="font-bold text-blue-600">${property.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <img src={property.seller.avatar} alt="" className="w-8 h-8 rounded-full" />
                            <span className="text-sm text-slate-600">{property.seller.name}</span>
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

          {/* Recently Approved */}
          <div>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Recently Approved</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {recentApproved.map((property) => (
                  <div key={property.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={property.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{property.title}</p>
                        <p className="text-sm text-slate-500">{property.date}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
              {recentApproved.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No recently approved properties
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Approval Rate</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Avg. Response Time</span>
                  <span className="font-semibold text-slate-800">2.4 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Active Sellers</span>
                  <span className="font-semibold text-blue-600">342</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}