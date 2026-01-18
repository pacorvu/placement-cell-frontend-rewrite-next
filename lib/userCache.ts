// userCache.ts
import type { UserData } from './schema'; // Adjust the path to your schema file

class UserCache {
  private userData: UserData | null = null;
  private isFetching = false;
  private listeners: Set<(data: UserData | null) => void> = new Set();

  get(): UserData | null {
    return this.userData;
  }

  set(data: UserData | null): void {
    this.userData = data;
    this.notifyListeners();
  }

  hasData(): boolean {
    return this.userData !== null;
  }

  clear(): void {
    this.userData = null;
    this.notifyListeners();
  }

  subscribe(listener: (data: UserData | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.userData));
  }

  setFetching(fetching: boolean): void {
    this.isFetching = fetching;
  }

  isFetchingData(): boolean {
    return this.isFetching;
  }
}

export const userCache = new UserCache();
