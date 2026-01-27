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

const GetWerthenbachData = ({ refresh }) => {
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
        `${Helpers.apiUrl}get-user-werthenbach-data`,
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
    const worksheet = workbook.addWorksheet("Werthenbach Data");

    // Define headers in the desired order
    const headers = [
      "Produktname",
      "Hersteller",
      "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse",
      "WGK(numerischer Wert)",
      "Signalwort",

      "H Sätze durch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]",
      "UN Nr",
      "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)",
      "Verpackungsgruppe",
      "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "LQ (Spalte eingefügt)",
      "Dichte",
      "Aggregatzustand",
      "Klassifizierungscode",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5",
      "Main Ingredients",
      "UFI",
      "Section - FirstPage",
      "Section - 1",
      "Section - 2",
      "Section - 2|2.2",
      "Section - 3",
      "Section - 5|5.1",
      "Section - 7|7.2--15|15.1",
      "Section - 7|7.2",
      "Section - 9|9.1",
      "Section - 10|10.5",
      "Section - 14",
      "Section - 15",

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

    // Header Mapping - Your stored data uses different field names
    const headerMapping = {
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "Dateiname SDB": "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse": "LG Klasse",
      "WGK(numerischer Wert)": "WGK\n(numerischer Wert)",
      Signalwort: "Signalwort",
      "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]":
        "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr": "UN Nr",
      Gefahrensymbole: "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)": "Gefahrgutklasse (Länge beachten)",
      Verpackungsgruppe: "Verpackungsgruppe",
      Tunnelcode: "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)":
        "N.A.G./NOS\ntechnische Benennung\n(Gefahraus-löser)",
      "LQ (Spalte eingefügt)": "LQ (Spalte eingefügt)",
      Dichte: "Dichte",
      Aggregatzustand: "Aggregatzustand",
      Klassifizierungscode: "Klassifizierungscode",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter": "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2": "Maßnahmen Lagerung\nAbschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5":
        "Zusammenlagerverbot\nAbschnitt 10.5",
      "Main Ingredients": "Main Ingredients",
      UFI: "UFI",
      "Section - FirstPage": "Section - FirstPage",
      "Section - 1": "Section - 1",
      "Section - 2": "Section - 2",
      "Section - 2|2.2": "Section - 2|2.2",
      "Section - 3": "Section - 3",
      "Section - 5|5.1": "Section - 5|5.1",
      "Section - 7|7.2--15|15.1": "Section - 7|7.2--15",
      "Section - 7|7.2": "Section - 7|7.2",
      "Section - 9|9.1": "Section - 9|9.1",
      "Section - 10|10.5": "Section - 10|10.5",

      "Section - 14": "Section - 14",
      "Section - 15": "Section - 15",
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

    // If the selected date range is for today, download all data for today
    if (selectedStartDate === today && selectedEndDate === today) {
      Helpers.toast("error", "Downloading data for today's date!");
      setStartDate(today);
      setEndDate(today);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    // Use the same headers as handleDownloadFile for consistency
    const headers = [
      "Produktname",
      "Hersteller",
      "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse",
      "WGK(numerischer Wert)",
      "Signalwort",
      "H Sätze durch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]",
      "UN Nr",
      "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)",
      "Verpackungsgruppe",
      "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "LQ (Spalte eingefügt)",
      "Dichte",
      "Aggregatzustand",
      "Klassifizierungscode",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5",
      "Main Ingredients",
      "UFI",
      "Section - FirstPage",
      "Section - 1",
      "Section - 2",
      "Section - 2|2.2",
      "Section - 3",
      "Section - 5|5.1",
      "Section - 7|7.2--15|15.1",
      "Section - 7|7.2",
      "Section - 9|9.1",
      "Section - 10|10.5",
      "Section - 14",
      "Section - 15",
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
      Hersteller: "Hersteller",
      "Dateiname SDB": "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse": "LG Klasse",
      "WGK(numerischer Wert)": "WGK\n(numerischer Wert)",
      Signalwort: "Signalwort",
      "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]":
        "Flammpunkt\n(numerischer Wert)\n[°C]",
      "UN Nr": "UN Nr",
      Gefahrensymbole: "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)": "Gefahrgutklasse (Länge beachten)",
      Verpackungsgruppe: "Verpackungsgruppe",
      Tunnelcode: "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)":
        "N.A.G./NOS\ntechnische Benennung\n(Gefahraus-löser)",
      "LQ (Spalte eingefügt)": "LQ (Spalte eingefügt)",
      Dichte: "Dichte",
      Aggregatzustand: "Aggregatzustand",
      Klassifizierungscode: "Klassifizierungscode",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter": "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2": "Maßnahmen Lagerung\nAbschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5":
        "Zusammenlagerverbot\nAbschnitt 10.5",
      "Main Ingredients": "Main Ingredients",
      UFI: "UFI",
      "Section - FirstPage": "Section - FirstPage",
      "Section - 1": "Section - 1",
      "Section - 2": "Section - 2",
      "Section - 2|2.2": "Section - 2|2.2",
      "Section - 3": "Section - 3",
      "Section - 5|5.1": "Section - 5|5.1",
      "Section - 7|7.2--15|15.1": "Section - 7|7.2--15",
      "Section - 7|7.2": "Section - 7|7.2",
      "Section - 9|9.1": "Section - 9|9.1",
      "Section - 10|10.5": "Section - 10|10.5",
      "Section - 14": "Section - 14",
      "Section - 15": "Section - 15",
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
    // Define the desired display order for specific fields (based on client request)
    // Include variations with and without \n characters
    const prioritizedFields = [
      "WasserGefKlasse", // First priority - written out version
      "WGK\n(numerischer Wert)", // With \n
      "WGK(numerischer Wert)", // Without \n
      "LG Klasse", // Lagerklasse
      "Signalwort", // Signalwort
      "Gefahrensymbole", // GefSymbole
      "Aggregatzustand", // Aggregatzustand
      "Dichte", // Dichte
      "Flammpunkt", // Flammpunkt (simple version first)
      "Flammpunkt\n(numerischer Wert)\n[°C]", // With \n
      "Flammpunkt (numerischer Wert)[°C]", // Without \n
      "UN Nr", // UN
      "UN Benennung", // UN Benennung (if exists)
      "Gefahrgutklasse (Länge beachten)", // Gefahrklasse
      "Verpackungsgruppe", // Verpackungsgruppe
      "Tunnelcode", // Tunnelcode
      "Klassifizierungscode", // Klassifizierungscode
      "LQ (Spalte eingefügt)", // Begrenzte Menge
      "H Sätze durch Komma getrennt", // H-Sätze
      "H Sätze\ndurch Komma getrennt", // H-Sätze with \n
    ];

    // Get all data keys (need to check both with and without \n variations)
    const allKeys = Object.keys(data);

    // Function to find matching key (check for exact match or variations with \n)
    const findMatchingKey = (fieldName) => {
      // First check exact match
      if (allKeys.includes(fieldName)) {
        return fieldName;
      }
      // Normalize both by removing \n and extra spaces for comparison
      const normalize = (str) =>
        str.replace(/\n/g, "").replace(/\s+/g, "").toLowerCase();
      const normalizedFieldName = normalize(fieldName);

      for (const key of allKeys) {
        const normalizedKey = normalize(key);
        // Check exact normalized match or if one contains the other
        if (
          normalizedKey === normalizedFieldName ||
          normalizedKey.includes(normalizedFieldName) ||
          normalizedFieldName.includes(normalizedKey)
        ) {
          return key;
        }
      }
      return null;
    };

    // Find actual field names that exist in the data, in the desired order
    const prioritizedKeys = [];
    const foundKeys = new Set();

    for (const field of prioritizedFields) {
      const matchingKey = findMatchingKey(field);
      if (matchingKey && !foundKeys.has(matchingKey)) {
        prioritizedKeys.push(matchingKey);
        foundKeys.add(matchingKey);
      }
    }

    // Get remaining fields that weren't prioritized
    const remainingKeys = allKeys.filter((key) => !foundKeys.has(key));

    // Combine: prioritized first, then remaining fields
    const orderedKeys = [...prioritizedKeys, ...remainingKeys];

    return orderedKeys.map((key) => {
      const value = data[key];
      // Handle values with \n - use CSS to preserve line breaks
      let displayValue;
      if (typeof value === "string") {
        displayValue = value;
      } else if (typeof value === "number") {
        displayValue = value;
      } else {
        displayValue = JSON.stringify(value);
      }

      return (
        <tr key={key} className="border-b">
          <td className="p-3 font-medium text-gray-800">
            {key.replace(/\n/g, " ")}
          </td>
          <td className="p-3 text-gray-600" style={{ whiteSpace: "pre-wrap" }}>
            {displayValue}
          </td>
        </tr>
      );
    });
  };

  const truncateText = (text, maxLength = 70) => {
    if (typeof text !== "string") return text;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Derive filtered data for display
  const filteredData = getFilteredData();

  if (filteredData.length === 0) {
    return;
  }

  return (
    <div className="w-full bg-white py-5 px-10 mx-auto">
      <div className="bg-white rounded-lg p-6 mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            All Werthenbach Data
          </h2>
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
                {item.created_at && (
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {new Date(item.created_at).toLocaleString()}
                  </p>
                )}
                <div className="mt-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === "success" || !item.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status === "success" || !item.status
                      ? "Success"
                      : "Error"}
                  </span>
                  {item.status === "error" && item.error_message && (
                    <p className="text-red-600 text-sm mt-1">
                      Error: {item.error_message}
                    </p>
                  )}
                </div>
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
          <div className="mb-4 text-center">
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                selectedData.status === "success" || !selectedData.status
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedData.status === "success" || !selectedData.status
                ? "Success"
                : "Error"}
            </span>
            {selectedData.error_message && (
              <p className="text-red-600 text-sm mt-2">
                Error: {selectedData.error_message}
              </p>
            )}
          </div>
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
};

GetWerthenbachData.propTypes = {
  refresh: PropTypes.bool.isRequired, // Declare the prop
};

export default GetWerthenbachData;
