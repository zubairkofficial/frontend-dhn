import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Helpers from "../../../Config/Helpers";

const EditTool = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTool();
    }, []);

    const fetchTool = async () => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${Helpers.apiUrl}tools/${id}`, Helpers.authHeaders);
            setFormData({
                name: data.name,
                description: data.description,
                image: null,
            });
    
            setImagePreview(`${Helpers.basePath}/images/${data.image}`);
        } catch (error) {
            Helpers.toast('error', "Failed to fetch tool.");
            console.error("Fetch Tool Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file,
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);
    
        const formDataToSend = new FormData();
        formDataToSend.append("_method", "PUT");
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
    
        if (formData.image instanceof File) {
            formDataToSend.append("image", formData.image);
        }
    
        try {
            await axios.post(`${Helpers.apiUrl}tools/${id}`, formDataToSend, Helpers.authFileHeaders);
            Helpers.toast('success', "Tool updated successfully.");
            navigate("/admin/tools");
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 422) {
                const errors = error.response.data;
                for (const [key, messages] of Object.entries(errors)) {
                    messages.forEach(message => Helpers.toast('error', message));
                }
                setFieldErrors(error.response.data);
            } else {
                Helpers.toast('error', "Failed to update tool. Please try again later.");
            }
            console.error("Update Tool Error:", error.response || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 mt-10 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Edit Tool</h2>
            {loading && <div className="text-blue-500 mb-4">Loading...</div>}
            <form onSubmit={handleSave}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full border ${
                            fieldErrors.name ? "border-red-500" : "border-gray-300"
                        } rounded-lg p-2 focus:border-blue-500 focus:ring-0`}
                        required
                    />
                    {fieldErrors.name && (
                        <div className="text-red-500 text-sm mt-1">{fieldErrors.name[0]}</div>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={`w-full border ${
                            fieldErrors.description ? "border-red-500" : "border-gray-300"
                        } rounded-lg p-2 focus:border-blue-500 focus:ring-0`}
                    ></textarea>
                    {fieldErrors.description && (
                        <div className="text-red-500 text-sm mt-1">
                            {fieldErrors.description[0]}
                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`w-full border ${
                            fieldErrors.image ? "border-red-500" : "border-gray-300"
                        } rounded-lg p-2 focus:border-blue-500 focus:ring-0`}
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <image
                                src={imagePreview}
                                alt="Image Preview"
                                className="h-40 w-auto object-cover rounded-lg border"
                            />
                        </div>
                    )}
                    {fieldErrors.image && (
                        <div className="text-red-500 text-sm mt-1">{fieldErrors.image[0]}</div>
                    )}
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
                        onClick={() => navigate("/admin/tools")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-success-300 text-white p-2 rounded-lg hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTool;
