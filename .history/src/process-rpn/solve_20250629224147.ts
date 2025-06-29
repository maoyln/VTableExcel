import { get, set } from 'lodash-es'
import operation, { NumericLike } from './operation'
import * as globalFunction from './global-func'
import { isCellReference, isRangeReference, generateCellRange, cellToReference } from './excel-utils'

type Token = {
  type: string;
  value: any;
  callee?: string[];
  args?: any[];
};

type VariableMap = Record<string, { value: unknown }>;
type CellDataMap = Record<string, unknown>;

type TypeHandleMap = {
  [key: string]: (data: any) => void;
};

class Solve {
  _variableMap: VariableMap;
  _cellData: CellDataMap;

  constructor() {
    this._variableMap = {};
    this._cellData = {}; // 存储单元格数据
    // 追加默认变量函数
    for (const v in globalFunction) {
      this.putVariable(...globalFunction[v]);
    }
  }

  transformOperator(left: { value: NumericLike }, right: { value: NumericLike }, data: { value: string }): number {
    const value = data.value;
    return operation?.[value](left?.value, right?.value);
  }

  // 获取单元格值
  getCellValue(cellRef: string): unknown {
    if (isCellReference(cellRef)) {
      return this._cellData[cellRef] || 0;
    }
    return cellRef;
  }

  // 获取范围值
  getRangeValues(rangeRef: string): number[] | string[] {
    if (isRangeReference(rangeRef)) {
      const cells = generateCellRange(rangeRef);
      const values: number[] = [];
      for (const cell of cells) {
        const cellRef = cellToReference(cell.col, cell.row);
        const value = this.getCellValue(cellRef);
        if (typeof value === 'number' || !isNaN(parseFloat(value as string))) {
          values.push(parseFloat(value as string));
        }
      }
      return values;
    }
    return [rangeRef];
  }

  evaluate(expr: Token[]): { value: unknown } {
    let left: any, right: any;
    const _s: any[] = [];
    const typeHandleMap: TypeHandleMap = {
      boolean: (data: any) => {
        _s.push(data);
      },
      string: (data: any) => {
        _s.push(data);
      },
      number: (data: any) => {
        _s.push(data);
      },
      operator: (data: any) => {
        right = _s.pop();
        left = _s.pop();
        const result = this.transformOperator(left, right, data);
        _s.push({ value: result });
      },
      identifier: ({ callee, args }: { callee: string[]; args: any[] }) => {
        const _path = [...callee];
        const _var = get(this._variableMap, _path);
        const _v = _var?.value;
        if (_var === undefined) {
          if (isCellReference(callee[0])) {
            const cellValue = this.getCellValue(callee[0]);
            _s.push({ value: cellValue });
          } else if (isRangeReference(callee[0])) {
            const rangeValues = this.getRangeValues(callee[0]);
            _s.push({ value: rangeValues });
          } else {
            _s.push({ value: callee?.[0] || callee || _var });
          }
        } else if (typeof _v === 'function') {
          const _args: any[] = [];
          for (let i = 0; i < args.length; i++) {
            const evaluatedArg = this.evaluate(args[i]);
            if (evaluatedArg?.value !== undefined) {
              _args.push(evaluatedArg.value);
            }
          }
          const processedArgs: any[] = [];
          for (const arg of _args) {
            if (Array.isArray(arg)) {
              processedArgs.push(...arg);
            } else {
              processedArgs.push(arg);
            }
          }
          try {
            const result = _v.apply(this, processedArgs);
            _s.push({ value: result });
          } catch (error) {
            console.error('函数执行错误:', error);
            _s.push({ value: 0 });
          }
        } else {
          _s.push(_var);
        }
      }
    };
    for (let i = 0; i < expr.length; i++) {
      const _expr = expr[i];
      if (typeHandleMap[_expr.type]) {
        typeHandleMap[_expr.type](_expr);
      } else {
        console.log('未找到处理函数:', _expr.type);
      }
    }
    if (_s.length === 1) {
      return _s.pop();
    } else if (_s.length > 1) {
      return _s[_s.length - 1];
    }
    return { value: undefined };
  }

  putVariable(key: string, data: unknown): void {
    set(this._variableMap, key, {
      value: data,
    });
  }

  // 设置单元格数据
  setCellData(cellRef: string, value: unknown): void {
    if (isCellReference(cellRef)) {
      this._cellData[cellRef] = value;
    }
  }

  // 批量设置单元格数据
  setCellDataBatch(data: Record<string, unknown>): void {
    for (const [cellRef, value] of Object.entries(data)) {
      this.setCellData(cellRef, value);
    }
  }

  // 获取所有单元格数据
  getCellData(): CellDataMap {
    return this._cellData;
  }

  // 清除单元格数据
  clearCellData(): void {
    this._cellData = {};
  }
}

export default new Solve()
