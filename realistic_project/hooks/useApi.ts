import { EventEmitter } from '../utils/helpers';

type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;
type SyncFunction<T = any> = (...args: any[]) => T;

function retry(maxAttempts: number = 3, delay: number = 1000) {
  return function<T extends AsyncFunction>(target: T, context: ClassMethodDecoratorContext): T {
    return async function(this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await target.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
          }
        }
      }

      throw lastError!;
    } as T;
  };
}

function memoize<T extends SyncFunction>(target: T, context: ClassMethodDecoratorContext): T {
  const cache = new Map<string, ReturnType<T>>();

  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = target.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

function log(target: any, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`[LOG] Calling ${methodName} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`[LOG] ${methodName} returned:`, result);
    return result;
  };

  return descriptor;
}

function validate(target: any, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const validationRules = (this as any).validationRules?.[methodName];

    if (validationRules) {
      for (const rule of validationRules) {
        const isValid = rule.validate(...args);
        if (!isValid) {
          throw new Error(rule.message);
        }
      }
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private eventEmitter: EventEmitter<any>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.eventEmitter = new EventEmitter();
  }

  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.headers
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  @retry(3, 1000)
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  @retry(3, 1000)
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  @retry(3, 1000)
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  @retry(3, 1000)
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  on(event: string, listener: Function): void {
    this.eventEmitter.on(event as any, listener);
  }

  off(event: string, listener: Function): void {
    this.eventEmitter.off(event as any, listener);
  }
}

export class CacheManager<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();

  set(key: string, value: T, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export { retry, memoize, log, validate };
