import { get, set } from 'lodash-es'
import operation from './operation'
import * as globalFunction from './global-func'
import { isCellReference, isRangeReference, generateCellRange, cellToReference } from './excel-utils'

class Solve {
  constructor () {
    this._variableMap = {}
    this._cellData = {} // 存储单元格数据
    // 追加默认变量函数
    for (const v in globalFunction) {
      this.putVariable(...globalFunction[v])
    }
  }

  transformOperator (left, right, data) {
    const value = data.value
    return operation?.[value](left?.value, right?.value)
  }

  // 获取单元格值
  getCellValue(cellRef) {
    if (isCellReference(cellRef)) {
      return this._cellData[cellRef] || 0
    }
    return cellRef
  }

  // 获取范围值
  getRangeValues(rangeRef) {
    if (isRangeReference(rangeRef)) {
      const cells = generateCellRange(rangeRef)
      const values = []
      
      for (const cell of cells) {
        const cellRef = cellToReference(cell.col, cell.row)
        const value = this.getCellValue(cellRef)
        if (typeof value === 'number' || !isNaN(parseFloat(value))) {
          values.push(parseFloat(value))
        }
      }
      
      return values
    }
    return [rangeRef]
  }

  evaluate (expr) {
    let left, right
    const _s = []
    const typeHandleMap = {
      boolean: (data) => {
        // console.log('处理boolean:', data)
        _s.push(data)
      },
      string: (data) => {
        // console.log('处理string:', data)
        _s.push(data)
      },
      number: (data) => {
        // console.log('处理number:', data)
        _s.push(data)
      },
      operator: (data) => {
        right = _s.pop()
        left = _s.pop()
        // console.log('操作符:', data.value, '左操作数:', left?.value, '右操作数:', right?.value)
        const result = this.transformOperator(left, right, data)
        // console.log('操作结果:', result)
        _s.push({
          value: result
        })
      },
      identifier: ({ callee, args }) => {
        // console.log('处理identifier:', callee, args)
        const _path = [...callee]
        const _var = get(this._variableMap, _path)
        const _v = _var?.value
        
        if (_var === undefined) {
          // console.log(JSON.stringify(this._variableMap) , 'this._variableMap');
          // console.log(JSON.stringify(this._cellData), 'this._cellData');
          // 检查是否为单元格引用
          if (isCellReference(callee[0])) {
            const cellValue = this.getCellValue(callee[0])
            // console.log('单元格引用:', callee[0], '值:', cellValue)
            _s.push({ value: cellValue })
          } else if (isRangeReference(callee[0])) {
            // 范围引用，返回数组
            const rangeValues = this.getRangeValues(callee[0])
            // console.log('范围引用:', callee[0], '值:', rangeValues)
            _s.push({ value: rangeValues })
          } else {
            // 常量处理
            _s.push({ value: callee?.[0] || callee || _var })
          }
        } else if (typeof _v === 'function') {
          // 函数处理
          // console.log('函数调用:', callee[0], '参数:', args)
          const _args = []
          for (let i = 0; i < args.length; i++) {
            const evaluatedArg = this.evaluate(args[i])
            if (evaluatedArg?.value !== undefined) {
              _args.push(evaluatedArg.value)
            }
          }
          
          // 处理函数参数中的范围引用
          const processedArgs = []
          for (const arg of _args) {
            if (Array.isArray(arg)) {
              processedArgs.push(...arg)
            } else {
              processedArgs.push(arg)
            }
          }
          
          try {
            const result = _v.apply(this, processedArgs)
            // console.log('函数结果:', result)
            _s.push({ value: result })
          } catch (error) {
            console.error('函数执行错误:', error)
            _s.push({ value: 0 })
          }
        } else {
          // 默认对象或者变量
          _s.push(_var)
        }
      }
    }

    // console.log('开始计算表达式，长度:', expr.length)
    for (let i = 0; i < expr.length; i++) {
      const _expr = expr[i]
      // console.log(`处理第${i}个token:`, _expr.type, _expr.value)
      if (typeHandleMap[_expr.type]) {
        typeHandleMap[_expr.type](_expr)
      } else {
        console.log('未找到处理函数:', _expr.type)
      }
    }

    // console.log('最终栈:', _s)
    if (_s.length === 1) {
      return _s.pop()
    } else if (_s.length > 1) {
      // 兜底：返回栈顶
      return _s[_s.length - 1]
    }
    return { value: undefined }
  }

  putVariable (key, data) {
    set(this._variableMap, key, {
      value: data,
    })
  }

  // 设置单元格数据
  setCellData(cellRef, value) {
    if (isCellReference(cellRef)) {
      this._cellData[cellRef] = value
    }
  }

  // 批量设置单元格数据
  setCellDataBatch(data) {
    for (const [cellRef, value] of Object.entries(data)) {
      this.setCellData(cellRef, value)
    }
  }

  // 获取所有单元格数据
  getCellData() {
    return this._cellData
  }

  // 清除单元格数据
  clearCellData() {
    this._cellData = {}
  }
}

export default new Solve()
