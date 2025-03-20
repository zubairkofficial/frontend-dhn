import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Helpers from "../../Config/Helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faSpinner, faCheckCircle, faExclamationCircle, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useHeader } from '../../Components/HeaderContext';
import * as XLSX from "xlsx";

function FreeDataProcess() {
    const { setHeaderData } = useHeader();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileStatuses, setFileStatuses] = useState({});
    const [canUpload, setCanUpload] = useState(true);
    const [allProcessedData, setAllProcessedData] = useState([]);
    const [isEmailSending, setIsEmailSending] = useState(false);
    const fileInputRef = useRef(null);

    const checkUsageCount = async () => {
        try {
            const response = await axios.get(
                `${Helpers.apiUrl}check-usage-count/FreeDataProcess`, Helpers.authHeaders
            );

            if (response.status === 200) {
                const { available_count } = response.data;
                if (available_count <= 0) {
                    setCanUpload(false);
                    Helpers.toast("error", Helpers.getTranslationValue("error_usage_limit"));
                } else {
                    setCanUpload(true);
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setCanUpload(false);
                Helpers.toast("error", Helpers.getTranslationValue("error_usage_limit"));
            } else {
                Helpers.toast("error", Helpers.getTranslationValue("error_check_usage"));
                setCanUpload(false);
            }
        }
    };

    useEffect(() => {
        setHeaderData({ title: Helpers.getTranslationValue('Kostenloser Datenprozess'), desc: 'Dieses Tool ist für kostenlose Benutzer unter dem Cretschmar-Administrator verfügbar' });
        checkUsageCount();
    }, [setHeaderData]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newStatuses = {};

        files.forEach(file => {
            newStatuses[file.name] = { status: "Pending", data: null };
        });

        setSelectedFiles(files);
        setFileStatuses(newStatuses);
    };

    const handleFileUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            Helpers.toast("error", Helpers.getTranslationValue('file_select_first'));
            return;
        }
        let json = localStorage.getItem("user");
        let userObj = JSON.parse(json);
        let userId = userObj.id;
        const newStatuses = { ...fileStatuses };
        let allData = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const formData = new FormData();
            formData.append("documents[]", file);
            formData.append("user_id", userId);

            newStatuses[file.name] = { status: "In Progress" };
            setFileStatuses({ ...newStatuses });

            try {
                const response = await axios.post(`${Helpers.apiUrl}freeDataProcess`, formData, Helpers.authFileHeaders);

                if (response.status === 200 && response.data && response.data.data) {
                    newStatuses[file.name].status = "Completed";
                    setFileStatuses({ ...newStatuses });

                    const parsedData = response.data.data.map(item => {
                        try {
                            return { data: item || {} };
                        } catch (parseError) {
                            console.error("Error processing item:", item, parseError);
                            return { data: {} };
                        }
                    });

                    allData = allData.concat(parsedData);
                } else {
                    throw new Error(response.message || Helpers.getTranslationValue('error_file_upload'));
                }
            } catch (error) {
                console.error("Error uploading file:", file.name, error);
                newStatuses[file.name].status = "Error";
                setFileStatuses({ ...newStatuses });
            }
        }

        setAllProcessedData(allData);
        Helpers.toast("success", Helpers.getTranslationValue('files_processed_msg'));
        checkUsageCount();
    };

    const handleSendEmail = async () => {
        setIsEmailSending(true);
        const MAX_CHAR_LIMIT = 32767;
        const data = [];

        const headers = [
            "Dateiname SDB", "Ausgabedatum bzw. letzte Änderung", "Flammpunkt (numerischer Wert)[°C]", "H Sätze durch Komma getrennt",
            "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)", "LG Klasse", "WGK (numerischer Wert)", "Maßnahmen Lagerung Abschnitt 7.2", "Zusammenlagerverbot Abschnitt 10.5"
        ];
        data.push(headers);

        const headerMapping = {
            "Dateiname SDB": "Dateiname SDB",
            "Ausgabedatum bzw. letzte Änderung": "Ausgabedatum bzw. letzte Änderung",
            "Flammpunkt (numerischer Wert)[°C]": "Flammpunkt\n(numerischer Wert)\n[°C]",
            "H Sätze durch Komma getrennt": "H Sätze\ndurch Komma getrennt",
            "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)": "Hinweise/Bemerkungen/Sicherheitsbetrachtung (stoffspezifisch)",
            "LG Klasse": "LG Klasse",
            "WGK (numerischer Wert)": "WGK\n(numerischer Wert)",
            "Maßnahmen Lagerung Abschnitt 7.2": "Maßnahmen Lagerung\nAbschnitt 7.2",
            "Zusammenlagerverbot Abschnitt 10.5": "Zusammenlagerverbot\nAbschnitt 10.5"
        };

        allProcessedData.forEach((fileData) => {
            let rowData = Array(headers.length).fill("");

            headers.forEach((header, index) => {
                const key = headerMapping[header];
                let cellData = fileData.data[key] || "";

                while (cellData.length > MAX_CHAR_LIMIT) {
                    rowData[index] = cellData.slice(0, MAX_CHAR_LIMIT);
                    data.push([...rowData]);
                    cellData = cellData.slice(MAX_CHAR_LIMIT);
                    rowData = Array(headers.length).fill("");
                }
                rowData[index] = cellData;
            });

            data.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Processed Data");

        const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const formData = new FormData();
        formData.append("file", blob, "Processed_Files_Data.xlsx");

        try {
            const response = await axios.post(`${Helpers.apiUrl}send-processed-file`, formData, Helpers.authFileHeaders);

            Helpers.toast("success", response.data.message || "Die Datei wurde erfolgreich an Ihre E-Mail-Adresse gesendet.");

            setSelectedFiles([]);
            setFileStatuses({});
            setAllProcessedData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setIsEmailSending(false);
            checkUsageCount();
        } catch (error) {
            setIsEmailSending(false);
            console.error("Error sending file:", error);
            Helpers.toast("error", "There was an error sending the file.");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "In Progress":
                return <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />;
            case "Completed":
                return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
            case "Error":
                return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-white py-5 mx-auto">
            <h2 className="text-center text-2xl font-semibold mb-8">{Helpers.getTranslationValue('Kostenloser Datenprozess')}</h2>
            <div className="flex flex-col items-center px-10">
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
                                <span>{file.name} ({file.size} bytes)</span>
                                <span className="flex items-center space-x-2">
                                    {getStatusIcon(fileStatuses[file.name]?.status)}
                                    <span>{fileStatuses[file.name]?.status}</span>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end gap-1 mt-8 px-10">
                <button
                    onClick={handleFileUpload}
                    disabled={Object.values(fileStatuses).some(file => file.status === "In Progress") || !canUpload}
                    className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg"
                    style={{ marginRight: '40px' }}
                >
                    {Helpers.getTranslationValue('carry_out')} <FontAwesomeIcon icon={faCloudUploadAlt} className="ml-2" />
                </button>
                {allProcessedData.length > 0 && (
                    <button
                        onClick={handleSendEmail}
                        disabled={isEmailSending}
                        className="flex justify-end text-white py-3 px-6 font-bold bg-success-300 hover:bg-success-300  transition-all rounded-lg"
                    >
                        {Helpers.getTranslationValue(isEmailSending ? 'sending_email' : 'send_email')}
                        <FontAwesomeIcon
                            icon={isEmailSending ? faSpinner : faEnvelope}
                            spin={isEmailSending}
                            className='ml-2'
                        />

                    </button>
                )}
            </div>
        </div>
    );
}

export default FreeDataProcess;
