import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "@workspace/api-client-react";

const MAX_COMPARE = 3;

interface CompareContextValue {
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
  count: number;
  atLimit: boolean;
}

const CompareContext = createContext<CompareContextValue>({
  compareList: [],
  toggleCompare: () => undefined,
  removeFromCompare: () => undefined,
  isInCompare: () => false,
  clearCompare: () => undefined,
  count: 0,
  atLimit: false,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);

  const toggleCompare = useCallback((product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: number) => compareList.some((p) => p.id === productId),
    [compareList],
  );

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        toggleCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        count: compareList.length,
        atLimit: compareList.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
