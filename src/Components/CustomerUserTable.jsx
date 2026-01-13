import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaEye, FaPencilAlt, FaTrashAlt, FaUsers } from "react-icons/fa";
import Helpers from "../Config/Helpers";
import axios from "axios";
import { useHeader } from "./HeaderContext";
import Pagination from "./Pagination";

const CustomerUserTable = () => {
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Dashboard"),
      desc: Helpers.getTranslationValue("Dashboard_Desc"),
    });
  }, [setHeaderData]);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [childUsersMap, setChildUsersMap] = useState({});
  const [childUsersLoading, setChildUsersLoading] = useState(false);
  const [childUsersError, setChildUsersError] = useState(null);
  const [matchingChildUsers, setMatchingChildUsers] = useState({});
  const [allChildUsers, setAllChildUsers] = useState([]);
  const itemsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.successMessage;

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
    setDemoDataProcessCount(null);
    setWerthenbachCount(null);
    setScherenCount(null);
    setSennheiserCount(null);
    setVerbundCount(null);
    setModalError(null);
  };
  const userId = Helpers.authUser.id;
  useEffect(() => {
    if (successMessage) {
      Helpers.toast("success", successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, navigate, location.pathname]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const stringifyServices = (services) => {
    if (Array.isArray(services)) {
      return services
        .map((service) =>
          typeof service === "string" ? service : service?.name ?? ""
        )
        .filter(Boolean)
        .join(", ");
    }

    if (typeof services === "string") {
      return services;
    }

    if (services && typeof services === "object") {
      return services.name || "";
    }

    return "";
  };

  const handleLocalSearchChange = (value) => {
    setSearchTerm(value);
    setGlobalSearchTerm("");
    setIsGlobalSearch(false);
    setCurrentPage(0);
  };

  const handleGlobalSearchChange = (value) => {
    setGlobalSearchTerm(value);
    if (value.trim()) {
      setIsGlobalSearch(true);
      setSearchTerm("");
      setMatchingChildUsers({});
    } else {
      setIsGlobalSearch(false);
    }
    setCurrentPage(0);
  };

  useEffect(() => {
    if (isGlobalSearch) {
      const normalizedGlobal = globalSearchTerm.trim().toLowerCase();

      if (!normalizedGlobal) {
        setFilteredUsers(
          users.filter((user) => user.is_user_organizational === 1)
        );
        return;
      }

      const filteredChildren = allChildUsers.filter((child) => {
        const servicesText = stringifyServices(child.services)
          .toLowerCase()
          .trim();
        return (
          child.name?.toLowerCase().includes(normalizedGlobal) ||
          child.email?.toLowerCase().includes(normalizedGlobal) ||
          servicesText.includes(normalizedGlobal) ||
          child.organization_name?.toLowerCase().includes(normalizedGlobal) ||
          child.parentName?.toLowerCase().includes(normalizedGlobal) ||
          child.parentEmail?.toLowerCase().includes(normalizedGlobal)
        );
      });

      setFilteredUsers(filteredChildren);
      setCurrentPage(0);
      return;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const organizationalUsers = users.filter(
      (user) => user.is_user_organizational === 1
    );

    if (!normalizedSearch) {
      setFilteredUsers(organizationalUsers);
      setMatchingChildUsers({});
      return;
    }

    const nextMatchingChildren = {};
    const filtered = organizationalUsers.filter((user) => {
      const servicesText = stringifyServices(user.services)
        .toLowerCase()
        .trim();

      const matchesSelf =
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        servicesText.includes(normalizedSearch) ||
        user.organization_name?.toLowerCase().includes(normalizedSearch);

      const children = childUsersMap[user.id] || [];
      const childMatches = children.filter((child) => {
        const childServices = stringifyServices(child.services)
          .toLowerCase()
          .trim();
        return (
          child.name?.toLowerCase().includes(normalizedSearch) ||
          child.email?.toLowerCase().includes(normalizedSearch) ||
          childServices.includes(normalizedSearch) ||
          child.organization_name?.toLowerCase().includes(normalizedSearch)
        );
      });

      if (childMatches.length) {
        nextMatchingChildren[user.id] = childMatches;
      }

      return matchesSelf || childMatches.length > 0;
    });

    setMatchingChildUsers(nextMatchingChildren);
    setFilteredUsers(filtered);
    setCurrentPage(0);
  }, [
    searchTerm,
    users,
    childUsersMap,
    isGlobalSearch,
    globalSearchTerm,
    allChildUsers,
  ]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${userId}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("users_fetch_error"));
      }

      const usersData = Array.isArray(response.data.organization_users)
        ? response.data.organization_users
        : [];
      setUsers(usersData);
      setFilteredUsers(
        usersData.filter((user) => user.is_user_organizational === 1)
      ); // Only set users with is_user_organizational = 1
      fetchChildUsersForOrganizations(usersData);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchChildUsersForOrganizations = async (organizationUsers) => {
    const orgAdmins = organizationUsers.filter(
      (user) => user.is_user_organizational === 1
    );
    const orgAdminLookup = orgAdmins.reduce((acc, admin) => {
      acc[admin.id] = admin;
      return acc;
    }, {});

    if (!orgAdmins.length) {
      setChildUsersMap({});
      setAllChildUsers([]);
      return;
    }

    setChildUsersLoading(true);
    setChildUsersError(null);

    try {
      const responses = await Promise.all(
        orgAdmins.map(async (orgUser) => {
          try {
            const response = await axios.get(
              `${Helpers.apiUrl}customer-normal-users/${orgUser.id}`,
              Helpers.authHeaders
            );
            if (
              response.status === 200 &&
              Array.isArray(response.data.normal_users)
            ) {
              return {
                parentId: orgUser.id,
                users: response.data.normal_users,
              };
            }
            return { parentId: orgUser.id, users: [] };
          } catch (childError) {
            console.error(
              `Failed to fetch users for organizational admin ${orgUser.id}`,
              childError
            );
            return { parentId: orgUser.id, users: [] };
          }
        })
      );

      const map = responses.reduce((acc, { parentId, users }) => {
        acc[parentId] = users;
        return acc;
      }, {});

      const flattenedChildren = responses.flatMap(({ parentId, users }) => {
        const parentInfo = orgAdminLookup[parentId] || {};
        return users.map((child) => ({
          ...child,
          parentId,
          parentName: parentInfo.name || "",
          parentEmail: parentInfo.email || "",
          parentOrganization:
            parentInfo.organization_name || child.organization_name || "",
        }));
      });

      setChildUsersMap(map);
      setAllChildUsers(flattenedChildren);
    } catch (childFetchError) {
      setChildUsersError(childFetchError.message);
      setAllChildUsers([]);
    } finally {
      setChildUsersLoading(false);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/edit-customer-user/${userId}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${Helpers.apiUrl}delete/${id}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("user_delete_error"));
      }
      setUsers(users.filter((user) => user.id !== id));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
      Helpers.toast("success", Helpers.getTranslationValue("user_delete_msg"));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewChildren = (userId) => {
    navigate(`/customer-child-table/${userId}`);
  };
  const handleViewAllProcessedData = (userId) => {
    navigate(`/user/all-processed-data/${userId}`);
  };

  const handleToggleUserHistory = async (userId, historyEnabled) => {
    try {
      const response = await axios.post(
        `${Helpers.apiUrl}toggle-user-history/${userId}`,
        { history_enabled: historyEnabled },
        Helpers.authHeaders
      );

      if (response.status === 200) {
        // Update the user in the state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, history_enabled: historyEnabled }
              : user
          )
        );
        setFilteredUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, history_enabled: historyEnabled }
              : user
          )
        );
        // Also update allChildUsers for global search
        setAllChildUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, history_enabled: historyEnabled }
              : user
          )
        );
        Helpers.toast(
          "success",
          `Historie ${historyEnabled ? "aktiviert" : "deaktiviert"}`
        );
      }
    } catch (error) {
      Helpers.toast(
        "error",
        "Fehler beim Aktualisieren der Historieeinstellungen"
      );
    }
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
                  {/* Check if all tools are undefined (i.e., no tools are available for the user) */}
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
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-gray-50">
                              Sr. No
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-gray-50">
                              Werkzeug
                            </th>
                            <th className="px-6 py-3 border-b text-left text-sm font-medium text-white bg-gray-50">
                              Dateien hochgeladen
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Display 0 if the tool is available but count is 0 */}
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

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between space-x-2 mb-4 flex-col lg:flex-row">
          <div className="mb-4 flex flex-col md:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:border-blue-500 focus:ring-0"
                id="search"
                placeholder={Helpers.getTranslationValue("user_search")}
                value={searchTerm}
                onChange={(e) => handleLocalSearchChange(e.target.value)}
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
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full border border-blue-500 rounded-lg p-2 pr-10 focus:border-blue-600 focus:ring-0"
                id="globalSearch"
                placeholder="Global Search (Assigned Users)"
                value={globalSearchTerm}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
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
            {childUsersLoading && (
              <p className="text-xs text-gray-500 mt-1">
                {Helpers.getTranslationValue("Loading")}...
              </p>
            )}
            {!childUsersLoading && childUsersError && (
              <p className="text-xs text-red-500 mt-1">
                {Helpers.getTranslationValue("error")}: {childUsersError}
              </p>
            )}
          </div>

          <Link
            to="/customer-admin-add-user"
            className="flex flex-col justify-center py-1 px-2 text-white bg-success-300 hover:bg-success-800 rounded-lg"
          >
            {Helpers.getTranslationValue("Add user")}
          </Link>
        </div>

        <div className="rounded-lg">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {isGlobalSearch ? (
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
                      {Helpers.getTranslationValue(
                        "Voice Protocol Organization"
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Organizational Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("Actions")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("All Processed Data")}
                    </th>
                    {Helpers.authUser &&
                      Helpers.getItem("is_user_customer") === "1" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Historie aktivieren
                        </th>
                      )}
                  </tr>
                ) : (
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
                      {Helpers.getTranslationValue(
                        "Voice Protocol Organization"
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue(
                        "Anzahl verfügbarer Dokumente"
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("Organisationsbenutzer")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("Verbrauchte Dokumente")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("Actions")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("users")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {Helpers.getTranslationValue("All Processed Data")}
                    </th>
                    {Helpers.authUser &&
                      Helpers.getItem("is_user_customer") === "1" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Historie aktivieren
                        </th>
                      )}
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isGlobalSearch
                  ? currentUsers.map((user, index) => (
                      <tr key={`${user.id}-${user.parentId || index}`}>
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
                          {stringifyServices(user.services) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.organization_name ||
                            user.parentOrganization ||
                            "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{user.parentName || "-"}</div>
                          {user.parentEmail && (
                            <div className="text-xs text-gray-400">
                              {user.parentEmail}
                            </div>
                          )}
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 ml-2"
                            onClick={() => handleViewAllProcessedData(user.id)}
                          >
                            <FaEye className="text-black" />
                          </button>
                        </td>
                        {Helpers.authUser &&
                          Helpers.getItem("is_user_customer") === "1" && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  checked={user.history_enabled ?? true}
                                  onChange={(e) =>
                                    handleToggleUserHistory(
                                      user.id,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="ml-2 text-sm">
                                  {user.history_enabled ?? true
                                    ? "Aktiviert"
                                    : "Deaktiviert"}
                                </span>
                              </label>
                            </td>
                          )}
                      </tr>
                    ))
                  : currentUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {indexOfFirstUser + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.name}
                          {searchTerm.trim() &&
                            matchingChildUsers[user.id] &&
                            matchingChildUsers[user.id].length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                Matching users:{" "}
                                {matchingChildUsers[user.id]
                                  .map(
                                    (child) => `${child.name} (${child.email})`
                                  )
                                  .join(", ")}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stringifyServices(user.services) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.organization_name}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                          {user.counter_limit}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                          {user.all_organization_count ?? "Nill"}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                          {user.allCount}
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
                          {/* <button
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 ml-2"
                        onClick={() => handleShowModal(user.id)}
                      >
                        <FaEye className="text-black" />
                      </button> */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium items-center">
                          {user.is_user_organizational === 1 && (
                            <button
                              className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 ml-2"
                              onClick={() => handleViewChildren(user.id)}
                            >
                              <FaUsers className="text-black" />
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  items-center">
                          <button
                            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 ml-2"
                            onClick={() => handleViewAllProcessedData(user.id)}
                          >
                            <FaEye className="text-black" />
                          </button>
                        </td>
                        {Helpers.authUser &&
                          Helpers.getItem("is_user_customer") === "1" && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  checked={user.history_enabled ?? true}
                                  onChange={(e) =>
                                    handleToggleUserHistory(
                                      user.id,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="ml-2 text-sm">
                                  {user.history_enabled ?? true
                                    ? "Aktiviert"
                                    : "Deaktiviert"}
                                </span>
                              </label>
                            </td>
                          )}
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
      </div>
    </section>
  );
};

export default CustomerUserTable;
