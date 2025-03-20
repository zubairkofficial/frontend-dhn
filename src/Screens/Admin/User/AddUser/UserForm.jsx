// UserForm.js
import React from "react";

const UserForm = ({ user, handleChange }) => {
  return (
    <>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        placeholder="Enter your name"
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={user.name}
        onChange={(e) => handleChange("name")(e.target.value)}
      />

      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={user.email}
        onChange={(e) => handleChange("email")(e.target.value)}
      />

      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        placeholder="Enter your password"
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={user.password}
        onChange={(e) => handleChange("password")(e.target.value)}
      />
    </>
  );
};

export default UserForm;
