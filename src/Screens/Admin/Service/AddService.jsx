import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import { useHeader } from '../../../Components/HeaderContext';

const AddService = () => {
    const { setHeaderData } = useHeader();
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderData({ title: Helpers.getTranslationValue('Services'), desc: Helpers.getTranslationValue('services_desc') });
    }, [setHeaderData]);

    const [service, setService] = useState({
        name: "",
        description: "",
        link: "",
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setService({ ...service, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);

            // For previewing the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!service.name || !service.description || !service.link) {
            Helpers.toast("error", Helpers.getTranslationValue('service_fileds_error'));
            return;
        }

        const formData = new FormData();
        formData.append("name", service.name);
        formData.append("description", service.description);
        formData.append("link", service.link);
        if (image) {
            formData.append("image", image);
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
            const response = await axios.post(`${Helpers.apiUrl}add-service`, formData, { headers });

            if (response.status !== 200) {
                throw new Error(Helpers.getTranslationValue('service_add_error'));
            }

            setService({
                name: "",
                description: "",
                link: "",
            });
            setImage(null);
            setImagePreview(null);

            Helpers.toast("success", Helpers.getTranslationValue('add_service_msg'));
            navigate("/admin/services");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token might be invalid or expired
                localStorage.removeItem('authToken');
                Helpers.toast('error', 'Session expired or invalid token. Please log in again.');
                navigate('/login');
            } else {
                Helpers.toast('error', error.response?.data?.message || error.message);
            }
        }
    };

    return (
        <div className="bg-gray-100 py-8">
            <div className="flex justify-center items-center">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl w-full">
                    <h5 className="text-xl font-semibold mb-4">{Helpers.getTranslationValue('add_service')}</h5>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('Name')}</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                id="name"
                                name="name"
                                placeholder={Helpers.getTranslationValue('Name')}
                                value={service.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="link" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('link')}</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                id="link"
                                name="link"
                                placeholder={Helpers.getTranslationValue('link')}
                                value={service.link}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{Helpers.getTranslationValue('description')}</label>
                            <textarea
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder={Helpers.getTranslationValue('description')}
                                id="description"
                                name="description"
                                rows="4"
                                value={service.description}
                                onChange={handleChange}
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
                                    <img src={imagePreview} alt="Selected" className="max-h-20" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-success-300 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-success-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {Helpers.getTranslationValue('add_service')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddService;
