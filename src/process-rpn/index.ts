import Express from "./express";
import solve from "./solve";
import type { Token } from "./solve";

// 类型扩展，声明 solve._variableMap
interface SolveWithVariableMap {
  _variableMap: Record<string, unknown>;
  [key: string]: unknown;
}

class RPN {
  // 字符串转换逆波兰表达式
  express(expr: string): unknown {
    return new Express(expr);
  }

  // 逆波兰表达式 求值
  solve(expr: unknown): unknown {
    return solve.evaluate(expr as Token[]);
  }

  // 字符串表达式 求值
  calculate(expr: string): unknown {
    try {
      const _expr = this.express(expr);
      console.log("expr", _expr)
      // debugger
      return (solve.evaluate(_expr as Token[]) as { value: string })?.value;
    } catch (e) {
      console.log(`表达式:${expr}, 计算出错.`);
      console.log(e);
    }
  }

  // 追加表达式中的变量
  putVariable({ seqCode, value }: { seqCode: string; value: unknown }): void {
    solve.putVariable(seqCode, value);
  }

  getVariable(): Record<string, unknown> {
    return (solve as unknown as SolveWithVariableMap)._variableMap;
  }

  // 设置单元格数据
  setCellData(cellRef: string, value: unknown): void {
    solve.setCellData(cellRef, value);
  }

  // 批量设置单元格数据
  setCellDataBatch(data: Record<string, unknown>): void {
    solve.setCellDataBatch(data);
  }

  // 获取单元格数据
  getCellData(): unknown {
    return solve.getCellData();
  }

  // 清除单元格数据
  clearCellData(): void {
    solve.clearCellData();
  }
}

export default new RPN();
