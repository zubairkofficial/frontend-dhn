import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Helpers from "../../../Config/Helpers";
import Select from "react-dropdown-select";
import axios from "axios";
import { useHeader } from '../../../Components/HeaderContext';

const EditOrg = () => {
    const { setHeaderData } = useHeader();
    const { id } = useParams();
    const [org, setOrg] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [selectedInstructions, setSelectedInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        prompt: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderData({ title: Helpers.getTranslationValue('Organizations'), desc: Helpers.getTranslationValue('org_desc') });
        fetchOrg();
        fetchInstructions();
    }, [id]);

    const fetchOrg = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}get-org/${id}`, Helpers.authHeaders);
            if (response.status !== 200) {
                throw new Error(Helpers.getTranslationValue('org_fetch_error'));
            }
            setOrg(response.data);
            setFormData({
                name: response.data.name,
                prompt: response.data.prompt,
            });
            setSelectedInstructions(response.data?.instructions.map(inst => inst.id)); // Pre-select assigned instructions
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchInstructions = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}instructions`, Helpers.authHeaders);
            setInstructions(response.data); // Assuming response.data is an array of instructions
        } catch (error) {
            setError(Helpers.getTranslationValue('fetch_instructions_error'));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${Helpers.apiUrl}update-org/${id}`, {
                ...formData,
                instructions: selectedInstructions
            }, Helpers.authHeaders);

            if (response.status !== 200) {
                throw new Error(Helpers.getTranslationValue('org_update_error'));
            }
            Helpers.toast("success", Helpers.getTranslationValue('org_update_msg'));
            navigate("/admin/orgs");
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

    if (!org) {
        return <div className="text-center text-red-500 mt-5">{Helpers.getTranslationValue('org_fetch_error')}</div>;
    }

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{Helpers.getTranslationValue(isEditing ? 'edit_org' : 'Organizations')}</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {isEditing ? (
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
                                <Select
                                    id="instructions"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    multi                                    
                                    dropdownHeight="80px"
                                    dropdownHandle
                                    options={instructions.map((instruction) => ({
                                        label: instruction.title,
                                        value: instruction.id,
                                    }))}
                                    values={instructions
                                        .filter((instruction) => selectedInstructions.includes(instruction.id))
                                        .map((instruction) => ({
                                            label: instruction.title,
                                            value: instruction.id,
                                        }))
                                    }
                                    onChange={(values) => setSelectedInstructions(values.map((v) => v.value))}
                                />

                                <div className="flex justify-end space-x-3">
                                    <button type="button" className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none" onClick={() => setIsEditing(false)}>
                                        {Helpers.getTranslationValue('Cancel')}
                                    </button>
                                    <button type="submit" className="bg-success-300 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-success-400 focus:outline-none">
                                        {Helpers.getTranslationValue('save_changes')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p><strong>{Helpers.getTranslationValue('Name')}:</strong> {org.name}</p>
                                    <p><strong>{Helpers.getTranslationValue('Prompt')}:</strong> {org.prompt}</p>
                                    <div className="flex justify-end space-x-3">
                                        <Link to="/admin/orgs" className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none">
                                            {Helpers.getTranslationValue('Back')}
                                        </Link>
                                        <button onClick={() => setIsEditing(true)} className="bg-success-300 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-success-400 focus:outline-none">
                                            {Helpers.getTranslationValue('Edit')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditOrg;
