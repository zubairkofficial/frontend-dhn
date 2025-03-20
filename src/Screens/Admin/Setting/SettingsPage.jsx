import React from "react";
import SettingTable from "./SettingTable";
import Helpers from "../../../Config/Helpers";

const SettingsPage = () => {
    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {Helpers.getTranslationValue("manage_settings")}
                </h2>
                <SettingTable />
            </div>
        </div>
    );
};

export default SettingsPage;
