import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Clock, XCircle, X, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NotificationItem {
  id: number;
  icon: 'approved' | 'pending' | 'rejected' | 'welcome';
  title: string;
  body: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 3, icon: 'welcome', title: 'Welcome to UrbanNest', body: 'Start browsing or post your first property.', time: 'Just now' },
  { id: 2, icon: 'pending', title: 'Listing under review', body: 'Your listing "Modern Villa in Dagon" is being reviewed.', time: '2h ago' },
  { id: 1, icon: 'approved', title: 'Listing approved', body: '"Luxury Apartment in Bahan" is now live.', time: '1d ago' },
];

export function getStatusIcon(type: NotificationItem['icon']) {
  switch (type) {
    case 'approved':
      return <CheckCircle />;
    case 'pending':
      return <Clock />;
    case 'rejected':
      return <XCircle />;
    case 'welcome':
      return <PlusCircle />;
    default:
      return <Bell />;
  }
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notif-wrap" ref={boxRef}>
      <button
        className="notif-bell"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell />
        {notifications.length > 0 && (
          <span className="notif-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {notifications.length > 0 && (
              <button className="notif-clear" onClick={() => setNotifications([])}>
                <X /> Clear all
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div className="notif-item" key={n.id}>
                  <div className={`notif-icon ${n.icon}`}>{getStatusIcon(n.icon)}</div>
                  <div className="notif-content">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-body">{n.body}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {user && (
            <Link
              to="/user/my-properties"
              className="notif-footer"
              onClick={() => setOpen(false)}
            >
              View my dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  );
}