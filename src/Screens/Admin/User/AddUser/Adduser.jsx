import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-dropdown-select";
import axios from "axios";
import "./styles.css";
import Helpers from "../../../../Config/Helpers";
import { useHeader } from "../../../../Components/HeaderContext";

const AddUser = () => {
  const { setHeaderData } = useHeader();
  const [organizationalUsers, setOrganizationalUsers] = useState([]);
  const [customerAdmins, setCustomerAdmins] = useState([]);
  const [showOrgUsersDropdown, setShowOrgUsersDropdown] = useState(false);
  const [customerUsersCount, setCustomerUsersCount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState({
    id: "",
    org_id: "",
    services: [],
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    org_id: "",
    services: [],
    is_user_organizational: 0,
    is_user_customer: 0,
    showPassword: false,
    creator_id: "",
  });

  const [services, setServices] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Dashboard"),
      desc: Helpers.getTranslationValue("Dashboard_Desc"),
    });
    fetchServices();
    fetchCustomerAdmins();
    fetchOrgs();
  }, []);

  const fetchCustomerAdmins = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllCustomerAdmins`,
        Helpers.authHeaders
      );
      setCustomerAdmins(response.data.data);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}active-services`,
        Helpers.authHeaders
      );
      setServices(response.data);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const fetchOrgs = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}all-orgs`,
        Helpers.authHeaders
      );
      setOrgs(response.data);
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const handleChange = (name) => (value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const fetchOrganizationalUsers = async (customerId) => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${customerId}`,
        Helpers.authHeaders
      );
      setOrganizationalUsers(response.data.organization_users || []);
      setShowOrgUsersDropdown(true);
      setCustomerUsersCount(
        response.data.organization_users
          .map(user => user.current_usage)
          .reduce((acc, usage) => acc + usage, 0)
      );
    } catch (error) {
      Helpers.toast("error", error.message);
    }
  };

  const handleSelectCustomerAdmin = async (selectedValues) => {
    const selectedCustomerId = selectedValues[0]?.value;
    await fetchOrganizationalUsers(selectedCustomerId);

    const selectedCustomerAdmin = customerAdmins.find(
      (admin) => admin.id === selectedCustomerId
    );

    setSelectedCustomer({
      id: selectedCustomerAdmin?.id || "",
      org_id: selectedCustomerAdmin?.org_id || "",
      services: selectedCustomerAdmin?.services || [],
    });

    setUser((prevUser) => ({
      ...prevUser,
      creator_id: selectedCustomerId,
    }));
  };

  const handleSelectOrganizationalUser = (selectedValues) => {
    const selectedUserId = selectedValues[0]?.value;
    const selectedUser = organizationalUsers.find(
      (user) => user.id === selectedUserId
    );

    setUser((prevUser) => ({
      ...prevUser,
      creator_id: selectedUserId,
      selectedOrgUser: selectedUser,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let payload;
      let apiUrl;
      if (user.is_user_organizational === 0 && user.is_user_customer === 0) {
        payload = {
          name: user.name,
          email: user.email,
          password: user.password,
          is_user_organizational: 0,
          is_user_customer: 0,
          creator_id: user.creator_id,
          parent_id: selectedCustomer.id,
          org_id: selectedCustomer.org_id,
          services: selectedCustomer.services.map((service) => service),
          ...(user.is_user_organizational === 1
            ? {
              counterLimit: user?.selectedOrgUser?.counter_limit ?? 0,
              expirationDate: user?.selectedOrgUser?.expiration_date ?? "2099-12-31",
            }
            : {
              counterLimit: selectedCustomer?.counter_limit ?? "super-admin",
              expirationDate: selectedCustomer?.expiration_date ?? "2099-12-31",
            }),
        };
        apiUrl = `${Helpers.apiUrl}register_user`;
      } else if (user.is_user_customer === 1) {
        payload = {
          name: user.name,
          email: user.email,
          password: user.password,
          org_id: user.org_id,
          services: user.services,
          is_user_customer: user.is_user_customer,
          is_user_organizational: 1,
        };
        apiUrl = `${Helpers.apiUrl}auth/register-customer-admin`;
      } else {
        payload = {
          name: user.name,
          email: user.email,
          password: user.password,
          creator_id: user.creator_id,
          is_user_organizational: user.is_user_organizational,
          org_id: selectedCustomer.org_id,
          counterLimit: user.counterLimit,
          expirationDate: user.expirationDate || "2099-12-31",
          services: selectedCustomer.services.map((service) => service),
        };
        apiUrl = `${Helpers.apiUrl}auth/register`;
      }
      const response = await axios.post(apiUrl, payload, Helpers.authHeaders);

      if (response.status === 201 || response.status === 200) {
        Helpers.toast("success", Helpers.getTranslationValue("user_save_msg"));
        navigate("/admin/dashboard");
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
 const validateDate = (date) => {
  const minDate = new Date();
  const maxDate = new Date("2099-12-31");
  const selectedDate = new Date(date);

  if (selectedDate < minDate || selectedDate > maxDate) {
    Helpers.toast("error", "Selected date is out of range.");
    return false;
  }
  return true;
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={user.password}
                  onChange={(e) => handleChange("password")(e.target.value)}
                />

                <div className="flex flex-col items-start space-x-3 space-y-2 mt-4">
                  <label
                    htmlFor="is_user_organization"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {Helpers.getTranslationValue("Benutzertyp")}
                  </label>

                  <div className="custom-switch-toggle">
                    <button
                      type="button"
                      className={`custom-switch-button ${user.is_user_organizational === 0 &&
                        user.is_user_customer === 0
                        ? "active"
                        : ""
                        }`}
                      onClick={() => {
                        handleChange("is_user_organizational")(0);
                        handleChange("is_user_customer")(0);
                      }}
                    >
                      Normaler Benutzer
                    </button>
                    <button
                      type="button"
                      className={`custom-switch-button ${user.is_user_organizational === 1 ? "active" : ""
                        }`}
                      onClick={() => {
                        handleChange("is_user_organizational")(1);
                        handleChange("is_user_customer")(0);
                      }}
                    >
                      Organisationsbenutzer
                    </button>
                    <button
                      type="button"
                      className={`custom-switch-button ${user.is_user_customer === 1 ? "active" : ""
                        }`}
                      onClick={() => {
                        handleChange("is_user_customer")(1);
                        handleChange("is_user_organizational")(0);
                      }}
                    >
                      Kundenadministrator
                    </button>
                  </div>
                </div>

                {user.is_user_organizational === 0 && user.is_user_customer === 0 && (
                  <>
                    <div>
                      <label
                        htmlFor="customer_admin"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {Helpers.getTranslationValue("Wählen Sie den Kundenadministrator")}
                      </label>
                      <Select
                        options={customerAdmins.map((admin) => ({
                          label: admin.name,
                          value: admin.id,
                        }))}
                        onChange={handleSelectCustomerAdmin}
                        className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                      />
                    </div>

                    {showOrgUsersDropdown && (
                      <div>
                        <label
                          htmlFor="organizational_user"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {Helpers.getTranslationValue("Wählen Sie den organisatorischen Benutzer")}
                        </label>
                        <Select
                          options={organizationalUsers.map((user) => ({
                            label: user.name,
                            value: user.id,
                          }))}
                          onChange={handleSelectOrganizationalUser}
                          className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                        />
                      </div>
                    )}
                  </>
                )}

                {user.is_user_organizational === 1 && (
                  <>
                    <div>
                      <label
                        htmlFor="customer_admin"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {Helpers.getTranslationValue("Wählen Sie den Kundenadministrator")}
                      </label>
                      <Select
                        options={customerAdmins.map((admin) => ({
                          label: admin.name,
                          value: admin.id,
                        }))}
                        onChange={handleSelectCustomerAdmin}
                        className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                      />
                    </div>
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
                          value={user.expirationDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const isValid = validateDate(e.target.value);
                            if (isValid) {
                              handleChange("expirationDate")(e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
                {user.is_user_customer === 1 && (
                  <>
                    <label
                      htmlFor="services"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {Helpers.getTranslationValue("Services")}
                    </label>
                    <Select
                      options={services.map((service) => ({
                        label: service.name,
                        value: service.id,
                      }))}
                      multi
                      onChange={(values) =>
                        handleChange("services")(values.map((v) => v.value))
                      }
                      className="text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                    />

                    {user.services.includes(2) && (
                      <div>
                        <label
                          htmlFor="org"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {Helpers.getTranslationValue("Organisation des Sprachprotokolls")}
                        </label>
                        <Select
                          options={orgs.map((org) => ({
                            label: org.name,
                            value: org.id,
                          }))}
                          onChange={(value) =>
                            handleChange("org_id")(value[0].value)
                          }
                          className="text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="py-2 px-4 text-white bg-success-300 hover:bg-success-400 rounded-lg hover:bg-blue-600"
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

export default AddUser;
