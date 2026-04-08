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

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * API responses may be a single flat object, an array of sheet objects, or wrapped
 * ({ data: [...] }). Arrays must be normalized or column lookups hit numeric keys only
 * and Excel rows stay empty.
 */
export function normalizeSurfachemSheetObjects(fileData) {
  if (fileData == null) return [];

  if (typeof fileData === "string") {
    try {
      return normalizeSurfachemSheetObjects(JSON.parse(fileData));
    } catch {
      return [];
    }
  }

  if (Array.isArray(fileData)) {
    if (fileData.length === 0) return [];
    if (fileData.every((x) => isPlainObject(x))) return fileData;
    if (fileData.every((x) => Array.isArray(x))) {
      return fileData.flatMap((inner) => normalizeSurfachemSheetObjects(inner));
    }
    const objects = fileData.filter((x) => isPlainObject(x));
    if (objects.length) return objects;
    return [];
  }

  if (!isPlainObject(fileData)) return [];

  if (isPlainObject(fileData.data) && !Array.isArray(fileData.data)) {
    return [fileData.data];
  }

  const nestedKeys = ["data", "sheets", "results", "rows", "documents"];
  for (const k of nestedKeys) {
    const inner = fileData[k];
    if (Array.isArray(inner) && inner.length > 0 && inner.every((x) => isPlainObject(x))) {
      return inner;
    }
  }

  return [fileData];
}

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

/** GHS pictogram codes: match H-/P-phrases using ';' (API often returns comma-separated). */
function normalizeClpGhsSeparators(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return trimmed
    .split(/,\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(";");
}

const CLP_SYMBOLE_HEADER = "CLP Symbole SDS 2.2";

/**
 * Single cell value for a canonical Excel column, including legacy JSON keys.
 * `sheet` must be a plain row object (not an array).
 */
export function getSurfachemCellValue(sheet, header) {
  if (!sheet || typeof sheet !== "object" || Array.isArray(sheet)) return "";
  const aliases = SURFACHEM_KEY_ALIASES[header] || [];
  const keys = [header, ...aliases];
  const raw = firstResolvedValue(sheet, keys);
  if (header === CLP_SYMBOLE_HEADER) {
    return normalizeClpGhsSeparators(raw);
  }
  return raw;
}

/**
 * First sheet only, in SURFACHEM_HEADERS order (e.g. legacy callers).
 * Prefer getSurfachemExportRowArrays for Excel when the API returns multiple sheets.
 */
export function getSurfachemRowValues(fileData) {
  const sheets = normalizeSurfachemSheetObjects(fileData);
  const obj = sheets[0];
  if (!obj) return SURFACHEM_HEADERS.map(() => "");
  return SURFACHEM_HEADERS.map((header) => getSurfachemCellValue(obj, header) ?? "");
}

/** One row per sheet (for API payloads that contain multiple SDS rows). */
export function getSurfachemExportRowArrays(fileData) {
  const sheets = normalizeSurfachemSheetObjects(fileData);
  if (sheets.length === 0) {
    return [SURFACHEM_HEADERS.map(() => "")];
  }
  return sheets.map((obj) =>
    SURFACHEM_HEADERS.map((header) => getSurfachemCellValue(obj, header) ?? "")
  );
}

/** Prefer SDS trade name, then article name, chemical line, filename. */
export function getSurfachemProductLabel(fileData) {
  const sheets = normalizeSurfachemSheetObjects(fileData);
  const fileDataObj = sheets[0];
  if (!fileDataObj) return "";
  const candidates = [
    getSurfachemCellValue(fileDataObj, "Artikelbezeichnung SDS 1.1"),
    getSurfachemCellValue(fileDataObj, "Artikelbezeichnung"),
    getSurfachemCellValue(fileDataObj, "Chemische Bezeichnung / SDS 1.1"),
    getSurfachemCellValue(fileDataObj, "Dateiname"),
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== "") return c;
  }
  return "";
}
