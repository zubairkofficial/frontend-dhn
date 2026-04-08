/**
 * Verbund / SDB2Excel — Excel column order, API key aliases, and subsection extractors.
 */

export const VERBUND_HEADERS = [
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
  "BA: Verhalten im Gefahrenfall_5",
  "BA: Verhalten im Gefahrenfall_6",
  "BA: Erste Hilfe_4",
  "BA: Sachgerechte Entsorgung _13",
  "BA: Sachgerechte Entsorgung _14",
  "Kopf\n(alles überhalb Kap.1.)",
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

/** Excel column label → JSON key when it differs from the label. */
export const VERBUND_HEADER_TO_JSON_KEY = {
  "Hersteller/Lieferant\n(aus 1.3)": "Hersteller/Lieferant\n(aus1.3)",
  "WGK\n(aus 15)": "WGK\n(aus 15.2)",
};

export function verbundExtractValue(content, section) {
  if (!content) return "";
  const regex = new RegExp(
    `${section}\\s*([^\\n]*(?:\\n(?!\\d+\\.\\d+)[^\\n]*)*)`,
    "i"
  );
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function verbundExtract3_1(data) {
  const content = data["tatsächliche Überschrift Kap.3"] || "";
  return verbundExtractValue(content, "3\\.1");
}

function verbundExtract6_1(data) {
  const content = data["tatsächliche Überschrift Kap.6"] || "";
  return verbundExtractValue(content, "6\\.1");
}

function verbundExtract11_2(data) {
  const content = data["tatsächliche Überschrift Kap.11"] || "";
  return verbundExtractValue(content, "11\\.2");
}

function verbundExtract14_7(data) {
  const content = data["tatsächliche Überschrift Kap.14"] || "";
  return verbundExtractValue(content, "14\\.7");
}

function verbundExtract14_8(data) {
  const content = data["tatsächliche Überschrift Kap.14"] || "";
  return verbundExtractValue(content, "14\\.8");
}

function verbundExtract15_1(data) {
  const content = data["tatsächliche Überschrift Kap.15"] || "";
  return verbundExtractValue(content, "15\\.1");
}

const HEADER_6_1 =
  "6.1 Personenbezogene Vorsichtsmaßnahmen, Schutzausrüstungen und in Notfällen anzuwendende";

/** Subsection fields parsed from chapter heading blobs. */
export const VERBUND_SPECIAL_CELL_GETTERS = {
  "3.1 Stoffe": verbundExtract3_1,
  [HEADER_6_1]: verbundExtract6_1,
  "11.2 Angaben über sonstige Gefahren": verbundExtract11_2,
  "14.7 Massengutbeförderun auf dem Seeweg": verbundExtract14_7,
  "14.8 Sonstige Angaben": verbundExtract14_8,
  "15.1 Sicherheits-, Gesundheits- und Umweltschutzvorschriften": verbundExtract15_1,
};

function formatVerbundCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return val;
}

export function getVerbundRowValues(fileData) {
  if (!fileData || typeof fileData !== "object") {
    return VERBUND_HEADERS.map(() => "");
  }
  return VERBUND_HEADERS.map((header) => {
    const getter = VERBUND_SPECIAL_CELL_GETTERS[header];
    if (getter) return formatVerbundCell(getter(fileData));
    const jsonKey = VERBUND_HEADER_TO_JSON_KEY[header] ?? header;
    const val = fileData[jsonKey];
    return formatVerbundCell(val);
  });
}

export const VERBUND_SECTION_MISSING_INDEX = VERBUND_HEADERS.indexOf(
  "Section-Missing-Count"
);

const VERBUND_HANDELSNAME_KEY =
  "Handelsname/Produktname/Produktidentifikator\n(aus 1.1)";

/** Display / duplicate detection: canonical handelsname or Produktname. */
export function getVerbundProduktname(fileData) {
  if (!fileData || typeof fileData !== "object") return "";
  const h = fileData[VERBUND_HANDELSNAME_KEY];
  if (h != null && String(h).trim() !== "") return h;
  const p = fileData["Produktname"];
  if (p != null && String(p).trim() !== "") return p;
  return "";
}
