/**
 * Scheren — Excel column order and row values for exports.
 * Column labels match API JSON keys.
 */

export const SCHEREN_HEADERS = [
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

function formatScherenCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return val;
}

export function getScherenRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return SCHEREN_HEADERS.map(() => "");
  }
  return SCHEREN_HEADERS.map((header) =>
    formatScherenCell(fileData[header])
  );
}

export const SCHEREN_SECTION_MISSING_INDEX = SCHEREN_HEADERS.indexOf(
  "Section-Missing-Count"
);
