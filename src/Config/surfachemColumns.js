/**
 * Surfachem / SDB2Excel column order (matches Excel).
 * API/JSON may use older or alternate keys; see SURFACHEM_KEY_ALIASES.
 */
export const SURFACHEM_HEADERS = [
  "Item Number",
  "Artikelbezeichnung",
  "Dateiname",
  "Revision MSDS",
  "Stand MSDS",
  "Artikelbezeichnung SDS 1.1",
  "RSPO MB/SG",
  "Chemische Bezeichnung / SDS 1.1",
  "UFI-Code",
  "Lieferant",
  "SDS Notfallnummer Punkt 1.4",
  "CLP Symbole SDS 2.2",
  "Signalwörter",
  "Gefahrenhinweise (H-Sätze)",
  "Sicherheitshinweise P: Prävention",
  "Sicherheitshinweise P: Reaktion",
  "Sicherheitshinweise P: Lagerung",
  "Sicherheitshinweise P: Entsorgung",
  "Zusätzliche Angaben auf dem Etikett EUH -Sätze",
  "CAS Number",
  "EG - Nr",
  "EC index number",
  "REACH registriert",
  "Bedingungen für Sichere Lagerung (SDS 7.2)",
  "Lagerklasse (SDS 7.2)",
  "Aggregatzustand",
  "Flammpunkt",
  "ADR-UN-Nummer",
  "ADR-Versandbezeichnung",
  "ADR-Transportgefahrenklasse",
  "ADR-Verpackungsgruppe",
  "Wassergefährdungsklasse",
  "ChemVerbotsV",
  "Kommentare",
  "Section-Missing-Count",
];

/** For each canonical header, extra JSON keys to try (after the canonical key). */
export const SURFACHEM_KEY_ALIASES = {
  "Chemische Bezeichnung / SDS 1.1": [
    "Produkt SDS 1.1. Erste Nennung",
  ],
  "Gefahrenhinweise (H-Sätze)": [
    "Gefahrenhinweise (H-Sätze) SDS 2.2",
  ],
  "Sicherheitshinweise P: Prävention": [
    "Sicherheitshinweise P: Prävention SDS 2.2",
  ],
  "Sicherheitshinweise P: Reaktion": [
    "Sicherheitshinweise P: Reaktion SDS 2.2",
  ],
  "Sicherheitshinweise P: Lagerung": [
    "Sicherheitshinweise P: Lagerung SDS 2.2.",
    "Sicherheitshinweise P: Lagerung SDS 2.2",
  ],
  "Sicherheitshinweise P: Entsorgung": [
    "Sicherheitshinweise P: Entsorgung SDS 2.2",
  ],
  "Zusätzliche Angaben auf dem Etikett EUH -Sätze": [
    "Zusätzliche Angaben auf dem Etikett EUH -Sätze (SDS2.2)",
  ],
};

function firstResolvedValue(fileData, keys) {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(fileData, key)) continue;
    const v = fileData[key];
    if (v === undefined || v === null) continue;
    if (typeof v === "object") return JSON.stringify(v);
    if (v === "") continue;
    return v;
  }
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(fileData, key)) continue;
    const v = fileData[key];
    if (v === undefined || v === null) continue;
    if (typeof v === "object") return JSON.stringify(v);
    return v;
  }
  return "";
}

/**
 * Single cell value for a canonical Excel column, including legacy JSON keys.
 */
export function getSurfachemCellValue(fileData, header) {
  if (!fileData || typeof fileData !== "object") return "";
  const aliases = SURFACHEM_KEY_ALIASES[header] || [];
  const keys = [header, ...aliases];
  return firstResolvedValue(fileData, keys);
}

/** One Excel row (strings/numbers) in SURFACHEM_HEADERS order. */
export function getSurfachemRowValues(fileData) {
  return SURFACHEM_HEADERS.map((header) => getSurfachemCellValue(fileData, header) ?? "");
}

/** Prefer SDS trade name, then article name, chemical line, filename. */
export function getSurfachemProductLabel(fileData) {
  if (!fileData || typeof fileData !== "object") return "";
  const candidates = [
    getSurfachemCellValue(fileData, "Artikelbezeichnung SDS 1.1"),
    getSurfachemCellValue(fileData, "Artikelbezeichnung"),
    getSurfachemCellValue(fileData, "Chemische Bezeichnung / SDS 1.1"),
    getSurfachemCellValue(fileData, "Dateiname"),
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== "") return c;
  }
  return "";
}
