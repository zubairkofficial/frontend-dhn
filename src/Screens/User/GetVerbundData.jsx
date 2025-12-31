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

const GetVerbundData = ({ refresh }) => {
  // State declarations
  const [verbundData, setVerbundData] = useState([]);
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
        `${Helpers.apiUrl}get-user-verbund-data`,
        Helpers.authHeaders
      );
      if (response.status === 200) {
        setVerbundData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFilteredData = () => {
    if (!startDate || !endDate) {
      return verbundData; // No filter applied, return all data
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Set time to 00:00:00

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Extend to the end of the day

    return verbundData.filter((item) => {
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
    const worksheet = workbook.addWorksheet("Verbund Data");

    // Define headers in the desired order
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

    // Helper functions to extract values from API response content
    const extractValue = (content, section) => {
      if (!content) return "";
      const regex = new RegExp(
        `${section}\\s*([^\\n]*(?:\\n(?!\\d+\\.\\d+)[^\\n]*)*)`,
        "i"
      );
      const match = content.match(regex);
      return match ? match[1].trim() : "";
    };

    const extract6_1 = (data) => {
      const content = data["tatsächliche Überschrift Kap.6"] || "";
      return extractValue(content, "6\\.1");
    };

    const extract3_1 = (data) => {
      const content = data["tatsächliche Überschrift Kap.3"] || "";
      return extractValue(content, "3\\.1");
    };

    const extract11_2 = (data) => {
      const content = data["tatsächliche Überschrift Kap.11"] || "";
      return extractValue(content, "11\\.2");
    };

    const extract14_7 = (data) => {
      const content = data["tatsächliche Überschrift Kap.14"] || "";
      return extractValue(content, "14\\.7");
    };

    const extract14_8 = (data) => {
      const content = data["tatsächliche Überschrift Kap.14"] || "";
      return extractValue(content, "14\\.8");
    };

    const extract15_1 = (data) => {
      const content = data["tatsächliche Überschrift Kap.15"] || "";
      return extractValue(content, "15\\.1");
    };

    // Field mapping to align API response fields with expected headers
    const fieldMapping = {
      "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)":
        "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)",
      "Hersteller/Lieferant\n(aus 1.3)": "Hersteller/Lieferant\n(aus1.3)",
      "Dateiname SDB\n (=Name des pdf's, so wie übergeben)":
        "Dateiname SDB\n (=Name des pdf's, so wie übergeben)",
      "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)":
        "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)",
      "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)":
        "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)",
      "CAS-Nummer(n)\n(aus 3.)": "CAS-Nummer(n)\n(aus 3.)",
      Hauptbestandteile: "Hauptbestandteile",
      "Lagerklassen (LGK) nach TRGS 510 (aus 15)":
        "Lagerklassen (LGK) nach TRGS 510 (aus 15)",
      "Gefahrensymbole (CLP/GHS)\n(aus 2.2)":
        "Gefahrensymbole (CLP/GHS)\n(aus 2.2)",
      "WGK\n(aus 15)": "WGK\n(aus 15.2)",
      "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)":
        "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)",
      "N.A.G./NOS technische Benennung (Gefahrauslöser)":
        "N.A.G./NOS technische Benennung (Gefahrauslöser)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)":
        "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)":
        "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)":
        "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)":
        "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "Flammpunkt [°C]\n(aus 9.1)": "Flammpunkt [°C]\n(aus 9.1)",
      "Aggregatzustand (9.1)": "Aggregatzustand (9.1)",
      "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)":
        "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)",
      "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)":
        "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)",
      "Diisocyanat (aus Gesamtdatei)": "Diisocyanat (aus Gesamtdatei)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "UN Nr \n": "UN Nr \n",
      "ADR-Klasse (Gefahrgutklasse)": "ADR-Klasse (Gefahrgutklasse)",
      "Gefahr-Nr (Kemler-Zahl)": "Gefahr-Nr (Kemler-Zahl)",
      "Transport: Mengenbegrenzung LQ": "Transport: Mengenbegrenzung LQ",
      "Transport: Tunnelcode": "Transport: Tunnelcode",
      "BA: Gefahrstoffbezeichnung_1": "BA: Gefahrstoffbezeichnung_1",
      "BA: Gefahrstoffbezeichnung_3": "BA: Gefahrstoffbezeichnung_3",
      "BA: Gefahren für Mensch und Umwelt_2":
        "BA: Gefahren für Mensch und Umwelt_2",
      "BA: Schutzmaßnahmen_8": "BA: Schutzmaßnahmen_8",
      "BA: Verhalten im Gefahrenfall _5": "BA: Verhalten im Gefahrenfall _5",
      "BA: Verhalten im Gefahrenfall _6": "BA: Verhalten im Gefahrenfall _6",
      "BA: Erste Hilfe_4": "BA: Erste Hilfe_4",
      "BA: Sachgerechte Entsorgung _13": "BA: Sachgerechte Entsorgung _13",
      "BA: Sachgerechte Entsorgung _14": "BA: Sachgerechte Entsorgung _14",
      "Kopf (alles überhalb Kap.1)": "-", // This field is not provided by API, use "-" as per user requirement
      "tatsächliche Überschrift Kap.1": "tatsächliche Überschrift Kap.1",
      "1.1 Produktidentifikator": "1.1 Produktidentifikator",
      "1.2 Relevante identifizierte Verwendungen des Stoffs/Gemischs":
        "1.2 Relevante identifizierte Verwendungen des Stoffs/Gemischs",
      "1.3 Einzelheiten zum Lieferanten, der das Sicherheitsdatenblatt bereitstellt":
        "1.3 Einzelheiten zum Lieferanten, der das Sicherheitsdatenblatt bereitstellt",
      "1.4 Notrufnummer": "1.4 Notrufnummer",
      "Kap.1 Rest (falls vorhanden)": "Kap.1 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.2": "tatsächliche Überschrift Kap.2",
      "2.1 Einstufung des Stoffs/Gemischs":
        "2.1 Einstufung des Stoffs/Gemischs",
      "2.2 Kennzeichnungselemente": "2.2 Kennzeichnungselemente",
      "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen":
        "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen",
      "Kap.2 Rest (falls vorhanden)": "Kap.2 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.3": "tatsächliche Überschrift Kap.3",
      "3.1 Stoffe": extract3_1,
      "3.2 Gemische": "3.2 Gemische",
      "Kap.3 Rest (falls vorhanden)": "Kap.3 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.4": "tatsächliche Überschrift Kap.4",
      "4.1 Beschreibung der Erste-Hilfe-Maßnahmen":
        "4.1 Beschreibung der Erste-Hilfe-Maßnahmen",
      "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen":
        "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen",
      "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung":
        "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung",
      "Kap.4 Rest (falls vorhanden)": "Kap.4 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.5": "tatsächliche Überschrift Kap.5",
      "5.1 Löschmittel": "5.1 Löschmittel",
      "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren":
        "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren",
      "5.3 Hinweise für die Brandbekämpfung":
        "5.3 Hinweise für die Brandbekämpfung",
      "Kap.5 Rest (falls vorhanden)": "Kap.5 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.6": "tatsächliche Überschrift Kap.6",
      "6.1 Personenbezogene Vorsichtsmaßnahmen, Schutzausrüstungen und in Notfällen anzuwendende":
        extract6_1,
      "6.2 Umweltschutzmaßnahmen": "6.2 Umweltschutzmaßnahmen",
      "6.3 Methoden und Material für Rückhaltung und Reinigung":
        "6.3 Methoden und Material für Rückhaltung und Reinigung",
      "6.4 Verweis auf andere Abschnitte": "6.4 Verweis auf andere Abschnitte",
      "Kap.6 Rest (falls vorhanden)": "Kap.6 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.7": "tatsächliche Überschrift Kap.7",
      "7.1 Schutzmaßnahmen zur sicheren Handhabung":
        "7.1 Schutzmaßnahmen zur sicheren Handhabung",
      "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten":
        "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten",
      "7.3 Spezifische Endanwendungen": "7.3 Spezifische Endanwendungen",
      "Kap.7 Rest (falls vorhanden)": "Kap.7 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.8": "tatsächliche Überschrift Kap.8",
      "8.1 Zu überwachende Parameter": "8.1 Zu überwachende Parameter",
      "8.2 Begrenzung und Überwachung der Exposition":
        "8.2 Begrenzung und Überwachung der Exposition",
      "Kap.8 Rest (falls vorhanden)": "Kap.8 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.9": "tatsächliche Überschrift Kap.9",
      "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften":
        "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften",
      "9.2 Sonstige Angaben": "9.2 Sonstige Angaben",
      "Kap.9 Rest (falls vorhanden)": "Kap.9 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.10": "tatsächliche Überschrift Kap.10",
      "10.1 Reaktivität": "10.1 Reaktivität",
      "10.2 Chemische Stabilität": "10.2 Chemische Stabilität",
      "10.3 Möglichkeit gefährlicher Reaktionen":
        "10.3 Möglichkeit gefährlicher Reaktionen",
      "10.4 Zu vermeidende Bedingungen": "10.4 Zu vermeidende Bedingungen",
      "10.5 Unverträgliche Materialen": "10.5 Unverträgliche Materialen",
      "10.6 Gefährliche Zersetzungsprodukte":
        "10.6 Gefährliche Zersetzungsprodukte",
      "Kap.10 Rest (falls vorhanden)": "Kap.10 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.11": "tatsächliche Überschrift Kap.11",
      "11.1 Angaben zu toxikologischen Wirkungen":
        "11.1 Angaben zu toxikologischen Wirkungen",
      "11.2 Angaben über sonstige Gefahren": extract11_2,
      "Kap.11 Rest (falls vorhanden)": "Kap.11 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.12": "tatsächliche Überschrift Kap.12",
      "12.1 Toxizität": "12.1 Toxizität",
      "12.2 Persistenz und Abbaubarkeit": "12.2 Persistenz und Abbaubarkeit",
      "12.3 Bioakkumulationspotenzial": "12.3 Bioakkumulationspotenzial",
      "12.4 Mobilität im Boden": "12.4 Mobilität im Boden",
      "12.5 Ergebnisse der PBT- und vPvB-Beurteilung":
        "12.5 Ergebnisse der PBT- und vPvB-Beurteilung",
      "12.6 Andere schädliche Wirkungen": "12.6 Andere schädliche Wirkungen",
      "12.7 Endokrinschädliche Eigenschaften":
        "12.7 Endokrinschädliche Eigenschaften",
      "Kap.12 Rest (falls vorhanden)": "Kap.12 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.13": "tatsächliche Überschrift Kap.13",
      "13.1 Verfahren der Abfallbehandlung":
        "13.1 Verfahren der Abfallbehandlung",
      "Kap.13 Rest (falls vorhanden)": "Kap.13 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.14": "tatsächliche Überschrift Kap.14",
      "14.1 UN-Nummer": "14.1 UN-Nummer",
      "14.2 Transportbezeichnung": "14.2 Transportbezeichnung",
      "14.3. Transportgefahrenklassen": "14.3. Transportgefahrenklassen",
      "14.4 Verpackungsgruppe": "14.4 Verpackungsgruppe",
      "14.5. Umweltgefahren": "14.5. Umweltgefahren",
      "14.6 Besondere Vorsichtsmaßnahmen des Verwenders":
        "14.6 Besondere Vorsichtsmaßnahmen des Verwenders",
      "14.7 Massengutbeförderun auf dem Seeweg": extract14_7,
      "14.8 Sonstige Angaben": extract14_8,
      "Kap.14 Rest (falls vorhanden)": "Kap.14 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.15": "tatsächliche Überschrift Kap.15",
      "15.1 Sicherheits-, Gesundheits- und Umweltschutzvorschriften":
        extract15_1,
      "15.2. Stoffsicherheitsbeurteilung": "15.2. Stoffsicherheitsbeurteilung",
      "Kap.15 Rest (falls vorhanden)": "Kap.15 Rest (falls vorhanden)",
      "tatsächliche Überschrift Kap.16 (sonstige Angaben)":
        "tatsächliche Überschrift Kap.16 (sonstige Angaben)",
      "Kap.16 Rest (falls vorhanden)": "Kap.16 Rest (falls vorhanden)",
      "Rest des SDB (falls vorhanden)": "-", // Not provided by API
      Message: "Message",
      "Section-Missing-Count": "Section-Missing-Count",
    };

    // Map data correctly using fieldMapping
    const rowData = headers.map((header) => {
      const mappedField = fieldMapping[header];
      if (mappedField === "-") return "-";
      if (typeof mappedField === "function") {
        return mappedField(fileData);
      }
      return fileData[mappedField] || "";
    });
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
      "1.1 Produktidentifikator",
      "10.1 Reaktivität",
      "10.2 Chemische Stabilität",
      "10.3 Möglichkeit gefährlicher Reaktionen",
      "10.4 Zu vermeidende Bedingungen",
      "10.5 Unverträgliche Materialen",
      "10.6 Gefährliche Zersetzungsprodukte",
      "11.1 Angaben zu toxikologischen Wirkungen",
      "12.1 Toxizität",
      "12.2 Persistenz und Abbaubarkeit",
      "12.3 Bioakkumulationspotenzial",
      "12.4 Mobilität im Boden",
      "12.5 Ergebnisse der PBT- und vPvB-Beurteilung",
      "12.6 Andere schädliche Wirkungen",
      "12.7 Endokrinschädliche Eigenschaften",
      "13.1 Verfahren der Abfallbehandlung",
      "14.1 UN-Nummer",
      "14.2 Transportbezeichnung",
      "14.3. Transportgefahrenklassen",
      "14.4 Verpackungsgruppe",
      "14.5. Umweltgefahren",
      "14.6 Besondere Vorsichtsmaßnahmen des Verwenders",
      "15.2. Stoffsicherheitsbeurteilung",
      "2.1 Einstufung des Stoffs/Gemischs",
      "2.2 Kennzeichnungselemente",
      "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen",
      "3.2 Gemische",
      "4.1 Beschreibung der Erste-Hilfe-Maßnahmen",
      "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen",
      "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung",
      "5.1 Löschmittel",
      "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren",
      "5.3 Hinweise für die Brandbekämpfung",
      "6.3 Methoden und Material für Rückhaltung und Reinigung",
      "6.4 Verweis auf andere Abschnitte",
      "7.1 Schutzmaßnahmen zur sicheren Handhabung",
      "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten",
      "7.3 Spezifische Endanwendungen",
      "8.1 Zu überwachende Parameter",
      "8.2 Begrenzung und Überwachung der Exposition",
      "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften",
      "9.2 Sonstige Angaben",
      "ADR-Klasse (Gefahrgutklasse)",
      "Aggregatzustand (9.1)",
      "BA: Erste Hilfe_4",
      "BA: Gefahren für Mensch und Umwelt_2",
      "BA: Gefahrstoffbezeichnung_1",
      "BA: Gefahrstoffbezeichnung_3",
      "BA: Sachgerechte Entsorgung _13",
      "BA: Sachgerechte Entsorgung _14",
      "BA: Schutzmaßnahmen_8",
      "BA: Verhalten im Gefahrenfall_5",
      "BA: Verhalten im Gefahrenfall_6",
      "CAS-Nummer(n)\n(aus 3.)",
      "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)",
      "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)",
      "Dateiname SDB\n (=Name des pdf's, so wie übergeben)",
      "Diisocyanat (aus Gesamtdatei)",
      "Flammpunkt [°C]\n(aus 9.1)",
      "Gefahr-Nr (Kemler-Zahl)",
      "Gefahrensymbole (CLP/GHS)\n(aus 2.2)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)",
      "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)",
      "Hauptbestandteile",
      "Hersteller/Lieferant\n(aus1.3)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Kap.1 Rest (falls vorhanden)",
      "Kap.10 Rest (falls vorhanden)",
      "Kap.11 Rest (falls vorhanden)",
      "Kap.12 Rest (falls vorhanden)",
      "Kap.13 Rest (falls vorhanden)",
      "Kap.14 Rest (falls vorhanden)",
      "Kap.15 Rest (falls vorhanden)",
      "Kap.16 Rest (falls vorhanden)",
      "Kap.2 Rest (falls vorhanden)",
      "Kap.3 Rest (falls vorhanden)",
      "Kap.4 Rest (falls vorhanden)",
      "Kap.5 Rest (falls vorhanden)",
      "Kap.6 Rest (falls vorhanden)",
      "Kap.7 Rest (falls vorhanden)",
      "Kap.8 Rest (falls vorhanden)",
      "Kap.9 Rest (falls vorhanden)",
      "Lagerklassen (LGK) nach TRGS 510 (aus 15)",
      "Message",
      "N.A.G./NOS technische Benennung (Gefahrauslöser)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)",
      "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)",
      "Section-Missing-Count",
      "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)",
      "Transport: Mengenbegrenzung LQ",
      "Transport: Tunnelcode",
      "UN Nr \n",
      "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)",
      "WGK\n(aus 15.2)",
      "tatsächliche Überschrift Kap.1",
      "tatsächliche Überschrift Kap.10",
      "tatsächliche Überschrift Kap.11",
      "tatsächliche Überschrift Kap.12",
      "tatsächliche Überschrift Kap.13",
      "tatsächliche Überschrift Kap.14",
      "tatsächliche Überschrift Kap.15",
      "tatsächliche Überschrift Kap.16 (sonstige Angaben)",
      "tatsächliche Überschrift Kap.2",
      "tatsächliche Überschrift Kap.3",
      "tatsächliche Überschrift Kap.4",
      "tatsächliche Überschrift Kap.5",
      "tatsächliche Überschrift Kap.6",
      "tatsächliche Überschrift Kap.7",
      "tatsächliche Überschrift Kap.8",
      "tatsächliche Überschrift Kap.9",
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

    const produktnameCounts = filteredData.reduce((acc, item) => {
      const produktname =
        item.data["Handelsname/Produktname/Produktidentifikator\n(aus 1.1)"] ||
        item.data["Produktname"];
      if (produktname) {
        acc[produktname] = (acc[produktname] || 0) + 1;
      }
      return acc;
    }, {});

    // Field mapping to align API response fields with expected headers
    const fieldMapping = {
      "1.1 Produktidentifikator": "1.1 Produktidentifikator",
      "10.1 Reaktivität": "10.1 Reaktivität",
      "10.2 Chemische Stabilität": "10.2 Chemische Stabilität",
      "10.3 Möglichkeit gefährlicher Reaktionen":
        "10.3 Möglichkeit gefährlicher Reaktionen",
      "10.4 Zu vermeidende Bedingungen": "10.4 Zu vermeidende Bedingungen",
      "10.5 Unverträgliche Materialen": "10.5 Unverträgliche Materialen",
      "10.6 Gefährliche Zersetzungsprodukte":
        "10.6 Gefährliche Zersetzungsprodukte",
      "11.1 Angaben zu toxikologischen Wirkungen":
        "11.1 Angaben zu toxikologischen Wirkungen",
      "12.1 Toxizität": "12.1 Toxizität",
      "12.2 Persistenz und Abbaubarkeit": "12.2 Persistenz und Abbaubarkeit",
      "12.3 Bioakkumulationspotenzial": "12.3 Bioakkumulationspotenzial",
      "12.4 Mobilität im Boden": "12.4 Mobilität im Boden",
      "12.5 Ergebnisse der PBT- und vPvB-Beurteilung":
        "12.5 Ergebnisse der PBT- und vPvB-Beurteilung",
      "12.6 Andere schädliche Wirkungen": "12.6 Andere schädliche Wirkungen",
      "12.7 Endokrinschädliche Eigenschaften":
        "12.7 Endokrinschädliche Eigenschaften",
      "13.1 Verfahren der Abfallbehandlung":
        "13.1 Verfahren der Abfallbehandlung",
      "14.1 UN-Nummer": "14.1 UN-Nummer",
      "14.2 Transportbezeichnung": "14.2 Transportbezeichnung",
      "14.3. Transportgefahrenklassen": "14.3. Transportgefahrenklassen",
      "14.4 Verpackungsgruppe": "14.4 Verpackungsgruppe",
      "14.5. Umweltgefahren": "14.5. Umweltgefahren",
      "14.6 Besondere Vorsichtsmaßnahmen des Verwenders":
        "14.6 Besondere Vorsichtsmaßnahmen des Verwenders",
      "15.2. Stoffsicherheitsbeurteilung": "15.2. Stoffsicherheitsbeurteilung",
      "2.1 Einstufung des Stoffs/Gemischs":
        "2.1 Einstufung des Stoffs/Gemischs",
      "2.2 Kennzeichnungselemente": "2.2 Kennzeichnungselemente",
      "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen":
        "2.3 Sonstige Gefahren, die nicht zu einer Einstufung führen",
      "3.2 Gemische": "3.2 Gemische",
      "4.1 Beschreibung der Erste-Hilfe-Maßnahmen":
        "4.1 Beschreibung der Erste-Hilfe-Maßnahmen",
      "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen":
        "4.2 Wichtigste akute und verzögert auftretende Symptome und Wirkungen",
      "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung":
        "4.3 Hinweise auf ärztliche Soforthilfe oder Spezialbehandlung",
      "5.1 Löschmittel": "5.1 Löschmittel",
      "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren":
        "5.2 Besondere vom Stoff oder Gemisch ausgehende Gefahren",
      "5.3 Hinweise für die Brandbekämpfung":
        "5.3 Hinweise für die Brandbekämpfung",
      "6.3 Methoden und Material für Rückhaltung und Reinigung":
        "6.3 Methoden und Material für Rückhaltung und Reinigung",
      "6.4 Verweis auf andere Abschnitte": "6.4 Verweis auf andere Abschnitte",
      "7.1 Schutzmaßnahmen zur sicheren Handhabung":
        "7.1 Schutzmaßnahmen zur sicheren Handhabung",
      "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten":
        "7.2. Bedingungen zur sicheren Lagerung unter Berücksichtigung von Unverträglichkeiten",
      "7.3 Spezifische Endanwendungen": "7.3 Spezifische Endanwendungen",
      "8.1 Zu überwachende Parameter": "8.1 Zu überwachende Parameter",
      "8.2 Begrenzung und Überwachung der Exposition":
        "8.2 Begrenzung und Überwachung der Exposition",
      "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften":
        "9.1 Angaben zu den grundlegenden physikalischen und chemischen Eigenschaften",
      "9.2 Sonstige Angaben": "9.2 Sonstige Angaben",
      "ADR-Klasse (Gefahrgutklasse)": "ADR-Klasse (Gefahrgutklasse)",
      "Aggregatzustand (9.1)": "Aggregatzustand (9.1)",
      "BA: Erste Hilfe_4": "BA: Erste Hilfe_4",
      "BA: Gefahren für Mensch und Umwelt_2":
        "BA: Gefahren für Mensch und Umwelt_2",
      "BA: Gefahrstoffbezeichnung_1": "BA: Gefahrstoffbezeichnung_1",
      "BA: Gefahrstoffbezeichnung_3": "BA: Gefahrstoffbezeichnung_3",
      "BA: Sachgerechte Entsorgung _13": "BA: Sachgerechte Entsorgung _13",
      "BA: Sachgerechte Entsorgung _14": "BA: Sachgerechte Entsorgung _14",
      "BA: Schutzmaßnahmen_8": "BA: Schutzmaßnahmen_8",
      "BA: Verhalten im Gefahrenfall_5": "BA: Verhalten im Gefahrenfall _5",
      "BA: Verhalten im Gefahrenfall_6": "BA: Verhalten im Gefahrenfall _6",
      "CAS-Nummer(n)\n(aus 3.)": "CAS-Nummer(n)\n(aus 3.)",
      "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)":
        "CLP/GHS-Symbolnummern\n(CLP-Code mit Text; aus Piktorammen Kap.2 erkennen)",
      "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)":
        "CMR\n(GHS08 Piktogramm & einer der folgenden Sätze: H340, H341, H350, H351, H360, H361 (inkl Unterkategorie in Form von Buchstaben zB f)",
      "Dateiname SDB\n (=Name des pdf's, so wie übergeben)":
        "Dateiname SDB\n (=Name des pdf's, so wie übergeben)",
      "Diisocyanat (aus Gesamtdatei)": "Diisocyanat (aus Gesamtdatei)",
      "Flammpunkt [°C]\n(aus 9.1)": "Flammpunkt [°C]\n(aus 9.1)",
      "Gefahr-Nr (Kemler-Zahl)": "Gefahr-Nr (Kemler-Zahl)",
      "Gefahrensymbole (CLP/GHS)\n(aus 2.2)":
        "Gefahrensymbole (CLP/GHS)\n(aus 2.2)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)":
        "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)":
        "H-Sätze (mit EUH)\n(durch Komma getrennt)\n(aus Kap.2)",
      "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)":
        "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)",
      Hauptbestandteile: "Hauptbestandteile",
      "Hersteller/Lieferant\n(aus1.3)": "Hersteller/Lieferant\n(aus1.3)",
      "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)":
        "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
      "Kap.1 Rest (falls vorhanden)": "Kap.1 Rest (falls vorhanden)",
      "Kap.10 Rest (falls vorhanden)": "Kap.10 Rest (falls vorhanden)",
      "Kap.11 Rest (falls vorhanden)": "Kap.11 Rest (falls vorhanden)",
      "Kap.12 Rest (falls vorhanden)": "Kap.12 Rest (falls vorhanden)",
      "Kap.13 Rest (falls vorhanden)": "Kap.13 Rest (falls vorhanden)",
      "Kap.14 Rest (falls vorhanden)": "Kap.14 Rest (falls vorhanden)",
      "Kap.15 Rest (falls vorhanden)": "Kap.15 Rest (falls vorhanden)",
      "Kap.16 Rest (falls vorhanden)": "Kap.16 Rest (falls vorhanden)",
      "Kap.2 Rest (falls vorhanden)": "Kap.2 Rest (falls vorhanden)",
      "Kap.3 Rest (falls vorhanden)": "Kap.3 Rest (falls vorhanden)",
      "Kap.4 Rest (falls vorhanden)": "Kap.4 Rest (falls vorhanden)",
      "Kap.5 Rest (falls vorhanden)": "Kap.5 Rest (falls vorhanden)",
      "Kap.6 Rest (falls vorhanden)": "Kap.6 Rest (falls vorhanden)",
      "Kap.7 Rest (falls vorhanden)": "Kap.7 Rest (falls vorhanden)",
      "Kap.8 Rest (falls vorhanden)": "Kap.8 Rest (falls vorhanden)",
      "Kap.9 Rest (falls vorhanden)": "Kap.9 Rest (falls vorhanden)",
      "Lagerklassen (LGK) nach TRGS 510 (aus 15)":
        "Lagerklassen (LGK) nach TRGS 510 (aus 15)",
      Message: "Message",
      "N.A.G./NOS technische Benennung (Gefahrauslöser)":
        "N.A.G./NOS technische Benennung (Gefahrauslöser)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)":
        "P-Sätze\n(durch Komma getrennt)\n(aus Gesamtdatei)",
      "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)":
        "P-Sätze\n(durch Komma getrennt)\n(aus Kap.2)",
      "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)":
        "SDB-Ausgabedatum bzw. letzte Änderung\n(aus Kopfdaten)",
      "Section-Missing-Count": "Section-Missing-Count",
      "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)":
        "Transport oder Umfüllen: Verpackungsgruppe\n(aus 14.4)",
      "Transport: Mengenbegrenzung LQ": "Transport: Mengenbegrenzung LQ",
      "Transport: Tunnelcode": "Transport: Tunnelcode",
      "UN Nr \n": "UN Nr \n",
      "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)":
        "Verwendungszweck / Produktkategorie\n(Extrakt aus 1.2)",
      "WGK\n(aus 15.2)": "WGK\n(aus 15.2)",
      "tatsächliche Überschrift Kap.1": "tatsächliche Überschrift Kap.1",
      "tatsächliche Überschrift Kap.10": "tatsächliche Überschrift Kap.10",
      "tatsächliche Überschrift Kap.11": "tatsächliche Überschrift Kap.11",
      "tatsächliche Überschrift Kap.12": "tatsächliche Überschrift Kap.12",
      "tatsächliche Überschrift Kap.13": "tatsächliche Überschrift Kap.13",
      "tatsächliche Überschrift Kap.14": "tatsächliche Überschrift Kap.14",
      "tatsächliche Überschrift Kap.15": "tatsächliche Überschrift Kap.15",
      "tatsächliche Überschrift Kap.16 (sonstige Angaben)":
        "tatsächliche Überschrift Kap.16 (sonstige Angaben)",
      "tatsächliche Überschrift Kap.2": "tatsächliche Überschrift Kap.2",
      "tatsächliche Überschrift Kap.3": "tatsächliche Überschrift Kap.3",
      "tatsächliche Überschrift Kap.4": "tatsächliche Überschrift Kap.4",
      "tatsächliche Überschrift Kap.5": "tatsächliche Überschrift Kap.5",
      "tatsächliche Überschrift Kap.6": "tatsächliche Überschrift Kap.6",
      "tatsächliche Überschrift Kap.7": "tatsächliche Überschrift Kap.7",
      "tatsächliche Überschrift Kap.8": "tatsächliche Überschrift Kap.8",
      "tatsächliche Überschrift Kap.9": "tatsächliche Überschrift Kap.9",
      "Kopf (alles überhalb Kap.1)": "-", // This field is not provided by API, use "-" as per user requirement
      "Rest des SDB (falls vorhanden)": "Rest des SDB (falls vorhanden)",
      "11.2 Angaben über sonstige Gefahren":
        "11.2 Angaben über sonstige Gefahren",
      "14.7 Massengutbeförderun auf dem Seeweg":
        "14.7 Massengutbeförderun auf dem Seeweg",
      "14.8 Sonstige Angaben": "14.8 Sonstige Angaben",
      "3.1 Stoffe": "3.1 Stoffe",
    };

    // Add filtered data rows to the worksheet
    filteredData.forEach((file) => {
      const rowData = headers.map((header) => {
        const mappedField = fieldMapping[header];
        if (mappedField === "-") return "-";
        return file.data[mappedField] || "";
      });
      const newRow = worksheet.addRow(rowData);
      const produktname =
        file.data["Handelsname/Produktname/Produktidentifikator\n(aus 1.1)"] ||
        file.data["Produktname"];
      if (produktname && produktnameCounts[produktname] > 1) {
        newRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ADD8E6" }, // Light Blue
          };
        });
      }
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

  // Derive filtered data for display
  const filteredData = getFilteredData();

  // Find duplicates based on 'Produktname'
  const produktnameCounts = filteredData.reduce((acc, item) => {
    const produktname =
      item.data?.["Handelsname/Produktname/Produktidentifikator\n(aus 1.1)"] ||
      item.data?.["Produktname"];
    if (produktname) {
      acc[produktname] = (acc[produktname] || 0) + 1;
    }
    return acc;
  }, {});
  if (filteredData.length === 0) {
    return;
  }
  return (
    <div className="w-full bg-white py-5 px-10 mx-auto">
      <div className="bg-white rounded-lg p-6 mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Verbund Data</h2>
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
          {filteredData.map((item) => {
            const produktname =
              item.data?.["Handelsname/Produktname \n(aus 1.1)"] ||
              item.data?.["Produktname"];
            const isDuplicate =
              produktname && produktnameCounts[produktname] > 1;

            return (
              <li
                key={item.id}
                className={`p-4 rounded-lg flex justify-between items-center shadow-sm ${
                  isDuplicate ? "bg-blue-200" : "bg-gray-100"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    File Name: {truncateText(item.file_name)}
                  </p>
                  <p>
                    Product Name:{" "}
                    {truncateText(
                      item.data["Handelsname/Produktname \n(aus 1.1)"] ||
                        item.data["Produktname"]
                    )}
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
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          No verbund data found for the selected date range.
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
};

GetVerbundData.propTypes = {
  refresh: PropTypes.bool.isRequired, // Declare the prop
};

export default GetVerbundData;
