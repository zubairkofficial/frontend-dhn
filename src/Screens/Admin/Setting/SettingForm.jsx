import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import { Link, useNavigate, useParams } from "react-router-dom";

const SettingForm = ({ isEdit }) => {
    const [formData, setFormData] = useState({ name: "", value: "" });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (isEdit && id) {
            fetchSetting();
        }
    }, [id, isEdit]);

    const fetchSetting = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}settings/${id}`, Helpers.authHeaders);
            setFormData({ name: response.data.name, value: response.data.value });
        } catch (error) {
            Helpers.toast("error", Helpers.getTranslationValue("failed_to_fetch_settings"));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            Helpers.toast("error", Helpers.getTranslationValue("name_filed_required"));
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`${Helpers.apiUrl}settings/${id}`, formData, Helpers.authHeaders);
                Helpers.toast("success", Helpers.getTranslationValue("setting_update_success"));
            } else {
                await axios.post(`${Helpers.apiUrl}settings`, formData, Helpers.authHeaders);
                Helpers.toast("success", Helpers.getTranslationValue("setting_add_success"));
            }
            navigate("/admin/settings");
        } catch (error) {
            Helpers.toast("error", Helpers.getTranslationValue("setting_save_error"));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6 ">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        readOnly={isEdit}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter name"
                    />
                </div>
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                        {Helpers.getTranslationValue("value")}
                    </label>
                    <textarea
                        name="value"
                        id="value"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder="Enter value"
                        rows="4"
                    ></textarea>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2">
                    <button
                        type="submit"
                        className="text-white bg-success-300 py-2 px-4 border rounded-md shadow-sm hover:bg-success-400 focus:outline-none"
                    >
                        {Helpers.getTranslationValue(isEdit ? "update_setting" : "add_setting")}
                    </button>
                    <Link
                        to="/admin/settings"
                        className="text-white bg-success-300 py-2 px-4 border rounded-md shadow-sm hover:bg-success-400 focus:outline-none"
                    >
                        {Helpers.getTranslationValue('Back')}
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default SettingForm;
