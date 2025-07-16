import React from "react";

const OldSummaryFormatter = ({ summary }) => {
  const renderFormattedSummary = () => {
    try {
      // If summary is in JSON format
      const parsedSummary = JSON.parse(summary);
      return Object.entries(parsedSummary).map(([key, value], index) => (
        <div key={index}>
          {key === "Verkaufsthemen"
            ? "Thema 1"
            : key === "Einkaufsthemen"
            ? "Thema 2"
            : key === "Eigenmarke"
            ? "Thema 3"
            : key}
          : {/* Apply font-semibold for bold */}
          <span className="font-semibold">{value}</span>
        </div>
      ));
    } catch {
      // Handle plain text summary dynamically
      const sections = summary.split("\n").filter((line) => line.trim() !== ""); // Remove empty lines

      // Create an object to hold the reformatted sections
      const formattedSections = {
        Allgemein: [],
        Thema1: [],
        Thema2: [],
        Thema3: [],
        Aufgaben: [],
      };

      let currentSection = "Allgemein";

      sections.forEach((line) => {
        if (line.startsWith("**")) {
          const cleanLine = line.replace(/\*\*/g, "").trim();
          if (cleanLine === "Verkaufsthemen") {
            currentSection = "Thema1";
          } else if (cleanLine === "Einkaufsthemen") {
            currentSection = "Thema2";
          } else if (cleanLine === "Eigenmarke") {
            currentSection = "Thema3";
          } else if (cleanLine === "Aufgaben") {
            currentSection = "Aufgaben";
          }
        } else {
          formattedSections[currentSection].push(line);
        }
      });

      // Render the reformatted sections
      return (
        <>
          <div>
            <strong>Allgemein</strong>
          </div>
          {formattedSections.Allgemein.map((line, index) => (
            <p key={index}>{line}</p>
          ))}

          <div>
            <strong>Thema 1</strong>
          </div>
          {formattedSections.Thema1.map((line, index) => (
            <p key={index}>{line}</p>
          ))}

          <div>
            <strong>Thema 2</strong>
          </div>
          {formattedSections.Thema2.map((line, index) => (
            <p key={index}>{line}</p>
          ))}

          <div>
            <strong>Thema 3</strong>
          </div>
          {formattedSections.Thema3.map((line, index) => (
            <p key={index}>{line}</p>
          ))}

          <div style={{ marginTop: "20px", marginBottom: "5px" }}>
            <strong>Aufgaben</strong>
          </div>
          {formattedSections.Aufgaben.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </>
      );
    }
  };

  return <div>{renderFormattedSummary()}</div>;
};

export default OldSummaryFormatter;
