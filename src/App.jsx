import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Navigate, Routes, Route, Link } from "react-router-dom";
import AdminLayout from "./Screens/Admin/Layout/Layout";
import AddOrganizationalUser from "./Screens/User/AddUser/AddOrganizationalUser";
import { HeaderProvider } from "./Components/HeaderContext";
import Users from "./Screens/Admin/User/Users";
import Helpers from "./Config/Helpers";
import Login from "./Screens/Auth/Login";
import Adduser from "./Screens/Admin/User/AddUser/Adduser";
import Edituser from "./Screens/Admin/User/Edituser";
import UserDashboard from "./Screens/User/Dashboard";
import UserLayout from "./Screens/User/Layout/Layout";
import FileUpload from "./Screens/User/Fileupload";
import ChangePass from "./Screens/User/ChangePass";
import Voice from "./Screens/User/Voice";
import SentEmails from "./Screens/User/SentEmails";
import Transcription from "./Screens/User/Transcription";
import ResendEmail from "./Screens/User/ResendEmail";
import Services from "./Screens/Admin/Service/Services";
import AddService from "./Screens/Admin/Service/AddService";
import EditService from "./Screens/Admin/Service/EditService";
import Orgs from "./Screens/Admin/Organization/Orgs";
import AddOrg from "./Screens/Admin/Organization/AddOrg";
import EditOrg from "./Screens/Admin/Organization/EditOrg";
import Trans from "./Screens/Admin/Translation/Translations";
import AddTrans from "./Screens/Admin/Translation/AddTrans";
import EditTrans from "./Screens/Admin/Translation/EditTrans";
import ContractAutomationSolution from "./Screens/User/ContractAutomationSolution";
import Tools from "./Screens/Admin/Tools/Tools";
import AddTool from "./Screens/Admin/Tools/AddTool";
import EditTool from "./Screens/Admin/Tools/EditTool";
import DataProcess from "./Screens/User/DataProcess";
import CloneDataProcess from "./Screens/User/CloneDataProcess";
import ChangeLogo from "./Screens/User/ChangeLogo";
import Settings from "./Screens/User/Settings";
import OrganizationalUserTable from "./Components/OrganizationalUserTable";
import { useState } from "react";
import OrganizationUsers from "./Screens/Admin/User/OrganizationUsers";
import EditOrganizationalUser from "./Screens/User/EditOrganizationalUser";
import Register from "./Screens/Auth/Register";
import AddCustomerAdmin from "./Screens/User/AddUser/AddCustomerAdmin";
import CustomerUserTable from "./Components/CustomerUserTable";
import CustomerChildTable from "./Components/CustomerChildTable";
import NormalUsers from "./Screens/Admin/User/NormalUsers";
import LoginCustomer from "./Screens/Auth/LoginCustomer";
import AllUsers from "./Screens/Admin/User/AllUsers";
import LinkUsers from "./Screens/Admin/User/LinkUsers";
import FreeDataProcess from "./Screens/User/FreeDataProcess";
import InstructionsPage from "./Screens/Admin/Instruction/InstructionsPage";
import InstructionForm from "./Screens/Admin/Instruction/InstructionForm";
import SettingsPage from "./Screens/Admin/Setting/SettingsPage";
import SettingForm from "./Screens/Admin/Setting/SettingForm";
import DeliveryBills from "./Screens/User/DeliveryBills";
import InvoiceDetails from "./Screens/User/InvoiceDetails";
import PastInvoices from "./Screens/User/PastInvoices";
import InvoiceRecords from "./Screens/User/InvoiceRecords";
import DetialsWithDate from "./Screens/User/DetialsWithDate";
import EditCustomerUser from "./Screens/User/AddUser/EditCustomerUser";
import EditOrganizationalUserPage from "./Screens/User/AddUser/EditOrganizationalUser";
import ResetUserPassword from "./Screens/Admin/User/ResetUserPassword";
import ResetOrganizationalUserPassword from "./Screens/Admin/User/AddUser/ResetOrganizationalUserPassword";
import ResetNormalUserPassword from "./Screens/Admin/User/AddUser/ResetNormalUserPassword";
import GetProcessedData from "./Screens/User/GetProcessedData";
import AllProcessedData from "./Screens/User/Layout/AllProcessedData";
import Werthenbach from "./Screens/User/Werthenbach";

