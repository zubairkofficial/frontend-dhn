import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import Helpers from "../../Config/Helpers"; // Assuming you have this helper for translations and toasts
import './LoginCustomer.css'; 

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load captcha engine on component mount
    loadCaptchaEnginge(6); // Load a 6-character captcha
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if checkbox is selected
    if (!isCheckboxChecked) {
      setErrors({ checkbox: "Bitte akzeptieren Sie die Datenschutzbestimmungen" });
      return;
    }

    // Validate captcha
    if (!validateCaptcha(captchaInput)) {
      setErrors({ captcha: "Captcha ist falsch" });
      return;
    }

    // Reset errors
    setErrors({});

    // Validate passwords match
    if (user.password !== user.confirmPassword) {
      setErrors({ confirmPassword: "Passwörter stimmen nicht überein" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${Helpers.apiUrl}auth/register-customer`, {
        name: user.name,
        email: user.email,
        password: user.password,
      });

      // On successful registration
      Helpers.toast("success", Helpers.getTranslationValue("register_success"));
      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data) {
        const errorData = error.response.data.errors || {
          message: Helpers.getTranslationValue(error.response.data.message),
        };
        setErrors(errorData);
      } else {
        setErrors({ message: Helpers.getTranslationValue("unexpected_error") });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white font min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {Helpers.getTranslationValue("Register")}
          </h2>
          <form onSubmit={handleRegister}>
            {/* Existing form fields */}
            <div className="mb-4">
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                placeholder={Helpers.getTranslationValue("Name")}
                className="text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
              />
              {errors.name && (
                <small className="text-error-200">{errors.name[0]}</small>
              )}
            </div>

            <div className="mb-4">
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder={Helpers.getTranslationValue("Email")}
                className="text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
              />
              {errors.email && (
                <small className="text-error-200">{errors.email[0]}</small>
              )}
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                placeholder={Helpers.getTranslationValue("Password")}
                className="text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
              />
              {errors.password && (
                <small className="text-error-200">{errors.password[0]}</small>
              )}
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                placeholder={Helpers.getTranslationValue("Confirm Password")}
                className="text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
              />
              {errors.confirmPassword && (
                <small className="text-error-200">{errors.confirmPassword}</small>
              )}
            </div>

            {/* Checkbox for data protection */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isCheckboxChecked}
                  onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
                  className="mr-2"
                />
                <p>
                Ich habe die <a href="https://www.dhn.digital/datenschutz" className="text-blue-500">Datenschutzbestimmungen</a> zur Kenntnis genommen.
                </p>
              </label>
              {errors.checkbox && (
                <small className="text-error-200">{errors.checkbox}</small>
              )}
            </div>

            {/* Simple Captcha */}
            <div className="mb-4">
              <LoadCanvasTemplate />
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter the captcha"
                className="text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
              />
              {errors.captcha && (
                <small className="text-error-200">{errors.captcha}</small>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="py-3.5 flex text-white items-center justify-center font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg w-full"
            >
              {Helpers.getTranslationValue(isLoading ? "Is_loading" : "Register")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
