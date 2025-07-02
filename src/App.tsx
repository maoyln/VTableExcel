import React, { useState } from "react";
import "./App.css";
import EditableVTable from "./EditableVTable/EditableVTable";

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
  { title: "序号(A)", field: "id", width: 100 },
  { title: "姓名(B)", field: "name", editor: "input", width: 100 },
  { title: "数据(C)", field: "testData", editor: "input", width: 100 },
  { title: "数据(D)", field: "testData2", editor: "input", width: 100 },
  { title: "数据(E)", field: "testData3", editor: "input", width: 100 },
  { title: "数据(F)", field: "testData4", editor: "input", width: 100 },
  { title: "数据(G)", field: "testData5", editor: "input", width: 100 },
  { title: "数据(H)", field: "testData6", editor: "input", width: 100 },
  { title: "数据(I)", field: "testData7", editor: "input", width: 100 },
  { title: "测试计算(J)", field: "total", editor: "input", width: 200 },
];

const myRecords: RecordType[] = Array.from({ length: 100000 }, (_, i) => ({
  id: `${i + 1}`,
  name: `${i + 3}`,
  testData: i + 11,
  testData2: i + 22,
  testData3: i + 103,
  testData4: i + 1004,
  testData5: i + 10005,
  testData6: i + 10006,
  testData7: i + 10007,
  total: "=H" + (i + 1) + "+I" + (i + 1),
}));

function getExcelColToField(columns: Column[]): Record<string, string> {
  const map: Record<string, string> = {};
  columns.forEach((col, idx) => {
    let colLetter = "";
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
      <EditableVTable
        columns={columns}
        records={records}
        excelColToField={excelColToField}
        editCellTrigger={["doubleclick", "keydown"]}
        onChange={(col: string, row: number, value: string | number) => {
          const newRecords = [...records];
          newRecords[row] = { ...records[row], [col]: value };
          setRecords(newRecords);
        }}
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  );
};

export default App;
