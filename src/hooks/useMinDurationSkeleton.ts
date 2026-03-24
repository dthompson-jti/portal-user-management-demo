import { useState, useEffect, useRef } from 'react';

/**
 * Ensures a skeleton loading state is shown for at least `minDurationMs`.
 * Prevents skeleton from flashing too briefly on fast loads.
 *
 * - When `isLoading` goes true: immediately shows skeleton and records start time.
 * - When `isLoading` goes false: waits for remaining min duration before hiding.
 * - If `isLoading` re-activates during the wait, the timer is cancelled and restarted.
 *
 * @param isLoading  The real loading state from your data fetch.
 * @param minDurationMs  Minimum ms to keep skeleton visible. Pass 0 for no minimum.
 */
export function useMinDurationSkeleton(isLoading: boolean, minDurationMs: number): boolean {
    const [showSkeleton, setShowSkeleton] = useState(isLoading);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadStartRef = useRef<number | null>(null);

    useEffect(() => {
        // Cancel any pending hide timer
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isLoading) {
            loadStartRef.current = Date.now();
            setShowSkeleton(true);
        } else {
            if (loadStartRef.current === null) {
                // Was never loading — stay hidden
                setShowSkeleton(false);
                return;
            }

            const elapsed = Date.now() - loadStartRef.current;
            const remaining = minDurationMs - elapsed;

            if (remaining <= 0) {
                // Min duration already elapsed — hide immediately
                setShowSkeleton(false);
                loadStartRef.current = null;
            } else {
                // Wait for the remainder of min duration, then hide
                timerRef.current = setTimeout(() => {
                    setShowSkeleton(false);
                    loadStartRef.current = null;
                    timerRef.current = null;
                }, remaining);
            }
        }

        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isLoading, minDurationMs]);

    return showSkeleton;
}
