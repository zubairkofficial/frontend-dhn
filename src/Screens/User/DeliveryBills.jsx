import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import Helpers from "../../Config/Helpers";

function DeliveryBills() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [textInput, setTextInput] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setTextInput("");
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
    setFile(null);
  };

  const handleFromDateChange = (date) => setFromDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  
  const clearFileInput = () => {
    setFile(null);
    setErrorMessage("");
    document.getElementById("file-input").value = null;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const sendInvoiceData = async () => {
    if (file || textInput) {
      try {
        setUploading(true);
        setErrorMessage("");
        const formData = new FormData();
        file ? formData.append("pdf", file) : formData.append("content", textInput);
        if (fromDate) formData.append("fromDate", formatDate(fromDate));
        if (endDate) formData.append("endDate", formatDate(endDate));
        formData.append("user_login_id", Helpers.authUser.id);

        const response = await axios.post(`${Helpers.apiUrl}extractInvoiceData`, formData, {
          headers: Helpers.authFileHeaders.headers,
        });

        handleNextPageClick(response.data.jsonresult);
      } catch (error) {
        console.error("Error processing the invoice:", error);
        setErrorMessage("Keine Rechnung gefunden");
      } finally {
        setUploading(false);
      }
    } else {
      setErrorMessage("Bitte wählen Sie eine Datei aus oder geben Sie den Text ein.");
    }
  };

  const handleNextPageClick = (data) => navigate("/invoice-details", { state: { data } });

  return (
    <div className="container">
      
      <div className="flex justify-end space-x-3 mb-5">
        <Link to="/past-invoices" className="btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Laden Sie frühere Rechnungen hoch
        </Link>
        <Link to="/invoice-records" className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Aufzeichnungen
        </Link>
      </div>

      <h2 className="text-center text-2xl font-semibold mb-6">Bearbeitung von Lieferscheinen</h2>
      <div className="mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Rechnungen</h3>
          <div className="flex space-x-3 mb-3">
            <DatePicker
              selected={fromDate}
              onChange={handleFromDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Von Datum"
              className="form-control w-full p-2 border border-gray-300 rounded-md"
            />
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Bis Datum"
              className="form-control w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <input
            type="text"
            value={textInput}
            onChange={handleTextInputChange}
            placeholder="Geben Sie den Text ein"
            className="form-control w-full p-2 border border-gray-300 rounded-md mt-3"
            disabled={file !== null}
          />
          <div className="flex items-center mt-3">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              accept=".pdf"
              disabled={textInput !== ""}
            />
            {file && (
              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={clearFileInput}
              >
                Datei löschen
              </button>
            )}
          </div>
        </div>
        
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}
        
        <button
          onClick={sendInvoiceData}
          className={`btn px-2 mt-5 py-2 rounded-md text-white ${uploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={uploading}
        >
          {uploading ? "Hochladen..." : "Lieferschein hochladen"}
        </button>
      </div>
    </div>
  );
}

export default DeliveryBills;
