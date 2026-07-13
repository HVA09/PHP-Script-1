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
  useGetRecentlyViewed,
  getGetRecentlyViewedQueryKey,
  useTrackRecentlyViewed,
  getGetUserWishlistQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "dealhub_recently_viewed";
const MAX_LOCAL = 20;

interface RecentlyViewedContextValue {
  recentIds: number[];
  track: (productId: number) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>({
  recentIds: [],
  track: () => undefined,
});

function getLocalIds(): number[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as number[];
  } catch {}
  return [];
}

function setLocalIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const [localIds, setLocalIdsState] = useState<number[]>(() => getLocalIds());

  const { data: serverData } = useGetRecentlyViewed(
    { query: { queryKey: getGetRecentlyViewedQueryKey(), enabled: isAuthenticated } },
  );

  const trackMutation = useTrackRecentlyViewed();

  const track = useCallback(
    (productId: number) => {
      if (isAuthenticated) {
        trackMutation.mutate(
          { productId },
          {
            onSuccess: (data) => {
              queryClient.setQueryData(getGetRecentlyViewedQueryKey(), data);
            },
          },
        );
      } else {
        setLocalIdsState((prev) => {
          const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_LOCAL);
          setLocalIds(next);
          return next;
        });
      }
    },
    [isAuthenticated, trackMutation, queryClient],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalIdsState(getLocalIds());
    }
  }, [isAuthenticated]);

  const recentIds = isAuthenticated
    ? (serverData?.productIds ?? [])
    : localIds;

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, track }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
