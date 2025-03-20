import React from "react";
import InstructionTable from "./InstructionTable";
import Helpers from "../../../Config/Helpers";

const InstructionsPage = () => {
    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{Helpers.getTranslationValue("manage_instructions")}</h2>
                <InstructionTable />
            </div>
        </div>
    );
};

export default InstructionsPage;
