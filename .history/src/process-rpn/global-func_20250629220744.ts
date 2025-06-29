/**
 * 全局函数
 */
// SUM函数 - 支持范围和单个单元格
export const sum = ['SUM', function (...args) {
  let total = 0
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      // 如果是数组，递归处理
      total += this.sum(...arg)
    } else if (typeof arg === 'number') {
      total += arg
    } else if (typeof arg === 'string') {
      // 如果是字符串，尝试解析为数字
      const num = parseFloat(arg)
      if (!isNaN(num)) {
        total += num
      }
    }
  }
  
  return total
}]

// AVERAGE函数 - 计算平均值
export const average = ['AVERAGE', function (...args) {
  const numbers = []
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...arg)
    } else if (typeof arg === 'number') {
      numbers.push(arg)
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }
  
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}]

// COUNT函数 - 计算数量
export const count = ['COUNT', function (...args) {
  let count = 0
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      count += this.count(...arg)
    } else if (arg !== null && arg !== undefined && arg !== '') {
      count++
    }
  }
  
  return count
}]

// MAX函数 - 计算最大值
export const max = ['MAX', function (...args) {
  const numbers = []
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...arg)
    } else if (typeof arg === 'number') {
      numbers.push(arg)
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }
  
  if (numbers.length === 0) return 0
  return Math.max(...numbers)
}]

// MIN函数 - 计算最小值
export const min = ['MIN', function (...args) {
  const numbers = []
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...arg)
    } else if (typeof arg === 'number') {
      numbers.push(arg)
    } else if (typeof arg === 'string') {
      const num = parseFloat(arg)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }
  
  if (numbers.length === 0) return 0
  return Math.min(...numbers)
}]

