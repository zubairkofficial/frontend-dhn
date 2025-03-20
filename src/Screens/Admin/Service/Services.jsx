import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import { useHeader } from '../../../Components/HeaderContext';
import Pagination from '../../../Components/Pagination';

const Services = () => {
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({ title: Helpers.getTranslationValue('Services'), desc: Helpers.getTranslationValue('services_desc') });
  }, []);

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFilteredServices(
      services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${Helpers.apiUrl}all-services`, Helpers.authHeaders);
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue('services_fetch_error'));
      }
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-service/${id}`);
  };

  const handleServiceStatus = async (id) => {
    try {
      const response = await axios.post(`${Helpers.apiUrl}update-service-status/${id}`, {}, Helpers.authHeaders);
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue('service_update_error'));
      }
      fetchServices();
    } catch (error) {
      setError(error.message);
    }
  };
  const handleAdd = () => {
    navigate(`/admin/add-service`);
  };

  const indexOfFirstService = currentPage * itemsPerPage;
  const indexOfLastService = indexOfFirstService + itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{Helpers.getTranslationValue('error')}: {error}</div>;
  }

  return (
    <section className="bg-white p-5">
      <div className="flex justify-between mb-4">
        <div className="mb-4 ">
          <div className="relative">
            <input
              type="text"
              className="border border-darkblack-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
              id="search"
              placeholder={Helpers.getTranslationValue('Suchdienst')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="9.7859"
                  cy="9.78614"
                  r="8.23951"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5166 15.9448L18.747 19.1668"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

        </div>
        <button
          className="text-white h-10 px-5 mb-2 transition-colors duration-150 bg-success-300 rounded-lg focus:shadow-outline hover:bg-success-400 flex items-center justify-center"
          onClick={handleAdd}>
          Dienst hinzufügen
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{Helpers.getTranslationValue('Image')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{Helpers.getTranslationValue('Name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{Helpers.getTranslationValue('description')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{Helpers.getTranslationValue('link')}</th>
  
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{Helpers.getTranslationValue('Actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentServices.map((service, index) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstService + index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.image ? (
                    <img
                      src={`${Helpers.basePath}/images/${service.image}`}
                      alt={service.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.link}</td>
               
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600" onClick={() => handleEdit(service.id)}>
                    <FaPencilAlt />
                  </button>
                  <button className={`p-2 rounded-lg text-white ${service.status ? 'bg-gray-500 hover:bg-gray-600' : 'bg-success-300 hover:bg-success-400'}`} onClick={() => handleServiceStatus(service.id)}>
                    {service.status ? <FaTimes /> : <FaCheck />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredServices.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </section>
  );
};

export default Services;
