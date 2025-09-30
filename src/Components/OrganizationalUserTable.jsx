import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPencilAlt, FaEye } from "react-icons/fa";
import axios from "axios";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import Helpers from "../Config/Helpers";
import { useHeader } from "./HeaderContext";

const OrganizationalUserTable = () => {
  const navigate = useNavigate();
  const { setHeaderData } = useHeader();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [documentCount, setDocumentCount] = useState(null);
  const [contractSolutionCount, setContractSolutionCount] = useState(null);
  const [dataProcessCount, setDataProcessCount] = useState(null);
  const [freeDataProcessCount, setFreeDataProcessCount] = useState(null);
  const [cloneDataProcessCount, setCloneDataProcessCount] = useState(null);
  const [werthenbachCount, setWerthenbachCount] = useState(null);
  const [scherenCount, setScherenCount] = useState(null);
  const [sennheiserCount, setSennheiserCount] = useState(null);
  const [verbundCount, setVerbundCount] = useState(null);
  const [loadingModal, setLoadingModal] = useState(true);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Benutzer"),
      desc: Helpers.getTranslationValue("Benutzer verwalten"),
    });
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Helpers.apiUrl}getOrganizationUsers?page=${
          currentPage + 1
        }&limit=${itemsPerPage}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("users_fetch_error"));
      }
      const usersData = response.data.organization_users;
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.services &&
          user.services
            .join(", ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        user.org_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${Helpers.apiUrl}delete_User/${id}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("user_delete_error"));
      }
      setUsers(users.filter((user) => user.id !== id));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
      Helpers.toast("success", Helpers.getTranslationValue("user_delete_msg"));
      window.location.reload();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  const handleShowModal = async (userId) => {
    setShowModal(true);
    setLoadingModal(true);
    setModalError(null);

    try {
      const response = await axios.get(
        `${Helpers.apiUrl}user/${userId}/document-count`,
        Helpers.authHeaders
      );
      if (response.status === 200) {
        setDocumentCount(response.data.document_count);
        setContractSolutionCount(response.data.contract_solution_count);
        setDataProcessCount(response.data.data_process_count);
        setFreeDataProcessCount(response.data.free_data_process_count);
        setCloneDataProcessCount(response.data.clone_process_count);
        setWerthenbachCount(response.data.werthenbach_count);
        setScherenCount(response.data.scheren_count);
        setSennheiserCount(response.data.sennheiser_count);
        setVerbundCount(response.data.verbund_count);
      } else {
        throw new Error("Failed to fetch user usage data");
      }
    } catch (error) {
      setModalError(error.message);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDocumentCount(null);
    setContractSolutionCount(null);
    setDataProcessCount(null);
    setFreeDataProcessCount(null);
    setCloneDataProcessCount(null);
    setWerthenbachCount(null);
    setScherenCount(null);
    setSennheiserCount(null);
    setVerbundCount(null);
    setModalError(null);
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = currentPage * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleAddUserRedirect = () => {
    const isUserCustomer = localStorage.getItem("is_user_customer");
    if (isUserCustomer === "1") {
      navigate("/customer-admin-add-user");
    } else {
      navigate("/add-org-user");
    }
  };
  const handleViewAllProcessedData = (userId) => {
    navigate(`/user/all-processed-data/${userId}`);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-blue-500">
        {Helpers.getTranslationValue("error")}: {error}
      </div>
    );
  }

  return (
    <section className="w-full h-full">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-100 opacity-75"></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Usage</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-900 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {loadingModal ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                </div>
              ) : modalError ? (
                <p className="text-red-500">Fehler: {modalError}</p>
              ) : (
                <>
                  {documentCount === undefined &&
                  contractSolutionCount === undefined &&
                  dataProcessCount === undefined &&
                  freeDataProcessCount === undefined &&
                  cloneDataProcessCount === undefined ? (
                    <p className="text-gray-500">
                      Keine Werkzeugnutzung gefunden
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-success-300">
                          <tr>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-gray-50">
                              Sr. No
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-gray-50">
                              Werkzeug
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-gray-50">
                              Dateien hochgeladen
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                1
                              </td>
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                Sthamer
                              </td>
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                {documentCount}
                              </td>
                            </tr>
                          )}
                          {contractSolutionCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                2
                              </td>
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                Contract Automation Solution
                              </td>
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                {contractSolutionCount}
                              </td>
                            </tr>
                          )}
                          {dataProcessCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                3
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Datenprozess
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {dataProcessCount}
                              </td>
                            </tr>
                          )}
                          {freeDataProcessCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                4
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                FreeDatenprozess
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {freeDataProcessCount}
                              </td>
                            </tr>
                          )}
                          {cloneDataProcessCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                5
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Klon der Sicherheitsdatenblattanalyse
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {cloneDataProcessCount}
                              </td>
                            </tr>
                          )}
                          {werthenbachCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                6
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Werthenbach
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {werthenbachCount}
                              </td>
                            </tr>
                          )}
                          {scherenCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                7
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Scheren
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {scherenCount}
                              </td>
                            </tr>
                          )}
                          {sennheiserCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                8
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Sennheiser
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {sennheiserCount}
                              </td>
                            </tr>
                          )}
                          {verbundCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                9
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Verbund
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {verbundCount}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between space-x-2 mb-4">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                className="w-1/2 border border-darkblack-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                id="search"
                placeholder="Search users"
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
            onClick={handleAddUserRedirect}
            className="h-10 px-5 mb-2 text-white transition-colors duration-150 bg-success-300 rounded-lg focus:shadow-outline hover:bg-success-300 flex items-center justify-center w-1/3 md:w-1/3"
          >
            {Helpers.getTranslationValue("Add user")}
          </button>
        </div>

        <div className="rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-darkblack-200">
              <thead className="bg-white-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dienstleistungen
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verbrauchte Dokumente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zählerlimit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {Helpers.getTranslationValue("All Processed Data")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.services ? user.services.join(", ") : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.organization_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.allCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.counter_limit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                        <button
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                          onClick={() => handleEdit(user.id)}
                        >
                          <FaPencilAlt className="text-black" />
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 ml-2"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FaTrashAlt className="text-black" />
                        </button>
                        <button
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 ml-2"
                          onClick={() => handleShowModal(user.id)}
                        >
                          <FaEye className="text-black" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  items-center">
                        <button
                          className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 ml-2"
                          onClick={() => handleViewAllProcessedData(user.id)}
                        >
                          <FaEye className="text-black" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Es wurden noch keine Benutzer erstellt.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default OrganizationalUserTable;
