import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsX } from "react-icons/bs";
import toast from "react-hot-toast";
import Helpers from "../../Config/Helpers";
import axios from "axios";

const PastInvoices = () => {
  const [files, setFiles] = useState([[]]);
  const [titles, setTitles] = useState([""]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event, index) => {
    const newFiles = [...files];
    newFiles[index] = [...newFiles[index], ...Array.from(event.target.files)];
    setFiles(newFiles);
  };

  const handleTitleChange = (event, index) => {
    const newTitles = [...titles];
    newTitles[index] = event.target.value;
    setTitles(newTitles);
  };

  const handleAddFileInput = () => {
    setFiles([...files, []]);
    setTitles([...titles, ""]);
  };

  const handleRemoveFileInput = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    const newTitles = [...titles];
    newTitles.splice(index, 1);
    setTitles(newTitles);
  };

  const handleRemoveFile = (fileIndex, index) => {
    const newFiles = [...files];
    newFiles[fileIndex] = newFiles[fileIndex].filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const sendInvoiceData = async () => {
    try {
      setUploading(true);

      let hasFiles = files.some((fileArray) => fileArray.length > 0);
      if (!hasFiles) throw new Error("Bitte wählen Sie mindestens eine Datei zum Hochladen aus.");

      for (let index = 0; index < files.length; index++) {
        const filesArray = files[index];
        const title = titles[index];

        for (const file of filesArray) {
          const formData = new FormData();
          formData.append("pdf", file);
          formData.append("title", title);
          formData.append("user_login_id", Helpers.authUser.id);

          await axios.post(`${Helpers.apiUrl}postinvoice`, formData, {
            headers: Helpers.authFileHeaders.headers,
          });
        }
      }

      toast.success("Rechnungen erfolgreich hochgeladen", { duration: 3000 });
      setFiles([[]]);
      setTitles([""]);
    } catch (error) {
      toast.error(error.message || "Fehler beim Hochladen der Rechnungen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="flex justify-end mb-5 space-x-4">
        <Link to="/delivery-bills" className="mt-4 btn p-2 m-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
          Vergleichen mit Lieferung Rechnungen
        </Link>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-6">Laden Sie frühere Rechnungen hoch</h2>


      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        {files.map((fileArray, fileIndex) => (
          <div key={fileIndex} className="mb-4">
            <div className="flex items-center">
              {fileIndex > 0 && (
                <button onClick={() => handleRemoveFileInput(fileIndex)} className="mr-2 text-red-500">
                  <BsX size={20} />
                </button>
              )}
              <input
                type="text"
                placeholder="Titel der Datei"
                value={titles[fileIndex]}
                onChange={(e) => handleTitleChange(e, fileIndex)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
              />
            </div>
            <input
              type="file"
              onChange={(event) => handleFileChange(event, fileIndex)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2"
              accept=".pdf"
              multiple
            />
            {fileArray.length > 0 && (
              <ul className="mt-2">
                {fileArray.map((file, index) => (
                  <li key={index} className="flex items-center my-1">
                    <button onClick={() => handleRemoveFile(fileIndex, index)} className="text-red-500 mr-2">
                      <BsX size={20} />
                    </button>
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <button
          onClick={handleAddFileInput}
          className="mt-4 btn p-2 m-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Weitere Datei hinzufügen
        </button>

        <button
          onClick={sendInvoiceData}
          className={`mt-4 btn p-2 m-1 rounded-md text-white ${uploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={uploading}
        >
          {uploading ? "Wird hochgeladen..." : "Rechnungen hochladen"}
        </button>
      </div>
    </div>
  );
}

export default PastInvoices;
