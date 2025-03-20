import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Helpers from "../../../../Config/Helpers";
import { useHeader } from "../../../../Components/HeaderContext";

const ResetNormalUserPassword = () => {
    const { setHeaderData } = useHeader();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        newPassword: "",
        password_confirmation: "", // Change this to match the backend
    });
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderData({ title: Helpers.getTranslationValue('Passwort zurücksetzen'), desc: Helpers.getTranslationValue('Reset Password Description') });
        setLoading(false); // No need to fetch user data for just resetting password
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.password_confirmation) { // Check against the new field name
            Helpers.toast("error", "Passwords do not match.");
            return;
        }

        try {
            // alert(formData.newPassword)
            const response = await axios.post(
                `${Helpers.apiUrl}reset-user-password/${id}`, // Adjust the API endpoint as necessary
                {
                    password: formData.newPassword,
                    password_confirmation: formData.password_confirmation, // Send the confirmation password
                },
                Helpers.authHeaders
            );

            if (response.status !== 200) throw new Error("Failed to reset password.");
            Helpers.toast("success", "Password reset successfully.");
            navigate(-1);
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

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );

    if (error)
        return <div className="text-center text-red-500 mt-5">{error}</div>;

    return (
        <div className="bg-gray-100 py-5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{Helpers.getTranslationValue('Reset User Password')}</h2>

                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {Helpers.getTranslationValue('New Password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        placeholder={Helpers.getTranslationValue('New Password')}
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {Helpers.getTranslationValue('Confirm Password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation" // Updated field name
                                        id="password_confirmation" // Updated field name
                                        placeholder={Helpers.getTranslationValue('Confirm Password')}
                                        value={formData.password_confirmation} // Updated field name
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        to={`/edit-user/${id}`}
                                        className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue('Cancel')}
                                    </Link>
                                    <button
                                        type="submit"
                                        className="bg-success-300 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-success-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue('Passwort zurücksetzen')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetNormalUserPassword;