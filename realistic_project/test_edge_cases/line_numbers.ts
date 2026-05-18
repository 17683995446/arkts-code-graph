// 测试单行和多行class
export class SingleLineClass { value = 1; }
export class MultiLineClass { 
  value = 1;
  method() { return this.value; }
}
export interface SingleLineInterface { name: string; }
export interface MultiLineInterface { 
  name: string;
  age: number;
}
export const singleLineFn = () => 1;
export function multiLineFn() {
  return 1;
}
