import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Heart,
  BarChart3,
  Bed,
  Bath,
  Square,
  Mail,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { NotificationsBell } from '../components/NotificationsBell';
import { adminAPI, propertyPostingFeeAPI } from '../utils/api';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatMMKAmount, formatPropertyPrice } from '../utils/price';
import type { ContactMessage, Property, PropertyPostingFee, PropertyType } from '../types';

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export function AdminDashboard() {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const { refreshProperties } = useProperties();
  const { newlyReceived } = useNotifications();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState<Property | null>(null);
  const [postingFees, setPostingFees] = useState<PropertyPostingFee[]>([]);
  const [feeDrafts, setFeeDrafts] = useState<Partial<Record<PropertyType, string>>>({});
  const [editingFee, setEditingFee] = useState<PropertyType | null>(null);
  const [savingFee, setSavingFee] = useState<PropertyType | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeMessage, setFeeMessage] = useState('');
  const [feeError, setFeeError] = useState('');
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState('');

  const loadAdminProperties = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await adminAPI.getAllProperties();
      setProperties(data);
      setError('');
    } catch {
      setError('Unable to load properties.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminProperties(true);
  }, [loadAdminProperties]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const approvalRequested = newlyReceived.some(
      (notification) => notification.type === 'PROPERTY_APPROVAL_REQUESTED',
    );
    if (approvalRequested) void loadAdminProperties();
  }, [loadAdminProperties, newlyReceived, user?.role]);

  useEffect(() => {
    let active = true;

    adminAPI.getContactMessages()
      .then(({ data }) => {
        if (active) setContactMessages(data);
      })
      .catch(() => {
        if (active) setMessagesError('Unable to load contact messages.');
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    propertyPostingFeeAPI.getAll()
      .then(({ data }) => {
        if (!active) return;
        setPostingFees(data);
        setFeeDrafts(Object.fromEntries(
          data.map((fee) => [fee.propertyType, String(fee.feeAmount)]),
        ));
      })
      .catch(() => {
        if (active) setFeeError('Unable to load property posting fees.');
      })
      .finally(() => {
        if (active) setFeeLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pending = properties.filter((p) => p.approvalStatus === 'PENDING');
  const approved = properties
    .filter((p) => p.approvalStatus === 'APPROVED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentlyAdded = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();

  const stats = [
    { icon: Home, label: 'Total Properties', value: properties.length.toString(), trend: '+12% this month', color: 'green' },
    { icon: Users, label: 'Total Users', value: '5', trend: '+5 this week', color: 'blue' },
    { icon: Clock, label: 'Pending Approvals', value: pending.length.toString(), trend: `${pending.length} awaiting review`, color: 'amber', urgent: true },
    { icon: Heart, label: 'Total Favorites', value: favoriteIds.length.toString(), trend: '+8% this week', color: 'violet' },
  ];

  const handleApprove = async (id: number) => {
    setUpdatingId(id);
    setError('');
    try {
      await adminAPI.approve(id);
      setProperties((prev) => prev.map((property) => (
        property.id === id ? { ...property, approvalStatus: 'APPROVED' } : property
      )));
      refreshProperties().catch(() => undefined);
      setReviewing(null);
    } catch {
      setError('Unable to approve the property.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setUpdatingId(id);
    setError('');
    try {
      await adminAPI.reject(id);
      setProperties((prev) => prev.map((property) => (
        property.id === id ? { ...property, approvalStatus: 'REJECTED' } : property
      )));
      refreshProperties().catch(() => undefined);
      setReviewing(null);
    } catch {
      setError('Unable to reject the property.');
    } finally {
      setUpdatingId(null);
    }
  };

  const startEditingFee = (fee: PropertyPostingFee) => {
    setEditingFee(fee.propertyType);
    setFeeDrafts((current) => ({ ...current, [fee.propertyType]: String(fee.feeAmount) }));
    setFeeMessage('');
    setFeeError('');
  };

  const cancelEditingFee = (fee: PropertyPostingFee) => {
    setFeeDrafts((current) => ({ ...current, [fee.propertyType]: String(fee.feeAmount) }));
    setEditingFee(null);
    setFeeError('');
  };

  const savePostingFee = async (propertyType: PropertyType) => {
    const draft = feeDrafts[propertyType]?.trim() ?? '';
    if (!/^\d+$/.test(draft) || Number(draft) > 999_999_999_999) {
      setFeeError('Fee must be a non-negative whole MMK amount up to 999,999,999,999.');
      return;
    }

    setSavingFee(propertyType);
    setFeeMessage('');
    setFeeError('');
    try {
      const { data } = await adminAPI.updatePostingFee(propertyType, Number(draft));
      setPostingFees((current) => current.map((fee) => (
        fee.propertyType === propertyType ? data : fee
      )));
      setFeeDrafts((current) => ({ ...current, [propertyType]: String(data.feeAmount) }));
      setEditingFee(null);
      setFeeMessage(`${propertyType.charAt(0) + propertyType.slice(1).toLowerCase()} fee updated.`);
    } catch {
      setFeeError('Unable to update the posting fee. Please try again.');
    } finally {
      setSavingFee(null);
    }
  };

  const statusBadge = (status: Property['approvalStatus']) => (
    <span
      className={`dash-badge ${
        status === 'APPROVED' ? 'approved'
        : status === 'PENDING' ? 'pending' : 'rejected'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );

  return (
    <div className="admin-page">
      <div className="admin-panel-topbar">
        <div className="admin-panel-brand">
          <span className="admin-panel-logo"><Home /></span>
          <span className="admin-panel-brand-name">UrbanNest</span>
          <span className="admin-panel-brand-sub">Admin Panel</span>
        </div>
        <div className="admin-panel-top-actions">
          <NotificationsBell />
          <div className="admin-panel-profile">
            <div className="admin-panel-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.username} /> : initial(user?.username || 'A')}
            </div>
            <span>{user?.username || 'admin'}</span>
          </div>
        </div>
      </div>

      <div className="adm-layout admin-panel-layout">
        <AdminSidebar active="dashboard" />

        <main className="adm-main">
          <div className="adm-content admin-dash-content">
            <div className="adm-mobile-tabs">
              <Link to="/admin/dashboard" className="adm-mobile-tab active">
                <BarChart3 /> Dashboard
              </Link>
              <Link to="/admin/manage-all?tab=properties" className="adm-mobile-tab">
                <Home /> Properties
              </Link>
              <Link to="/admin/manage-all?tab=users" className="adm-mobile-tab">
                <Users /> Users
              </Link>
            </div>

            <div className="admin-header">
              <div>
                <div className="admin-header-title">Dashboard</div>
                <div className="admin-header-sub">
                  Welcome back, {user?.username}! Here's what's happening today.
                </div>
              </div>
            </div>

            {(loading || error) && (
              <div className="admin-header-sub">{loading ? 'Loading properties...' : error}</div>
            )}

            <div className="admin-stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className={`admin-stat-card ${stat.urgent ? 'urgent' : ''}`}>
                  <div className={`admin-stat-icon ${stat.color}`}>
                    <stat.icon />
                  </div>
                  <div>
                    <div className="admin-stat-value">{stat.value}</div>
                    <div className="admin-stat-label">{stat.label}</div>
                    <div className={`admin-stat-trend ${stat.urgent ? 'urgent' : ''}`}>{stat.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-layout">
              <div className="admin-card">
                <div className="admin-card-header">
                  <span className="admin-card-title">Pending Approvals</span>
                  <span className="admin-card-badge">{pending.length} pending</span>
                </div>
                {pending.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty-icon"><CheckCircle /></div>
                    <div className="admin-empty-text">All caught up! No pending approvals.</div>
                  </div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Location</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th>Owner</th>
                          <th>Submitted</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map((property) => (
                          <tr key={property.id}>
                            <td>
                              <div className="adm-property-cell">
                                <img src={resolvePropertyImageUrl(property.imageUrl)} alt="" className="adm-property-thumb" />
                                <div className="adm-property-name">{property.title}</div>
                              </div>
                            </td>
                            <td>{property.location}</td>
                            <td className="adm-price">{formatPropertyPrice(property.price)}</td>
                            <td className="admin-cell-owner">{property.owner}</td>
                            <td className="admin-cell-date">{formatDate(property.createdAt)}</td>
                            <td>
                              <div className="admin-pending-actions">
                                <button onClick={() => handleApprove(property.id)} className="admin-btn-approve" disabled={updatingId === property.id}>
                                  <CheckCircle /> Approve
                                </button>
                                <button onClick={() => handleReject(property.id)} className="admin-btn-reject" disabled={updatingId === property.id}>
                                  <XCircle /> Reject
                                </button>
                                <button onClick={() => setReviewing(property)} className="admin-btn-view" aria-label="Review details" title="Review details">
                                  <Eye />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <span className="admin-card-title">Recently Approved</span>
                </div>
                {approved.length === 0 ? (
                  <div className="admin-empty">
                    <div className="admin-empty-icon"><CheckCircle /></div>
                    <div className="admin-empty-text">No approved listings yet.</div>
                  </div>
                ) : (
                  <div className="admin-recent-list">
                    {approved.slice(0, 4).map((property) => (
                      <div className="admin-recent-item" key={property.id}>
                        <img src={resolvePropertyImageUrl(property.imageUrl)} alt="" className="admin-recent-thumb" />
                        <div className="admin-recent-info">
                          <div className="admin-recent-name">{property.title}</div>
                          <div className="admin-recent-loc">
                            <MapPin style={{ width: 12, height: 12, verticalAlign: 'middle' }} /> {property.location}
                          </div>
                        </div>
                        <CheckCircle className="admin-recent-check" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card admin-recently-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Recently Added Properties</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th>Status</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentlyAdded.map((property) => (
                      <tr key={property.id}>
                        <td>
                          <div className="adm-property-cell">
                            <img src={resolvePropertyImageUrl(property.imageUrl)} alt="" className="adm-property-thumb" />
                            <div className="adm-property-name">{property.title}</div>
                          </div>
                        </td>
                        <td>{property.location}</td>
                        <td className="adm-price">{formatPropertyPrice(property.price)}</td>
                        <td>{statusBadge(property.approvalStatus)}</td>
                        <td className="admin-cell-date">{formatDate(property.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <section className="admin-card admin-contact-card" aria-labelledby="contact-messages-title">
              <div className="admin-card-header">
                <div>
                  <div id="contact-messages-title" className="admin-card-title">Contact Messages</div>
                  <div className="admin-contact-subtitle">Messages submitted through the public Contact page.</div>
                </div>
                {!messagesLoading && !messagesError && (
                  <span className="admin-card-badge">{contactMessages.length} total</span>
                )}
              </div>
              {messagesLoading ? (
                <div className="admin-contact-status">Loading contact messages...</div>
              ) : messagesError ? (
                <div className="admin-contact-status error">{messagesError}</div>
              ) : contactMessages.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon"><Mail /></div>
                  <div className="admin-empty-text">No contact messages yet.</div>
                </div>
              ) : (
                <div className="admin-contact-list">
                  {contactMessages.map((contactMessage) => (
                    <article className="admin-contact-message" key={contactMessage.id}>
                      <div className="admin-contact-heading">
                        <div>
                          <div className="admin-contact-name">{contactMessage.fullName}</div>
                          <div className="admin-contact-details">
                            <span>{contactMessage.email}</span>
                            <span>{contactMessage.phone || 'No phone provided'}</span>
                          </div>
                        </div>
                        <time className="admin-contact-time" dateTime={contactMessage.createdAt}>
                          {formatDateTime(contactMessage.createdAt)}
                        </time>
                      </div>
                      <p className="admin-contact-body">{contactMessage.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-card admin-fees-card" aria-labelledby="posting-fees-title">
              <div className="admin-card-header">
                <div>
                  <div id="posting-fees-title" className="admin-card-title">Property Posting Fees</div>
                  <div className="admin-fees-subtitle">Configure the informational fee shown for new property submissions.</div>
                </div>
              </div>
              {feeLoading ? (
                <div className="admin-fees-status">Loading posting fees...</div>
              ) : postingFees.length === 0 ? (
                <div className="admin-fees-status error">{feeError || 'No posting fees are configured.'}</div>
              ) : (
                <div className="admin-fee-list">
                  {postingFees.map((fee) => (
                    <div className="admin-fee-row" key={fee.propertyType}>
                      <div>
                        <div className="admin-fee-type">
                          {fee.propertyType.charAt(0) + fee.propertyType.slice(1).toLowerCase()}
                        </div>
                        {editingFee !== fee.propertyType && (
                          <div className="admin-fee-amount">{formatMMKAmount(fee.feeAmount)}</div>
                        )}
                      </div>
                      {editingFee === fee.propertyType ? (
                        <div className="admin-fee-editor">
                          <div className="admin-fee-input-wrap">
                            <span>MMK</span>
                            <input
                              type="number"
                              min="0"
                              max="999999999999"
                              step="1"
                              inputMode="numeric"
                              value={feeDrafts[fee.propertyType] ?? ''}
                              onChange={(event) => setFeeDrafts((current) => ({
                                ...current,
                                [fee.propertyType]: event.target.value,
                              }))}
                              aria-label={`${fee.propertyType} posting fee`}
                            />
                          </div>
                          <button
                            type="button"
                            className="admin-fee-save"
                            onClick={() => savePostingFee(fee.propertyType)}
                            disabled={savingFee === fee.propertyType}
                          >
                            {savingFee === fee.propertyType ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" className="admin-fee-cancel" onClick={() => cancelEditingFee(fee)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="admin-fee-edit" onClick={() => startEditingFee(fee)}>
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {(feeMessage || feeError) && postingFees.length > 0 && (
                <div className={`admin-fees-status ${feeError ? 'error' : 'success'}`} aria-live="polite">
                  {feeError || feeMessage}
                </div>
              )}
            </section>

            <div className="admin-quick-grid">
              <Link to="/admin/manage-all?tab=properties" className="admin-quick-card">
                <div className="admin-quick-icon green"><CheckCircle /></div>
                <div>
                  <div className="admin-quick-title">Approved Listings</div>
                  <div className="admin-quick-sub">{approved.length} live on the site</div>
                </div>
              </Link>
              <Link to="/admin/dashboard" className="admin-quick-card">
                <div className="admin-quick-icon amber"><Clock /></div>
                <div>
                  <div className="admin-quick-title">Pending Approvals</div>
                  <div className="admin-quick-sub">{pending.length} awaiting review</div>
                </div>
              </Link>
              <Link to="/admin/manage-all?tab=users" className="admin-quick-card">
                <div className="admin-quick-icon blue"><Users /></div>
                <div>
                  <div className="admin-quick-title">Manage Users</div>
                  <div className="admin-quick-sub">5 registered</div>
                </div>
              </Link>
              <Link to="/admin/manage-all?tab=properties" className="admin-quick-card">
                <div className="admin-quick-icon violet"><Home /></div>
                <div>
                  <div className="admin-quick-title">Manage Properties</div>
                  <div className="admin-quick-sub">{properties.length} total listings</div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Review Property Modal */}
      {reviewing && (
        <div className="dash-modal-overlay" onClick={() => setReviewing(null)}>
          <div className="dash-modal admin-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Review Property</span>
              <button className="dash-modal-close" onClick={() => setReviewing(null)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="admin-review-body">
              {reviewing.imageUrl ? (
                <img src={resolvePropertyImageUrl(reviewing.imageUrl)} alt={reviewing.title} className="admin-review-thumb" />
              ) : (
                <div className="admin-review-thumb admin-review-thumb-fallback"><Home /></div>
              )}
              <div className="admin-review-title-row">
                <div className="admin-review-title">{reviewing.title}</div>
                <div className="admin-pending-price">{formatPropertyPrice(reviewing.price)}</div>
              </div>
              <div className="admin-review-loc">
                <MapPin style={{ width: 14, height: 14, verticalAlign: 'middle' }} /> {reviewing.location}
              </div>
              <div className="admin-review-grid">
                <div className="admin-review-cell">
                  <Bed /> {reviewing.bedrooms} beds
                </div>
                <div className="admin-review-cell">
                  <Bath /> {reviewing.bathrooms} baths
                </div>
                <div className="admin-review-cell">
                  <Square /> {reviewing.area.toLocaleString()} sqft
                </div>
                <div className="admin-review-cell">
                  <Home /> {reviewing.propertyType.toLowerCase()}
                </div>
              </div>
              <div className="admin-review-meta">
                <div className="admin-review-meta-item">
                  <span className="admin-review-label">Owner</span>
                  <span className="admin-review-value">{reviewing.owner} · {reviewing.ownerPhone || '—'}</span>
                </div>
                <div className="admin-review-meta-item">
                  <span className="admin-review-label">Listing Type</span>
                  <span className="admin-review-value">
                    {reviewing.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                <div className="admin-review-meta-item">
                  <span className="admin-review-label">Submitted</span>
                  <span className="admin-review-value">{formatDate(reviewing.createdAt)}</span>
                </div>
              </div>
              <div className="admin-review-desc">
                <span className="admin-review-label">Description</span>
                <p>{reviewing.description}</p>
              </div>
            </div>
            <div className="admin-review-actions">
              <button onClick={() => handleReject(reviewing.id)} className="admin-btn-reject" disabled={updatingId === reviewing.id}>
                <XCircle /> Reject Listing
              </button>
              <button onClick={() => handleApprove(reviewing.id)} className="admin-btn-approve" disabled={updatingId === reviewing.id}>
                <CheckCircle /> Approve Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
