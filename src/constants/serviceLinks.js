/**
 * Stable service identifiers — must match `services.link` in the database.
 * Legacy numeric IDs (users.services) are listed for sessions without service_links.
 */

export const SERVICE_LINK = {
  FILE_UPLOAD: "fileupload",
  /** Voice / transcription stack */
  VOICE: "voice",
  CONTRACT_AUTOMATION: "contract_automation_solution",
  DATA_PROCESS: "data_process",
  FREE_DATA_PROCESS: "free-data-process",
  CLONE_DATA_PROCESS: "clone_data_process",
  DEMO_DATA_PROCESS: "demo_data_process",
  WERTHENBACH: "Werthenbach",
  SCHEREN: "Scheren",
  SENNHEISER: "Sennheiser",
  VERBUND: "Verbund",
  SURFACHEM: "surfachem",
};

/** @type {Record<number, string>} Historical id → link (for old localStorage without service_links) */
export const LEGACY_SERVICE_ID_TO_LINK = {
  1: SERVICE_LINK.FILE_UPLOAD,
  2: SERVICE_LINK.VOICE,
  3: SERVICE_LINK.CONTRACT_AUTOMATION,
  4: SERVICE_LINK.DATA_PROCESS,
  5: SERVICE_LINK.FREE_DATA_PROCESS,
  7: SERVICE_LINK.CLONE_DATA_PROCESS,
  8: SERVICE_LINK.WERTHENBACH,
  9: SERVICE_LINK.SCHEREN,
  10: SERVICE_LINK.SENNHEISER,
  11: SERVICE_LINK.VERBUND,
  12: SERVICE_LINK.DEMO_DATA_PROCESS,
  13: SERVICE_LINK.SURFACHEM,
};
