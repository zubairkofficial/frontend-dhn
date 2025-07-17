import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Helpers from "../../Config/Helpers";
import axios from "axios";
import { useHeader } from "../../Components/HeaderContext";

const Dashboard = () => {
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("Dashboard"),
      desc: Helpers.getTranslationValue("Benutzer-Dashboard"),
    });
  }, [setHeaderData]);

  const [services, setServices] = useState([]);
  // const [shouldDisplayServices, setShouldDisplayServices] = useState(false); // State to determine whether to show services
  const [loading, setLoading] = useState(true); // State for loading indicator

  // Fetch the user roles from localStorage and set conditions for showing services
  // useEffect(() => {
  //   const isUserOrg = parseInt(localStorage.getItem("is_user_org"), 10) || 0;
  //   const isUserCustomer = parseInt(localStorage.getItem("is_user_customer"), 10) || 0;

  //   // Logic for showing services:
  //   // 1. Show services if both `is_user_org` and `is_user_customer` are 1
  //   // 2. Show services if both `is_user_org` and `is_user_customer` are 0
  //   // 3. Hide services if only `is_user_org` is 1
  //   if ((isUserOrg === 1 && isUserCustomer === 1) || (isUserOrg === 0 && isUserCustomer === 0)) {
  //     setShouldDisplayServices(true);
  //   } else if (isUserOrg === 1 && isUserCustomer === 0) {
  //     setShouldDisplayServices(false);
  //   }
  // }, []);

  // Fetch the user services (assumes it's stored in Helpers.authUser)
  const userServices = Helpers.authUser?.services || [];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Helpers.apiUrl}active-services`,
        Helpers.authHeaders
      );
      if (response.status !== 200) {
        throw new Error(Helpers.getTranslationValue("services_fetch_error"));
      }
      setServices(response.data);
    } catch (error) {
      // Show proper error message from backend or fallback to default
      const errorMessage = error.response ? error.response.data.message : Helpers.getTranslationValue("services_fetch_error");
      Helpers.toast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isServiceEnabled = (serviceId) => {
    return userServices.includes(serviceId);
  };

  // Filter services to only show those that are enabled for the user
  const filteredServices = services.filter((service) =>
    isServiceEnabled(service.id)
  );

  return (
    <div className="w-full mb-6">
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Display loading indicator if fetching services */}
        {loading ? (
          <p>Loading services...</p>
        ) : (
          <>
            {/* Render services only if shouldDisplayServices is true */}
            {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div key={service.id} className="w-full p-2">
                    {service.status === 1 ? ( // Check if the service is enabled
                      <Link
                        to={`/${service.link}`}
                        className="block text-decoration-none relative"
                      >
                        <div
                          className="shadow-sm rounded-lg p-5 transition-opacity opacity-90"
                          style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${Helpers.basePath}/images/${service.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            cursor: "pointer",
                            height: "200px",
                            backgroundColor: "#333", // Fallback color if image is not available
                          }}
                        >
                          <div className="flex flex-col justify-start h-full">
                            <h3 className="text-lg text-white font-semibold mb-2">
                              {service.name}
                            </h3>
                            <p className="text-white text-base">{service.description}</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="shadow-sm rounded-lg p-5 transition-opacity opacity-50 cursor-not-allowed"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${Helpers.basePath}/images/${service.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          height: "200px",
                          backgroundColor: "#333", // Fallback color if image is not available
                        }}
                      >
                        <div className="flex flex-col justify-start h-full">
                          <h3 className="text-lg text-gray-400 font-semibold mb-2">
                            {service.name}
                          </h3>
                          <p className="text-gray-400 text-base">{service.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-96 w-full">
                  <p className="text-center text-xl text-black">
                    Sie haben keinen Zugriff auf Dienste.
                  </p>
                </div>
              )}
            {/* ) : (
              <div className="flex items-center justify-center h-96 w-full">
                <p className="text-center text-xl text-black">
                  Organisatorische Benutzer haben keinen Zugriff auf Dienste.
                </p>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
