import React, { useEffect, useState } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import Pagination from "../../../Components/Pagination";

const InstructionTable = () => {
    const [instructions, setInstructions] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}instructions`, Helpers.authHeaders);
            setInstructions(response.data);
        } catch (error) {
            setError(Helpers.getTranslationValue("fetch_instructions_error"));
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${Helpers.apiUrl}instructions/${id}`, Helpers.authHeaders);
            Helpers.toast("success", Helpers.getTranslationValue("instruction_deleted"));
            fetchInstructions();
        } catch (error) {
            Helpers.toast("error", error.message);
        }
    };

    const indexOfLastInst = (currentPage + 1) * itemsPerPage;
    const indexOfFirstInst = currentPage * itemsPerPage;
    const currentInsts = instructions.slice(indexOfFirstInst, indexOfLastInst);


    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            {error && <p className="text-red-500">{error}</p>}
            <Link to="/admin/add-instruction" className="text-white bg-success-300 py-2 px-4 rounded-md mb-4 inline-block">
                {Helpers.getTranslationValue("add_instruction")}
            </Link>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{Helpers.getTranslationValue("Title")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{Helpers.getTranslationValue("Actions")}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentInsts.map((instruction) => (
                        <tr key={instruction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{instruction.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{instruction.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    onClick={() => navigate(`/admin/edit-instruction/${instruction.id}`)}
                                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 mr-2"
                                >
                                    <FaPencilAlt />
                                </button>
                                <button
                                    onClick={() => handleDelete(instruction.id)}
                                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalItems={instructions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
};

export default InstructionTable;
