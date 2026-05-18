// 边界条件测试 - 命名空间和模块
export namespace Validation {
  export interface Rule<T = any> {
    validate(value: T): boolean;
    message?: string;
  }

  export class RequiredRule implements Rule {
    validate(value: any): boolean {
      return value !== null && value !== undefined && value !== '';
    }
    message = 'This field is required';
  }

  export class MinLengthRule implements Rule<string> {
    constructor(private minLength: number) {}
    validate(value: string): boolean {
      return value && value.length >= this.minLength;
    }
    message = `Minimum length is ${this.minLength}`;
  }

  export class EmailRule implements Rule<string> {
    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validate(value: string): boolean {
      return this.emailRegex.test(value);
    }
    message = 'Invalid email format';
  }

  export class Validator<T> {
    private rules: Rule<T>[] = [];

    addRule(rule: Rule<T>): this {
      this.rules.push(rule);
      return this;
    }

    validate(value: T): { valid: boolean; errors: string[] } {
      const errors = this.rules
        .filter(rule => !rule.validate(value))
        .map(rule => rule.message || 'Validation failed');
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  }
}

export namespace Database {
  export interface Connection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string): Promise<any[]>;
  }

  export class MySQLConnection implements Connection {
    async connect(): Promise<void> {
      console.log('Connecting to MySQL...');
    }
    async disconnect(): Promise<void> {
      console.log('Disconnecting from MySQL...');
    }
    async query(sql: string): Promise<any[]> {
      return [];
    }
  }

  export class PostgreSQLConnection implements Connection {
    async connect(): Promise<void> {
      console.log('Connecting to PostgreSQL...');
    }
    async disconnect(): Promise<void> {
      console.log('Disconnecting from PostgreSQL...');
    }
    async query(sql: string): Promise<any[]> {
      return [];
    }
  }
}

export namespace MathUtils {
  export function add(a: number, b: number): number {
    return a + b;
  }

  export function subtract(a: number, b: number): number {
    return a - b;
  }

  export function multiply(a: number, b: number): number {
    return a * b;
  }

  export function divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }

  export const PI = 3.14159;
  export const E = 2.71828;
}
