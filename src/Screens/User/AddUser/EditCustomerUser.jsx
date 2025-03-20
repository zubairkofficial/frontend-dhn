import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Select from "react-dropdown-select";
import axios from "axios";
import Helpers from "../../../Config/Helpers";

const EditCustomerUser = () => {
    const { id } = useParams();
    const [userDetails, setUserDetails] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [userServiceUsage, setUserServiceUsage] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        org_id: "",
        services: [],
        counterLimit: 0,
        currentUsage: 0,
        expirationDate: "2099-12-31"
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
        fetchOrganizations();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}getuser/${id}`, Helpers.authHeaders);
            if (response.status !== 200) throw new Error(Helpers.getTranslationValue('user_not_found'));
            const user = response.data.user;
            setUserDetails(user);
            setAvailableServices(response.data.services);
            setOrganizations(response.data.orgs);
            setFormData({
                id: user.id,
                name: user.name,
                email: user.email,
                services: user.services,
                org_id: user.org_id,
                counterLimit: user.counter_limit || 0,
                expirationDate: user.expiration_date || "2099-12-31"
            });
            setIsLoading(false);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    const fetchOrganizations = async () => {
        try {
            const response = await axios.get(
                `${Helpers.apiUrl}getAllOrganizationalUsersForCustomer/${Helpers.authUser.id}`,
                Helpers.authHeaders
            );
            setUserServiceUsage(
                response.data.organization_users
                    .map(user => user.current_usage)
                    .reduce((acc, usage) => acc + usage, 0)
            );
        } catch (error) {
            Helpers.toast("error", error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            services: selectedOptions.map(option => option.value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${Helpers.apiUrl}update-customer-user/${id}`,
                formData,
                Helpers.authHeaders
            );
            if (response.status !== 200) throw new Error(Helpers.getTranslationValue('user_not_found'));
            Helpers.toast("success", Helpers.getTranslationValue('user_update_msg'));
            navigate('/customer-user-table');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                Object.keys(error.response.data.errors).forEach((field) => {
                    error.response.data.errors[field].forEach((message) => {
                        Helpers.toast("error", `Error: ${message}`);
                    });
                });
            } else {
                Helpers.toast("error", error.message);
            }
        }
    };

    const orgOptions = organizations.map((org) => ({
        value: org.id,
        label: org.name,
    }));

    const selectedOrg = orgOptions.find(option => option.value === formData.org_id);

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
    );

    if (error) return <div className="text-center text-red-500 mt-5">{error}</div>;

    if (!userDetails) return <div className="text-center text-red-500 mt-5">{Helpers.getTranslationValue('user_not_found')}</div>;

    return (
        <div className="bg-gray-100 py-5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{Helpers.getTranslationValue('Edit user')}</h2>
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Name')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder={Helpers.getTranslationValue('Name')}
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Email')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder={Helpers.getTranslationValue('Email')}
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="services" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Services')}</label>
                                        <Select
                                            options={availableServices.map((service) => ({
                                                label: service.name,
                                                value: service.id,
                                            }))}
                                            values={availableServices.filter(service => formData.services.includes(service.id)).map(service => ({
                                                label: service.name,
                                                value: service.id,
                                            }))}
                                            onChange={handleServiceChange}
                                            multi
                                            className="text-base"
                                        />
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="counterLimit" className="block text-sm font-medium text-gray-700">Anzahl verfügbarer Dokumente (Paketvolumen)</label>
                                            <input
                                                id="counterLimit"
                                                name="counterLimit"
                                                type="number"
                                                placeholder="Geben Sie das Zählerlimit ein"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                                value={formData.counterLimit}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="currentUsage" className="block text-sm font-medium text-gray-700">Aktueller Verbrauch</label>
                                            <input
                                                id="currentUsage"
                                                name="currentUsage"
                                                type="number"
                                                disabled
                                                placeholder="Enter Current Usage"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                                value={userServiceUsage}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Verbrauch bis max Datum</label>
                                            <input
                                                id="expirationDate"
                                                name="expirationDate"
                                                type="date"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                                value={formData.expirationDate}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    {formData.services.includes(2) && (
                                        <div>
                                            <label htmlFor="org" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Organization')}</label>
                                            <Select
                                                values={selectedOrg ? [selectedOrg] : []}
                                                options={orgOptions}
                                                onChange={(selectedOption) => setFormData(prev => ({ ...prev, org_id: selectedOption[0].value }))}
                                                className="text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 p-2"
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-300"
                                            onClick={() => navigate("/customer-user-table")}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h6 className="text-center text-lg font-medium text-gray-900 mt-4">
                                    {Helpers.getTranslationValue('User_info')}
                                </h6>
                                <div className="border-t border-gray-200 mt-5">
                                    <dl>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">
                                                {Helpers.getTranslationValue('Name')}
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {formData.name}
                                            </dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">
                                                {Helpers.getTranslationValue('Email')}
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {formData.email}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">
                                                {Helpers.getTranslationValue('Services')}
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {availableServices
                                                    .filter((s) => formData.services.includes(s.id))
                                                    .map((s) => s.name)
                                                    .join(", ")}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        to="/customer-user-table"
                                        className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        {Helpers.getTranslationValue('Back')}
                                    </Link>
                                    <Link
                                        to={`/reset-customer-password/${formData.id}`} // Use curly braces and backticks for template literals
                                        className="mr-2 py-2 px-4 text-white bg-success-300 hover:bg-success-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        {Helpers.getTranslationValue('Passwort zurücksetzen')}
                                    </Link>
                                    <button
                                        type="submit"
                                        onClick={() => setIsEditing(true)}
                                        className="bg-success-300 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-success-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue('Edit')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCustomerUser;
