import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-dropdown-select";
import Helpers from "../../../Config/Helpers";

const AddOrg = () => {
    const [formData, setFormData] = useState({
        name: "",
        prompt: "",
    });
    const [instructions, setInstructions] = useState([]);
    const [selectedInstructions, setSelectedInstructions] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}instructions`, Helpers.authHeaders);
            setInstructions(response.data);
        } catch (error) {
            setError(Helpers.getTranslationValue('fetch_instructions_error'));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleInstructionsChange = (values) => {
        setSelectedInstructions(values.map((v) => v.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${Helpers.apiUrl}add-org`,
                {
                    ...formData,
                    instructions: selectedInstructions,
                },
                Helpers.authHeaders
            );
            Helpers.toast("success", Helpers.getTranslationValue('org_add_success'));
            navigate("/admin/orgs");
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || Helpers.getTranslationValue('org_add_error');
            setError(errorMessage);
        }
    };

    return (
        <div className="bg-gray-100 py-8 ">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{Helpers.getTranslationValue('add_org')}</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                type="text"
                                name="name"
                                placeholder={Helpers.getTranslationValue('Name')}
                                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <textarea
                                name="prompt"
                                placeholder={Helpers.getTranslationValue('Prompt')}
                                className="block p-1 w-full sm:text-sm border-gray-300 rounded-md shadow-sm"
                                value={formData.prompt}
                                onChange={handleChange}
                                rows="3"
                            />
                            <div>
                                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                                    {Helpers.getTranslationValue('Select Instructions')}
                                </label>
                                <Select
                                    id="instructions"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    multi
                                    options={instructions.map((instruction) => ({
                                        label: instruction.title,
                                        value: instruction.id,
                                    }))}
                                    values={instructions
                                        .filter((instruction) => selectedInstructions.includes(instruction.id))
                                        .map((instruction) => ({
                                            label: instruction.title,
                                            value: instruction.id,
                                        }))}
                                    onChange={handleInstructionsChange}
                                    dropdownHeight="80px"
                                    dropdownHandle 
                                />
                            </div>
                            {error && <div className="text-red-500">{error}</div>}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none"
                                    onClick={() => navigate("/admin/orgs")}
                                >
                                    {Helpers.getTranslationValue('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="bg-success-300 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-success-400 focus:outline-none"
                                >
                                    {Helpers.getTranslationValue('save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOrg;
