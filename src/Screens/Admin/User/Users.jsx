import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaEye, FaPencilAlt, FaTrashAlt, FaUsers } from "react-icons/fa";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import { useHeader } from "../../../Components/HeaderContext";
import Pagination from "../../../Components/Pagination";

const Users = () => {
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Dashboard"),
      desc: Helpers.getTranslationValue("Dashboard_Desc"),
    });
  }, [setHeaderData]);

  const [customerAdmins, setCustomerAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.successMessage;
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [totalModalUser, SetTotalModalUser] = useState(null);
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentCount, setDocumentCount] = useState(null);
  const [contractSolutionCount, setContractSolutionCount] = useState(null);
  const [dataProcessCount, setDataProcessCount] = useState(null);
  const [freeDataProcessCount, setFreeDataProcessCount] = useState(null);
  const [cloneDataProcessCount, setCloneDataProcessCount] = useState(null);
  const [demoDataProcessCount, setDemoDataProcessCount] = useState(null);
  const [werthenbachCount, setWerthenbachCount] = useState(null);
  const [scherenCount, setScherenCount] = useState(null);
  const [sennheiserCount, setSennheiserCount] = useState(null);
  const [verbundCount, setVerbundCount] = useState(null);
  const [loadingModal, setLoadingModal] = useState(true);
  const [modalError, setModalError] = useState(null);

  const handleTotalModal = async (user) => {
    setShowTotalModal(true);
    SetTotalModalUser(user);
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
        setDemoDataProcessCount(response.data.demo_data_process_count);
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
    setDemoDataProcessCount(null);
    setModalError(null);
  };

  useEffect(() => {
    if (successMessage) {
      Helpers.toast("success", successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, navigate, location.pathname]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search terms
  useEffect(() => {
    let usersToFilter = isGlobalSearch ? allUsers : customerAdmins;
    let searchValue = isGlobalSearch ? globalSearchTerm : searchTerm;

    if (!searchValue || searchValue.trim() === "") {
      // Show default data when search is empty
      setFilteredUsers(usersToFilter);
      return;
    }

    const filtered = usersToFilter.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (user.services &&
          Array.isArray(user.services) &&
          user.services
            .map((service) =>
              typeof service === "string" ? service : service.name || service
            )
            .join(", ")
            .toLowerCase()
            .includes(searchValue.toLowerCase())) ||
        (user.organization_name &&
          user.organization_name
            .toLowerCase()
            .includes(searchValue.toLowerCase()))
    );

    setFilteredUsers(filtered);
  }, [searchTerm, globalSearchTerm, isGlobalSearch, customerAdmins, allUsers]);

  // Fetch customer admins
  const fetchCustomerAdmins = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllCustomerUsers`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("users_fetch_error"));
      }
      const usersData = Array.isArray(response.data.customer_users)
        ? response.data.customer_users
        : [];
      setCustomerAdmins(usersData);
      return usersData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fetch all users for global search
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}search-all-users`,
        Helpers.authHeaders
      );
      if (response.status === 200) {
        const usersData = Array.isArray(response.data.users)
          ? response.data.users
          : [];
        // Transform the data to match the expected format
        const transformedUsers = usersData.map((user) => ({
          ...user,
          services: user.services || [],
        }));
        setAllUsers(transformedUsers);
        return transformedUsers;
      } else {
        throw new Error("Failed to fetch all users");
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
      setAllUsers([]);
      return [];
    }
  };

  // Fetch both datasets on component load
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [customerAdminsData] = await Promise.all([
        fetchCustomerAdmins(),
        fetchAllUsers(),
      ]);
      // Set default filtered users to customer admins
      setFilteredUsers(customerAdminsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (searchValue) => {
    setGlobalSearchTerm(searchValue);
    setIsGlobalSearch(true);

    // If search is empty, switch back to customer admins view
    if (!searchValue || searchValue.trim() === "") {
      setIsGlobalSearch(false);
      setFilteredUsers(customerAdmins);
    }
  };

  const handleLocalSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setIsGlobalSearch(false);

    // If search is empty, show all customer admins
    if (!searchValue || searchValue.trim() === "") {
      setFilteredUsers(customerAdmins);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/edit-user/${userId}`);
  };
  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await axios.delete(
        `${Helpers.apiUrl}delete/${userToDelete}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("user_delete_error"));
      }
      setCustomerAdmins(
        customerAdmins.filter((user) => user.id !== userToDelete)
      );
      setAllUsers(allUsers.filter((user) => user.id !== userToDelete));
      setFilteredUsers(
        filteredUsers.filter((user) => user.id !== userToDelete)
      );
      Helpers.toast("success", Helpers.getTranslationValue("user_delete_msg"));
    } catch (error) {
      setError(error.message);
    } finally {
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const handleViewChildren = (userId) => {
    navigate(`/admin/user-children/${userId}`);
  };
  const handleViewAllProcessedData = (userId) => {
    navigate(`/admin/all-processed-data/${userId}`);
  };
  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = currentPage * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
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
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-md max-w-sm w-1/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {Helpers.getTranslationValue("Sind Sie sicher?")}
            </h3>
            <p className="text-gray-600 mb-6">
              {Helpers.getTranslationValue(
                "Möchten Sie diesen Benutzer wirklich löschen?"
              )}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                {Helpers.getTranslationValue("Abbrechen")}
              </button>
              <button
                onClick={confirmDeleteUser}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 ml-2"
              >
                <FaTrashAlt className="text-black" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-100 opacity-75"></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Usage</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
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
                  cloneDataProcessCount === undefined &&
                  werthenbachCount === undefined &&
                  scherenCount === undefined &&
                  sennheiserCount === undefined &&
                  verbundCount === undefined &&
                  demoDataProcessCount === undefined ? (
                    <p className="text-gray-500">
                      Keine Werkzeugnutzung gefunden
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-success-300">
                          <tr>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-blue-500">
                              Sr. No
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-blue-500">
                              Werkzeug
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-blue-500">
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
                                Kostenloser Datenprozess
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
                          {demoDataProcessCount !== undefined && (
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                                10
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                Demo Data Process
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                {demoDataProcessCount}
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
      {showTotalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-100 opacity-75"></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Usage</h2>
              <button
                onClick={() => {
                  setShowTotalModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
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
              {totalModalUser.total_document_count === 0 &&
              totalModalUser.total_contract_solution_count === 0 &&
              totalModalUser.total_data_process_count === 0 &&
              totalModalUser.total_free_data_process_count === 0 ? (
                <p className="text-gray-500">Keine Werkzeugnutzung gefunden</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-success-300">
                      <tr>
                        <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-blue-500">
                          Sr. No
                        </th>
                        <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-blue-500">
                          Werkzeug
                        </th>
                        <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-800 bg-blue-500">
                          Dateien hochgeladen
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Display 0 if the tool is available but count is 0 */}
                      {totalModalUser.total_document_count !== 0 && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            1
                          </td>
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            Sthamer
                          </td>
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            {totalModalUser.total_document_count}
                          </td>
                        </tr>
                      )}
                      {totalModalUser.total_contract_solution_count !== 0 && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            2
                          </td>
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            Contract Automation Solution
                          </td>
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            {totalModalUser.total_contract_solution_count}
                          </td>
                        </tr>
                      )}
                      {totalModalUser.total_data_process_count !== 0 && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            3
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                            Datenprozess
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                            {totalModalUser.total_data_process_count}
                          </td>
                        </tr>
                      )}
                      {totalModalUser.total_free_data_process_count !== 0 && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b text-sm text-gray-600 font-bold">
                            4
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                            Kostenloser Datenprozess
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                            {totalModalUser.total_free_data_process_count}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowTotalModal(false);
                }}
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
          <div className="mb-4 flex gap-2">
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2 pr-10 focus:border-blue-500 focus:ring-0"
                id="search"
                placeholder={
                  Helpers.getTranslationValue("user_search") +
                  " (Customer Admins)"
                }
                value={searchTerm}
                onChange={(e) => handleLocalSearch(e.target.value)}
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
            <div className="relative">
              <input
                type="text"
                className="border border-blue-500 rounded-lg p-2 pr-10 focus:border-blue-600 focus:ring-0"
                id="globalSearch"
                placeholder="Global Search (All Users)"
                value={globalSearchTerm}
                onChange={(e) => handleGlobalSearch(e.target.value)}
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
                    className="text-blue-500"
                  />
                  <path
                    d="M15.5166 15.9448L18.747 19.1668"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 items-center p-2">
            <Link
              to="/admin/show-all-users"
              className=" justify-center py-3 px-4 text-white bg-success-300 hover:bg-success-800 rounded-lg"
            >
              {Helpers.getTranslationValue("All Users")}
            </Link>

            <Link
              to="/admin/add-user"
              className=" justify-center py-3 px-4 text-white bg-success-300 hover:bg-success-800 rounded-lg"
            >
              {Helpers.getTranslationValue("Add user")}
            </Link>
          </div>
        </div>

        {/* <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-full"> */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Services")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Voice Protocol Organization")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Total tools usage")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Actions")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("Organisationen")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {Helpers.getTranslationValue("All Processed Data")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, index) => (
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
                    {Array.isArray(user.services)
                      ? user.services
                          .map((service) =>
                            typeof service === "string"
                              ? service
                              : service.name || service
                          )
                          .join(", ")
                      : user.services || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.organization_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                    <button
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 ml-2"
                      onClick={() => handleTotalModal(user)}
                    >
                      <FaEye className="text-black" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                    <button
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                      onClick={() => handleEdit(user.id)}
                    >
                      <FaPencilAlt className="text-black" />
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 ml-2"
                      onClick={() => handleDeleteClick(user.id)}
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
                      onClick={() => handleViewChildren(user.id)}
                    >
                      <FaUsers className="text-black" />
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
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      {/* </div> */}
    </section>
  );
};

export default Users;
