import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Helpers from "../../Config/Helpers";

function InvoiceDetails() {
  const location = useLocation();
  const { state } = location;
  const [matchedData, setMatchedData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (state && state.data) {
      setMatchedData(state.data);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [state]);

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedInvoice(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex justify-end mb-5 space-x-4">
        <button onClick={() => { navigate(-1) }} className="mt-4 btn p-2 m-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
          {Helpers.getTranslationValue("Back")}
        </button>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-8">Rechnungsvergleich</h2>

      <div className="flex justify-center">
        {loading ? (
          Helpers.getTranslationValue("Is_loading")
        ) : matchedData && matchedData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchedData.map((matchedValue, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-5 flex flex-col">
                <div className="text-center mb-4">
                  <span className="text-lg font-semibold bg-blue-500 text-white px-4 py-1 rounded-full">
                    Rechnung {index + 1}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <p>
                    <strong>Produkt:</strong> {matchedValue.description}
                  </p>
                  <p>
                    <strong>Rechnungsnummer:</strong> {matchedValue.invoice_number}
                  </p>
                  <p>
                    <strong>Datum:</strong> {matchedValue.date}
                  </p>
                  <p>
                    <strong>Fälligkeitsdatum:</strong> {matchedValue.due_date}
                  </p>
                  {matchedValue.price && (
                    <p>
                      <strong>Preis:</strong> {matchedValue.price}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => openModal(matchedValue)}
                  >
                    Rechnung anzeigen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-10">Keine Übereinstimmung gefunden.</p>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceDetails;
