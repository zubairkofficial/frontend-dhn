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

Modal.setAppElement("#root");

const GetCloneProcessedData = ({ refresh }) => {
  // State declarations
  const [processedData, setProcessedData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // Date filter states
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
        `${Helpers.apiUrl}get-user-clone-processed-data`,
        Helpers.authHeaders
      );

      if (response.status === 200) {
        setProcessedData(response.data.data);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = (data) => {
    setSelectedData(data);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedData(null);
    setModalIsOpen(false);
  };

  const filterDataByDate = (data) => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const itemDate = new Date(item.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  const exportToExcel = async (data) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Processed Data");

      // Add headers
      worksheet.columns = [
        { header: "File Name", key: "file_name", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Error Message", key: "error_message", width: 50 },
      ];

      // Add data rows
      data.forEach((item) => {
        worksheet.addRow({
          file_name: item.file_name,
          status: item.status || "success",
          created_at: new Date(item.created_at).toLocaleString(),
          error_message: item.error_message || "",
        });
      });

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Clone_Processed_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const filteredData = filterDataByDate(processedData);

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Verarbeitete Daten - SDB2Excel
            </h2>
          </div>

          {/* Date Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Startdatum
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enddatum
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => exportToExcel(filteredData)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium"
                >
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dateiname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellungsdatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.file_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "success" || !item.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status === "success" || !item.status ? "Erfolgreich" : "Fehler"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          Anzeigen
                        </button>
                        {item.status === "error" && item.error_message && (
                          <span className="text-red-600 text-xs">
                            Fehler: {item.error_message}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Keine verarbeiteten Daten gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for viewing data */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Processed Data Details"
        className="modal fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Verarbeitete Daten Details
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Schließen</span>
              ×
            </button>
          </div>
          <div className="px-6 py-4">
            {selectedData && (
              <div>
                <div className="mb-4">
                  <strong>Dateiname:</strong> {selectedData.file_name}
                </div>
                <div className="mb-4">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedData.status === "success" || !selectedData.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedData.status === "success" || !selectedData.status ? "Erfolgreich" : "Fehler"}
                  </span>
                </div>
                <div className="mb-4">
                  <strong>Erstellungsdatum:</strong>{" "}
                  {new Date(selectedData.created_at).toLocaleString()}
                </div>
                {selectedData.error_message && (
                  <div className="mb-4">
                    <strong>Fehlermeldung:</strong>
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                      {selectedData.error_message}
                    </div>
                  </div>
                )}
                <div>
                  <strong>Daten:</strong>
                  <pre className="bg-gray-100 p-4 rounded mt-2 overflow-x-auto text-sm">
                    {JSON.stringify(selectedData.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

GetCloneProcessedData.propTypes = {
  refresh: PropTypes.bool,
};

export default GetCloneProcessedData;
