/**
 * Data Process / processed SDB — Excel column order, template row, and API key aliases.
 * Excel header labels often differ from stored JSON keys (newlines / subsection labels).
 */

export const PROCESSED_DATA_HEADERS = [
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

/** First columns: legend row under header (SAP-style codes); remainder padded empty. */
export const PROCESSED_DATA_STATIC_ROW_VALUES = [
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

export const PROCESSED_DATA_HEADER_TO_JSON_KEY = {
  "Artikel Nr.(Länge beachten)": "Artikel Nr.\n(Länge beachten)",
  "WGK(numerischer Wert)": "WGK\n(numerischer Wert)",
  "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
  "Flammpunkt (numerischer Wert)[°C]":
    "Flammpunkt\n(numerischer Wert)\n[°C]",
  "N.A.G./NOS technische Benennung (Gefahraus-löser)":
    "N.A.G./NOS\ntechnische Benennung\n(Gefahraus-löser)",
  "Maßnahmen Lagerung Abschnitt 7.2": "Maßnahmen Lagerung\nAbschnitt 7.2",
  "Zusammenlagerverbot Abschnitt 10.5":
    "Zusammenlagerverbot\nAbschnitt 10.5",
  "Section - 7|7.2--15|15.1": "Section - 7|7.2--15",
};

export function getProcessedDataJsonKey(excelHeader) {
  return PROCESSED_DATA_HEADER_TO_JSON_KEY[excelHeader] ?? excelHeader;
}

function formatProcessedDataCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return val;
}

export function getProcessedDataRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return PROCESSED_DATA_HEADERS.map(() => "");
  }
  return PROCESSED_DATA_HEADERS.map((header) => {
    const key = getProcessedDataJsonKey(header);
    return formatProcessedDataCell(fileData[key]);
  });
}

/** Row under headers: fixed legend cells + empty padding to column count. */
export function getProcessedDataStaticRow() {
  const target = PROCESSED_DATA_HEADERS.length;
  const row = PROCESSED_DATA_STATIC_ROW_VALUES.slice();
  while (row.length < target) {
    row.push("");
  }
  return row;
}

export const PROCESSED_DATA_SECTION_MISSING_INDEX =
  PROCESSED_DATA_HEADERS.indexOf("Section-Missing-Count");
