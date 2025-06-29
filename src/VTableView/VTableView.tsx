/*
 * @Author: maoyl maoyl@glodon.com
 * @Date: 2025-06-29 11:22:47
 * @LastEditors: maoyl maoyl@glodon.com
 * @LastEditTime: 2025-06-29 21:46:26
 * @FilePath: /归档/src/VTableView/VTableView.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import React, { useEffect, useRef } from 'react';
import * as VTable from '@visactor/vtable';
import { calculateCellFormulaOptimized } from '../process-rpn/cell-formula-handler';

export interface Column {
  title: string;
  field: string;
  editor?: string;
  width?: number;
}

export interface VTableViewProps {
  records: Record<string, unknown>[];
  columns: Column[];
  width?: number;
  height?: number;
}

type TableRefType = HTMLDivElement & { vtableInstance?: VTable.ListTable };

const VTableView: React.FC<VTableViewProps> = ({ records, columns, width = 600, height = 400 }) => {
  const tableRef = useRef<TableRefType | null>(null);

  useEffect(() => {
    if (!tableRef.current) return;
    if (tableRef.current.vtableInstance) {
      tableRef.current.vtableInstance.release();
    }
    const option = {
      records,
      columns,
      widthMode: 'standard',
      height,
      width,
      customRender: (args: { value: string; [key: string]: any }) => {
        if (args.value?.startsWith?.('=')) {
          try {
            const result = calculateCellFormulaOptimized(records, args.value);
            return {
              elements: [
                {
                  type: 'text',
                  fill: 'black',
                  fontSize: 16,
                  textBaseline: 'middle',
                  text: result || args.value,
                  x: 15,
                  y: 20,
                }
              ],
            };
          } catch (error) {
            console.error('公式计算错误:', error);
            return {
              elements: [
                {
                  type: 'text',
                  fill: 'red',
                  fontSize: 16,
                  textBaseline: 'middle',
                  text: 'ERROR',
                  x: 15,
                  y: 20,
                }
              ],
            };
          }
        }
        return {
          elements: [
            {
              type: 'text',
              fill: 'black',
              fontSize: 16,
              textBaseline: 'middle',
              text: args.value,
              x: 15,
              y: 20,
            }
          ],
        };
      },
    };
    const tableInstance = new VTable.ListTable(tableRef.current, option);
    (tableRef.current as TableRefType).vtableInstance = tableInstance;
    return () => {
      tableInstance.release();
    };
  }, [records, columns, width, height]);

  return <div ref={tableRef} style={{ background: '#fff', margin: '0 auto', width, height }} />;
};

export default VTableView; 