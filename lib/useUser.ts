// useUser.ts
"use client";
import { useEffect, useState } from 'react';
import { userCache } from './userCache';
import { userService } from './userService';
import { authService } from './api';
import type { UserData } from './schema';

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(userCache.get());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const hasToken = authService.getAccessToken();

    if (!hasToken) {
      setUserData(null);
      return;
    }

    // Subscribe to cache changes
    const unsubscribe = userCache.subscribe((data) => {
      setUserData(data);
    });

    // Fetch if no cached data
    if (!userCache.hasData() && !userCache.isFetchingData()) {
      setIsLoading(true);
      userService
        .fetchAndCacheUserData()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }

    return unsubscribe;
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      await userService.invalidateAndRefetch();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: userData,
    isLoading,
    refetch,
  };
};
