import React, { useEffect, useRef, useState } from 'react';
import * as VTable from '@visactor/vtable';
import { InputEditor, DateInputEditor, TextAreaEditor } from '@visactor/vtable-editors';
import { calculateCellFormulaOptimized } from '../process-rpn/cell-formula-handler';

export interface Column {
  title: string;
  field: string;
  editor?: string;
  width?: number;
}

export interface EditableVTableProps {
  columns: Column[];
  records: Record<string, unknown>[];
  editCellTrigger?: string | string[];
  editorOptions?: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
  onChange?: (col: string, row: number, value: string | number) => void;
  width?: number;
  height?: number;
  excelColToField?: Record<string, string>;
  [key: string]: unknown;
}

type TableRefType = { current: VTable.ListTable | null };

type HoverCell = { col: number | null; row: number | null };

const EditableVTable: React.FC<EditableVTableProps> = ({
  columns = [],
  records = [],
  editCellTrigger = 'doubleclick',
  editorOptions = {},
  style,
  className,
  onChange,
  width = 600,
  height = 400,
  excelColToField = {},
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<VTable.ListTable | null>(null);
  const hoverCellRef = useRef<HoverCell>({ col: null, row: null });
  const [, setRerender] = useState(0);

  useEffect(() => {
    VTable.register.editor('input', new InputEditor());
    VTable.register.editor('date', new DateInputEditor());
    VTable.register.editor('textarea', new TextAreaEditor());
    // VTable.register.editor('list', new ListEditor(editorOptions.list || { values: ['A', 'B', 'C'] }));
  }, [editorOptions]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const vtableColumns = columns.map(col => ({
      ...col,
      editor: col.editor,
      customRender: (args: { value: string; col: number; row: number }) => {
        if (typeof args.value === 'string' && args.value.startsWith('=')) {
          const isHover = hoverCellRef.current.col === args.col && hoverCellRef.current.row === args.row;
          let displayText = args.value;
          let fill = 'gray';
          if (!isHover) {
            try {
              displayText = calculateCellFormulaOptimized(records, args.value, excelColToField) || args.value;
              fill = 'black';
            } catch {
              displayText = 'ERROR';
              fill = 'red';
            }
          }
          return {
            elements: [
              {
                type: 'text',
                fill,
                fontSize: 16,
                textBaseline: 'middle',
                text: displayText,
                x: 15,
                y: 20,
              }
            ],
          };
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
      }
    }));

    const option = {
      columns: vtableColumns,
      records,
      editor: undefined,
      editCellTrigger,
      ...rest,
      container: containerRef.current,
      widthMode: 'standard' as const,
      height,
      width,
    };

    const table = new VTable.ListTable(option);
    tableRef.current = table;

    if (onChange) {
      table.on('change_cell_value', ({ col, row, changedValue }: { col: string; row: number; changedValue: string | number }) => {
        onChange(col, row, changedValue);
      });
    }

    table.on('cell_mouseenter', ({ col, row }: { col: number; row: number }) => {
      hoverCellRef.current = { col, row };
      setRerender(v => v + 1);
    });
    table.on('cell_mouseleave', () => {
      hoverCellRef.current = { col: null, row: null };
      setRerender(v => v + 1);
    });

    return () => {
      table?.release();
    };
  }, [columns, records, editCellTrigger, editorOptions, onChange, rest, width, height, excelColToField]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style || { width, height, background: '#fff', margin: '0 auto' }}
    />
  );
};

export default EditableVTable; 