import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import {
  useGetUserWishlist,
  getGetUserWishlistQueryKey,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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

function getLocalWishlist(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as number[]);
  } catch {}
  return new Set<number>();
}

function saveLocalWishlist(set: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const [localWishlist, setLocalWishlist] = useState<Set<number>>(() => getLocalWishlist());

  const { data: serverData } = useGetUserWishlist({
    query: { queryKey: getGetUserWishlistQueryKey(), enabled: isAuthenticated },
  });

  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalWishlist(getLocalWishlist());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalWishlist(localWishlist);
    }
  }, [localWishlist, isAuthenticated]);

  const toggle = useCallback(
    (productId: number) => {
      if (isAuthenticated) {
        const currentIds = serverData?.productIds ?? [];
        const isIn = currentIds.includes(productId);
        if (isIn) {
          removeMutation.mutate(
            { productId },
            {
              onSuccess: (data) => {
                queryClient.setQueryData(getGetUserWishlistQueryKey(), data);
              },
            },
          );
        } else {
          addMutation.mutate(
            { productId },
            {
              onSuccess: (data) => {
                queryClient.setQueryData(getGetUserWishlistQueryKey(), data);
              },
            },
          );
        }
      } else {
        setLocalWishlist((prev) => {
          const next = new Set(prev);
          if (next.has(productId)) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
      }
    },
    [isAuthenticated, serverData, addMutation, removeMutation, queryClient],
  );

  const wishlist: Set<number> = isAuthenticated
    ? new Set(serverData?.productIds ?? [])
    : localWishlist;

  const isWishlisted = useCallback(
    (productId: number) => wishlist.has(productId),
    [wishlist],
  );

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggle, isWishlisted, count: wishlist.size }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
