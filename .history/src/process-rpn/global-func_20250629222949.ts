/*
 * @Author: maoyln maoyl_yx@163.com
 * @Date: 2025-06-29 21:44:42
 * @LastEditors: maoyln maoyl_yx@163.com
 * @LastEditTime: 2025-06-29 22:29:27
 * @FilePath: /VTableExcel/src/process-rpn/global-func.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 全局函数
 */
type Func = (...args: (number | string | (number | string | unknown[])[])[]) => number;

type GlobalFuncThis = Record<string, unknown>;

export const sum: [string, Func] = ['SUM', function (this: GlobalFuncThis, ...args: (number | string | (number | string | unknown[])[])[]): number {
  let total = 0;
  for (const arg of args) {
    if (Array.isArray(arg)) {
      // 如果是数组，递归处理
      total += this.sum(...arg);
    } else if (typeof arg === 'number') {
      total += arg;
    } else if (typeof arg === 'string') {
      // 如果是字符串，尝试解析为数字
      const num = parseFloat(arg);
      if (!isNaN(num)) {
        total += num;
      }
    }
  }
  return total;
}];

export const average: [string, Func] = ['AVERAGE', function (this: GlobalFuncThis, ...args: (number | string | (number | string | unknown[])[])[]): number {
  const numbers: number[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...(arg as number[]));
    } else if (typeof arg === 'number') {
      numbers.push(arg);
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}];

export const count: [string, Func] = ['COUNT', function (this: GlobalFuncThis, ...args: (number | string | (number | string | unknown[])[])[]): number {
  let count = 0;
  for (const arg of args) {
    if (Array.isArray(arg)) {
      count += this.count(...arg);
    } else if (arg !== null && arg !== undefined && arg !== '') {
      count++;
    }
  }
  return count;
}];

export const max: [string, Func] = ['MAX', function (this: GlobalFuncThis, ...args: (number | string | (number | string | unknown[])[])[]): number {
  const numbers: number[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...(arg as number[]));
    } else if (typeof arg === 'number') {
      numbers.push(arg);
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}];

export const min: [string, Func] = ['MIN', function (this: GlobalFuncThis, ...args: (number | string | (number | string | unknown[])[])[]): number {
  const numbers: number[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...(arg as number[]));
    } else if (typeof arg === 'number') {
      numbers.push(arg);
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
}];

