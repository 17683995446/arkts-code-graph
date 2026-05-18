// 边界条件测试 - 特殊字符和Unicode
export const EMOJI_CONSTANT = "🚀 测试emoji";
export const UNICODE_CONSTANT = "中文测试 КИРИЛЛИЦΑ Greek Ωmega";
export const SPECIAL_CHARS = `反引号字符串 with 'single' and "double" quotes`;
export const REGEX_LITERAL = /pattern\d{3,}/gi;
export const TEMPLATE_LITERAL = `Hello ${'World'} with ${123} numbers`;

export class SpecialCharsClass {
  private "带空格的属性" = "value";
  private '单引号属性' = 'value2';
  
  methodWithSpecialParams(param1: string, param2: number): void {
    console.log(`param1=${param1}, param2=${param2}`);
  }
}
