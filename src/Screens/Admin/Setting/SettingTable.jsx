import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

const SettingTable = () => {
    const [settings, setSettings] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}settings`, Helpers.authHeaders);
            setSettings(response.data);
        } catch (error) {
            setError(Helpers.getTranslationValue("failed_to_fetch_settings"));
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${Helpers.apiUrl}settings/${id}`, Helpers.authHeaders);
            Helpers.toast("success", Helpers.getTranslationValue('setting_delete'));
            fetchSettings();
        } catch (error) {
            Helpers.toast("error",  Helpers.getTranslationValue('setting_delete_error'));
        }
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            {error && <p className="text-red-500">{error}</p>}
            {/* <Link to="/admin/add-setting" className="text-white bg-success-300 py-2 px-4 rounded-md mb-4 inline-block">
                {Helpers.getTranslationValue("add_setting")}
            </Link> */}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {settings.map((setting) => (
                        <tr key={setting.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{setting.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{setting.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {setting.value && setting.value.length > 30
                                    ? `${setting.value.substring(0, 30)}...`
                                    : setting.value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    onClick={() => navigate(`/admin/edit-setting/${setting.id}`)}
                                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
                                >
                                    <FaPencilAlt />
                                </button>
                                {/* <button
                                    onClick={() => handleDelete(setting.id)}
                                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                                >
                                    <FaTrash />
                                </button> */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SettingTable;
