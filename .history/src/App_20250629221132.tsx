/*
 * @Author: maoyl maoyl@glodon.com
 * @Date: 2025-06-29 21:25:15
 * @LastEditors: maoyl maoyl@glodon.com
 * @LastEditTime: 2025-06-29 22:11:33
 * @FilePath: /VTableExcel/VTableExcel/src/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import './App.css';
// import VTableView from './VTableView/VTableView';
import EditableVTable from './EditableVTable/EditableVTable';

interface Column {
  title: string;
  field: string;
  editor?: string;
  width?: number;
}

interface RecordType {
  [key: string]: string | number;
}

const columns: Column[] = [
  { title: '序号', field: 'id' },
  { title: '姓名', field: 'name', editor: 'input' },
  { title: '性别', field: 'gender' },
  { title: '生日', field: 'birthday', editor: 'date' },
  { title: '地址', field: 'address', editor: 'textarea' },
  { title: '部门', field: 'department', editor: 'input' },
  { title: '职位', field: 'position', editor: 'input' },
  { title: '电话', field: 'phone', editor: 'input' },
  { title: '邮箱', field: 'email', editor: 'input' },
  { title: '工号', field: 'jobId', editor: 'input' },
  { title: '备注', field: 'remark', editor: 'textarea' },
  { title: '工资', field: 'salary', editor: 'input' },
  { title: '奖金', field: 'bonus', editor: 'input' },
  { title: '总计', field: 'total', editor: 'input', width: 200 },
];

const myRecords: RecordType[] = Array.from({ length: 10 }, (_, i) => ({
  id: `${i + 1}`,
  name: `maoyl${i + 1}`,
  gender: i % 2 === 0 ? '男' : '女',
  birthday: `199${i % 10}-01-01`,
  address: `地址${i + 1}`,
  department: `部门${(i % 5) + 1}`,
  position: '=SUM(1,2,3)',
  phone: `1380000${i}`,
  email: `maoyl${i + 1}@mail.com`,
  jobId: `JID${i + 1}`,
  remark: '',
  salary: 1000 + i,
  bonus: 100 + i,
  total: '=L' + (i + 1) + '+M' + (i + 1),
}));

function getExcelColToField(columns: Column[]): Record<string, string> {
  const map: Record<string, string> = {};
  columns.forEach((col, idx) => {
    let colLetter = '';
    let n = idx;
    do {
      colLetter = String.fromCharCode(65 + (n % 26)) + colLetter;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    map[colLetter] = col.field;
  });
  return map;
}

const excelColToField = getExcelColToField(columns);

const App: React.FC = () => {
  const [records, setRecords] = useState<RecordType[]>(myRecords);

  return (
    <div className="App">
      <p>vtable 表格公式演示（C3 = SUM(B4:B9)）</p>
      {/* <VTableView records={records} columns={columns} width={600} height={400} /> */}
      <EditableVTable
        columns={columns}
        records={records}
        excelColToField={excelColToField}
        editCellTrigger={['doubleclick', 'keydown']}
        onChange={(col: string, row: number, value: string | number) => {
          const newRecords = [...records];
          newRecords[row] = { ...records[row], [col]: value };
          setRecords(newRecords);
        }}
        style={{
          width: 1400,
          height: 1000,
        }}
      />
    </div>
  );
};

export default App; 