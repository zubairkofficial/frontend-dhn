import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Helpers from "../../Config/Helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useHeader } from "../../Components/HeaderContext";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import GetProcessedData from "./GetProcessedData";

function DataProcess() {
  const { setHeaderData } = useHeader();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [canUpload, setCanUpload] = useState(true);
  const [allProcessedData, setAllProcessedData] = useState([]);
  const [processedCount, setProcessedCount] = useState(0);
  const fileInputRef = useRef(null);
  const [refreshProcessedData, setRefreshProcessedData] = useState(false);
  const checkUsageCount = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}check-usage-count/DataProcess`,
        Helpers.authHeaders
      );
console.log('DataProcess');

      if (response.status === 200) {
        const { userCounterLimit, available_count } = response.data;
        if (available_count <= 0) {
          setCanUpload(false);
          Helpers.toast(
            "error",
            Helpers.getTranslationValue("error_usage_limit")
          );
        } else {
          setCanUpload(true);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setCanUpload(false);
        Helpers.toast(
          "error",
          Helpers.getTranslationValue("error_usage_limit")
        );
      } else {
        Helpers.toast(
          "error",
          Helpers.getTranslationValue("error_check_usage")
        );
        setCanUpload(false);
      }
    }
  };
  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Data Process"),
      desc: "",
    });

    checkUsageCount();
  }, [setHeaderData]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newStatuses = {};

    files.forEach((file) => {
      newStatuses[file.name] = { status: "Pending", data: null };
    });

    setSelectedFiles(files);
    setFileStatuses(newStatuses);
    setProcessedCount(0);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      Helpers.toast("error", Helpers.getTranslationValue("file_select_first"));
      return;
    }

    let json = localStorage.getItem("user");
    let userObj = JSON.parse(json);
    let userId = userObj.id;
    const newStatuses = { ...fileStatuses };
    let allData = [];
    let count = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("documents[]", file);
      formData.append("user_id", userId);

      newStatuses[file.name] = { status: "In Progress" };
      setFileStatuses({ ...newStatuses });

      try {
        const response = await axios.post(
          `${Helpers.apiUrl}data-process`,
          formData,
          Helpers.authFileHeaders
        );

        if (response.status === 200 && response.data && response.data.data) {
          newStatuses[file.name].status = "Completed";
          setFileStatuses({ ...newStatuses });

          checkUsageCount();

          const parsedData = response.data.data.map((item) => {
            try {
              return { data: item || {} };
            } catch (parseError) {
              console.error("Error processing item:", item, parseError);
              return { data: {} };
            }
          });

          allData = allData.concat(parsedData);
        } else {
          throw new Error(
            response.message || Helpers.getTranslationValue("error_file_upload")
          );
        }
      } catch (error) {
        console.error("Error uploading file:", file.name, error);
        newStatuses[file.name].status = "Error";
        setFileStatuses({ ...newStatuses });
      }

      count += 1;
      setProcessedCount(count);
    }

    setAllProcessedData(allData);
    Helpers.toast(
      "success",
      Helpers.getTranslationValue("files_processed_msg")
    );

    // Trigger GetProcessedData to refresh
    setRefreshProcessedData((prev) => !prev);
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Processed Data");

    // Define the custom headers in your desired order
    const headers = [
      "Lagerkunde",
      "Artikel Nr.(Länge beachten)",
      "Materialkurztext",
      "Produktname",
      "Hersteller",
      "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse",
      "WGK(numerischer Wert)",
      "H Sätze durch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]",
      "Nr./Kategorie gem. Anhang I, 12. BImSchV 2017",
      "UN Nr",
      "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)",
      "Verpackungsgruppe",
      "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)",
      "LQ (Spalte eingefügt)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5",
      "Main Ingredients",
      "Section - PreText",
      "Section - 1",
      "Section - 2",
      "Section - 2|2.2",
      "Section - 3",
      "Section - 5|5.1",
      "Section - 7|7.2--15|15.1",
      "Section - 7|7.2",
      "Section - 9|9.1",
      "Section - 10|10.5",
      "Section - 15",
      "Section - 14",
      "Section-Missing-Count",
    ];

    // Add headers to the worksheet with styles
    worksheet.addRow(headers);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 14 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.border = {
        top: { style: "thick" },
        bottom: { style: "thick" },
        left: { style: "thick" },
        right: { style: "thick" },
      };
    });

    // Add the static row data below the header row
    const staticRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      "14",
      "1-HZWMSC",
      "1-HZDWGK",
      "3-HARIZIN",
      "1-H2FLSP 3n",
      "",
      "1-HZUNNR 6n",
      "2-HECODE",
      "4-HMKLAS",
      "4-HMVPAK",
      "4-HMTNCD",
      "1-HZGSDE / 4-HMGSDE",
      "4-HMLQTP",
    ];
    worksheet.addRow(staticRow);

    const headerMapping = {
      Lagerkunde: "Lagerkunde",
      "Artikel Nr.(Länge beachten)": "Artikel Nr.\n(Länge beachten)",
      Materialkurztext: "Materialkurztext",
      Produktname: "Produktname",
      Hersteller: "Hersteller",
      "Dateiname SDB": "Dateiname SDB",
      "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
      "LG Klasse": "LG Klasse",
      "WGK(numerischer Wert)": "WGK\n(numerischer Wert)",
      "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
      "Flammpunkt (numerischer Wert)[°C]":
        "Flammpunkt\n(numerischer Wert)\n[°C]",
      "Nr./Kategorie gem. Anhang I, 12. BImSchV 2017":
        "Nr./Kategorie gem. Anhang I, 12. BImSchV 2017",
      "UN Nr": "UN Nr",
      Gefahrensymbole: "Gefahrensymbole",
      "Gefahrgutklasse (Länge beachten)": "Gefahrgutklasse (Länge beachten)",
      Verpackungsgruppe: "Verpackungsgruppe",
      Tunnelcode: "Tunnelcode",
      "N.A.G./NOS technische Benennung (Gefahraus-löser)":
        "N.A.G./NOS\ntechnische Benennung\n(Gefahraus-löser)",
      "LQ (Spalte eingefügt)": "LQ (Spalte eingefügt)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Freigabe Störrfallbeauftragter": "Freigabe Störrfallbeauftragter",
      "Maßnahmen Lagerung Abschnitt 7.2": "Maßnahmen Lagerung\nAbschnitt 7.2",
      "Zusammenlagerverbot Abschnitt 10.5":
        "Zusammenlagerverbot\nAbschnitt 10.5",
      "Main Ingredients": "Main Ingredients",
      "Section - PreText": "Section - PreText",
      "Section - 1": "Section - 1",
      "Section - 2": "Section - 2",
      "Section - 2|2.2": "Section - 2|2.2",
      "Section - 3": "Section - 3",
      "Section - 5|5.1": "Section - 5|5.1",
      "Section - 7|7.2--15|15.1": "Section - 7|7.2--15",
      "Section - 7|7.2": "Section - 7|7.2",
      "Section - 9|9.1": "Section - 9|9.1",
      "Section - 10|10.5": "Section - 10|10.5",
      "Section - 15": "Section - 15",
      "Section - 14": "Section - 14",
      "Section-Missing-Count": "Section-Missing-Count",
    };

    // Add data rows and apply yellow fill if `Section-Missing-Count` > 0
    allProcessedData.forEach((fileData) => {
      let rowData = headers.map(
        (header) => fileData.data[headerMapping[header]] || ""
      );
      const sectionMissingCount = parseInt(
        rowData[headers.indexOf("Section-Missing-Count")] || 0
      );

      const newRow = worksheet.addRow(rowData);

      // Apply yellow fill if `Section-Missing-Count` > 0
      if (sectionMissingCount > 0) {
        newRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" },
          };
        });
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 20 },
      ...Array(headers.length - 4).fill({ width: 30 }),
      { width: 5 },
      { width: 30 },
    ];

    // Write the workbook to a file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Processed_Files_Data.xlsx");
    setRefreshProcessedData((prev) => !prev); // Trigger GetProcessedData to refresh
    setSelectedFiles([]);
    setFileStatuses({});
    setAllProcessedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Progress":
        return (
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
        );
      case "Completed":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case "Error":
        return (
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-red-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white py-5 mx-auto">
      <h2 className="text-center text-2xl font-semibold mb-8">
        {Helpers.getTranslationValue("Data Process")}
      </h2>

      <div className="flex flex-col items-center px-10">
        <input
          type="file"
          className="form-control mb-4 border border-bgray-300 w-full rounded-lg px-4 py-3.5 placeholder:placeholder:text-base"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
          multiple
          disabled={!canUpload}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="px-10">
        {selectedFiles.length > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
            <div
              className="bg-green-500 h-6 rounded-full"
              style={{
                width: `${(processedCount / selectedFiles.length) * 100}%`,
              }}
            ></div>
            <span className="absolute inset-0 flex justify-center items-center text-sm font-medium">
              {processedCount}/{selectedFiles.length} SDB verabeitet
            </span>
          </div>
        )}

        <ul className="space-y-4">
          {selectedFiles.map((file, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center space-x-2">
                <span>
                  {file.name} ({file.size} bytes)
                </span>
                <span className="flex items-center space-x-2">
                  {getStatusIcon(fileStatuses[file.name]?.status)}
                  <span>{fileStatuses[file.name]?.status}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-1 mt-8 px-10">
        <button
          onClick={handleFileUpload}
          disabled={
            Object.values(fileStatuses).some(
              (file) => file.status === "In Progress"
            ) || !canUpload
          }
          className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
          style={{ marginRight: "40px" }}
        >
          {Helpers.getTranslationValue("carry_out")}{" "}
          <FontAwesomeIcon icon={faCloudUploadAlt} className="ml-2" />
        </button>

        {allProcessedData.length > 0 && (
          <button
            onClick={handleDownload}
            className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
          >
            {Helpers.getTranslationValue("download_file")}{" "}
            <FontAwesomeIcon icon={faDownload} className="ml-2" />
          </button>
        )}
      </div>
      <div className="mt-10">
        <GetProcessedData refresh={refreshProcessedData} />
      </div>
    </div>
  );
}

export default DataProcess;
