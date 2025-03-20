import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import Helpers from "../../Config/Helpers";
import { useHeader } from '../../Components/HeaderContext';

const ChangeLogo = () => {
  const { setHeaderData } = useHeader();
  const { updateLogo } = useOutletContext(); // Get the updateLogo function from Layout
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Set header data
    setHeaderData({ title: Helpers.getTranslationValue('settings'), desc: '' });

    // Fetch current logo
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${Helpers.apiUrl}fetch-logo`, Helpers.authHeaders);
        if (response.data.logo) {
          setPreview(Helpers.serverImage(response.data.logo)); // Use the helper method to generate the full URL
        }
      } catch (error) {
        console.error("No logo found or error fetching logo",error);
      }
    };

    fetchLogo();
  }, [setHeaderData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set the selected file and update the preview
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('logo', logo);

    try {
      const response = await axios.post(`${Helpers.apiUrl}update-logo`, formData, Helpers.authFileHeaders);
      Helpers.toast("success", Helpers.getTranslationValue('change_logo_success'));
      // Update the logo in the layout immediately
      updateLogo(Helpers.serverImage(response.data.logo));

      navigate("/settings");
    } catch (error) {
      setErrors(error.response.data.errors || {});
      Helpers.toast('error', error.response.data.errors.message || 'Failed to update logo');
    }

    setLoading(false);
  };

  return (
    <div className="mt-10">
      <div className="max-w-2xl m-auto py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">{Helpers.getTranslationValue('change_logo')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">{Helpers.getTranslationValue('current_logo')}</label>
              {preview ? (
                <img
                  src={preview}
                  alt="Current Logo"
                  className="h-24 w-24 object-cover rounded-full mb-4"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-200 flex items-center justify-center rounded-full mb-4">
                  <span className="text-gray-500">{Helpers.getTranslationValue('no_logo')}</span>
                </div>
              )}
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">{Helpers.getTranslationValue('upload_new_logo')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-success-50 file:text-success-300
                  hover:file:bg-success-100"
              />
              <small className="text-error-200">
                {errors.logo ? errors.logo[0] : ""}
              </small>
            </div>
            <button
              type="submit"
              className="py-3.5 text-white flex items-center justify-center font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg w-full"
              disabled={loading}
            >
              {loading ? Helpers.getTranslationValue('updating') : Helpers.getTranslationValue('update_logo')}
            </button>
          </form>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default ChangeLogo;
