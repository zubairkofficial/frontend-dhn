/**
 * Sennheiser — Excel column order and row values for exports.
 * Column labels match API JSON keys (no alias map needed).
 */

export const SENNHEISER_HEADERS = [
  "ID Number",
  "Dateiname SDB",
  "Produktname",
  "Hersteller",
  "CAS Nummer bei reinen Stoffen",
  "Ausgabedatum bzw. letzte Änderung",
  "H Sätze durch Komma getrennt",
  "Einstufung des Stoffs oder Gemischs",
  "Einstufung gemäß der (EG) Verordnung 1272/2008 in der geänderten Fassung",
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

function formatSennheiserCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return val;
}

export function getSennheiserRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return SENNHEISER_HEADERS.map(() => "");
  }
  return SENNHEISER_HEADERS.map((header) =>
    formatSennheiserCell(fileData[header])
  );
}

export const SENNHEISER_SECTION_MISSING_INDEX = SENNHEISER_HEADERS.indexOf(
  "Section-Missing-Count"
);

/** Normalized Produktname for duplicate grouping (matches bulk-export logic). */
export function getSennheiserProduktnameKey(fileData) {
  if (!fileData || typeof fileData !== "object") return "";
  const p = fileData["Produktname"];
  if (p == null || p === "") return "";
  return String(p).toLowerCase().trim();
}
