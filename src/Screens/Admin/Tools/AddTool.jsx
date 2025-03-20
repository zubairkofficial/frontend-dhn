import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Helpers from "../../../Config/Helpers";

const AddTool = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            image: file,
        });
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
        if (formData.image) {
            formDataToSend.append("image", formData.image);
        }
    
        try {
            const response = await axios.post(`${Helpers.apiUrl}tools`, formDataToSend, Helpers.authFileHeaders);
            Helpers.toast('success', "Tool Saved Successfully.");
            navigate("/admin/tools");
        } catch (error) {
            console.error("Error Response Data:", error.response?.data);
            console.error("Error Status:", error.response?.status);
            
            if (error.response?.status === 400 || error.response?.status === 422) {
                // Display specific validation error messages
                const errors = error.response.data;
                for (const [key, messages] of Object.entries(errors)) {
                    messages.forEach(message => Helpers.toast('error', message));
                }
            } else {
                Helpers.toast('error', "Failed to save tool. Please try again later.");
            }
        }
    };
    
    
    
    
    

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8  rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Werkzeug hinzufügen</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                ></textarea>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                />
                {imagePreview && (
                    <div className="mt-4">
                        <img
                            src={imagePreview}
                            alt="Image Preview"
                            className="h-40 w-auto object-cover rounded-lg"
                        />
                    </div>
                )}

            </div>
            <div className="flex justify-end">
                <button
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 mr-2"
                    onClick={() => navigate("/admin/tools")}
                >
                    stornieren
                </button>
                <button
                    className="bg-success-300 text-white p-2 rounded-lg hover:bg-blue-600"
                    onClick={handleSave}
                >
                    speichern
                </button>
            </div>
        </div>
    );
};

export default AddTool;
