import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Helpers from "../../Config/Helpers";

const InvoiceRecords = () => {
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoiceHistory();
  }, []);

  const fetchInvoiceHistory = async () => {
    try {
      const response = await fetch(
        `${Helpers.apiUrl}invoiceHistory`,
        {
          headers: Helpers.authHeaders.headers,
        }
      );
      const data = await response.json();
      setInvoiceHistory(data.data);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  const handleRowClick = (entry) => {
    navigate(`/details-with-date/${entry.upload_date}`);
  };

  const handleDeleteInvoice = async (uploadDate) => {
    try {
      const response = await fetch(
        `${Helpers.apiUrl}deleteInvoicesByUploadDate/${uploadDate}`,
        {
          method: "DELETE",
          headers: Helpers.authHeaders.headers,
        }
      );
      if (response.ok) {
        await fetchInvoiceHistory();
        toast.success("Rechnungen erfolgreich gelöscht");
      } else {
        console.error("Failed to delete invoices.");
      }
    } catch (error) {
      console.error("Error deleting invoices:", error);
    }
  };

  if (isLoading) {
    return Helpers.getTranslationValue("Is_loading");
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto mt-10 px-4">

      <div className="flex justify-end mb-5 space-x-4">
        <Link to="/delivery-bills" className="mt-4 btn p-2 m-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
          Vergleichen mit Lieferung Rechnungen
        </Link>
      </div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-center w-full">Rechnungshistorie</h1>
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Hochladedatum</th>
              <th className="py-3 px-6 text-left">Gesamtanzahl Rechnungen</th>
              <th className="py-3 px-6 text-center">Aktionen</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {invoiceHistory.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(entry)}
              >
                <td className="py-3 px-6 text-left">{entry.upload_date}</td>
                <td className="py-3 px-6 text-left">{entry.total_invoices}</td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInvoice(entry.upload_date);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded focus:outline-none"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoiceRecords;
