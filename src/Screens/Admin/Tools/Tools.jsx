import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import Helpers from "../../../Config/Helpers";
import { useHeader } from '../../../Components/HeaderContext';
import Pagination from '../../../Components/Pagination';
import { useNavigate } from "react-router-dom";

const Tools = () => {
    const { setHeaderData } = useHeader();
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderData({ title: "Werkzeuge", desc: "Verwalten Sie Ihre Werkzeuge" });
    }, [setHeaderData]);

    const [tools, setTools] = useState([]);
    const [filteredTools, setFilteredTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchTools();
    }, []);

    useEffect(() => {
        setFilteredTools(
            tools.filter((tool) =>
                tool.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, tools]);

    const fetchTools = async () => {
        try {
            const response = await axios.get(`${Helpers.apiUrl}tools`, Helpers.authHeaders);
            setTools(response.data);
            setFilteredTools(response.data);
            setLoading(false);
        } catch (error) {
            setError("Failed to fetch tools.");
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-tool/${id}`);
    };

    const handleAdd = () => {
        navigate(`/admin/add-tool`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    const indexOfLastTool = (currentPage + 1) * itemsPerPage;
    const indexOfFirstTool = currentPage * itemsPerPage;
    const currentTools = filteredTools.slice(indexOfFirstTool, indexOfLastTool);

    return (
        <section className="bg-white">
            <div className="flex flex-col lg:flex-row justify-between lg:px-12 py-4">
                <div className="w-full px-5 xl:pl-12">
                    <div className="m-auto">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between space-x-2 mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full md:w-1/2 border border-darkblack-300 rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                                        id="search"
                                        placeholder="Such werkzeuge"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="text-white h-10 px-5 mb-2 transition-colors duration-150 bg-success-300 rounded-lg focus:shadow-outline hover:bg-success-400 flex items-center justify-center"
                                    onClick={handleAdd}>
                                    Werkzeug hinzufügen
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentTools.map((tool, index) => (
                                            <tr key={tool.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstTool + index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tool.image ? (
                                                        <img
                                                            src={`${Helpers.basePath}/images/${tool.image}`}
                                                            alt={tool.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>No Image</span>
                                                    )}
                                                </td>


                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {tool.description.length > 70
                                                        ? `${tool.description.substring(0, 70)}...`
                                                        : tool.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                                                        onClick={() => handleEdit(tool.id)}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTools.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tools;
