/*
 * @Author: maoyl maoyl@glodon.com
 * @Date: 2025-06-29 21:44:32
 * @LastEditors: maoyln maoyl_yx@163.com
 * @LastEditTime: 2025-06-29 22:36:06
 * @FilePath: /VTableExcel/VTableExcel/src/process-rpn/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Express from './express'
import solve from './solve'

class RPN {
  // 字符串转换逆波兰表达式
  express(expr: string): unknown {
    return new Express(expr)
  }

  // 逆波兰表达式 求值
  solve(expr: unknown): unknown {
    return solve.evaluate(expr)
  }

  // 字符串表达式 求值
  calculate(expr: string): unknown {
    try {
      const _expr = this.express(expr)
      // console.log("expr", _expr)
      // debugger
      return solve.evaluate(_expr)?.value
    } catch (e) {
      console.log(`表达式:${expr}, 计算出错.`)
      console.log(e)
    }
  }

  // 追加表达式中的变量
  putVariable({ seqCode, value }: { seqCode: string; value: unknown }): void {
    solve.putVariable(seqCode, value)
  }

  getVariable(): Record<string, unknown> {
    return solve._variableMap as Record<string, unknown>;
  }

  // 设置单元格数据
  setCellData(cellRef: string, value: unknown): void {
    solve.setCellData(cellRef, value)
  }

  // 批量设置单元格数据
  setCellDataBatch(data: Record<string, unknown>): void {
    solve.setCellDataBatch(data)
  }

  // 获取单元格数据
  getCellData(): unknown {
    return solve.getCellData()
  }

  // 清除单元格数据
  clearCellData(): void {
    solve.clearCellData()
  }
}

export default new RPN()
