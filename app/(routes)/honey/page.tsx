"use client";
import { Button } from "@/src/components/ui/button";
import _ from "lodash";
import { useRef, useState } from "react";
import saveFile from "file-saver";
import * as XLSX from "xlsx";

type Row = {
  [name: string]: string;
};

export default function Honey() {
  const [worksheets, setWorksheets] = useState<Row[][]>([[]]);
  const [totaledSheets, setTotaledSheets] = useState<{
    [type: string]: Row;
  }>({});
  const [name1Column, setName1Column] = useState<string>("");
  const [amount1Column, setAmount1Column] = useState<string>("");
  const [name2Column, setName2Column] = useState<string>("");
  const [amount2Column, setAmount2Column] = useState<string>("");
  const [departmentColumn, setDepartmentColumn] = useState<string>("");

  const uploadRef = useRef<HTMLInputElement | null>(null);

  const [downloadData, setDownloadData] =
    useState<{ [name: string]: string }[]>();

  const calculateTotals = (rows: Row[], nameCol: string, amountCol: string) => {
    const totaled: Row = {};

    for (const row of rows) {
      if (!row[nameCol]) continue;
      if (totaled[row[nameCol]?.toLowerCase()]) {
        totaled[row[nameCol]?.toLowerCase()] += Number(row[amountCol]);
      } else {
        totaled[row[nameCol]?.toLowerCase()] = row[amountCol];
      }
    }
    return totaled;
  };

  const calculateDiff = (left: Row, right: Row) => {
    const diff: Row = {};
    const leftKeys = Object.keys(left).map((k) => k.trim().toLowerCase());
    const rightKeys = Object.keys(right).map((k) => k.trim().toLowerCase());

    for (const key of leftKeys) {
      if (rightKeys.includes(key)) {
        diff[key] = String(Number(left[key]) - Number(right[key]));
      } else {
        diff[key] = left[key];
      }
    }

    for (const key of rightKeys) {
      if (!leftKeys.includes(key)) {
        diff[key] = right[key];
      }
    }

    return diff;
  };

  const readExcel = async (e: any) => {
    const file = e.target.files[0];
    const fileReader = await new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: any) => {
      const bufferArray = e?.target.result;
      const wb = XLSX.read(bufferArray, { type: "buffer" });

      const wsname1 = wb.SheetNames[0];
      const wsname2 = wb.SheetNames[1];

      const ws1 = wb.Sheets[wsname1];
      const ws2 = wb.Sheets[wsname2];
      const data1: Row[] = XLSX.utils.sheet_to_json(ws1);
      const data2: Row[] = XLSX.utils.sheet_to_json(ws2);

      const totaled1 = calculateTotals(data1, name1Column!, amount1Column!);
      const totaled2 = calculateTotals(data2, name2Column!, amount2Column!);
      const departments: Row = {};
      for (const row of data2) {
        const name = row[name2Column].toLowerCase();
        const currDepartment = departments[name];
        const candidateDepartment = row[departmentColumn];

        if (!candidateDepartment) continue;
        if (currDepartment && candidateDepartment !== currDepartment) {
          departments[name] = `${currDepartment}, ${candidateDepartment}`;
        } else {
          departments[name] = candidateDepartment;
        }
      }

      const diff = calculateDiff(totaled1, totaled2);

      const dataPerColumn = {
        Department: departments,
        Invoice: totaled1,
        Melita: totaled2,
        Delta: diff,
      };

      const downloadData = _.map(diff, (amount, name) => ({
        Name: name,
      }));
      for (const [colName, data] of Object.entries(dataPerColumn)) {
        for (const [name, amount] of Object.entries(data)) {
          for (const d of downloadData) {
            if (d.Name === name) {
              // @ts-ignore
              d[colName] = amount;
            }
          }
        }
      }
      console.log("data1", data1);
      console.log("data2", data2);
      console.log("totaled1", totaled1);
      console.log("totaled2", totaled2);
      console.log("departments", departments);
      console.log("downloadData", downloadData);

      setWorksheets([data1, data2] as Row[][]);
      setDownloadData(downloadData);
    };
  };

  const handleDownload = () => {
    if (!downloadData) {
      return;
    }
    const wb = XLSX.utils.book_new();

    const diffedWs = XLSX.utils.json_to_sheet(downloadData);

    XLSX.utils.book_append_sheet(wb, diffedWs, "Recon");
    // Convert the workbook to an array buffer
    const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    // Convert the array buffer to a blob
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveFile(blob);
  };

  return (
    <div className="flex flex-col gap-y-4 p-8">
      <p className="text-lg font-bold">Hi Honey</p>
      <div>
        <div>
          <label className="mr-2" htmlFor="name1">
            Name column of sheet 1
          </label>
          <input
            id="name1"
            type="text"
            value={name1Column}
            onChange={(e) => setName1Column(e.target.value)}
          />
        </div>

        <div>
          <label className="mr-2" htmlFor="amount1">
            Amount column of sheet 1
          </label>
          <input
            id="amount1"
            type="text"
            value={amount1Column}
            onChange={(e) => setAmount1Column(e.target.value)}
          />
        </div>
      </div>
      <div>
        <div>
          <label className="mr-2" htmlFor="name2">
            Name column of sheet 2
          </label>
          <input
            id="name2"
            type="text"
            value={name2Column}
            onChange={(e) => setName2Column(e.target.value)}
          />
        </div>
        <div>
          <label className="mr-2" htmlFor="amount2">
            Amount column of sheet 2
          </label>
          <input
            id="amount2"
            type="text"
            value={amount2Column}
            onChange={(e) => setAmount2Column(e.target.value)}
          />
        </div>
        <div>
          <label className="mr-2" htmlFor="amount2">
            Department column of sheet 2
          </label>
          <input
            id="amount2"
            type="text"
            value={departmentColumn}
            onChange={(e) => setDepartmentColumn(e.target.value)}
          />
        </div>
      </div>
      <div>
        <input
          disabled={
            !name1Column ||
            !name2Column ||
            !amount1Column ||
            !amount2Column ||
            !departmentColumn
          }
          type="file"
          ref={uploadRef}
          onChange={readExcel}
        />
        <Button
          onClick={() => {
            if (uploadRef?.current) {
              uploadRef.current.value = "";
            }
          }}
        >
          Clear
        </Button>
        {(!name1Column ||
          !name2Column ||
          !amount1Column ||
          !amount2Column ||
          !departmentColumn) && (
          <p className="text-destructive">Enter your columns first</p>
        )}
      </div>
      {/* <div className="flex gap-x-10">
        {worksheets.map((ws, index) => (
          <table key={index}>
            <thead>
              <tr>
                {Object.keys(ws[0] || {}).map((key, index: number) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(ws || []).map((row: Row, index: number) => (
                <tr key={index}>
                  <td>{row.Name}</td>
                  <td>{row.Amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div> */}
      {/* <div className="mt-10 flex gap-x-10">
        {totaledSheets.map((ws, index) => (
          <table key={index}>
            <thead>
              <tr>
                <td>Name</td>
                <td>Amount</td>
              </tr>
            </thead>
            <tbody>
              {Object.keys(ws).map((key: string, index: number) => (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{ws[key as string]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div> */}
      <Button
        className="w-40"
        disabled={!downloadData}
        onClick={handleDownload}
      >
        Download
      </Button>
      {downloadData && (
        <table className="mt-4 max-w-md">
          <thead>
            <tr>
              {Object.keys(downloadData[0] || {}).map((key, index: number) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {downloadData.map((row, index: number) => (
              <tr key={index}>
                {Object.values(row).map((val, index) => (
                  <td key={index}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
