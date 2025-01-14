import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Helpers from "../../../Config/Helpers";

const EditOrganizationalUser = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { id } = useParams(); // Get the user ID from the URL
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        services: [],
        is_user_organizational: false,
        is_user_customer: false,
        counterLimit: Helpers.authUser.counter_limit,
        expirationDate: Helpers.authUser.expiration_date,
    });
    const navigate = useNavigate();

    useEffect(() => {
        // console.error('isCustomerAdmin:', isCustomerAdmin);
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(
                `${Helpers.apiUrl}user/${id}`,
                Helpers.authHeaders
            );
            setUser(response.data.user);
        } catch (error) {
            Helpers.toast("error", "Error fetching user data.");
        }
    };


    const handleChange = (name) => (value) => {
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Include the counter_limit from Helpers.authUser
        const updatedUser = {
            ...user,
            counterLimit: Helpers.authUser.counter_limit,// Adding the counter_limit here
            expirationDate: Helpers.authUser.expiration_date,
        };

        try {
            const response = await axios.put(
                `${Helpers.apiUrl}update_user/${id}`,
                updatedUser,  // Send updated user with the new counter_limit
                Helpers.authHeaders
            );

            if (response.status === 200) {
                Helpers.toast("success", "User updated successfully.");
                navigate(-1);
            }
        } catch (error) {
            Helpers.toast("error", "Error updating user.");
        }
    };


    return (
        <section className="bg-white">
            <div className="flex flex-col lg:flex-row justify-between lg:px-12">
                <div className="xl:w-full lg:w-8/12 px-5 xl:pl-12">
                    <div className="max-w-2xl mx-auto pb-16">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-center text-2xl font-semibold mb-8">
                                {Helpers.getTranslationValue("Edit user")}
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
                                    {Helpers.getTranslationValue("Password (Leave blank to keep current)")}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={Helpers.getTranslationValue("Password")}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={user.password}
                                    onChange={(e) => handleChange("password")(e.target.value)}
                                />

                                <div className="flex justify-end mt-4 p-2">
                                    <Link
                                        to={`/org-user-table`}
                                        className="bg-gray-200 mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue('Cancel')}
                                    </Link>
                                    <Link
                                        to={`/reset-normal-user-password/${user.id}`} // Use curly braces and backticks for template literals
                                        className="mr-2 py-2 px-4 text-white bg-success-300 hover:bg-success-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        {Helpers.getTranslationValue('Passwort zurücksetzen')}
                                    </Link>
                                    <button
                                        type="submit"
                                        className="py-2 px-4 text-white bg-success-300 hover:bg-success-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue("Update User")}
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

export default EditOrganizationalUser;
