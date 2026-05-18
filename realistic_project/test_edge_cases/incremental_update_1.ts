// 测试增量更新1 - 添加新类
export class NewTestService {
  private data: Map<string, any> = new Map();
  
  set(key: string, value: any): void {
    this.data.set(key, value);
  }
  
  get(key: string): any {
    return this.data.get(key);
  }
  
  delete(key: string): boolean {
    return this.data.delete(key);
  }
  
  has(key: string): boolean {
    return this.data.has(key);
  }
  
  clear(): void {
    this.data.clear();
  }
  
  size(): number {
    return this.data.size;
  }
  
  keys(): IterableIterator<string> {
    return this.data.keys();
  }
  
  values(): IterableIterator<any> {
    return this.data.values();
  }
  
  entries(): IterableIterator<[string, any]> {
    return this.data.entries();
  }
}
