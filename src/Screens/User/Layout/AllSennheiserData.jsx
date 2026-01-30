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

const AllSennheiserData = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [sennheiserData, setSennheiserData] = useState([]);
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
    const fetchSennheiserData = async () => {
      let response;

      try {
        if (currentUser && currentUser.user_type === 1) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-sennheiser-data-customer/${userId}`,
            Helpers.authHeaders
          );
        }

        if (
          currentUser.is_user_customer === 1 &&
          currentUser.is_user_organizational === 1 &&
          currentUser.user_type === 0
        ) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-sennheiser-data-organization/${userId}`,
            Helpers.authHeaders
          );
        }
        if (
          currentUser.is_user_organizational === 1 &&
          currentUser.is_user_customer !== 1 &&
          currentUser.user_type === 0
        ) {
          response = await axios.get(
            `${Helpers.apiUrl}get-all-sennheiser-data-user/${userId}`,
            Helpers.authHeaders
          );
        }

        if (response && response.status === 200) {
          setUsers(response.data.users);
          setSennheiserData(response.data.data);
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

    fetchSennheiserData();
    fetchLastDownload();
  }, [userId]);

  const getFilteredData = () => {
    return sennheiserData.filter((item) => {
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
    const worksheet = workbook.addWorksheet("Sennheiser Data");

    const headers = [
      "ID Number",
      "Dateiname SDB",
      "Produktname",
      "Hersteller",
      "CAS Nummer bei reinen Stoffen",
      "Ausgabedatum bzw. letzte Änderung",
      "H Sätze durch Komma getrennt",
      "Einstufung des Stoffs oder Gemischs",
      "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung.",
      "Signalwort",
      "Ergänzende Hinweise",
      "P-Sätze",
      "Sonstige Gefahren",
      "LG Klasse",
      "WGK(numerischer Wert)",
      "Flammpunkt (numerischer Wert)",
      "pH-Wert",
      "Gemische",
      "Zu überwachende Parameter",
      "Arbeitsplatzgrenzwert",
      "SVHC",
      "CMR",
      "Kostenstellenfreigabe",
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

    const staticRow = Array(23).fill("");
    worksheet.addRow(staticRow);

    const headerMapping = {
      "ID Number": "ID Number",
      "Dateiname SDB": "Dateiname SDB",
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "CAS Nummer bei reinen Stoffen": "CAS Nummer bei reinen Stoffen",
      "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
      "H Sätze durch Komma getrennt": "H Sätze durch Komma getrennt",
      "Einstufung des Stoffs oder Gemischs":
        "Einstufung des Stoffs oder Gemischs",
      "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung":
        "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung",
      Signalwort: "Signalwort",
      "Ergänzende Hinweise": "Ergänzende Hinweise",
      "P-Sätze": "P-Sätze",
      "Sonstige Gefahren": "Sonstige Gefahren",
      "LG Klasse": "LG Klasse",
      "WGK(numerischer Wert)": "WGK(numerischer Wert)",
      "Flammpunkt (numerischer Wert)": "Flammpunkt (numerischer Wert)",
      "pH-Wert": "pH-Wert",
      Gemische: "Gemische",
      "Zu überwachende Parameter": "Zu überwachende Parameter",
      Arbeitsplatzgrenzwert: "Arbeitsplatzgrenzwert",
      SVHC: "SVHC",
      CMR: "CMR",
      Kostenstellenfreigabe: "Kostenstellenfreigabe",
      "Section-Missing-Count": "Section-Missing-Count",
    };

    const rowData = headers.map((header) => {
      const val = fileData[headerMapping[header]];
      return val != null && typeof val === "object" ? JSON.stringify(val) : (val ?? "");
    });
    const dataRow = worksheet.addRow(rowData);
    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
    });

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
    const worksheet = workbook.addWorksheet("Sennheiser Data");

    const headers = [
      "ID Number",
      "Dateiname SDB",
      "Produktname",
      "Hersteller",
      "CAS Nummer bei reinen Stoffen",
      "Ausgabedatum bzw. letzte Änderung",
      "H Sätze durch Komma getrennt",
      "Einstufung des Stoffs oder Gemischs",
      "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung.",
      "Signalwort",
      "Ergänzende Hinweise",
      "P-Sätze",
      "Sonstige Gefahren",
      "LG Klasse",
      "WGK(numerischer Wert)",
      "Flammpunkt (numerischer Wert)",
      "pH-Wert",
      "Gemische",
      "Zu überwachende Parameter",
      "Arbeitsplatzgrenzwert",
      "SVHC",
      "CMR",
      "Kostenstellenfreigabe",
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

    const staticRow = Array(23).fill("");
    worksheet.addRow(staticRow);

    const headerMapping = {
      "ID Number": "ID Number",
      "Dateiname SDB": "Dateiname SDB",
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "CAS Nummer bei reinen Stoffen": "CAS Nummer bei reinen Stoffen",
      "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
      "H Sätze durch Komma getrennt": "H Sätze durch Komma getrennt",
      "Einstufung des Stoffs oder Gemischs":
        "Einstufung des Stoffs oder Gemischs",
      "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung":
        "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung",
      Signalwort: "Signalwort",
      "Ergänzende Hinweise": "Ergänzende Hinweise",
      "P-Sätze": "P-Sätze",
      "Sonstige Gefahren": "Sonstige Gefahren",
      "LG Klasse": "LG Klasse",
      "WGK(numerischer Wert)": "WGK(numerischer Wert)",
      "Flammpunkt (numerischer Wert)": "Flammpunkt (numerischer Wert)",
      "pH-Wert": "pH-Wert",
      Gemische: "Gemische",
      "Zu überwachende Parameter": "Zu überwachende Parameter",
      Arbeitsplatzgrenzwert: "Arbeitsplatzgrenzwert",
      SVHC: "SVHC",
      CMR: "CMR",
      Kostenstellenfreigabe: "Kostenstellenfreigabe",
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

    // Group data by Produktname to find duplicates and compare values
    const produktnameCounts = filteredDownloadData.reduce((acc, item) => {
      const produktname = item.data?.["Produktname"];
      if (produktname) {
        const normalizedName = produktname.toLowerCase().trim();
        acc[normalizedName] = (acc[normalizedName] || 0) + 1;
      }
      return acc;
    }, {});

    const groupedByProduktname = filteredDownloadData.reduce((acc, file) => {
      const produktname = file.data?.["Produktname"];
      if (produktname) {
        const normalizedName = produktname.toLowerCase().trim();
        if (!acc[normalizedName]) {
          acc[normalizedName] = [];
        }
        acc[normalizedName].push(file);
      }
      return acc;
    }, {});

    filteredDownloadData.forEach((file) => {
      const rowData = headers.map(
        (header) => file.data[headerMapping[header]] || ""
      );
      const newRow = worksheet.addRow(rowData);
      const produktname = file.data?.["Produktname"];
      const normalizedName = produktname
        ? produktname.toLowerCase().trim()
        : "";

      if (produktname && produktnameCounts[normalizedName] > 1) {
        // Mark entire row blue for duplicates
        newRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFA5D5E3" }, // Light Blue #a5d5e3
          };
        });

        // Find other rows with same Produktname to compare values
        const duplicateRows = groupedByProduktname[normalizedName];
        if (duplicateRows.length > 1) {
          // Compare each field and mark different values green
          headers.forEach((header, columnIndex) => {
            const currentValue = file.data[headerMapping[header]] || "";
            const hasDifferentValues = duplicateRows.some(
              (otherFile) =>
                otherFile.id !== file.id &&
                (otherFile.data[headerMapping[header]] || "") !== currentValue
            );

            if (hasDifferentValues) {
              const cell = newRow.getCell(columnIndex + 1);
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFB5CD82" }, // Light Green #B5CD82
              };
            }
          });
        }
      }
    });

    // Same column widths and parsing as single-file download
    worksheet.columns.forEach((column) => {
      column.width = 30;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Sennheiser_Data_${new Date()
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
          <h2 className="text-3xl font-bold text-gray-800">
            All Sennheiser Data
          </h2>
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

      {sennheiserData.length > 0 ? (
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
                    {item.created_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    )}
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
            <p className="text-center text-gray-500">
              No sennheiser data found for the selected date range.
            </p>
          )}
        </>
      ) : (
        !loading && (
          <p className="text-center text-gray-500">No sennheiser data found.</p>
        )
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

AllSennheiserData.propTypes = {
  refresh: PropTypes.bool,
};

export default AllSennheiserData;
