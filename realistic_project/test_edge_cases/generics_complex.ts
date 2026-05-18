// 边界条件测试 - 复杂泛型和类型系统
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
export type Dictionary<T> = { [key: string]: T };
export type Pair<K, V> = { key: K; value: V };

export interface Container<T extends { id: string | number }, V = unknown> {
  items: T[];
  metadata?: V;
  addItem(item: T): void;
  getItem(id: T['id']): T | undefined;
}

export class GenericRepository<T extends { id: string | number }> implements Container<T> {
  private items: T[] = [];
  public metadata?: Record<string, unknown>;

  constructor(private readonly storage: Map<string, T>) {
    this.storage = new Map();
  }

  addItem(item: T): void {
    this.items.push(item);
  }

  getItem(id: string | number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): readonly T[] {
    return [...this.items];
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.items.map(fn);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  reduce<U>(fn: (acc: U, item: T) => U, initial: U): U {
    return this.items.reduce(fn, initial);
  }
}

// 复杂嵌套泛型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 条件类型
export type NonNullable<T> = T extends null | undefined ? never : T;

export type Flatten<T> = T extends Array<infer U> ? U : T;
export type FlattenDepth<T, D extends number> = D extends 0 ? T : T extends Array<infer U> 
  ? FlattenDepth<U, [-1, 0, 1, 2, 3, 4, 5][D]> 
  : T;
