import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Property, PropertyRequest } from '../types';
import { propertyAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';

interface PropertiesContextType {
  properties: Property[];
  myProperties: Property[];
  loading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
  refreshMyProperties: () => Promise<void>;
  getPropertyById: (id: number) => Promise<Property>;
  addProperty: (data: PropertyRequest) => Promise<Property>;
  updateProperty: (id: number, data: PropertyRequest) => Promise<Property>;
  deleteProperty: (id: number) => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error ? error.message : 'Unable to complete the request';
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { newlyReceived } = useNotifications();
  const [properties, setProperties] = useState<Property[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequests = useRef(0);
  const currentUserId = useRef<number | null>(null);
  currentUserId.current = isAuthenticated ? user?.id ?? null : null;

  const runRequest = useCallback(async <T,>(request: () => Promise<T>): Promise<T> => {
    pendingRequests.current += 1;
    setLoading(true);
    setError(null);
    try {
      return await request();
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    } finally {
      pendingRequests.current -= 1;
      if (pendingRequests.current === 0) setLoading(false);
    }
  }, []);

  const refreshProperties = useCallback(async () => {
    const response = await runRequest(() => propertyAPI.search({}));
    setProperties(response.data.filter((property) => property.approvalStatus === 'APPROVED'));
  }, [runRequest]);

  const refreshMyProperties = useCallback(async () => {
    const requestedUserId = currentUserId.current;
    if (requestedUserId === null) {
      setMyProperties([]);
      return;
    }

    const response = await runRequest(() => propertyAPI.getMine());
    if (currentUserId.current === requestedUserId) setMyProperties(response.data);
  }, [runRequest]);

  useEffect(() => {
    refreshProperties().catch(() => undefined);
  }, [refreshProperties]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setMyProperties([]);
      return;
    }
    refreshMyProperties().catch(() => undefined);
  }, [isAuthenticated, user?.id, refreshMyProperties]);

  useEffect(() => {
    if (user?.role !== 'USER') return;
    const statusChanged = newlyReceived.some((notification) => (
      notification.type === 'PROPERTY_APPROVED' || notification.type === 'PROPERTY_REJECTED'
    ));
    if (statusChanged) refreshMyProperties().catch(() => undefined);
  }, [newlyReceived, refreshMyProperties, user?.role]);

  const getPropertyById = useCallback(
    async (id: number) => (await propertyAPI.getById(id)).data,
    [],
  );

  const addProperty = useCallback(async (data: PropertyRequest) => {
    const property = (await runRequest(() => propertyAPI.create(data))).data;
    setMyProperties((current) => [property, ...current.filter((item) => item.id !== property.id)]);
    setProperties((current) =>
      property.approvalStatus === 'APPROVED'
        ? [property, ...current.filter((item) => item.id !== property.id)]
        : current.filter((item) => item.id !== property.id),
    );
    return property;
  }, [runRequest]);

  const updateProperty = useCallback(async (id: number, data: PropertyRequest) => {
    const property = (await runRequest(() => propertyAPI.update(id, data))).data;
    setMyProperties((current) => current.map((item) => (item.id === id ? property : item)));
    setProperties((current) =>
      property.approvalStatus === 'APPROVED'
        ? [property, ...current.filter((item) => item.id !== id)]
        : current.filter((item) => item.id !== id),
    );
    return property;
  }, [runRequest]);

  const deleteProperty = useCallback(async (id: number) => {
    await runRequest(() => propertyAPI.delete(id));
    setMyProperties((current) => current.filter((property) => property.id !== id));
    setProperties((current) => current.filter((property) => property.id !== id));
  }, [runRequest]);

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        myProperties,
        loading,
        error,
        refreshProperties,
        refreshMyProperties,
        getPropertyById,
        addProperty,
        updateProperty,
        deleteProperty,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
}
