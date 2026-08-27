import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'urbannest-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <UserFavoritesProvider key={user?.id ?? 'anonymous'} userId={user?.id ?? null}>
      {children}
    </UserFavoritesProvider>
  );
}

function UserFavoritesProvider({ children, userId }: { children: ReactNode; userId: number | null }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (userId === null) return [];

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (userId !== null) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}-${userId}`, JSON.stringify(favoriteIds));
    }
  }, [favoriteIds, userId]);

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
