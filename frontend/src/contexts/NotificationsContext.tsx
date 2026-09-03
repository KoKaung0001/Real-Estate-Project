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
  newlyReceived: Notification[];
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
  const authenticatedUserId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newlyReceived, setNewlyReceived] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const activeUserIdRef = useRef<number | undefined>(authenticatedUserId);
  const initializedUserIdRef = useRef<number | undefined>(undefined);
  const seenNotificationIdsRef = useRef<Set<number>>(new Set());
  activeUserIdRef.current = authenticatedUserId;

  const fetchNotifications = useCallback(async (showLoading = false) => {
    const requestedUserId = authenticatedUserId;
    if (requestedUserId === undefined) return;

    if (showLoading) setLoading(true);
    try {
      const { data } = await notificationAPI.getAll();
      if (activeUserIdRef.current === requestedUserId) {
        if (initializedUserIdRef.current !== requestedUserId) {
          initializedUserIdRef.current = requestedUserId;
          seenNotificationIdsRef.current = new Set(data.map((notification) => notification.id));
          setNewlyReceived([]);
        } else {
          const newNotifications = data.filter(
            (notification) => !seenNotificationIdsRef.current.has(notification.id),
          );
          data.forEach((notification) => seenNotificationIdsRef.current.add(notification.id));
          if (newNotifications.length > 0) setNewlyReceived(newNotifications);
        }
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
  }, [authenticatedUserId]);

  useEffect(() => {
    if (authenticatedUserId === undefined) {
      setNotifications([]);
      setNewlyReceived([]);
      setLoading(false);
      setError('');
      initializedUserIdRef.current = undefined;
      seenNotificationIdsRef.current.clear();
      return;
    }

    initializedUserIdRef.current = undefined;
    seenNotificationIdsRef.current = new Set();
    setNewlyReceived([]);

    void fetchNotifications(true);
    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);

    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') {
        void fetchNotifications();
      }
    };
    window.addEventListener('focus', refreshWhenActive);
    document.addEventListener('visibilitychange', refreshWhenActive);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenActive);
      document.removeEventListener('visibilitychange', refreshWhenActive);
    };
  }, [authenticatedUserId, fetchNotifications]);

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
    newlyReceived,
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  }), [notifications, newlyReceived, loading, error, refresh, markRead, markAllRead]);

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
