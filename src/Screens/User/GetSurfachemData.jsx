import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import Helpers from "../../Config/Helpers";
import {
  SURFACHEM_HEADERS,
  getSurfachemRowValues,
  getSurfachemCellValue,
  getSurfachemProductLabel,
} from "../../Config/surfachemColumns";

Modal.setAppElement("#root");

const GetSurfachemData = ({ refresh }) => {
  const [surfachemData, setSurfachemData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastDownload, setLastDownload] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchLastDownload();
  }, [refresh]);

  const fetchLastDownload = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}get-last-download`,
        Helpers.authHeaders
      );
      if (response.status === 200 && response.data.last_download) {
        setLastDownload({
          date: response.data.last_download,
          file: response.data.file_name,
        });
      }
    } catch (error) {
      console.error("Error fetching last download:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}get-user-surfachem-data`,
        Helpers.authHeaders
      );
      if (response.status === 200) {
        setSurfachemData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFilteredData = () => {
    if (!startDate || !endDate) return surfachemData;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return surfachemData.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate >= start && itemDate <= end;
    });
  };

  const getRowData = (fileData) => getSurfachemRowValues(fileData);

  const handleView = (data) => {
    setSelectedData(data);
    setModalIsOpen(true);
  };

  const handleDownloadFile = async (fileName, fileData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SDB2Excel Surfachem");

    worksheet.addRow(SURFACHEM_HEADERS);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD700" } };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    const dataRow = worksheet.addRow(getRowData(fileData));
    dataRow.eachCell((cell) => cell.alignment = { vertical: "middle", wrapText: true });

    worksheet.columns.forEach((col) => { col.width = 25; });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${fileName}.xlsx`);
    await axios.post(`${Helpers.apiUrl}log-download`, { file_name: fileName }, Helpers.authHeaders);
    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const handleDownloadAll = async () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) {
      Helpers.toast("error", "No matching records found for the selected filters!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SDB2Excel Surfachem");

    worksheet.addRow(SURFACHEM_HEADERS);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD700" } };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    filteredData.forEach((file) => {
      const rowData = getRowData(file.data);
      const newRow = worksheet.addRow(rowData);
      newRow.eachCell((cell) => cell.alignment = { vertical: "middle", wrapText: true });
    });

    worksheet.columns.forEach((col) => { col.width = 25; });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = `SDB2Excel_Surfachem_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
    await axios.post(`${Helpers.apiUrl}log-download`, { file_name: fileName }, Helpers.authHeaders);
    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const renderTableRows = (data) =>
    SURFACHEM_HEADERS.map((header) => {
      const value = getSurfachemCellValue(data, header);
      const display =
        typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value);
      return (
        <tr key={header} className="border-b">
          <td className="p-3 font-medium text-gray-800">{header}</td>
          <td className="p-3 text-gray-600">{display}</td>
        </tr>
      );
    });

  const truncateText = (text, maxLength = 70) =>
    typeof text !== "string" ? text : text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const filteredData = getFilteredData();

  if (filteredData.length === 0) return null;

  return (
    <div className="w-full bg-white py-5 px-10 mx-auto">
      <div className="bg-white rounded-lg p-6 mx-auto">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Surfachem Data</h2>
          <button onClick={() => navigate(-1)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all">
            {Helpers.getTranslationValue("Back")}
          </button>
        </div>

        {lastDownload && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-6 shadow-sm">
            <p className="text-lg font-semibold flex items-center">Last Download:</p>
            <p className="text-md mt-1"><span className="font-medium">Date:</span> {new Date(lastDownload.date).toLocaleString()}</p>
            <p className="text-md"><span className="font-medium">File:</span> {lastDownload.file}</p>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={handleDownloadAll} className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg">
          Download All <FontAwesomeIcon icon={faDownload} />
        </button>
        <input className="form-control m-2 border border-gray-300 rounded-lg p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="form-control m-2 border border-gray-300 rounded-lg p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        {(startDate || endDate) && (
          <button onClick={() => { setStartDate(""); setEndDate(""); }} className="bg-red-500 text-white py-2 px-4 rounded-lg">Clear Filter</button>
        )}
      </div>

      <ul className="space-y-4">
        {filteredData.map((item) => (
          <li key={item.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-semibold">File Name: {truncateText(item.file_name)}</p>
              <p>Product: {truncateText(getSurfachemProductLabel(item.data))}</p>
              {item.created_at && <p className="text-sm text-gray-600 mt-1">Created: {new Date(item.created_at).toLocaleString()}</p>}
            </div>
            <div className="space-x-2">
              <button onClick={() => handleView(item.data)} className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
                View <FontAwesomeIcon icon={faEye} />
              </button>
              <button onClick={() => handleDownloadFile(item.file_name, item.data)} className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg">
                Download <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selectedData && (
        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full mx-auto relative" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <h3 className="text-xl font-semibold mb-6 text-center">Data Details</h3>
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200 border-b">
                  <th className="p-3 text-left font-semibold text-gray-700">Key</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>{renderTableRows(selectedData)}</tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setModalIsOpen(false)} className="bg-red-500 text-white py-2 px-6 rounded-lg">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

GetSurfachemData.propTypes = { refresh: PropTypes.bool.isRequired };
export default GetSurfachemData;
