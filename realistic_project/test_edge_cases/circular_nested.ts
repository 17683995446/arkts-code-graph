// 边界条件测试 - 多层嵌套和循环依赖
import { AClass } from './nested/level_a';
import { BClass } from './nested/level_b';

export class CircularA {
  private b: BClass | null = null;
  
  setB(b: BClass): void {
    this.b = b;
  }
  
  getInfo(): string {
    return 'Class A';
  }
  
  callB(): string {
    return this.b ? this.b.getInfo() : 'B not set';
  }
}

export class CircularB {
  private a: CircularA | null = null;
  
  setA(a: CircularA): void {
    this.a = a;
  }
  
  getInfo(): string {
    return 'Class B';
  }
  
  callA(): string {
    return this.a ? this.a.getInfo() : 'A not set';
  }
}

export interface NestedInterface {
  level: number;
  children?: NestedInterface[];
  callback?: () => NestedInterface;
}

export class DeepNestedClass {
  private level1 = {
    level2: {
      level3: {
        level4: {
          level5: {
            data: 'deep',
            getData: (): string => 'very deep'
          }
        }
      }
    }
  };

  getDeepValue(): string {
    return this.level1.level2.level3.level4.level5.data;
  }
}

export type DeepNestedType = {
  a: {
    b: {
      c: {
        d: {
          e: {
            value: number;
          };
        };
      };
    };
  };
};

export const NESTED_OBJECT = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            value: 42
          }
        }
      }
    }
  }
};
