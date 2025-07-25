/**
 * 单元格公式处理器 - 只处理单个单元格，不处理整个数据源
 */
import RPN from "./index";
import type { RecordType } from "../types/type";

// 从records中提取指定单元格的值

function getCellValueFromRecords(
  records: RecordType[],
  cellRef: string,
  excelColToField: Record<string, string> = {}
): string | number {
  // console.log(records, 'records');
  // console.log(cellRef, 'cellRef');
  // console.log(excelColToField, 'excelColToField');
  /**
   * 这段代码使用 正则表达式 来解析类似 "A1"、"B23"、"AA42" 这样的 单元格引用字符串（常见于 Excel 或表格计算场景），将其拆分为：
   * 字母部分（列名，如 "A", "B", "AA"）
   * 数字部分（行号，如 "1", "23", "42"）
   */
  const match = cellRef.match(/^([A-Z]+)(\d+)$/i);
  /**
   * B42返回值类似于：
   * [
   *  "B42",       // 完整匹配的字符串
   *  "B",        // 捕获组1（字母部分）
   *  "42",        // 捕获组2（数字部分）
   *  index: 0,   // 匹配开始的索引
   *  input: "B42" // 原始输入字符串
   * ]
   */
  // console.log(match, 'match');
  if (!match) return 0;

  const col = match[1].toUpperCase(); // 列名
  const row = parseInt(match[2]); // 行号

  const record = records[row - 1]; // 数组索引从0开始
  if (!record) return 0;

  const field = excelColToField[col] || col;
  return record[field] ?? 0;
}

// 更高效的版本：只提取公式中引用的单元格
/**
 * Excel 公式计算工具（支持区域引用展开）
 */

// ==================== 辅助函数 ====================

/**
 * 将列字母转换为数字 (A=0, B=1, ..., AA=26, etc.)
 */
function columnToNumber(col: string): number {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num - 1; // 转为0-based
}

/**
 * 将数字转换为列字母 (0=A, 1=B, ..., 26=AA, etc.)
 */
function numberToColumn(num: number): string {
  let col = "";
  num += 1; // 转为1-based
  while (num > 0) {
    const remainder = (num - 1) % 26;
    col = String.fromCharCode(65 + remainder) + col;
    num = Math.floor((num - 1) / 26);
  }
  return col;
}

/**
 * 展开区域引用为单个单元格引用数组
 * 例如：A1:B2 → ["A1", "A2", "B1", "B2"]
 */
function expandRange(startRef: string, endRef: string): string[] {
  const startColMatch = startRef.match(/[A-Z]+/);
  const startRowMatch = startRef.match(/\d+/);
  const endColMatch = endRef.match(/[A-Z]+/);
  const endRowMatch = endRef.match(/\d+/);
  if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch)
    return [];
  const startCol = startColMatch[0];
  const startRow = parseInt(startRowMatch[0]);
  const endCol = endColMatch[0];
  const endRow = parseInt(endRowMatch[0]);
  const startColNum = columnToNumber(startCol);
  const endColNum = columnToNumber(endCol);
  // console.log(startColNum, 'startColNum');
  // console.log(endColNum, 'endColNum');
  const expanded: string[] = [];
  for (let colNum = startColNum; colNum <= endColNum; colNum++) {
    // console.log(colNum, 'colNum');
    const colLetter = numberToColumn(colNum);
    // console.log(colLetter, 'colLetter');

    for (let row = startRow; row <= endRow; row++) {
      expanded.push(`${colLetter}${row}`);
    }
  }
  console.log(expanded, 'expanded');
  return expanded;
}

/**
 * 优化后的公式计算函数
 * @param {Array} records - 数据记录数组
 * @param {string} formula - 要计算的公式（如 "=SUM(A1:B2)"）
 * @param {Object} excelColToField - 列名映射
 * @returns {any} 计算结果或原始公式（如果计算失败）
 */
export function calculateCellFormulaOptimized(
  records: RecordType[],
  formula: string,
  excelColToField: Record<string, string> = {}
): string | number {
  if (!formula.startsWith("=")) {
    return formula;
  }

  try {
    // 1. 提取所有单元格引用（包括区域引用和单个引用）
    const refMatches =
      formula.match(/([A-Z]+\d+:[A-Z]+\d+)|([A-Z]+\d+)/gi) || [];

    // 2. 展开所有引用为单个单元格引用
    const allCellRefs = refMatches.flatMap((ref) => {
      if (ref.includes(":")) {
        const [startRef, endRef] = ref.split(":");
        return expandRange(startRef, endRef);
      }
      return ref;
    });

    // 3. 去重并获取每个单元格的值
    const uniqueCellRefs = [...new Set(allCellRefs)];
    // console.log(uniqueCellRefs, 'uniqueCellRefs');
    const cellData: Record<string, string | number> = {};

    uniqueCellRefs.forEach((cellRef) => {
      cellData[cellRef] = getCellValueFromRecords(
        records,
        cellRef,
        excelColToField
      );
      // console.log(cellData[cellRef], 'cellData[cellRef]');
    });

    // console.log(cellData, 'cellData');

    // 4. 设置到RPN计算器并计算
    RPN.setCellDataBatch(cellData); // 批量设置单元格数据（保存到RPN类似于map对象中）
    const result = RPN.calculate(formula.slice(1)); // 去掉开头的 "=" 符号，进行计算
    // console.log(formula.slice(1), 'formula.slice(1)');
    // console.log(result, 'result');

    return result as string | number;
  } catch (error) {
    console.error("公式计算错误:", error);
    return formula;
  }
}
