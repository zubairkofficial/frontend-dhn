import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

const SURFACHEM_HEADERS = [
  "Nummer-Chemisch.Datei-Nr.",
  "Mitglied MNC einheit Gruppe",
  "D MNC/VMS 1.1. Teil UFI-Code Link",
  "Artikel-Bezeichnung Wirkstoff Sigma",
  "CH-Sicherh. P. Piktogramme",
  "Sicherh. P. CLP Teil Waren Einstufung",
  "CAS-Nummer EG-Nr. GHS Original Stoffname",
  "Einstuf. L Gefahr-Satz Ergänzungsart",
  "D-ALM-Nr. Löslichkeits-Bereich",
  "Eigentümer Ausg.-Gelt.-Vom-Gültig",
  "Produkt-Status Rev-Datum",
  "Kommentare In-House Message",
];

const AllSurfachemData = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [surfachemData, setSurfachemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastDownload, setLastDownload] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchSurfachemData = async () => {
      let response;
      try {
        if (currentUser && currentUser.user_type === 1) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-surfachem-data-customer/${userId}`,
            Helpers.authHeaders
          );
        }
        if (currentUser.is_user_customer === 1 && currentUser.is_user_organizational === 1 && currentUser.user_type === 0) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-surfachem-data-organization/${userId}`,
            Helpers.authHeaders
          );
        }
        if (currentUser.is_user_organizational === 1 && currentUser.is_user_customer !== 1 && currentUser.user_type === 0) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-surfachem-data-user/${userId}`,
            Helpers.authHeaders
          );
        }

        if (response && response.status === 200) {
          setUsers(response.data.users);
          setSurfachemData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching surfachem data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLastDownload = async () => {
      try {
        const response = await axios.get(`${Helpers.apiUrl}get-last-download`, Helpers.authHeaders);
        if (response.status === 200 && response.data.last_download) {
          setLastDownload({ date: response.data.last_download, file: response.data.file_name });
        }
      } catch (error) {
        console.error("Error fetching last download:", error);
      }
    };

    fetchSurfachemData();
    fetchLastDownload();
  }, [userId]);

  const getFilteredData = () =>
    surfachemData.filter((item) => {
      const itemDate = new Date(item.created_at);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      return (selectedUser ? item.user_id == selectedUser : true) && (!start || itemDate >= start) && (!end || itemDate <= end);
    });

  const filteredData = getFilteredData();

  const getRowData = (fileData) =>
    SURFACHEM_HEADERS.map((header) => {
      const val = fileData[header];
      return val != null && typeof val === "object" ? JSON.stringify(val) : (val ?? "");
    });

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
    worksheet.addRow(getRowData(fileData)).eachCell((cell) => { cell.alignment = { vertical: "middle", wrapText: true }; });
    worksheet.columns.forEach((col) => { col.width = 25; });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileName}.xlsx`);
    await axios.post(`${Helpers.apiUrl}log-download`, { file_name: fileName }, Helpers.authHeaders);
    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const handleDownloadAll = async () => {
    const dataToDownload = getFilteredData();
    if (dataToDownload.length === 0) {
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
    dataToDownload.forEach((file) => {
      const row = worksheet.addRow(getRowData(file.data));
      row.eachCell((cell) => cell.alignment = { vertical: "middle", wrapText: true });
    });
    worksheet.columns.forEach((col) => { col.width = 25; });
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `SDB2Excel_Surfachem_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileName);
    await axios.post(`${Helpers.apiUrl}log-download`, { file_name: fileName }, Helpers.authHeaders);
    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const productNameKey = SURFACHEM_HEADERS.find((h) => h.includes("Artikel")) || SURFACHEM_HEADERS[3];
  const truncateText = (text, maxLength = 70) => (typeof text !== "string" ? text : text.length > maxLength ? text.substring(0, maxLength) + "..." : text);
  const renderTableRows = (data) => Object.entries(data).map(([key, value]) => (
    <tr key={key} className="border-b">
      <td className="p-3 font-medium text-gray-800">{key}</td>
      <td className="p-3 text-gray-600">{typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}</td>
    </tr>
  ));

  if (loading) return <p>Loading...</p>;

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
            <p className="text-lg font-semibold">Last Download:</p>
            <p className="text-md mt-1"><span className="font-medium">Date:</span> {new Date(lastDownload.date).toLocaleString()}</p>
            <p className="text-md"><span className="font-medium">File:</span> {lastDownload.file}</p>
          </div>
        )}
      </div>

      {surfachemData.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button onClick={handleDownloadAll} className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg">
                Download All <FontAwesomeIcon icon={faDownload} />
              </button>
              <input className="form-control border border-gray-300 rounded-lg p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input className="form-control border border-gray-300 rounded-lg p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="bg-red-500 text-white py-2 px-4 rounded-lg">Clear Filter</button>}
            </div>
            <div>
              <select className="w-64 p-2 border rounded-lg shadow-sm" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">All Data</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
          {filteredData.length > 0 ? (
            <ul className="space-y-4">
              {filteredData.map((item) => (
                <li key={item.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-semibold">File Name: {truncateText(item.file_name)}</p>
                    <p>Product: {truncateText(item.data[productNameKey])}</p>
                    {item.created_at && <p className="text-sm text-gray-600 mt-1">Created: {new Date(item.created_at).toLocaleString()}</p>}
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleView(item.data)} className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">View <FontAwesomeIcon icon={faEye} /></button>
                    <button onClick={() => handleDownloadFile(item.file_name, item.data)} className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg">Download <FontAwesomeIcon icon={faDownload} /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No surfachem data found for the selected date range.</p>
          )}
        </>
      ) : (
        !loading && <p className="text-center text-gray-500">No surfachem data found.</p>
      )}

      {selectedData && (
        <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full mx-auto relative" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <h3 className="text-xl font-semibold mb-6 text-center">Data Details</h3>
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full border-collapse border">
              <thead><tr className="bg-gray-200 border-b"><th className="p-3 text-left font-semibold text-gray-700">Key</th><th className="p-3 text-left font-semibold text-gray-700">Value</th></tr></thead>
              <tbody>{renderTableRows(selectedData)}</tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end"><button onClick={() => setModalIsOpen(false)} className="bg-red-500 text-white py-2 px-6 rounded-lg">Close</button></div>
        </Modal>
      )}
    </div>
  );
};

AllSurfachemData.propTypes = { refresh: PropTypes.bool };
export default AllSurfachemData;