const Auth = ({ children, isAuth = true, isAdmin = false }) => {
  let user = Helpers.getItem("user", true);
  let token = Helpers.getItem("token");
  let loginTime = Helpers.getItem("loginTimestamp");

  // Get current time
  let currentTime = new Date().getTime();

  // Check if loginTime exists and calculate the minutes passed
  if (loginTime) {
    let minutesPassed = Math.floor((currentTime - loginTime) / (1000 * 60));

    // Session expiration check: Expire after 30 minutes
    if (minutesPassed > 60) {
      localStorage.clear();
      Helpers.toast(
        "error",
        "Session expired. Please login again to continue."
      );
      return <Navigate to="/login" />;
    }
  }

  // For protected routes
  if (isAuth) {
    // If no user or token found, redirect to login
    if (!user || !token) {
      Helpers.toast("error", "Please login to continue");
      return <Navigate to="/login" />;
    }

    // Ensure only admins can access admin routes
    if (isAdmin && parseInt(user.user_type) !== 1) {
      Helpers.toast("error", "Access denied. Only admin allowed.");
      return <Navigate to="/" />;
    }

    // Ensure admins cannot access user routes
    if (!isAdmin && parseInt(user.user_type) === 1) {
      Helpers.toast(
        "error",
        "Access denied. Admins cannot access user routes."
      );
      return <Navigate to="/admin/dashboard" />;
    }

    // If all checks pass, render the children
    return children;
  }
  // For non-protected routes like /login
  else {
    if (user && token) {
      if (user.user_type === 1) {
        return <Navigate to="/admin/dashboard" />;
      } else {
        return <Navigate to="/" />;
      }
    }
    return children;
  }
};

