import React from "react";

const UserTypeSelector = ({ user, handleChange }) => {
  return (
    <div className="flex flex-col items-start space-x-3 space-y-2 mt-4">
      <label htmlFor="is_user_organization" className="block text-sm font-medium text-gray-700">
        User Type
      </label>

      <div className="custom-switch-toggle">
        <button
          type="button"
          className={`custom-switch-button ${user.is_user_organizational === 0 && user.is_user_customer === 0 ? "active" : ""}`}
          onClick={() => {
            handleChange("is_user_organizational")(0);
            handleChange("is_user_customer")(0);
          }}
        >
          Normal
        </button>
        <button
          type="button"
          className={`custom-switch-button ${user.is_user_organizational === 1 ? "active" : ""}`}
          onClick={() => {
            handleChange("is_user_organizational")(1);
            handleChange("is_user_customer")(0);
          }}
        >
          Organizational User
        </button>
        <button
          type="button"
          className={`custom-switch-button ${user.is_user_customer === 1 ? "active" : ""}`}
          onClick={() => {
            handleChange("is_user_customer")(1);
            handleChange("is_user_organizational")(0);
          }}
        >
          Customer Admin
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelector;
