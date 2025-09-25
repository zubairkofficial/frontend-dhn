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

const AllVerbundData = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [verbundData, setVerbundData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastDownload, setLastDownload] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  // Set default filter to an empty string so that ALL users are shown by default
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchVerbundData = async () => {
      let response;

      try {
        if (currentUser && currentUser.user_type === 1) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-verbund-data-customer/${userId}`,
            Helpers.authHeaders
          );
        }

        if (
          currentUser.is_user_customer === 1 &&
          currentUser.is_user_organizational === 1 &&
          currentUser.user_type === 0
        ) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-verbund-data-organization/${userId}`,
            Helpers.authHeaders
          );
        }
        if (
          currentUser.is_user_organizational === 1 &&
          currentUser.is_user_customer !== 1 &&
          currentUser.user_type === 0
        ) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-verbund-data-user/${userId}`,
            Helpers.authHeaders
          );
        }

        if (response && response.status === 200) {
          setUsers(response.data.users);
          setVerbundData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching processed data:", error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchVerbundData();
    fetchLastDownload();
  }, [userId]);

  const getFilteredData = () => {
    return verbundData.filter((item) => {
      const itemDate = new Date(item.created_at);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      return (
        // If a user is selected, filter by user_id; otherwise, include all items
        (selectedUser ? item.user_id == selectedUser : true) &&
        (!start || itemDate >= start) &&
        (!end || itemDate <= end)
      );
    });
  };

  // Use the filtered data (by both user and dates) for rendering
  const filteredData = getFilteredData();

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleView = (data) => {
    setSelectedData(data);
    setModalIsOpen(true);
  };

  const handleDownloadFile = async (fileName, fileData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Verbund Data");

    const headers = [
      "Produktname",
      "Hersteller",
      "Dateiname SDB",
      "SDB-Ausgabedatum bzw. letzte Änderung",
      "CAS-Nummer(n)",
      "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510",
      "Gefahrensymbole (CLP/GHS)",
      "WGK",
      "Transport oder Umfüllen- Verpackungsgruppe",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)",
      "P-Sätze (durch Komma getrennt) (aus Kap.2)",
      "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)",
      "Flammpunkt [°C]",
      "Aggregatzustand",
      "CLP/GHS-Symbolnummern",
      "CMR",
      "Diisocyanat",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr",
      "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)",
      "Transport-Mengenbegrenzung LQ",
      "Transport-Tunnelcode",
      "Kopf",
      "1",
      "1.1",
      "1.2",
      "1.3",
      "1.4",
      "2",
      "2.1",
      "2.2",
      "2.3",
      "3",
      "3.1",
      "3.2",
      "4",
      "4.1",
      "4.2",
      "4.3",
      "5",
      "5.1",
      "5.2",
      "5.3",
      "6",
      "6.1",
      "6.2",
      "6.3",
      "6.4",
      "7",
      "7.1",
      "7.2",
      "7.3",
      "8",
      "8.1",
      "8.2",
      "9",
      "9.1",
      "9.2",
      "10",
      "10.1",
      "10.2",
      "10.3",
      "10.4",
      "10.5",
      "10.6",
      "11",
      "11.1",
      "12",
      "12.1",
      "12.2",
      "12.3",
      "12.4",
      "12.5",
      "12.6",
      "13",
      "13.1",
      "14",
      "14.1",
      "14.2",
      "14.3",
      "14.4",
      "14.5",
      "14.6",
      "14.7",
      "15",
      "15.1",
      "15.2",
      "16",
      "Message",
      "Section-Missing-Count",
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

    const staticRow = Array(94).fill("");
    worksheet.addRow(staticRow);

    const headerMapping = {
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "Dateiname SDB": "Dateiname SDB",
      "SDB-Ausgabedatum bzw. letzte Änderung":
        "SDB-Ausgabedatum bzw. letzte Änderung",
      "CAS-Nummer(n)": "CAS-Nummer(n)",
      Hauptbestandteile: "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510": "Lagerklassen (LGK) nach TRGS 510",
      "Gefahrensymbole (CLP/GHS)": "Gefahrensymbole (CLP/GHS)",
      WGK: "WGK",
      "Transport oder Umfüllen- Verpackungsgruppe":
        "Transport oder Umfüllen- Verpackungsgruppe",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)":
        "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)":
        "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)":
        "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)",
      "P-Sätze (durch Komma getrennt) (aus Kap.2)":
        "P-Sätze (durch Komma getrennt) (aus Kap.2)",
      "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)":
        "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)",
      "Flammpunkt [°C]": "Flammpunkt [°C]",
      Aggregatzustand: "Aggregatzustand",
      "CLP/GHS-Symbolnummern": "CLP/GHS-Symbolnummern",
      CMR: "CMR",
      Diisocyanat: "Diisocyanat",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr": "UN Nr",
      "ADR-Klasse (Gefahrgutklasse)": "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)": "Gefahr-Nr (Kemler-Zahl)",
      "Transport-Mengenbegrenzung LQ": "Transport-Mengenbegrenzung LQ",
      "Transport-Tunnelcode": "Transport-Tunnelcode",
      Kopf: "Kopf",
      1: "1",
      1.1: "1.1",
      1.2: "1.2",
      1.3: "1.3",
      1.4: "1.4",
      2: "2",
      2.1: "2.1",
      2.2: "2.2",
      2.3: "2.3",
      3: "3",
      3.1: "3.1",
      3.2: "3.2",
      4: "4",
      4.1: "4.1",
      4.2: "4.2",
      4.3: "4.3",
      5: "5",
      5.1: "5.1",
      5.2: "5.2",
      5.3: "5.3",
      6: "6",
      6.1: "6.1",
      6.2: "6.2",
      6.3: "6.3",
      6.4: "6.4",
      7: "7",
      7.1: "7.1",
      7.2: "7.2",
      7.3: "7.3",
      8: "8",
      8.1: "8.1",
      8.2: "8.2",
      9: "9",
      9.1: "9.1",
      9.2: "9.2",
      10: "10",
      10.1: "10.1",
      10.2: "10.2",
      10.3: "10.3",
      10.4: "10.4",
      10.5: "10.5",
      10.6: "10.6",
      11: "11",
      11.1: "11.1",
      12: "12",
      12.1: "12.1",
      12.2: "12.2",
      12.3: "12.3",
      12.4: "12.4",
      12.5: "12.5",
      12.6: "12.6",
      13: "13",
      13.1: "13.1",
      14: "14",
      14.1: "14.1",
      14.2: "14.2",
      14.3: "14.3",
      14.4: "14.4",
      14.5: "14.5",
      14.6: "14.6",
      14.7: "14.7",
      15: "15",
      15.1: "15.1",
      15.2: "15.2",
      16: "16",
      Message: "Message",
      "Section-Missing-Count": "Section-Missing-Count",
    };

    const rowData = headers.map(
      (header) => fileData[headerMapping[header]] || ""
    );
    worksheet.addRow(rowData);

    worksheet.columns.forEach((column) => {
      column.width = 30;
    });

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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    const headers = [
      "Produktname",
      "Hersteller",
      "Dateiname SDB",
      "SDB-Ausgabedatum bzw. letzte Änderung",
      "CAS-Nummer(n)",
      "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510",
      "Gefahrensymbole (CLP/GHS)",
      "WGK",
      "Transport oder Umfüllen- Verpackungsgruppe",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)",
      "P-Sätze (durch Komma getrennt) (aus Kap.2)",
      "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)",
      "Flammpunkt [°C]",
      "Aggregatzustand",
      "CLP/GHS-Symbolnummern",
      "CMR",
      "Diisocyanat",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr",
      "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)",
      "Transport-Mengenbegrenzung LQ",
      "Transport-Tunnelcode",
      "Kopf",
      "1",
      "1.1",
      "1.2",
      "1.3",
      "1.4",
      "2",
      "2.1",
      "2.2",
      "2.3",
      "3",
      "3.1",
      "3.2",
      "4",
      "4.1",
      "4.2",
      "4.3",
      "5",
      "5.1",
      "5.2",
      "5.3",
      "6",
      "6.1",
      "6.2",
      "6.3",
      "6.4",
      "7",
      "7.1",
      "7.2",
      "7.3",
      "8",
      "8.1",
      "8.2",
      "9",
      "9.1",
      "9.2",
      "10",
      "10.1",
      "10.2",
      "10.3",
      "10.4",
      "10.5",
      "10.6",
      "11",
      "11.1",
      "12",
      "12.1",
      "12.2",
      "12.3",
      "12.4",
      "12.5",
      "12.6",
      "13",
      "13.1",
      "14",
      "14.1",
      "14.2",
      "14.3",
      "14.4",
      "14.5",
      "14.6",
      "14.7",
      "15",
      "15.1",
      "15.2",
      "16",
      "Message",
      "Section-Missing-Count",
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

    const staticRow = Array(94).fill("");
    worksheet.addRow(staticRow);

    const headerMapping = {
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "Dateiname SDB": "Dateiname SDB",
      "SDB-Ausgabedatum bzw. letzte Änderung":
        "SDB-Ausgabedatum bzw. letzte Änderung",
      "CAS-Nummer(n)": "CAS-Nummer(n)",
      Hauptbestandteile: "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510": "Lagerklassen (LGK) nach TRGS 510",
      "Gefahrensymbole (CLP/GHS)": "Gefahrensymbole (CLP/GHS)",
      WGK: "WGK",
      "Transport oder Umfüllen- Verpackungsgruppe":
        "Transport oder Umfüllen- Verpackungsgruppe",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)":
        "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)":
        "H-Sätze (mit EUH) (durch Komma getrennt) (aus Kap.2)",
      "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)":
        "H-Sätze (mit EUH) (durch Komma getrennt) (aus Gesamtdatei)",
      "P-Sätze (durch Komma getrennt) (aus Kap.2)":
        "P-Sätze (durch Komma getrennt) (aus Kap.2)",
      "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)":
        "P-Sätze (durch Komma getrennt) (aus Gesamtdatei)",
      "Flammpunkt [°C]": "Flammpunkt [°C]",
      Aggregatzustand: "Aggregatzustand",
      "CLP/GHS-Symbolnummern": "CLP/GHS-Symbolnummern",
      CMR: "CMR",
      Diisocyanat: "Diisocyanat",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr": "UN Nr",
      "ADR-Klasse (Gefahrgutklasse)": "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)": "Gefahr-Nr (Kemler-Zahl)",
      "Transport-Mengenbegrenzung LQ": "Transport-Mengenbegrenzung LQ",
      "Transport-Tunnelcode": "Transport-Tunnelcode",
      Kopf: "Kopf",
      1: "1",
      1.1: "1.1",
      1.2: "1.2",
      1.3: "1.3",
      1.4: "1.4",
      2: "2",
      2.1: "2.1",
      2.2: "2.2",
      2.3: "2.3",
      3: "3",
      3.1: "3.1",
      3.2: "3.2",
      4: "4",
      4.1: "4.1",
      4.2: "4.2",
      4.3: "4.3",
      5: "5",
      5.1: "5.1",
      5.2: "5.2",
      5.3: "5.3",
      6: "6",
      6.1: "6.1",
      6.2: "6.2",
      6.3: "6.3",
      6.4: "6.4",
      7: "7",
      7.1: "7.1",
      7.2: "7.2",
      7.3: "7.3",
      8: "8",
      8.1: "8.1",
      8.2: "8.2",
      9: "9",
      9.1: "9.1",
      9.2: "9.2",
      10: "10",
      10.1: "10.1",
      10.2: "10.2",
      10.3: "10.3",
      10.4: "10.4",
      10.5: "10.5",
      10.6: "10.6",
      11: "11",
      11.1: "11.1",
      12: "12",
      12.1: "12.1",
      12.2: "12.2",
      12.3: "12.3",
      12.4: "12.4",
      12.5: "12.5",
      12.6: "12.6",
      13: "13",
      13.1: "13.1",
      14: "14",
      14.1: "14.1",
      14.2: "14.2",
      14.3: "14.3",
      14.4: "14.4",
      14.5: "14.5",
      14.6: "14.6",
      14.7: "14.7",
      15: "15",
      15.1: "15.1",
      15.2: "15.2",
      16: "16",
      Message: "Message",
      "Section-Missing-Count": "Section-Missing-Count",
    };

    // Use the same filtering here as well
    const filteredDownloadData = getFilteredData();

    if (filteredDownloadData.length === 0) {
      Helpers.toast(
        "error",
        "No matching records found for the selected filters!"
      );
      return;
    }

    filteredDownloadData.forEach((file) => {
      const rowData = headers.map(
        (header) => file.data[headerMapping[header]] || ""
      );
      worksheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Verbund_Data_${new Date()
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full bg-white py-5 px-10 mx-auto">
      <div className="bg-white rounded-lg p-6 mx-auto">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Verbund Data</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            {Helpers.getTranslationValue("Back")}
          </button>
        </div>

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

      {verbundData.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadAll}
                className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg"
              >
                Download All <FontAwesomeIcon icon={faDownload} />
              </button>

              <input
                className="form-control border border-gray-300 rounded-lg p-2"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                className="form-control border border-gray-300 rounded-lg p-2"
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

            <div>
              <select
                className="w-64 p-2 border rounded-lg shadow-sm"
                value={selectedUser}
                onChange={handleUserChange}
              >
                {/* Default option now shows "All Data" */}
                <option value="">All Data</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
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
                    <p>
                      Product Name: {truncateText(item.data["Produktname"])}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleView(item.data)}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                      View <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadFile(item.file_name, item.data)
                      }
                      className="text-white py-2 px-4 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
                    >
                      Download <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No verbund data found.</p>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">No verbund data found.</p>
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
};

AllVerbundData.propTypes = {
  refresh: PropTypes.bool,
};

export default AllVerbundData;