const NotFound = () => {
  useEffect(() => {
    const user = Helpers.getItem("user", true);
    const token = Helpers.getItem("token");

    if (!user || !token) {
      <Navigate to="/login" />;
    } else if (parseInt(user.user_type) === 1) {
      <Navigate to="/admin/dashboard" />;
    } else {
      <Navigate to="/" />;
    }
  }, []);

  return (
    <section className="bg-no-repeat bg-cover bg-notfound-light">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto">
          <img src="/assets/images/illustration/404.svg" alt="" />
          <div className="flex justify-center mt-10">
            <Link
              to="/"
              className="bg-success-300 text-sm font-bold text-white rounded-lg px-10 py-3"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const App = () => {
  const [isOrganizationalUser, setIsOrganizationalUser] = useState(false);
  const [isCustomerAdmin, setIsCustomerAdmin] = useState(false); // New state for Customer Admin

  // Retrieve is_user_organizational and is_user_customer from localStorage
  useEffect(() => {
    let isUserOrg = Helpers.getItem("is_user_org");
    let isUserCustomer = Helpers.getItem("is_user_customer");

    // Retrieve is_user_customer from localStorage

    if (isUserOrg === "1") {
      setIsOrganizationalUser(true);
    } else {
      setIsOrganizationalUser(false);
    }

    if (isUserCustomer === "1") {
      setIsCustomerAdmin(true); // Set Customer Admin to true if is_user_customer is 1
    } else {
      setIsCustomerAdmin(false);
    }
    // Set Admin
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const hasServiceAccess = (serviceId) => {
    const user = Helpers.getItem("user", true);
      if (user && user.services) {
        return user.services.includes(serviceId);
      }
    return false;
  };
  const fetchTranslations = async () => {
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}get-trans`,
        Helpers.authHeaders
      );
      Helpers.setItem("translationData", response.data, true);
    } catch (error) {
      console.error("Error fetching translations:", error);
    }
  };

  return (
    <BrowserRouter>
      <HeaderProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <Auth isAuth={false}>
                <Login />
              </Auth>
            }
          />
          <Route
            path="/cretschmar-login"
            element={
              <Auth isAuth={false}>
                <LoginCustomer />
              </Auth>
            }
          />
          <Route
            path="/register"
            element={
              <Auth isAuth={false}>
                <Register />
              </Auth>
            }
          />

          <Route path="/" element={<UserLayout />}>
            <Route
              path="/"
              element={
                <Auth>
                  <UserDashboard />
                </Auth>
              }
            />

            {hasServiceAccess(1) && (
              <Route
                path="/fileupload"
                element={
                  <Auth>
                    <FileUpload />
                  </Auth>
                }
              />
            )}
            {hasServiceAccess(2) && (
              <>
                <Route
                  path="/voice"
                  element={
                    <Auth>
                      <Voice />
                    </Auth>
                  }
                />
                <Route
                  path="/transcription"
                  element={
                    <Auth>
                      <Transcription />
                    </Auth>
                  }
                />
                <Route
                  path="/sent-emails"
                  element={
                    <Auth>
                      <SentEmails />
                    </Auth>
                  }
                />
                <Route
                  path="/resend-email/:userId"
                  element={
                    <Auth>
                      <ResendEmail />
                    </Auth>
                  }
                />
              </>
            )}
            {hasServiceAccess(3) && (
              <Route
                path="/contract_automation_solution"
                element={
                  <Auth>
                    <ContractAutomationSolution />
                  </Auth>
                }
              />
            )}
            {hasServiceAccess(4) && (
              <>
                <Route
                  path="/data_process"
                  element={
                    <Auth>
                      <DataProcess />
                    </Auth>
                  }
                />
                <Route
                  path="/get_processed_data"
                  element={
                    <Auth>
                      <GetProcessedData />
                    </Auth>
                  }
                />
              </>
            )}
            {hasServiceAccess(7) && (
              <Route
                path="/clone_data_process"
                element={
                  <Auth>
                    <CloneDataProcess />
                  </Auth>
                }
              />
            )}

              {hasServiceAccess(9) && (
              <Route
                path="/werthenbach"
                element={
                  <Auth>
                    <Werthenbach />
                  </Auth>
                }
              />
            )}
            {hasServiceAccess(5) && (
              <Route
                path="/free-data-process"
                element={
                  <Auth>
                    <FreeDataProcess />
                  </Auth>
                }
              />
            )}
            <Route
              path="/user/all-processed-data/:userId"
              element={
                <Auth>
                  <AllProcessedData />
                </Auth>
              }
            />
            <Route
              path="/delivery-bills"
              element={
                <Auth>
                  <DeliveryBills />
                </Auth>
              }
            />
            <Route
              path="/invoice-details"
              element={
                <Auth>
                  <InvoiceDetails />
                </Auth>
              }
            />
            <Route
              path="/past-invoices"
              element={
                <Auth>
                  <PastInvoices />
                </Auth>
              }
            />
            <Route
              path="/invoice-records"
              element={
                <Auth>
                  <InvoiceRecords />
                </Auth>
              }
            />
            <Route
              path="/details-with-date/:uploadDate"
              element={
                <Auth>
                  <DetialsWithDate />
                </Auth>
              }
            />
            <Route
              path="/changePass"
              element={
                <Auth>
                  <ChangePass />
                </Auth>
              }
            />
            <Route
              path="/change-logo"
              element={
                <Auth>
                  <ChangeLogo />
                </Auth>
              }
            />
            <Route
              path="/settings"
              element={
                <Auth>
                  <Settings />
                </Auth>
              }
            />
            {isOrganizationalUser && (
              <>
                <Route
                  path="/add-org-user"
                  element={
                    <Auth>
                      <AddOrganizationalUser />
                    </Auth>
                  }
                />
                <Route
                  path="/edit-user/:id"
                  element={
                    <Auth>
                      <EditOrganizationalUserPage />
                    </Auth>
                  }
                />
                ;
                <Route
                  path="/reset-normal-user-password/:id"
                  element={
                    <Auth>
                      <ResetNormalUserPassword />
                    </Auth>
                  }
                />
                ;
                <Route
                  path="/org-user-table"
                  element={
                    <Auth>
                      <OrganizationalUserTable />
                    </Auth>
                  }
                />
              </>
            )}
            {isCustomerAdmin && (
              <>
                <Route
                  path="/edit-user/:id"
                  element={
                    <Auth>
                      <EditOrganizationalUser />
                    </Auth>
                  }
                />
                <Route
                  path="/customer-admin-add-user"
                  element={
                    <Auth>
                      <AddCustomerAdmin />
                    </Auth>
                  }
                />
                <Route
                  path="/edit-customer-user/:id"
                  element={
                    <Auth>
                      <EditCustomerUser />
                    </Auth>
                  }
                />
                <Route
                  path="/customer-user-table"
                  element={
                    <Auth>
                      <CustomerUserTable />
                    </Auth>
                  }
                />
                <Route
                  path="/customer-child-table/:userId"
                  element={
                    <Auth>
                      <CustomerChildTable />
                    </Auth>
                  }
                />
                <Route
                  path="/reset-customer-password/:id"
                  element={
                    <Auth>
                      <ResetOrganizationalUserPassword />
                    </Auth>
                  }
                />
              </>
            )}
          </Route>

          <Route path="/admin/" element={<AdminLayout />}>
            <Route
              path="dashboard"
              element={
                <Auth isAdmin={true}>
                  <Users />
                </Auth>
              }
            />
            <Route
              path="show-all-users"
              element={
                <Auth isAdmin={true}>
                  <AllUsers />
                </Auth>
              }
            />
            <Route
              path="link-user"
              element={
                <Auth isAdmin={true}>
                  <LinkUsers />
                </Auth>
              }
            />
            <Route
              path="add-user"
              element={
                <Auth isAdmin={true}>
                  <Adduser />
                </Auth>
              }
            />
            <Route
              path="user-children/:customerId"
              element={
                <Auth isAdmin={true}>
                  <OrganizationUsers />
                </Auth>
              }
            />
            <Route
              path="all-processed-data/:userId"
              element={
                <Auth isAdmin={true}>
                  <AllProcessedData />
                </Auth>
              }
            />
            <Route
              path="normal-child-users/:userId"
              element={
                <Auth isAdmin={true}>
                  <NormalUsers />
                </Auth>
              }
            />
            <Route
              path="edit-user/:id"
              element={
                <Auth isAdmin={true}>
                  <Edituser />
                </Auth>
              }
            />
            <Route
              path="reset-user-password/:id"
              element={
                <Auth isAdmin={true}>
                  <ResetUserPassword />
                </Auth>
              }
            />

            <Route
              path="services"
              element={
                <Auth isAdmin={true}>
                  <Services />
                </Auth>
              }
            />
            <Route
              path="add-service"
              element={
                <Auth isAdmin={true}>
                  <AddService />
                </Auth>
              }
            />
            <Route
              path="edit-service/:id"
              element={
                <Auth isAdmin={true}>
                  <EditService />
                </Auth>
              }
            />
            <Route
              path="orgs"
              element={
                <Auth isAdmin={true}>
                  <Orgs />
                </Auth>
              }
            />
            <Route
              path="add-org"
              element={
                <Auth isAdmin={true}>
                  <AddOrg />
                </Auth>
              }
            />
            <Route
              path="edit-org/:id"
              element={
                <Auth isAdmin={true}>
                  <EditOrg />
                </Auth>
              }
            />
            <Route
              path="translations"
              element={
                <Auth isAdmin={true}>
                  <Trans />
                </Auth>
              }
            />
            <Route
              path="add-trans"
              element={
                <Auth isAdmin={true}>
                  <AddTrans />
                </Auth>
              }
            />
            <Route
              path="edit-trans/:id"
              element={
                <Auth isAdmin={true}>
                  <EditTrans />
                </Auth>
              }
            />
            <Route
              path="tools"
              element={
                <Auth isAdmin={true}>
                  <Tools />
                </Auth>
              }
            />
            <Route
              path="add-tool"
              element={
                <Auth isAdmin={true}>
                  <AddTool />
                </Auth>
              }
            />
            <Route
              path="edit-tool/:id"
              element={
                <Auth isAdmin={true}>
                  <EditTool />
                </Auth>
              }
            />
            <Route
              path="settings"
              element={
                <Auth isAdmin={true}>
                  <SettingsPage />
                </Auth>
              }
            />
            <Route
              path="add-setting"
              element={
                <Auth isAdmin={true}>
                  <SettingForm isEdit={false} />
                </Auth>
              }
            />
            <Route
              path="edit-setting/:id"
              element={
                <Auth isAdmin={true}>
                  <SettingForm isEdit={true} />
                </Auth>
              }
            />
            <Route
              path="instructions"
              element={
                <Auth isAdmin={true}>
                  <InstructionsPage />
                </Auth>
              }
            />
            <Route
              path="add-instruction"
              element={
                <Auth isAdmin={true}>
                  <InstructionForm />
                </Auth>
              }
            />
            <Route
              path="edit-instruction/:id"
              element={
                <Auth isAdmin={true}>
                  <InstructionForm isEdit={true} />
                </Auth>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HeaderProvider>
    </BrowserRouter>
  );
};

export default App;
