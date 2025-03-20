import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-dropdown-select"; // Custom select component
import axios from "axios";
import "./styles.css"; // Include necessary styles
import Helpers from "../../../Config/Helpers";

const AddCustomerAdmin = () => {
  const [user, setUser] = useState({
    creator_id: "",
    name: "",
    email: "",
    password: "",
    org_id: "",
    services: [],
    is_user_organizational: 0, // Track if the user is organizational
  });

  // const [services, setServices] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [selectedOrganizationUser, setSelectedOrganizationUser] = useState({});
  const [customerUsersCount, setCustomerUsersCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const userObj = localStorage.getItem("user");
    const user = JSON.parse(userObj);
    const user_id = user.id;
    const user_services = user.services;
    const user_org_id = user.org_id;
    setUser((prevUser) => ({
      ...prevUser,
      creator_id: user_id,
      services: user_services,
      org_id: user_org_id,
    }));

    fetchOrganizationUsers();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}active-services`,
        Helpers.authHeaders
      );
      //    setServices(response.data);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const fetchOrganizationUsers = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${Helpers.authUser.id}`,
        Helpers.authHeaders
      );
      setOrganizationUsers(response.data.organization_users);
      setCustomerUsersCount(
        response.data.organization_users
          .map(user => user.current_usage)  // Extract `current_usage` for each user
          .reduce((acc, usage) => acc + usage, 0)  // Sum up all the `current_usage` values
      );
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };
  const handleChange = (name) => (value) => {
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve data dynamically from localStorage
    const userObj = localStorage.getItem("user");
    const userData = JSON.parse(userObj);
    // Construct payload directly
    const payload = {
      ...user, // This spreads the original user object data
      creator_id: userData.id, // Dynamically set creator_id from localStorage
      services: userData.services, // Dynamically set services from localStorage
      org_id: userData.org_id, // Dynamically set org_id from localStorage
      is_user_organizational: user.is_user_organizational ? 1 : 0, // Set flag based on organizational user type
      orgi_id: selectedOrganizationUser.id || null, // Optional organization user ID
      ...(user.is_user_organizational
        ? {
          counterLimit: user.counterLimit || 0, // Append Counter Limit
          expirationDate: user.expirationDate || "2099-12-31", // Append Expiration Date
        }
        : {
          counterLimit: selectedOrganizationUser.counter_limit || 0, // Append Counter Limit
          expirationDate: selectedOrganizationUser.expiration_date || "2099-12-31",
        }),
    };

    try {
      let apiEndpoint = `${Helpers.apiUrl}registerUserByCustomer`;
      if (user.is_user_organizational) {
        apiEndpoint = `${Helpers.apiUrl}registerOrganizationalUserByCustomer`;
      }

      // Send the dynamically created payload directly to the API
      const response = await axios.post(
        apiEndpoint,
        payload,
        Helpers.authHeaders
      );

      if (response.status === 201 || response.status === 200) {
        Helpers.toast("success", Helpers.getTranslationValue("user_save_msg"));
        navigate("/customer-user-table");
      } else {
        throw new Error(Helpers.getTranslationValue("user_save_error"));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          error.response.data.errors[field].forEach((errorMessage) => {
            Helpers.toast("error", `Error: ${errorMessage}`);
          });
        });
      } else {
        Helpers.toast("error", error.message);
      }
    }
  };


  useEffect(() => {
    fetchOrganizationUsers();
    fetchServices();
  }, []);

  const handleSelectOrganizationalUser = (selectedValues) => {

    const selectedUserId = selectedValues[0]?.value;
    setSelectedOrganizationUser(selectedUserId);

  };

  return (
    <section className="bg-white">
      <div className="flex flex-col lg:flex-row justify-between lg:px-12">
        <div className="xl:w-full lg:w-8/12 px-5 xl:pl-12">
          <div className="max-w-2xl mx-auto pb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-center text-2xl font-semibold mb-8">
                {Helpers.getTranslationValue("Add user")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {Helpers.getTranslationValue("Name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder={Helpers.getTranslationValue("Name")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={user.name}
                  onChange={(e) => handleChange("name")(e.target.value)}
                />

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {Helpers.getTranslationValue("Email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={Helpers.getTranslationValue("Email")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={user.email}
                  onChange={(e) => handleChange("email")(e.target.value)}
                />

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {Helpers.getTranslationValue("Password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={Helpers.getTranslationValue("Password")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={user.password}
                  onChange={(e) => handleChange("password")(e.target.value)}
                />

                {/* Custom Switch for User Type (Normal/Organizational) */}
                <div className="flex flex-col items-start space-x-3 space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {Helpers.getTranslationValue("User Type")}
                  </label>
                  <div className="custom-switch-toggle">
                    <button
                      type="button"
                      className={`custom-switch-button ${user.is_user_organizational === 0 ? "active" : ""
                        }`}
                      onClick={() => handleChange("is_user_organizational")(0)}
                    >
                      Normaler Benutzer
                    </button>
                    <button
                      type="button"
                      className={`custom-switch-button ${user.is_user_organizational === 1 ? "active" : ""
                        }`}
                      onClick={() => handleChange("is_user_organizational")(1)}
                    >
                      Organisationsbenutzer
                    </button>
                  </div>
                </div>
                {user.is_user_organizational === 1 && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="counterLimit"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Anzahl verfügbarer Dokumente (Paketvolumen)
                      </label>
                      <input
                        id="counterLimit"
                        name="counterLimit"
                        type="number"
                        required
                        placeholder="Geben Sie das Zählerlimit ein"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        value={user.counterLimit || ""}
                        onChange={(e) => handleChange("counterLimit")(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="currentUsage"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Aktueller Verbrauch
                      </label>
                      <input
                        id="currentUsage"
                        name="currentUsage"
                        type="number"
                        disabled
                        placeholder="Enter Current Usage"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        value={customerUsersCount || 0}
                        onChange={(e) => handleChange("currentUsage")(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="expirationDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Verbrauch bis max Datum
                      </label>
                      <input
                        id="expirationDate"
                        name="expirationDate"
                        type="date"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        value={user.expirationDate || "2099-12-31"}
                        onChange={(e) => handleChange("expirationDate")(e.target.value)}
                      />
                    </div>
                  </div>
                )}


                {/* Normal User - Organizational User Selection */}
                {user.is_user_organizational === 0 && (
                  <div className="mt-4">
                    <label
                      htmlFor="organizationUser"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {Helpers.getTranslationValue("Select Organization User")}
                    </label>
                    <Select
                      options={
                        organizationUsers && organizationUsers.length > 0
                          ? organizationUsers.map((orgUser) => ({
                            label: orgUser.name,
                            value: orgUser,
                          }))
                          : []
                      }
                      onChange={handleSelectOrganizationalUser}
                      className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                    />
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="py-2 px-4 text-white bg-success-300 hover:bg-success-400 rounded-lg"
                  >
                    {Helpers.getTranslationValue("Add user")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddCustomerAdmin;
