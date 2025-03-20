import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Helpers from "../../Config/Helpers";

function DetialsWithDate() {
  const { uploadDate } = useParams();
  const [invoiceData, setInvoiceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchInvoiceData(uploadDate);
  }, [uploadDate]);

  const fetchInvoiceData = async (date) => {
    try {
      const response = await fetch(
        `${Helpers.apiUrl}getInvoiceDataByUploadDate/${uploadDate}`,
        {
          headers: Helpers.authHeaders.headers,
        }
      );

      const data = await response.json();
      setInvoiceData(data);
      setIsLoading(false);
    } catch (error) {
      toast.error("Fehler beim Abrufen der Daten");
      setIsLoading(false);
    }
  };

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedInvoice(null);
    setIsModalOpen(false);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await fetch(
        `${Helpers.apiUrl}deleteInvoiceById/${invoiceId}`,
        {
          headers: Helpers.authHeaders.headers,
          method: "GET",
        }
      );
      if (response.ok) {
        await fetchInvoiceData(uploadDate);
        toast.success("Rechnung erfolgreich gelöscht");
      } else {
        toast.error("Löschen der Rechnung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex justify-end mb-5 space-x-4">
        <button onClick={() => { navigate(-1) }} className="mt-4 btn p-2 m-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
          {Helpers.getTranslationValue("Back")}
        </button>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-6">
        Rechnungsdaten für {uploadDate}
      </h2>

      <div className="flex justify-center">

        {isLoading ? (
          Helpers.getTranslationValue("Is_loading")
        ) : invoiceData?.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {invoiceData.map((invoice, index) => (
              <div
                key={index}
                onClick={() => openModal(invoice)}
                className={`cursor-pointer p-5 rounded-lg shadow-md ${invoice.matched ? "border-green-500" : "border-yellow-500"
                  }`}
              >
                <h4 className="text-lg font-semibold bg-blue-500 text-white text-center py-2 rounded-t-md">
                  Rechnung {index + 1}
                </h4>
                <div className="p-3">
                  <p>
                    <strong>Produkt:</strong> {invoice.description}
                  </p>
                  <p>
                    <strong>Rechnungsnummer:</strong> {invoice.invoice_number}
                  </p>
                  <p>
                    <strong>Datum:</strong> {invoice.date}
                  </p>
                  <p>
                    <strong>Fälligkeitsdatum:</strong> {invoice.due_date}
                  </p>
                  {invoice.price && (
                    <p>
                      <strong>Preis:</strong> {invoice.price}
                    </p>
                  )}
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInvoice(invoice.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Rechnung löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-10">
            Keine passenden Rechnungen gefunden.
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <h5 className="text-lg font-semibold mb-4">Rechnungsdetails</h5>
            {selectedInvoice && (
              <>
                <p>
                  <strong>Rechnungsnummer:</strong> {selectedInvoice.invoice_number}
                </p>
                <p>
                  <strong>Währungscode:</strong> {selectedInvoice.currency_code}
                </p>
                <p>
                  <strong>Datum:</strong> {selectedInvoice.date}
                </p>
                <p>
                  <strong>Fälligkeitsdatum:</strong> {selectedInvoice.due_date}
                </p>
                <p>
                  <strong>Produkt:</strong> {selectedInvoice.description}
                </p>
                <p>
                  <strong>Steuer:</strong> {selectedInvoice.tax}
                </p>
                <p>
                  <strong>Teilsumme:</strong> {selectedInvoice.subtotal}
                </p>
                <p>
                  <strong>Preis:</strong> {selectedInvoice.price}
                </p>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mt-4" onClick={closeModal}>
                  Schließen
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DetialsWithDate;
