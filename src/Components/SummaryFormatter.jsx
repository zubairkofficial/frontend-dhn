import React from "react";

const SummaryFormatter = ({ summary, error }) => {
  const renderFormattedSummary = () => {
    if (error) {
      return <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>;
    }
    if (!summary || (typeof summary !== "string" && !Array.isArray(summary))) {
      return <p>No summary available.</p>;
    }
    try {
      let formattedSummary = summary;

      // Handle both "Originale Transkription:" and "Transkription:"
      if (formattedSummary.includes("Originale Transkription:")) {
        formattedSummary = formattedSummary.replace(
          "Originale Transkription:",
          "\n\n**Originale Transkription**\n"
        );
      } else if (formattedSummary.includes("Transkription:")) {
        formattedSummary = formattedSummary.replace(
          "Transkription:",
          "\n\n**Transkription**\n"
        );
      }

      // Ensure summary is properly extracted if it's an array
      if (Array.isArray(formattedSummary)) {
        formattedSummary = formattedSummary[0] || "";
      }

      // Attempt to parse JSON-formatted summary if necessary
      let parsedSummary;
      try {
        parsedSummary = JSON.parse(formattedSummary);
      } catch (err) {
        parsedSummary = null;
      }

      if (parsedSummary && typeof parsedSummary === "object") {
        console.log("✅ Parsed Summary:", parsedSummary);
        return (
          <div>
            {parsedSummary.general_information && (
              <div style={{ marginBottom: "15px" }}>
                <strong>Allgemein:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {parsedSummary.general_information.trim()}
                </div>
              </div>
            )}
            {parsedSummary.topic1 && parsedSummary.topic1.trim() !== "" && (
              <div style={{ marginBottom: "15px" }}>
                <strong>Thema 1:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {parsedSummary.topic1.trim()}
                </div>
              </div>
            )}
            {parsedSummary.topic2 && parsedSummary.topic2.trim() !== "" && (
              <div style={{ marginBottom: "15px" }}>
                <strong>Thema 2:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {parsedSummary.topic2.trim()}
                </div>
              </div>
            )}
            {parsedSummary.topic3 && parsedSummary.topic3.trim() !== "" && (
              <div style={{ marginBottom: "15px" }}>
                <strong>Thema 3:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {parsedSummary.topic3.trim()}
                </div>
              </div>
            )}
            {parsedSummary.tasks && parsedSummary.tasks.trim() !== "" && (
              <div style={{ marginBottom: "20px" }}>
                <strong>Aufgaben:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {parsedSummary.tasks.trim()}
                </div>
              </div>
            )}
            {/* Fix: Ensure "Originale Transkription" or "Transkription" appears separately */}
            {parsedSummary.original_transcription &&
              parsedSummary.original_transcription.trim() !== "" && (
                <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                  <strong>Originale Transkription:</strong>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {parsedSummary.original_transcription.trim()}
                  </div>
                </div>
              )}
            {parsedSummary.transcription &&
              parsedSummary.transcription.trim() !== "" && (
                <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                  <strong>Transkription:</strong>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {parsedSummary.transcription.trim()}
                  </div>
                </div>
              )}
          </div>
        );
      }

      // If not JSON, treat as raw text
      const sections = formattedSummary
        .split("\n")
        .filter((line) => line.trim() !== "");
      if (sections.length === 0) {
        return <p>No summary available.</p>;
      }

      const formattedSections = {
        Allgemein: [],
        Thema1: [],
        Thema2: [],
        Thema3: [],
        Aufgaben: [],
        OriginaleTranskription: [],
        Transkription: [],
      };

      let currentSection = "Allgemein";
      sections.forEach((line) => {
        if (line.startsWith("**")) {
          const cleanLine = line.replace(/\*\*/g, "").trim();
          switch (cleanLine) {
            case "Thema 1":
              currentSection = "Thema1";
              break;
            case "Thema 2":
              currentSection = "Thema2";
              break;
            case "Thema 3":
              currentSection = "Thema3";
              break;
            case "Aufgaben":
              currentSection = "Aufgaben";
              break;
            case "Originale Transkription":
              currentSection = "OriginaleTranskription";
              break;
            case "Transkription":
              currentSection = "Transkription";
              break;
            default:
              currentSection = "Allgemein";
          }
        } else {
          formattedSections[currentSection].push(line.trim());
        }
      });

      return (
        <div>
          {formattedSections.Allgemein.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Allgemein:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Allgemein.join("\n")}
              </div>
            </div>
          )}
          {formattedSections.Thema1.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Thema 1:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Thema1.join("\n")}
              </div>
            </div>
          )}
          {formattedSections.Thema2.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Thema 2:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Thema2.join("\n")}
              </div>
            </div>
          )}
          {formattedSections.Thema3.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Thema 3:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Thema3.join("\n")}
              </div>
            </div>
          )}
          {formattedSections.Aufgaben.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Aufgaben:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Aufgaben.join("\n")}
              </div>
            </div>
          )}
          {/* Fix: Ensure "Originale Transkription" or "Transkription" appears separately */}
          {formattedSections.OriginaleTranskription.length > 0 && (
            <div style={{ marginTop: "15px", marginBottom: "15px" }}>
              <strong>Originale Transkription:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.OriginaleTranskription.join("\n")}
              </div>
            </div>
          )}
          {formattedSections.Transkription.length > 0 && (
            <div style={{ marginTop: "15px", marginBottom: "15px" }}>
              <strong>Transkription:</strong>
              <div style={{ whiteSpace: "pre-line" }}>
                {formattedSections.Transkription.join("\n")}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error.message);
      return <p style={{ color: "red" }}>Error parsing summary</p>;
    }
  };

  return <div>{renderFormattedSummary()}</div>;
};

export default SummaryFormatter;