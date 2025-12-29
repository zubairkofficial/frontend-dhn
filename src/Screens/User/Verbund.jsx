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
import GetVerbundData from "./GetVerbundData";

const Verbund = () => {
  const { setHeaderData } = useHeader();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [canUpload, setCanUpload] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);
  const [allVerbundData, setAllVerbundData] = useState([]);
  const [verbundCount, setVerbundCount] = useState(0);
  const fileInputRef = useRef(null);
  const [refreshVerbundData, setRefreshVerbundData] = useState(false);
  const checkUsageCount = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}check-usage-count/Verbund`,
        Helpers.authHeaders
      );

      if (response.status === 200) {
        const { available_count } = response.data;
        const normalizedCount =
          typeof available_count === "number" ? available_count : null;

        setAvailableCount(normalizedCount);

        if (normalizedCount !== null && normalizedCount <= 0) {
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
      if (error.response) {
        const { status: statusCode, data } = error.response;
        const remainingCount =
          typeof data?.available_count === "number"
            ? data.available_count
            : null;

        setAvailableCount(remainingCount);

        if (statusCode === 403) {
          setCanUpload(false);
          const sheetsLeftMessage =
            remainingCount !== null
              ? `Only ${remainingCount} data sheet${
                  remainingCount === 1 ? "" : "s"
                } left. Please try again.`
              : Helpers.getTranslationValue("error_usage_limit");

          Helpers.toast("error", sheetsLeftMessage);
          return;
        }
      }

      Helpers.toast("error", Helpers.getTranslationValue("error_check_usage"));
      setCanUpload(false);
    }
  };
  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Verbund"),
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
    setVerbundCount(0);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      Helpers.toast("error", Helpers.getTranslationValue("file_select_first"));
      return;
    }

    if (availableCount !== null && selectedFiles.length > availableCount) {
      Helpers.toast(
        "error",
        `Only ${availableCount} data sheet${
          availableCount === 1 ? "" : "s"
        } left. Please try again.`
      );
      return;
    }

    let userId = Helpers.authUser.id;
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
          `${Helpers.apiUrl}verbund-data-process`,
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
      setVerbundCount(count);
    }

    setAllVerbundData(allData);
    Helpers.toast(
      "success",
      Helpers.getTranslationValue("files_processed_msg")
    );

    setRefreshVerbundData((prev) => !prev);
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Verbund Data");

    // Define the custom headers in your desired order
    const headers = [
      "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)",
      "Hersteller/Lieferant\n(aus 1.3)",
      "Dateiname SDB\n (=Name des pdf's, so wie übergeben)",
      "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)",
      "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)",
      "CAS-Nummer(n)\n(aus 3.)",
      "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510 (aus 15)",
      "Gefahrensymbole (CLP/GHS)\n(aus 2.2)",
      "WGK\n(aus 15)",
      "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)",
      "N.A.G./NOS technische Benennung (Gefahrauslöser)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "Flammpunkt [°C]\n(aus 9.1)",
      "Aggregatzustand (9.1)",
      "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)",
      "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)",
      "Diisocyanat (aus Gesamtdatei)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr \n",
      "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)",
      "Transport: Mengenbegrenzung LQ",
      "Transport: Tunnelcode",
      "BA: Gefahrstoffbezeichnung_1",
      "BA: Gefahrstoffbezeichnung_3",
      "BA: Gefahren für Mensch und Umwelt_2",
      "BA: Schutzmaßnahmen_8",
      "BA: Verhalten im Gefahrenfall _5",
      "BA: Verhalten im Gefahrenfall _6",
      "BA: Erste Hilfe_4",
      "BA: Sachgerechte Entsorgung _13",
      "BA: Sachgerechte Entsorgung _14",
      "Kopf (alles überhalb Kap.1)",
      "tatsächliche Überschrift Kap.1",
      "1.1 Produktidentifikator",
      "1.2 Relevante identifizierte Verwendungen des Stoffs/Gemischs",
      "1.3 Einzelheiten zum Lieferanten, der das Sicherheitsdatenblatt bereitstellt",
      "1.4 Notrufnummer",
      "Kap.1 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.2",
      "2.1 Einstufung des Stoffs/Gemischs",
      "2.2 Kennzeichnungselemente",
      "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen",
      "Kap.2 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.3",
      "3.1 Stoffe",
      "3.2 Gemische",
      "Kap.3 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.4",
      "4.1 Beschreibung der Erste-Hilfe-Maßnahmen",
      "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen",
      "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung",
      "Kap.4 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.5",
      "5.1 Löschmittel",
      "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren",
      "5.3 Hinweise für die Brandbekämpfung",
      "Kap.5 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.6",
      "6.1 Personenbezogene Vorsichtsmaßnahmen, Schutzausrüstungen und in Notfällen anzuwendende",
      "6.2 Umweltschutzmaßnahmen",
      "6.3 Methoden und Material für Rückhaltung und Reinigung",
      "6.4 Verweis auf andere Abschnitte",
      "Kap.6 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.7",
      "7.1 Schutzmaßnahmen zur sicheren Handhabung",
      "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten",
      "7.3 Spezifische Endanwendungen",
      "Kap.7 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.8",
      "8.1 Zu überwachende Parameter",
      "8.2 Begrenzung und Überwachung der Exposition",
      "Kap.8 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.9",
      "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften",
      "9.2 Sonstige Angaben",
      "Kap.9 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.10",
      "10.1 Reaktivität",
      "10.2 Chemische Stabilität",
      "10.3 Möglichkeit gefährlicher Reaktionen",
      "10.4 Zu vermeidende Bedingungen",
      "10.5 Unverträgliche Materialen",
      "10.6 Gefährliche Zersetzungsprodukte",
      "Kap.10 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.11",
      "11.1 Angaben zu toxikologischen Wirkungen",
      "11.2 Angaben über sonstige Gefahren",
      "Kap.11 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.12",
      "12.1 Toxizität",
      "12.2 Persistenz und Abbaubarkeit",
      "12.3 Bioakkumulationspotenzial",
      "12.4 Mobilität im Boden",
      "12.5 Ergebnisse der PBT- und vPvB-Beurteilung",
      "12.6 Andere schädliche Wirkungen",
      "12.7 Endokrinschädliche Eigenschaften",
      "Kap.12 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.13",
      "13.1 Verfahren der Abfallbehandlung",
      "Kap.13 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.14",
      "14.1 UN-Nummer",
      "14.2 Transportbezeichnung",
      "14.3. Transportgefahrenklassen",
      "14.4 Verpackungsgruppe",
      "14.5. Umweltgefahren",
      "14.6 Besondere Vorsichtsmaßnahmen des Verwenders",
      "14.7 Massengutbeförderun auf dem Seeweg",
      "14.8 Sonstige Angaben",
      "Kap.14 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.15",
      "15.1 Sicherheits-, Gesundheits- und Umweltschutzvorschriften",
      "15.2. Stoffsicherheitsbeurteilung",
      "Kap.15 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.16 (sonstige Angaben)",
      "Kap.16 Rest (falls vorhanden)",
      "Rest des SDB (falls vorhanden)",
      "Message",
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

    const headerMapping = headers.reduce((acc, header) => {
      acc[header] = header;
      return acc;
    }, {});

    const produktnameCounts = allVerbundData.reduce((acc, fileData) => {
      const produktname =
        fileData.data?.[
          "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)"
        ] || fileData.data?.["Produktname"];
      if (produktname) {
        acc[produktname] = (acc[produktname] || 0) + 1;
      }
      return acc;
    }, {});

    // Add data rows and apply yellow fill if `Section-Missing-Count` > 0
    allVerbundData.forEach((fileData) => {
      let rowData = headers.map(
        (header) => fileData.data[headerMapping[header]] || ""
      );
      const sectionMissingCount = parseInt(
        rowData[headers.indexOf("Section-Missing-Count")] || 0
      );

      const newRow = worksheet.addRow(rowData);
      const produktname =
        fileData.data?.[
          "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)"
        ] || fileData.data?.["Produktname"];
      const isDuplicate = produktname && produktnameCounts[produktname] > 1;
      // Apply blue fill if rows are duplicate
      if (isDuplicate) {
        newRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ADD8E6" },
          };
        });
      } else if (sectionMissingCount > 0) {
        // Apply yellow fill if `Section-Missing-Count` > 0
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
    worksheet.columns = headers.map(() => ({ width: 30 }));

    // Write the workbook to a file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Verbund_Files.xlsx");
    setRefreshVerbundData((prev) => !prev);
    setSelectedFiles([]);
    setFileStatuses({});
    setAllVerbundData([]);
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
        {Helpers.getTranslationValue("Verbund")}
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
                width: `${(verbundCount / selectedFiles.length) * 100}%`,
              }}
            ></div>
            <span className="absolute inset-0 flex justify-center items-center text-sm font-medium">
              {verbundCount}/{selectedFiles.length} Verbund verabeitet
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

        {allVerbundData.length > 0 && (
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
        <GetVerbundData refresh={refreshVerbundData} />
      </div>
    </div>
  );
};

export default Verbund;
