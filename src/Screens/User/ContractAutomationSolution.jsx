import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Helpers from "../../Config/Helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useHeader } from "../../Components/HeaderContext";

const ContractAutomationSolution = () => {
  const { setHeaderData } = useHeader();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [selectedDoctype, setSelectedDoctype] = useState("wind"); // Default to 'wind'
  const fileInputRef = useRef(null);
  const [canUpload, setCanUpload] = useState(true);
  const [availableCount, setAvailableCount] = useState(null);

  const checkUsageCount = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}check-usage-count/ContractSolutions`,
        Helpers.authHeaders
      );

      if (response.status === 200) {
        const { available_count } = response.data;
        const normalizedCount =
          typeof available_count === "number" ? available_count : null;

        setAvailableCount(normalizedCount);

        if (normalizedCount !== null && normalizedCount <= 0) {
          setCanUpload(false);
          Helpers.toast(
            "error",
            Helpers.getTranslationValue("error_usage_limit")
          );
        } else {
          setCanUpload(true);
        }
      }
    } catch (error) {
      if (error.response) {
        const { status: statusCode, data } = error.response;
        const remainingCount =
          typeof data?.available_count === "number"
            ? data.available_count
            : null;

        setAvailableCount(remainingCount);

        if (statusCode === 403) {
          setCanUpload(false); // Disable the file selection
          const sheetsLeftMessage =
            remainingCount !== null
              ? `Only ${remainingCount} data sheet${
                  remainingCount === 1 ? "" : "s"
                } left. Please try again.`
              : Helpers.getTranslationValue("error_usage_limit");

          Helpers.toast("error", sheetsLeftMessage);
          return;
        }
      }

      // Handle other errors
      Helpers.toast("error", Helpers.getTranslationValue("error_check_usage"));
      setCanUpload(false); // Optionally disable if there's an unknown error
    }
  };

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Automatisierte Vertragserstellung"),
      desc: "",
    });
    checkUsageCount();
  }, [setHeaderData]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newStatuses = {};
    files.forEach((file) => {
      newStatuses[file.name] = { status: "Pending", data: null };
    });
    setSelectedFiles(files);
    setFileStatuses(newStatuses);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      Helpers.toast("error", Helpers.getTranslationValue("file_select_first"));
      return;
    }

    if (availableCount !== null && selectedFiles.length > availableCount) {
      Helpers.toast(
        "error",
        `Only ${availableCount} data sheet${
          availableCount === 1 ? "" : "s"
        } left. Please try again.`
      );
      return;
    }

    const newStatuses = { ...fileStatuses };
    let userId = Helpers.authUser.id;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("document", file);
      formData.append("doctype", selectedDoctype); // Append doctype
      formData.append("user_id", userId);
      newStatuses[file.name].status = "In Progress";
      setFileStatuses({ ...newStatuses });

      try {
        const token = localStorage.getItem("token"); // Retrieve the token from local storage

        const response = await axios.post(
          `${Helpers.apiUrl}contract-automation`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
            responseType: "blob",
            timeout: 120000,
          }
        );

        if (response.status === 200) {
          // Create a URL for the file blob and trigger a download
          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `API_Response_${file.name.split(".")[0]}.docx`;
          document.body.appendChild(link);
          link.click();
          link.remove();

          newStatuses[file.name] = { status: "Completed", data: null };
          setSelectedFiles([]);
          setFileStatuses({});
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the file input
          }
          Helpers.toast(
            "success",
            Helpers.getTranslationValue("upload_success")
          );
          await checkUsageCount();
        } else {
          throw new Error(
            response.message || Helpers.getTranslationValue("error_file_upload")
          );
        }
      } catch (error) {
        console.error("Error:", error);
        Helpers.toast(
          "error",
          Helpers.getTranslationValue("error_file_upload") + file.name
        );
        newStatuses[file.name] = { status: "Error", data: error.toString() };
      }

      setFileStatuses({ ...newStatuses });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Progress":
        return (
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
        );
      case "Completed":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case "Error":
        return (
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-red-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white py-5 mx-auto">
      <h2 className="text-center text-2xl font-semibold mb-8">
        {Helpers.getTranslationValue("Automatisierte Vertragserstellung")}
      </h2>
      <div className="flex flex-col items-center px-10">
        <div className="w-full mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {Helpers.getTranslationValue("doctype")}
          </label>
          <select
            value={selectedDoctype}
            onChange={(e) => setSelectedDoctype(e.target.value)}
            className="form-control border border-bgray-300 w-full rounded-lg px-4 py-3.5 placeholder:placeholder:text-base"
          >
            <option value="wind">Wind</option>
            <option value="pv">PV</option>
            <option value="pool">Pool</option>
            <option value="kabel">Kabel</option>
            <option value="forst">Forst</option>
          </select>
        </div>
        <input
          type="file"
          className="form-control mb-4 border border-bgray-300 w-full rounded-lg px-4 py-3.5 placeholder:placeholder:text-base"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
          multiple
          disabled={!canUpload}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      <div className="px-10">
        <ul className="space-y-4">
          {selectedFiles.map((file, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center space-x-2">
                <span>
                  {file.name} ({file.size} bytes)
                </span>
                <span className="flex items-center space-x-2">
                  {getStatusIcon(fileStatuses[file.name].status)}
                  <span>{fileStatuses[file.name].status}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end gap-1 mt-8 px-10">
        <button
          onClick={handleFileUpload}
          disabled={
            Object.values(fileStatuses).some(
              (file) => file.status === "In Progress"
            ) || !canUpload
          }
          className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
          style={{ marginRight: "40px" }}
        >
          {Helpers.getTranslationValue("carry_out")}{" "}
          <FontAwesomeIcon icon={faCloudUploadAlt} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ContractAutomationSolution;
