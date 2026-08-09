import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Property, ApprovalStatus } from '../types';

interface PropertiesContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => Property;
  updateProperty: (id: number, updates: Partial<Property>) => void;
  deleteProperty: (id: number) => void;
  setApprovalStatus: (id: number, status: ApprovalStatus) => void;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

const STORAGE_KEY = 'urbannest-properties';

const SEED_PROPERTIES: Property[] = [
  { id: 1, title: 'Luxury Apartment in Bahan', description: 'Beautiful modern apartment in the heart of Bahan with city views.', price: 250000, location: 'Bahan', propertyType: 'APARTMENT', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 3, bathrooms: 2, area: 1800, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-01T00:00:00Z' },
  { id: 2, title: 'Modern Villa in Dagon', description: 'Spacious villa with a private garden and modern finishes.', price: 850000, location: 'Dagon', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 5, bathrooms: 4, area: 4200, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-05T00:00:00Z' },
  { id: 3, title: 'Cozy Condo in Mayangone', description: 'Cozy two-bedroom condo close to schools and shopping.', price: 180000, location: 'Mayangone', propertyType: 'CONDO', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 2, bathrooms: 2, area: 1200, imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', owner: 'aung', ownerPhone: '09-222222222', createdAt: '2026-08-03T00:00:00Z' },
  { id: 4, title: 'Family House in Hlaing', description: 'Comfortable family house with a big yard in Hlaing.', price: 320000, location: 'Hlaing', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'REJECTED', bedrooms: 4, bathrooms: 3, area: 2800, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', owner: 'kyaw', ownerPhone: '09-333333333', createdAt: '2026-08-02T00:00:00Z' },
  { id: 5, title: 'Studio for Rent in Yankin', description: 'Compact studio apartment available for rent.', price: 800, location: 'Yankin', propertyType: 'APARTMENT', status: 'FOR_RENT', approvalStatus: 'APPROVED', bedrooms: 1, bathrooms: 1, area: 650, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-04T00:00:00Z' },
  { id: 6, title: 'Luxury Penthouse Suite', description: 'Premium penthouse with panoramic views of the city.', price: 2800000, location: 'Bahan', propertyType: 'APARTMENT', status: 'FOR_SALE', approvalStatus: 'PENDING', bedrooms: 4, bathrooms: 3, area: 3500, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-07T00:00:00Z' },
  { id: 7, title: 'Beachfront Villa', description: 'Luxury villa with direct beach access.', price: 3500000, location: 'Tamwe', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 6, bathrooms: 5, area: 5800, imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', owner: 'seller', ownerPhone: '09-987654321', createdAt: '2026-08-06T00:00:00Z' },
  { id: 8, title: 'Mountain Retreat', description: 'Peaceful mountain retreat surrounded by nature.', price: 780000, location: 'Kamaryut', propertyType: 'HOUSE', status: 'FOR_SALE', approvalStatus: 'APPROVED', bedrooms: 3, bathrooms: 2, area: 1800, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', owner: 'buyer', ownerPhone: '09-123456789', createdAt: '2026-08-08T00:00:00Z' },
];

function loadProperties(): Property[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Property[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return SEED_PROPERTIES;
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(loadProperties);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  const addProperty = (property: Omit<Property, 'id' | 'createdAt'>) => {
    const newProperty: Property = {
      ...property,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProperties(prev => [newProperty, ...prev]);
    return newProperty;
  };

  const updateProperty = (id: number, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProperty = (id: number) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const setApprovalStatus = (id: number, status: ApprovalStatus) => {
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, approvalStatus: status } : p)));
  };

  return (
    <PropertiesContext.Provider
      value={{ properties, addProperty, updateProperty, deleteProperty, setApprovalStatus }}
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
