import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../utils/api';
import type { Notification } from '../types';

const POLL_INTERVAL_MS = 20_000;

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const activeUserIdRef = useRef<number | undefined>(user?.id);
  activeUserIdRef.current = user?.id;

  const fetchNotifications = useCallback(async (showLoading = false) => {
    const requestedUserId = user?.id;
    if (requestedUserId === undefined) return;

    if (showLoading) setLoading(true);
    try {
      const { data } = await notificationAPI.getAll();
      if (activeUserIdRef.current === requestedUserId) {
        setNotifications(data);
        setError('');
      }
    } catch {
      if (activeUserIdRef.current === requestedUserId) {
        setError('Unable to load notifications.');
      }
    } finally {
      if (showLoading && activeUserIdRef.current === requestedUserId) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      setError('');
      return;
    }

    void fetchNotifications(true);
    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications, user]);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    const requestedUserId = activeUserIdRef.current;
    try {
      const { data } = await notificationAPI.markRead(id);
      if (activeUserIdRef.current === requestedUserId) {
        setNotifications((current) => current.map((notification) => (
          notification.id === id ? data : notification
        )));
        setError('');
      }
    } catch {
      if (activeUserIdRef.current === requestedUserId) {
        setError('Unable to mark the notification as read.');
      }
      throw new Error('Unable to mark notification as read');
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const requestedUserId = activeUserIdRef.current;
    try {
      await notificationAPI.markAllRead();
      if (activeUserIdRef.current === requestedUserId) {
        setNotifications((current) => current.map((notification) => ({
          ...notification,
          isRead: true,
        })));
        setError('');
      }
    } catch {
      if (activeUserIdRef.current === requestedUserId) {
        setError('Unable to mark notifications as read.');
      }
    }
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  }), [notifications, loading, error, refresh, markRead, markAllRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
