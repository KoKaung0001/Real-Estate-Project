import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Home, Search, Trash2, Ban, CheckCircle, Eye, Settings, BarChart3, ArrowLeft, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOCK_USERS = [
  { id: '1', name: 'John Buyer', email: 'buyer@demo.com', role: 'buyer', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: '2', name: 'Jane Seller', email: 'seller@demo.com', role: 'seller', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: '3', name: 'Mike Wilson', email: 'mike@demo.com', role: 'seller', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@demo.com', role: 'buyer', status: 'banned', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '5', name: 'Admin User', email: 'admin@demo.com', role: 'admin', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
];

const MOCK_PROPERTIES = [
  { id: '1', title: 'Modern Waterfront Residence', type: 'House', township: 'Austin, TX', price: 1250000, status: 'approved', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80' },
  { id: '2', title: 'Luxury Ocean View Villa', type: 'Villa', township: 'Malibu, CA', price: 3500000, status: 'approved', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80' },
  { id: '3', title: 'Urban Loft Downtown', type: 'Apartment', township: 'New York, NY', price: 2800000, status: 'pending', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' },
  { id: '4', title: 'Cozy Portland Cottage', type: 'Townhouse', township: 'Portland, OR', price: 450000, status: 'approved', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80' },
  { id: '5', title: 'Mountain View Retreat', type: 'House', township: 'Denver, CO', price: 780000, status: 'rejected', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80' },
];

export function AdminDataManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>('users');
  const [users, setUsers] = useState(MOCK_USERS);
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.township.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u));
  };

  const handleDeleteProperty = (id) => {
    setProperties(properties.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge bg-violet-100 text-violet-800">{role.toUpperCase()}</span>;
      case 'seller': return <span className="badge badge-info">{role.toUpperCase()}</span>;
      default: return <span className="badge badge-success">{role.toUpperCase()}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success">Approved</span>;
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      case 'rejected': return <span className="badge badge-error">Rejected</span>;
      case 'active': return <span className="badge badge-success">Active</span>;
      case 'banned': return <span className="badge badge-error">Banned</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] sticky top-20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-slate-100"
              />
              <div>
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <span className="badge bg-violet-100 text-violet-800 text-xs">ADMIN</span>
              </div>
            </div>
            <nav className="space-y-2">
              <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                <BarChart3 className="w-5 h-5" /> Dashboard
              </Link>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Users className="w-5 h-5" /> Manage Users
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'properties' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Home className="w-5 h-5" /> Manage Properties
              </button>
              <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Home
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex bg-white rounded-xl p-1 mb-6 shadow-sm">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
              >
                <Users className="w-5 h-5 inline mr-2" /> Users
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'properties' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
              >
                <Home className="w-5 h-5 inline mr-2" /> Properties
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {activeTab === 'users' ? 'Manage Users' : 'Manage Properties'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {activeTab === 'users' ? `${users.length} total users` : `${properties.length} total properties`}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-11 w-full sm:w-80"
                />
              </div>
            </div>

            {/* Users Table */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="font-medium text-slate-800">{u.name}</p>
                                <p className="text-sm text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                          <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(u.id)}
                                className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                                title={u.status === 'active' ? 'Ban User' : 'Unban User'}
                              >
                                {u.status === 'active' ? <Ban className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                              </button>
                              {confirmDelete === u.id ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleDeleteUser(u.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Confirm</button>
                                  <button onClick={() => setConfirmDelete(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(u.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No users found</p>
                  </div>
                )}
              </div>
            )}

            {/* Properties Table */}
            {activeTab === 'properties' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Property</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={property.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium text-slate-800">{property.title}</p>
                                <p className="text-sm text-slate-500">{property.township}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="badge bg-slate-100 text-slate-700">{property.type}</span>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(property.status)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800">${property.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/property/${property.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                                <Eye className="w-5 h-5" />
                              </Link>
                              {confirmDelete === `prop-${property.id}` ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleDeleteProperty(property.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Confirm</button>
                                  <button onClick={() => setConfirmDelete(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(`prop-${property.id}`)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                  title="Delete Property"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProperties.length === 0 && (
                  <div className="p-12 text-center">
                    <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No properties found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}