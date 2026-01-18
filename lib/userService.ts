// userService.ts
import { api, authService } from './api';
import { userCache } from './userCache';
import { requestSchema, type UserData } from './schema';

export const userService = {
  async fetchAndCacheUserData(): Promise<UserData | null> {
    if (userCache.isFetchingData()) {
      return userCache.get();
    }

    // Get user_id from localStorage
    const userId = authService.getUserId();

    if (!userId) {
      console.error('No user_id found in localStorage');
      throw new Error('User not authenticated');
    }

    try {
      userCache.setFetching(true);
      const response = await api.get(`/student/user/${userId}`);

      // Validate the response data against the schema
      const validatedData = requestSchema.parse(response.data);

      userCache.set(validatedData);
      return validatedData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    } finally {
      userCache.setFetching(false);
    }
  },

  getCachedUserData(): UserData | null {
    return userCache.get();
  },

  async invalidateAndRefetch(): Promise<UserData | null> {
    userCache.clear();
    return this.fetchAndCacheUserData();
  },

  clearUserCache(): void {
    userCache.clear();
  },
};
