// useUser.ts
"use client";
import { useEffect, useState } from 'react';
import { userCache } from './userCache';
import { userService } from './userService';
import { authService } from './api';
import type { UserData } from './schema';

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const cachedData = userCache.get();
    console.log('[useUser] Initial state:', {
      hasCachedData: !!cachedData,
      userId: cachedData?.user_id,
      userName: cachedData?.personal_details?.full_name
    });
    return cachedData;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('[useUser] Effect running');

    // Check if user is authenticated
    const hasToken = authService.getAccessToken();
    console.log('[useUser] Authentication check:', { hasToken });

    if (!hasToken) {
      console.log('[useUser] No token found, clearing user data');
      setUserData(null);
      return;
    }

    // Subscribe to cache changes
    const unsubscribe = userCache.subscribe((data) => {
      console.log('[useUser] Cache updated via subscription:', {
        hasData: !!data,
        userId: data?.user_id,
        userName: data?.personal_details?.full_name,
        source: 'cache subscription'
      });
      setUserData(data);
    });

    // Check cache status
    const hasCachedData = userCache.hasData();
    const isFetching = userCache.isFetchingData();

    console.log('[useUser] Cache status:', {
      hasCachedData,
      isFetching,
      willFetch: !hasCachedData && !isFetching
    });

    // Fetch if no cached data
    if (!hasCachedData && !isFetching) {
      console.log('[useUser] No cached data found, fetching from API...');
      setIsLoading(true);
      userService
        .fetchAndCacheUserData()
        .then(() => {
          console.log('[useUser] Data fetched and cached successfully');
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('[useUser] Failed to fetch user data:', error);
          setIsLoading(false);
        });
    } else if (hasCachedData) {
      console.log('[useUser] ✅ Using cached data - no API call needed');
    }

    return () => {
      console.log('[useUser] Cleaning up subscription');
      unsubscribe();
    };
  }, []);

  const refetch = async () => {
    console.log('[useUser] Manual refetch requested');
    setIsLoading(true);
    try {
      await userService.invalidateAndRefetch();
      console.log('[useUser] Refetch completed successfully');
    } catch (error) {
      console.error('[useUser] Refetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Log whenever userData changes
  useEffect(() => {
    console.log('[useUser] Current userData state:', {
      hasData: !!userData,
      userId: userData?.user_id,
      userName: userData?.personal_details?.full_name,
      isLoading
    });
  }, [userData, isLoading]);

  return {
    user: userData,
    isLoading,
    refetch,
  };
};
