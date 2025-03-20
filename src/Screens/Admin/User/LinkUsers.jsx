import React, { useEffect, useState } from "react";
import Select from "react-dropdown-select";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import "./AddUser/styles.css";
import { useNavigate } from "react-router-dom";

const LinkUsers = () => {
  const [users, setUsers] = useState([]);
  const [organizationalUsers, setOrganizationalUsers] = useState([]);
  const [customerAdmins, setCustomerAdmins] = useState([]);
  const [selectedCustomerAdmin, setSelectedCustomerAdmin] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrganizationalUser, setSelectedOrganizationalUser] = useState(null);
  const [showOrgUsersDropdown, setShowOrgUsersDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCustomerAdmins();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Helpers.apiUrl}getNonOrganizationalUsers`, Helpers.authHeaders);
      if (response.status !== 200) {
        throw new Error("Fehler beim Abrufen der normalen Benutzer.");
      }
      const usersData = Array.isArray(response.data.all_users) ? response.data.all_users : [];
      setUsers(usersData);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const fetchCustomerAdmins = async () => {
    try {
      const response = await axios.get(`${Helpers.apiUrl}getAllCustomerAdmins`, Helpers.authHeaders);
      setCustomerAdmins(response.data.data);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const handleSelectCustomerAdmin = async (selectedValues) => {
    const selectedCustomerAdminId = selectedValues[0]?.value;
    setSelectedCustomerAdmin(selectedCustomerAdminId);
    await fetchOrganizationalUsers(selectedCustomerAdminId);
  };

  const fetchOrganizationalUsers = async (customerId) => {
    try {
      const response = await axios.get(`${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${customerId}`, Helpers.authHeaders);
      setOrganizationalUsers(response.data.organization_users || []);
      setShowOrgUsersDropdown(true);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const handleAssignUsers = async () => {
    try {
      const payload = {
        userId: selectedUser,
        customerAdminId: selectedCustomerAdmin,
        organizationalUserId: selectedOrganizationalUser,
        services: customerAdmins.find(admin => admin.id === selectedCustomerAdmin)?.services || [],
        org_id: customerAdmins.find(admin => admin.id === selectedCustomerAdmin)?.org_id || null,
        is_user_customer: 0,
        is_user_organizational: 0
      };
      const response = await axios.post(`${Helpers.apiUrl}auth/link-users`, payload, Helpers.authHeaders);
      if (response.status === 200) {
        Helpers.toast("success", "Benutzer erfolgreich verknüpft");
        navigate('/admin/dashboard');
      }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          Object.keys(error.response.data.errors).forEach((field) => {
            error.response.data.errors[field].forEach((errorMessage) => {
              Helpers.toast("error", `Fehler: ${errorMessage}`);
            });
          });
        } else {
          Helpers.toast("error", error.message);
        }
      }
    };

  return (
    <div className="link-users-container">
      <h2 className="text-center text-2xl font-semibold mb-8">Benutzer verknüpfen</h2>
      
      <div className="dropdown-section">
        <label htmlFor="users" className="block text-sm font-medium text-gray-700">
          Benutzer auswählen
        </label>
        <Select
          options={users.map((user) => ({ label: user.name, value: user.id }))}
          onChange={(selectedValues) => setSelectedUser(selectedValues[0]?.value)}
          className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
        />
      </div>

      <div className="dropdown-section mt-4">
        <label htmlFor="customer_admin" className="block text-sm font-medium text-gray-700">
          Kundenadministrator auswählen
        </label>
        <Select
          options={customerAdmins.map((admin) => ({ label: admin.name, value: admin.id }))}
          onChange={handleSelectCustomerAdmin}
          className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
        />
      </div>

      {showOrgUsersDropdown && (
        <div className="dropdown-section mt-4">
          <label htmlFor="organizational_user" className="block text-sm font-medium text-gray-700">
            Organisationsbenutzer auswählen
          </label>
          <Select
            options={organizationalUsers.map((user) => ({ label: user.name, value: user.id }))}
            onChange={(selectedValues) => setSelectedOrganizationalUser(selectedValues[0]?.value)}
            className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
          />
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleAssignUsers}
          className="py-2 px-4 text-white bg-success-300 hover:bg-blue-600 rounded-lg"
        >
          Benutzer zuweisen
        </button>
      </div>
    </div>
  );
};

export default LinkUsers;