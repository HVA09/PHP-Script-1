import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface WishlistContextValue {
  wishlist: Set<number>;
  toggle: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlist: new Set(),
  toggle: () => undefined,
  isWishlisted: () => false,
  count: 0,
});

const STORAGE_KEY = "dealhub_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return new Set(JSON.parse(stored) as number[]);
    } catch {}
    return new Set<number>();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...wishlist]));
    } catch {}
  }, [wishlist]);

  const toggle = useCallback((productId: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId: number) => wishlist.has(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, count: wishlist.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
