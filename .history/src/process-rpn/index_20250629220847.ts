/*
 * @Author: maoyl maoyl@glodon.com
 * @Date: 2025-06-29 21:44:32
 * @LastEditors: maoyl maoyl@glodon.com
 * @LastEditTime: 2025-06-29 22:07:36
 * @FilePath: /VTableExcel/VTableExcel/src/process-rpn/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Express from './express'
import solve from './solve'

class RPN {
  // 字符串转换逆波兰表达式
  express (expr) {
    return new Express(expr)
  }

  // 逆波兰表达式 求值
  solve (expr) {
    return solve.evaluate(expr)
  }

  // 字符串表达式 求值
  calculate (expr) {
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
  putVariable ({ seqCode, value }) {
    solve.putVariable(seqCode, value)
  }

  getVariable () {
    return solve._variableMap
  }

  // 设置单元格数据
  setCellData(cellRef, value) {
    solve.setCellData(cellRef, value)
  }

  // 批量设置单元格数据
  setCellDataBatch(data) {
    solve.setCellDataBatch(data)
  }

  // 获取单元格数据
  getCellData() {
    return solve.getCellData()
  }

  // 清除单元格数据
  clearCellData() {
    solve.clearCellData()
  }
}

export default new RPN()
