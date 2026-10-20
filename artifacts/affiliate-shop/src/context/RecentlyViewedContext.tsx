import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import {
  useGetRecentlyViewed,
  getGetRecentlyViewedQueryKey,
  useTrackRecentlyViewed,
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
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const recentlyViewedQueryKey = useMemo(
    () => [...getGetRecentlyViewedQueryKey(), userId ?? "anonymous"],
    [userId],
  );
  const previousUserId = useRef(userId);

  const [localIds, setLocalIdsState] = useState<number[]>(() => getLocalIds());

  const { data: serverData } = useGetRecentlyViewed(
    { query: { queryKey: recentlyViewedQueryKey, enabled: isAuthenticated } },
  );

  const trackMutation = useTrackRecentlyViewed();

  useEffect(() => {
    const previousId = previousUserId.current;
    if (previousId && previousId !== userId) {
      const previousQueryKey = [...getGetRecentlyViewedQueryKey(), previousId];
      void queryClient.cancelQueries({ queryKey: previousQueryKey, exact: true });
      queryClient.removeQueries({ queryKey: previousQueryKey, exact: true });
    }
    previousUserId.current = userId;
  }, [userId, queryClient]);

  const track = useCallback(
    (productId: number) => {
      if (isAuthenticated) {
        trackMutation.mutate(
          { productId },
          {
            onSuccess: (data) => {
              queryClient.setQueryData(recentlyViewedQueryKey, data);
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
    [isAuthenticated, trackMutation, queryClient, recentlyViewedQueryKey],
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
