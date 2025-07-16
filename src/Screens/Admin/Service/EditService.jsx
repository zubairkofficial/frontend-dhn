import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import { useHeader } from '../../../Components/HeaderContext';

const EditService = () => {
    const { setHeaderData } = useHeader();
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        link: "",
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderData({ title: Helpers.getTranslationValue('Services'), desc: Helpers.getTranslationValue('services_desc') });
        fetchService();
    }, [id]);

    const fetchService = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}get-service/${id}`, Helpers.authHeaders);
            if (response.status !== 200) {
                throw new Error(Helpers.getTranslationValue('service_fetch_error'));
            }
            setService(response.data);
            setFormData({
                name: response.data.name,
                description: response.data.description,
                link: response.data.link,
            });
            if (response.data.image) {
                setImagePreview(`${Helpers.basePath}/images/${response.data.image}`);
            }
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updateData = new FormData();
        updateData.append("name", formData.name);
        updateData.append("description", formData.description);
        updateData.append("link", formData.link);
        if (image) {
            updateData.append("image", image);
        }

        const token = localStorage.getItem('token');

        if (!token) {
            Helpers.toast('error', 'User is not authenticated. Please log in again.');
            navigate('/login');
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        };

        try {
            const response = await axios.post(`${Helpers.apiUrl}update-service/${id}`, updateData, { headers });
            if (response.status !== 200) {
                throw new Error(Helpers.getTranslationValue('service_update_error'));
            }
            Helpers.toast("success", Helpers.getTranslationValue('service_update_msg'));
            navigate("/admin/services");
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 mt-5">{error}</div>;
    }

    if (!service) {
        return <div className="text-center text-red-500 mt-5">{Helpers.getTranslationValue('service_not_found')}</div>;
    }

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{Helpers.getTranslationValue(isEditing ? 'Edit_service' : 'Service')}</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={Helpers.getTranslationValue('Name')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="link" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('link')}</label>
                                    <input
                                        type="url"
                                        name="link"
                                        id="link"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.link}
                                        onChange={handleChange}
                                        placeholder={Helpers.getTranslationValue('link')}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('description')}</label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder={Helpers.getTranslationValue('description')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Image')}</label>
                                    <input
                                        type="file"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <img src={imagePreview} alt="Selected" className="h-40 w-auto object-cover rounded-lg border" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        {Helpers.getTranslationValue('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-success-300 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-success-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {Helpers.getTranslationValue('save_changes')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{service.name}</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{service.description}</p>
                                        {/* {service.image && (
                                            <img src={`${Helpers.basePath}/images/${service.image}`} alt="Service" className="max-h-40 max-w-full object-contain mt-4" />
                                        )} */}
                                    </div>
                                    <Link to="/admin/services" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
                                        {Helpers.getTranslationValue('Back')}
                                    </Link>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success-300 hover:bg-success-400"
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

export default EditService;
