import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaPencilAlt, FaTrashAlt, FaUsers } from "react-icons/fa";
import Helpers from "../../../Config/Helpers";
import Pagination from "../../../Components/Pagination";

const OrganizationUsers = () => {
  const { customerId } = useParams();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchOrganizationUsers();
  }, [customerId]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.services &&
            user.services
              .join(", ")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (user.organization_name &&
            user.organization_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, users]);

  const fetchOrganizationUsers = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${customerId}`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error("Error fetching organizational users.");
      }

      const usersData = Array.isArray(response.data.organization_users)
        ? response.data.organization_users
        : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  const handleEdit = (userId) => {
    navigate(`/admin/edit-user/${userId}`);
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
  const handleViewUsers = (id) => {
    navigate(`/admin/normal-child-users/${id}`);
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
      <div className="text-red-500">
        {Helpers.getTranslationValue("Error")}: {error}
      </div>
    );
  }

  return (
    <section className="w-full h-full">
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-100 opacity-75"></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Gesamtnutzung der Organisation
              </h2>
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
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-success-300 text-white">
                    <tr>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-white">
                        #
                      </th>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-white">
                        Werkzeug
                      </th>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-white">
                        Hochgeladene Dateien
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.serviceIds.includes(1) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          1
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Sthamer
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.documentsCount}
                        </td>
                      </tr>
                    )}
                    {selectedUser.serviceIds.includes(3) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          2
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Contract Solution
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.contractSolutionCount}
                        </td>
                      </tr>
                    )}
                    {selectedUser.serviceIds.includes(4) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          3
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Datenprozess
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.dataProcessCount}
                        </td>
                      </tr>
                    )}
                    {selectedUser.serviceIds.includes(5) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          4
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Kostenloser Datenprozess
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.freeDataProcessCount}
                        </td>
                      </tr>
                    )}
                    {selectedUser.serviceIds.includes(7) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          5
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Klon der Sicherheitsdatenblattanalyse
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.cloneDataProcessCount}
                        </td>
                      </tr>
                    )}
                    {selectedUser.serviceIds.includes(12) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          6
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          Demo Data Process
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                          {selectedUser.demoDataProcessCount}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 pr-10 focus:border-blue-500 focus:ring-0"
              id="search"
              placeholder={Helpers.getTranslationValue("Search Users")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-end mb-5 space-x-4">
            <button
              onClick={() => {
                navigate(-1);
              }}
              className="mt-4 btn p-2 m-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              {Helpers.getTranslationValue("Back")}
            </button>
          </div>
        </div>

        <div className="rounded-lg">
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
                    {Helpers.getTranslationValue("Zählerlimit")}
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
                    {Helpers.getTranslationValue("Users")}
                  </th>
                  {Helpers.authUser &&
                    parseInt(Helpers.authUser.user_type) === 1 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Historie aktivieren
                      </th>
                    )}
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
                      {user.services ? user.services.join(", ") : ""}
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
                      <button
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 ml-2"
                        onClick={() => handleShowModal(user)}
                      >
                        <FaEye className="text-black" />
                      </button>
                    </td>
                    <td>
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 ml-2"
                        onClick={() => handleViewUsers(user.id)}
                      >
                        <FaUsers className="text-black" />
                      </button>
                    </td>
                    {Helpers.authUser &&
                      parseInt(Helpers.authUser.user_type) === 1 && (
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

export default OrganizationUsers;
