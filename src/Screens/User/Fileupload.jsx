import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Helpers from "../../Config/Helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faDownload,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useHeader } from "../../Components/HeaderContext";
import * as XLSX from "xlsx";

const FileUpload = () => {
  const { setHeaderData } = useHeader();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [canUpload, setCanUpload] = useState(true); // State to track if upload is allowed
  const [availableCount, setAvailableCount] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("files_upload"),
      desc: "",
    });
    const checkUsageCount = async () => {
      try {
        const response = await axios.get(
          `${Helpers.apiUrl}check-usage-count/Document`,
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
        // Check if the error is a 403 status
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
        Helpers.toast(
          "error",
          Helpers.getTranslationValue("error_check_usage")
        );
        setCanUpload(false); // Optionally disable if there's an unknown error
      }
    };

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

    let userId = Helpers.authUser.id;
    const newStatuses = { ...fileStatuses };

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("document", file);
      formData.append("fileName", file.name);
      formData.append("user_id", userId);

      newStatuses[file.name].status = "In Progress";
      setFileStatuses({ ...newStatuses });

      try {
        const response = await axios.post(
          `${Helpers.apiUrl}uploadFile`,
          formData,
          Helpers.authFileHeaders
        );

        if (response.status === 200) {
          newStatuses[file.name] = {
            status: "Completed",
            data: response.data.data,
          };
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
    Helpers.toast(
      "success",
      Helpers.getTranslationValue("files_processed_msg")
    );
  };

  const allFilesCompleted =
    selectedFiles.length > 0 &&
    Object.values(fileStatuses).every((file) => file.status === "Completed");

  const handleDownload = () => {
    const data = [];
    const allKeys = new Set();

    selectedFiles.forEach((file, index) => {
      const status = fileStatuses[file.name];
      if (status && status.data) {
        Object.keys(status.data).forEach((key) => allKeys.add(key));
      }
    });

    const headers = ["SR_No", "Filename", ...Array.from(allKeys)];
    data.push(headers);

    selectedFiles.forEach((file, index) => {
      const status = fileStatuses[file.name];
      if (status && status.data) {
        const row = [index + 1, file.name];
        headers.slice(2).forEach((header) => {
          row.push(status.data[header] || "NA");
        });
        data.push(row);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Files");
    XLSX.writeFile(wb, "Data.xlsx");
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
        {Helpers.getTranslationValue("files_upload")}
      </h2>
      <div className="flex flex-col items-center px-10">
        <input
          type="file"
          className="form-control mb-4 border border-bgray-300 w-full rounded-lg px-4 py-3.5 placeholder:placeholder:text-base"
          accept="application/pdf"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={!canUpload} // Disable input if upload is not allowed
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
          {Helpers.getTranslationValue("carry_out")}
          <FontAwesomeIcon icon={faCloudUploadAlt} className="ml-2" />
        </button>
        <button
          onClick={handleDownload}
          disabled={!allFilesCompleted}
          className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
        >
          {Helpers.getTranslationValue("download")}
          <FontAwesomeIcon icon={faDownload} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
