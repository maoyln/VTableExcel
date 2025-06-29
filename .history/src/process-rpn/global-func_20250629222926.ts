/**
 * 全局函数
 */
type Func = (...args: (number | string | any[])[]) => number;

export const sum: [string, Func] = ['SUM', function (...args: (number | string | any[])[]): number {
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

export const average: [string, Func] = ['AVERAGE', function (...args: (number | string | any[])[]): number {
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

export const count: [string, Func] = ['COUNT', function (...args: (number | string | any[])[]): number {
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

export const max: [string, Func] = ['MAX', function (...args: (number | string | any[])[]): number {
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

export const min: [string, Func] = ['MIN', function (...args: (number | string | any[])[]): number {
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

