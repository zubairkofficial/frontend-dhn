import React, { useState } from "react";
import Select from "react-dropdown-select";

const ServiceSelection = ({
  user,
  services,
  orgs,
  organizationalUsers,
  customerAdmins,
  handleSelectOrganizationalUser,
  handleChange,
}) => {
  const [filteredOrganizationalUsers, setFilteredOrganizationalUsers] = useState([]);
  const [selectedCustomerAdmin, setSelectedCustomerAdmin] = useState(null);

  const handleSelectCustomerAdminForNormalUser = (selectedValues) => {
    const selectedCustomerAdminId = selectedValues[0]?.value;
    setSelectedCustomerAdmin(selectedCustomerAdminId);

    const filteredUsers = organizationalUsers.filter(
      (user) => user.customer_admin_id === selectedCustomerAdminId
    );
    setFilteredOrganizationalUsers(filteredUsers);

    handleChange("creator_id")(selectedCustomerAdminId);
  };

  return (
    <>
      {user.is_user_organizational === 0 && user.is_user_customer === 0 && (
        <>
          <div>
            <label htmlFor="customer_admin" className="block text-sm font-medium text-gray-700">
              Select Customer Admin
            </label>
            <Select
              options={customerAdmins.map((admin) => ({
                label: admin.name,
                value: admin.id,
              }))}
              onChange={handleSelectCustomerAdminForNormalUser}
              className=" mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
            />
          </div>

          {selectedCustomerAdmin && (
            <div>
              <label htmlFor="organization_user" className="block text-sm font-medium text-gray-700">
                Select Organizational User
              </label>
              <Select
                options={filteredOrganizationalUsers.map((user) => ({
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
        <div>
          <label htmlFor="customer_admin" className="block text-sm font-medium text-gray-700">
            Select Customer Admin
          </label>
          <Select
            options={customerAdmins.map((admin) => ({
              label: admin.name,
              value: admin.id,
            }))}
            onChange={handleSelectOrganizationalUser}
            className="mt-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
          />
        </div>
      )}

      {user.is_user_customer === 1 && (
        <>
          <label htmlFor="services" className="block text-sm font-medium text-gray-700">
            Services
          </label>
          <Select
            options={services.map((service) => ({
              label: service.name,
              value: service.id,
            }))}
            multi
            onChange={(values) => handleChange("services")(values.map((v) => v.value))}
            className="text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
          />

          {user.services.includes(2) && (
            <div>
              <label htmlFor="org" className="block text-sm font-medium text-gray-700">
                Voice Protocol Organization
              </label>
              <Select
                options={orgs.map((org) => ({
                  label: org.name,
                  value: org.id,
                }))}
                onChange={(value) => handleChange("org_id")(value[0].value)}
                className="text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ServiceSelection;
