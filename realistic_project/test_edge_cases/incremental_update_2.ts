// 测试增量更新2 - 修改现有文件
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

export class SimpleCache<T = any> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL = 3600000;
  
  set(key: string, value: T, ttl?: number): void {
    this.store.set(key, {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }
  
  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    
    const now = Date.now();
    if (entry.ttl && (now - entry.timestamp) > entry.ttl) {
      this.store.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: string): boolean {
    return this.store.delete(key);
  }
  
  clear(): void {
    this.store.clear();
  }
  
  size(): number {
    return this.store.size;
  }
  
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.ttl && (now - entry.timestamp) > entry.ttl) {
        this.store.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
  
  keys(): string[] {
    return Array.from(this.store.keys());
  }
  
  values(): T[] {
    return this.keys()
      .map(key => this.get(key))
      .filter((v): v is T => v !== undefined);
  }
}
