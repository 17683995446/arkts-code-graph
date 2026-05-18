// 测试复杂的三元运算符和条件表达式
export const isActive = true;
export const userName = isActive ? "Active User" : "Inactive User";
export const greeting = userName ? `Hello, ${userName}!` : "Welcome!";
export const count = 10;
export const status = count > 5 ? (count > 10 ? "High" : "Medium") : "Low";
export const items = [1, 2, 3];
export const hasItems = items.length > 0 ? items[0] : null;
export const map = new Map<string, number>();
export const value = map.get("key") ?? "default";
export const result = value === "default" ? "was default" : value;
