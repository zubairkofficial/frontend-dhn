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

const GetScherenData = ({ refresh }) => {
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
        `${Helpers.apiUrl}get-user-scheren-data`,
        Helpers.authHeaders
      );
      if (response.status === 200) {
        setProcessedData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFilteredData = () => {
    if (!startDate || !endDate) {
      return processedData; // No filter applied, return all data
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Set time to 00:00:00

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Extend to the end of the day

    return processedData.filter((item) => {
      const itemDate = new Date(item.created_at); // Convert `created_at` to Date object
      return itemDate >= start && itemDate <= end;
    });
  };

  const handleView = (data) => {
    setSelectedData(data);
    setModalIsOpen(true);
  };

  const handleDownloadFile = async (fileName, fileData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Processed Data");

    // Define headers in the desired order
    const headers = [
      "Produktname",
      "Dateiname SDB",
      "LG Klasse",
      "WGK\n(numerischer Wert)",
      "H Sätze & Kategorie\ndurch Komma getrennt",
      "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr",
      "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)",
      "Verpackungsgruppe",
      "Tunnelcode",
      "N.A.G./NOS technische Benennung",
      "Gefahrauslöser",
      "technische Benennung englisch",
      "Gefahrauslöser englisch",
      "LQ (Spalte eingefügt)",
      "Main Ingredients",
      "Signalwort",
      "P-Sätze",
      "Störfallverordnung (Nr.)",
      "Aggregatzustand",
      "Transportgefahrenklassen",
      "Umweltgefahren (ADR)",
      "Umweltgefahren (IMDG)",
      "Section - 1",
      "Section - 2|2.2",
      "Section - FirstPage",
      "Section - 2",
      "Section - 7|7.2--15",
      "Section - 15",
      "Section - 9|9.1",
      "Section - 5|5.1",
      "Section - 7|7.2",
      "Section - 10|10.5",
      "Section - 14",
      "Section - 3",
      "Section-Missing-Count",
      "Message",
    ];

    // Add headers with styles
    worksheet.addRow(headers);

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD700" },
      }; // Gold color
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add static row below headers
    const staticRow = Array(37).fill("");
    worksheet.addRow(staticRow);

    // Header Mapping - Your stored data uses different field names
    const headerMapping = {
      Produktname: "Produktname",
      "Dateiname SDB": "Dateiname SDB",
      "LG Klasse": "LG Klasse",
      "WGK\n(numerischer Wert)": "WGK\n(numerischer Wert)",
      "H Sätze & Kategorie\ndurch Komma getrennt":
        "H Sätze & Kategorie\ndurch Komma getrennt",
      "Flammpunkt\n(numerischer Wert)\n[°C]":
        "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr": "UN Nr",
      Gefahrensymbole: "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)": "Gefahrgutklasse (Länge beachten)",
      Verpackungsgruppe: "Verpackungsgruppe",
      Tunnelcode: "Tunnelcode",
      "N.A.G./NOS technische Benennung": "N.A.G./NOS technische Benennung",
      Gefahrauslöser: "Gefahrauslöser",
      "technische Benennung englisch": "technische Benennung englisch",
      "Gefahrauslöser englisch": "Gefahrauslöser englisch",
      "LQ (Spalte eingefügt)": "LQ (Spalte eingefügt)",
      "Main Ingredients": "Main Ingredients",
      Signalwort: "Signalwort",
      "P-Sätze": "P-Sätze",
      "Störfallverordnung (Nr.)": "Störfallverordnung (Nr.)",
      Aggregatzustand: "Aggregatzustand",
      Transportgefahrenklassen: "Transportgefahrenklassen",
      "Umweltgefahren (ADR)": "Umweltgefahren (ADR)",
      "Umweltgefahren (IMDG)": "Umweltgefahren (IMDG)",
      "Section - 1": "Section - 1",
      "Section - 2|2.2": "Section - 2|2.2",
      "Section - FirstPage": "Section - FirstPage",
      "Section - 2": "Section - 2",
      "Section - 7|7.2--15": "Section - 7|7.2--15",
      "Section - 15": "Section - 15",
      "Section - 9|9.1": "Section - 9|9.1",
      "Section - 5|5.1": "Section - 5|5.1",
      "Section - 7|7.2": "Section - 7|7.2",
      "Section - 10|10.5": "Section - 10|10.5",
      "Section - 14": "Section - 14",
      "Section - 3": "Section - 3",
      "Section-Missing-Count": "Section-Missing-Count",
      Message: "Message",
    };

    // Map data correctly using headerMapping
    const rowData = headers.map(
      (header) => fileData[headerMapping[header]] || ""
    );
    worksheet.addRow(rowData);

    // Adjust column widths
    worksheet.columns.forEach((column) => {
      column.width = 30; // Set default width
    });

    // Write Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
    await axios.post(
      `${Helpers.apiUrl}log-download`,
      { file_name: fileName },
      Helpers.authHeaders
    );

    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const handleDownloadAll = async () => {
    // Check if the date range is for the current day
    const today = new Date().toISOString().slice(0, 10); // Today's date in YYYY-MM-DD format
    const selectedStartDate = startDate
      ? new Date(startDate).toISOString().slice(0, 10)
      : "";
    const selectedEndDate = endDate
      ? new Date(endDate).toISOString().slice(0, 10)
      : "";

    if (selectedStartDate === today && selectedEndDate === today) {
      Helpers.toast("error", "Downloading data for today's date!");
      setStartDate(today);
      setEndDate(today);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    const headers = [
      "Produktname",
      "Dateiname SDB",
      "LG Klasse",
      "WGK\n(numerischer Wert)",
      "H Sätze & Kategorie\ndurch Komma getrennt",
      "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr",
      "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)",
      "Verpackungsgruppe",
      "Tunnelcode",
      "N.A.G./NOS technische Benennung",
      "Gefahrauslöser",
      "technische Benennung englisch",
      "Gefahrauslöser englisch",
      "LQ (Spalte eingefügt)",
      "Main Ingredients",
      "Signalwort",
      "P-Sätze",
      "Störfallverordnung (Nr.)",
      "Aggregatzustand",
      "Transportgefahrenklassen",
      "Umweltgefahren (ADR)",
      "Umweltgefahren (IMDG)",
      "Section - 1",
      "Section - 2|2.2",
      "Section - FirstPage",
      "Section - 2",
      "Section - 7|7.2--15",
      "Section - 15",
      "Section - 9|9.1",
      "Section - 5|5.1",
      "Section - 7|7.2",
      "Section - 10|10.5",
      "Section - 14",
      "Section - 3",
      "Section-Missing-Count",
      "Message",
    ];
    worksheet.addRow(headers);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD700" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const staticRow = Array(37).fill("");
    worksheet.addRow(staticRow);

    // Filter data based on the start and end date
    const filteredData = getFilteredData();

    // If no matching records are found, show an alert
    if (filteredData.length === 0) {
      Helpers.toast(
        "error",
        "No matching records found for the selected filters!"
      );
      return;
    }

    const headerMapping = {
      Produktname: "Produktname",
      "Dateiname SDB": "Dateiname SDB",
      "LG Klasse": "LG Klasse",
      "WGK\n(numerischer Wert)": "WGK\n(numerischer Wert)",
      "H Sätze & Kategorie\ndurch Komma getrennt":
        "H Sätze & Kategorie\ndurch Komma getrennt",
      "Flammpunkt\n(numerischer Wert)\n[°C]":
        "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr": "UN Nr",
      Gefahrensymbole: "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)": "Gefahrgutklasse (Länge beachten)",
      Verpackungsgruppe: "Verpackungsgruppe",
      Tunnelcode: "Tunnelcode",
      "N.A.G./NOS technische Benennung": "N.A.G./NOS technische Benennung",
      Gefahrauslöser: "Gefahrauslöser",
      "technische Benennung englisch": "technische Benennung englisch",
      "Gefahrauslöser englisch": "Gefahrauslöser englisch",
      "LQ (Spalte eingefügt)": "LQ (Spalte eingefügt)",
      "Main Ingredients": "Main Ingredients",
      Signalwort: "Signalwort",
      "P-Sätze": "P-Sätze",
      "Störfallverordnung (Nr.)": "Störfallverordnung (Nr.)",
      Aggregatzustand: "Aggregatzustand",
      Transportgefahrenklassen: "Transportgefahrenklassen",
      "Umweltgefahren (ADR)": "Umweltgefahren (ADR)",
      "Umweltgefahren (IMDG)": "Umweltgefahren (IMDG)",
      "Section - 1": "Section - 1",
      "Section - 2|2.2": "Section - 2|2.2",
      "Section - FirstPage": "Section - FirstPage",
      "Section - 2": "Section - 2",
      "Section - 7|7.2--15": "Section - 7|7.2--15",
      "Section - 15": "Section - 15",
      "Section - 9|9.1": "Section - 9|9.1",
      "Section - 5|5.1": "Section - 5|5.1",
      "Section - 7|7.2": "Section - 7|7.2",
      "Section - 10|10.5": "Section - 10|10.5",
      "Section - 14": "Section - 14",
      "Section - 3": "Section - 3",
      "Section-Missing-Count": "Section-Missing-Count",
      Message: "Message",
    };

    // Add filtered data rows to the worksheet
    filteredData.forEach((file) => {
      const rowData = headers.map(
        (header) => file.data[headerMapping[header]] || ""
      );
      worksheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Processed_Data_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);

    await axios.post(
      `${Helpers.apiUrl}log-download`,
      { file_name: fileName },
      Helpers.authHeaders
    );

    setLastDownload({ date: new Date().toISOString(), file: fileName });
  };

  const renderTableRows = (data) => {
    return Object.entries(data).map(([key, value]) => (
      <tr key={key} className="border-b">
        <td className="p-3 font-medium text-gray-800">{key}</td>
        <td className="p-3 text-gray-600">
          {typeof value === "string" || typeof value === "number"
            ? value
            : JSON.stringify(value)}
        </td>
      </tr>
    ));
  };

  const truncateText = (text, maxLength = 70) => {
    if (typeof text !== "string") return text;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Derive filtered data for display
  const filteredData = getFilteredData();

  return (
    <div className="w-full bg-white py-5 px-10 mx-auto">
      <div className="bg-white rounded-lg p-6 mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Scheren Data</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            {Helpers.getTranslationValue("Back")}
          </button>
        </div>

        {/* Last Download Information */}
        {lastDownload && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-6 shadow-sm">
            <p className="text-lg font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Last Download:
            </p>
            <p className="text-md mt-1">
              <span className="font-medium">Date:</span>{" "}
              {new Date(lastDownload.date).toLocaleString()}
            </p>
            <p className="text-md">
              <span className="font-medium">File:</span> {lastDownload.file}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleDownloadAll}
          className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
        >
          Download All <FontAwesomeIcon icon={faDownload} />
        </button>
        <input
          className="form-control m-2 border border-gray-300 rounded-lg p-2"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          className="form-control m-2 border border-gray-300 rounded-lg p-2"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {/* Optional: Clear Filter Button */}
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="bg-red-500 text-white py-2 px-4 rounded-lg"
          >
            Clear Filter
          </button>
        )}
      </div>

      {filteredData.length > 0 ? (
        <ul className="space-y-4">
          {filteredData.map((item) => (
            <li
              key={item.id}
              className="bg-gray-100 p-4 rounded-lg flex justify-between items-center shadow-sm"
            >
              <div>
                <p className="font-semibold">
                  File Name: {truncateText(item.file_name)}
                </p>
                <p>Product Name: {truncateText(item.data["Produktname"])}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleView(item.data)}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  View <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => handleDownloadFile(item.file_name, item.data)}
                  className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
                >
                  Download <FontAwesomeIcon icon={faDownload} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          No processed data found for the selected date range.
        </p>
      )}

      {selectedData && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full mx-auto relative"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <h3 className="text-xl font-semibold mb-6 text-center">
            Data Details
          </h3>
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200 border-b">
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Key
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>{renderTableRows(selectedData)}</tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

GetScherenData.propTypes = {
  refresh: PropTypes.bool.isRequired, // Declare the prop
};

export default GetScherenData;
