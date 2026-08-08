import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Search, Trash2, Eye, ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Property, User } from '../types';

const DEMO_USERS: User[] = [
  { id: 1, username: 'buyer', email: 'buyer@demo.com', phone: '09-123456789', role: 'USER' },
  { id: 2, username: 'seller', email: 'seller@demo.com', phone: '09-987654321', role: 'USER' },
  { id: 3, username: 'admin', email: 'admin@demo.com', phone: '09-111111111', role: 'ADMIN' },
  { id: 4, username: 'aung', email: 'aung@demo.com', phone: '09-222222222', role: 'USER' },
  { id: 5, username: 'kyaw', email: 'kyaw@demo.com', phone: '09-333333333', role: 'USER' },
];

const DEMO_PROPERTIES: Property[] = [
  { id: 1, title: 'Luxury Apartment in Bahan', description: 'Beautiful apartment', price: 250000, location: 'Bahan', propertyType: 'APARTMENT', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 3, bathrooms: 2, area: 1800, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-01T00:00:00Z' },
  { id: 2, title: 'Modern Villa in Dagon', description: 'Spacious villa', price: 850000, location: 'Dagon', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 5, bathrooms: 4, area: 4200, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-05T00:00:00Z' },
  { id: 3, title: 'Cozy Condo in Mayangone', description: 'Nice condo', price: 180000, location: 'Mayangone', propertyType: 'CONDO', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 2, bathrooms: 2, area: 1200, imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', owner: 'aung', ownerPhone: '09-222222222', createdAt: '2026-08-03T00:00:00Z' },
  { id: 4, title: 'Family House in Hlaing', description: 'Family house', price: 320000, location: 'Hlaing', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'REJECTED', bedrooms: 4, bathrooms: 3, area: 2800, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', owner: 'kyaw', ownerPhone: '09-333333333', createdAt: '2026-08-02T00:00:00Z' },
  { id: 5, title: 'Studio for Rent in Yankin', description: 'Studio apartment', price: 800, location: 'Yankin', propertyType: 'APARTMENT', status: 'FOR_RENT', approvalStatus: 'APPROVED', bedrooms: 1, bathrooms: 1, area: 650, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-04T00:00:00Z' },
];

export function AdminDataManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>('users');
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [properties, setProperties] = useState<Property[]>(DEMO_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const handleDeleteProperty = (id: number) => {
    setProperties(properties.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="badge bg-violet-100 text-violet-800">{role}</span>;
      default: return <span className="badge badge-success">{role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success">Approved</span>;
      case 'PENDING': return <span className="badge badge-warning">Pending</span>;
      case 'REJECTED': return <span className="badge badge-error">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] sticky top-20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-slate-100"
              />
              <div>
                <p className="font-semibold text-slate-800">{user?.username}</p>
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

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
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

            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="font-medium text-slate-800">{u.username}</p>
                                <p className="text-sm text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {confirmDelete === `user-${u.id}` ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleDeleteUser(u.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Confirm</button>
                                  <button onClick={() => setConfirmDelete(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(`user-${u.id}`)}
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

            {activeTab === 'properties' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Property</th>
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
                              <img src={property.imageUrl} alt="" className="w-16 h-12 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium text-slate-800">{property.title}</p>
                                <p className="text-sm text-slate-500">{property.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(property.approvalStatus)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800">K {property.price.toLocaleString()}</td>
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
