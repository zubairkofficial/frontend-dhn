import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import { Link, useNavigate, useParams } from "react-router-dom";

const InstructionForm = ({ isEdit }) => {
    const [formData, setFormData] = useState({ title: "" });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (isEdit && id) {
            fetchInstruction();
        }
    }, [id, isEdit]);

    const fetchInstruction = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}instructions/${id}`, Helpers.authHeaders);
            setFormData({ title: response.data.title });
        } catch (error) {
            Helpers.toast("error", Helpers.getTranslationValue("fetch_instructions_error"));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            Helpers.toast("error", Helpers.getTranslationValue("title_required"));
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`${Helpers.apiUrl}instructions/${id}`, formData, Helpers.authHeaders);
                Helpers.toast("success", Helpers.getTranslationValue("instruction_updated"));
            } else {
                await axios.post(`${Helpers.apiUrl}instructions`, formData, Helpers.authHeaders);
                Helpers.toast("success", Helpers.getTranslationValue("instruction_added"));
            }
            navigate("/admin/instructions");
        } catch (error) {
            Helpers.toast("error", error.message);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        {Helpers.getTranslationValue("Title")}
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={Helpers.getTranslationValue("instruction_placeholder")}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2">
                <button
                    type="submit"
                    className="text-white bg-success-300 py-2 px-4 border rounded-md shadow-sm hover:bg-success-400 focus:outline-none"
                >
                     {Helpers.getTranslationValue(isEdit ?"update_instruction":"add_instruction")}
                </button>
                
                <Link
                    to="/admin/instructions"
                    className="btn text-white bg-success-300 py-2 px-4 border rounded-md shadow-sm hover:bg-success-400 focus:outline-none"
                  >
                    {Helpers.getTranslationValue('Back')}
                  </Link>
                  </div>
            </form>
        </div>
    );
};

export default InstructionForm;
