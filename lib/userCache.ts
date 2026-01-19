// userCache.ts
import type { UserData } from './schema';

class UserCache {
  private userData: UserData | null = null;
  private isFetching = false;
  private listeners: Set<(data: UserData | null) => void> = new Set();

  get(): UserData | null {
    console.log('[UserCache] get() called:', {
      hasData: !!this.userData,
      userId: this.userData?.user_id
    });
    return this.userData;
  }

  set(data: UserData | null): void {
    console.log('[UserCache] set() called:', {
      hasData: !!data,
      userId: data?.user_id,
      userName: data?.personal_details?.full_name,
      listenersCount: this.listeners.size
    });
    this.userData = data;
    this.notifyListeners();
  }

  hasData(): boolean {
    const has = this.userData !== null;
    console.log('[UserCache] hasData() check:', has);
    return has;
  }

  clear(): void {
    console.log('[UserCache] clear() called - removing cached data');
    this.userData = null;
    this.notifyListeners();
  }

  subscribe(listener: (data: UserData | null) => void): () => void {
    this.listeners.add(listener);
    console.log('[UserCache] New subscriber added. Total listeners:', this.listeners.size);

    return () => {
      this.listeners.delete(listener);
      console.log('[UserCache] Subscriber removed. Total listeners:', this.listeners.size);
    };
  }

  private notifyListeners(): void {
    console.log('[UserCache] Notifying listeners:', {
      count: this.listeners.size,
      hasData: !!this.userData
    });
    this.listeners.forEach((listener) => listener(this.userData));
  }

  setFetching(fetching: boolean): void {
    console.log('[UserCache] setFetching():', fetching);
    this.isFetching = fetching;
  }

  isFetchingData(): boolean {
    console.log('[UserCache] isFetchingData() check:', this.isFetching);
    return this.isFetching;
  }
}

export const userCache = new UserCache();
