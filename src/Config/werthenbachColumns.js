/**
 * Werthenbach / SDB2Excel — shared column order and JSON key mapping.
 * Two layouts: compact (API keys from fetch-data-werthenbach) and full (admin / aggregated Excel).
 */

function formatWerthenbachCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return val;
}

/** Excel headers and download order after upload / user history (matches API field names via mapping below). */
export const WERTHENBACH_COMPACT_HEADERS = [
  "Produktname",
  "Hersteller",
  "Dateiname SDB",
  "Version",
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

/** Maps Excel column title → actual `fileData` key (some API keys contain newlines). */
export const WERTHENBACH_COMPACT_HEADER_TO_DATA_KEY = {
  Produktname: "Produktname",
  Hersteller: "Hersteller",
  "Dateiname SDB": "Dateiname SDB",
  Version: "Version",
  "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
  "LG Klasse": "LG Klasse",
  "WGK(numerischer Wert)": "WGK\n(numerischer Wert)",
  Signalwort: "Signalwort",
  "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
  "Flammpunkt (numerischer Wert)[°C]": "Flammpunkt\n(numerischer Wert)\n[°C]",
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

/** Wide Excel layout for customer/org admin “All Werthenbach” downloads. */
export const WERTHENBACH_FULL_HEADERS = [
  "Produktname",
  "Hersteller",
  "Dateiname SDB",
  "Version",
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

/** Full export: column title equals JSON key (same as stored row objects). */
export const WERTHENBACH_FULL_HEADER_TO_DATA_KEY = Object.fromEntries(
  WERTHENBACH_FULL_HEADERS.map((h) => [h, h])
);

export function getWerthenbachCompactRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return WERTHENBACH_COMPACT_HEADERS.map(() => "");
  }
  return WERTHENBACH_COMPACT_HEADERS.map((header) => {
    const key = WERTHENBACH_COMPACT_HEADER_TO_DATA_KEY[header];
    const val = key != null ? fileData[key] : undefined;
    return formatWerthenbachCell(val);
  });
}

export function getWerthenbachFullRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return WERTHENBACH_FULL_HEADERS.map(() => "");
  }
  return WERTHENBACH_FULL_HEADERS.map((header) => {
    const key = WERTHENBACH_FULL_HEADER_TO_DATA_KEY[header];
    const val = key != null ? fileData[key] : undefined;
    return formatWerthenbachCell(val);
  });
}

export const WERTHENBACH_COMPACT_SECTION_MISSING_INDEX = WERTHENBACH_COMPACT_HEADERS.indexOf(
  "Section-Missing-Count"
);
