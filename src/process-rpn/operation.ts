import Big from "big.js";

// 操作数类型
export type NumericLike = number | string | Big;

// 计算结果的最大长度
const MAX_DP = 14;
// 除法除不尽时保留的小数位数
Big.DP = MAX_DP;
// 整数最大位数 超过则用指数表示
Big.PE = 60;
// +
export const plus = (a: NumericLike, b: NumericLike): number =>
  Number(new Big(a).plus(b).toString());
// -
export const minus = (a: NumericLike, b: NumericLike): number =>
  Number(new Big(a).minus(b).toString());
// *
export const times = (a: NumericLike, b: NumericLike): number =>
  Number(new Big(a).times(b).toString());
// /
export const divide = (a: NumericLike, b: NumericLike): number => {
  const _value = new Big(a).div(b).toString();
  // b=0
  if (_value === "Infinity") {
    throw new Error("Infinity");
  }
  return Number(_value);
};

// 操作符map
const operation: Record<string, (a: NumericLike, b: NumericLike) => number> = {
  "+": plus,
  "-": minus,
  "*": times,
  x: times,
  "÷": divide,
  "/": divide,
};

export default operation;
