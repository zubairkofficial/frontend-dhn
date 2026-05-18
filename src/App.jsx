import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { BrowserRouter, Navigate, Routes, Route, Link } from "react-router-dom";
import { HeaderProvider } from "./Components/HeaderContext";
import Helpers from "./Config/Helpers";
import { SERVICE_LINK } from "./constants/serviceLinks";
import {
  AdminLayout,
  AddOrganizationalUser,
  Users,
  Login,
  Adduser,
  Edituser,
  UserDashboard,
  UserLayout,
  FileUpload,
  ChangePass,
  Voice,
  SentEmails,
  Transcription,
  ResendEmail,
  Services,
  AddService,
  EditService,
  Orgs,
  AddOrg,
  EditOrg,
  Trans,
  AddTrans,
  EditTrans,
  ContractAutomationSolution,
  Tools,
  AddTool,
  EditTool,
  DataProcess,
  CloneDataProcess,
  DemoDataProcess,
  ChangeLogo,
  Settings,
  OrganizationalUserTable,
  OrganizationUsers,
  EditOrganizationalUser,
  Register,
  AddCustomerAdmin,
  CustomerUserTable,
  CustomerChildTable,
  NormalUsers,
  LoginCustomer,
  AllUsers,
  LinkUsers,
  FreeDataProcess,
  InstructionsPage,
  InstructionForm,
  SettingsPage,
  SettingForm,
  DeliveryBills,
  InvoiceDetails,
  PastInvoices,
  InvoiceRecords,
  DetialsWithDate,
  EditCustomerUser,
  EditOrganizationalUserPage,
  ResetUserPassword,
  ResetOrganizationalUserPassword,
  ResetNormalUserPassword,
  GetProcessedData,
  AllProcessedData,
  Werthenbach,
  AllWerthenbach,
  Scheren,
  AllScherenData,
  AllSennheiserData,
  Sennheiser,
  AllVerbundData,
  Verbund,
  Surfachem,
  AllSurfachemData,
} from "./lazyScreens";

const Auth = ({ children, isAuth = true, isAdmin = false }) => {
  let user = Helpers.getItem("user", true);
  let token = Helpers.getItem("token");
  let loginTime = Helpers.getItem("loginTimestamp");

  // Get current time
  let currentTime = new Date().getTime();

  // Check if loginTime exists and calculate the minutes passed
  if (loginTime) {
    let minutesPassed = Math.floor((currentTime - loginTime) / (1000 * 60));

    // Session expiration: idle window (minutes)
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
  const user = Helpers.authUser;
  const token = Helpers.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="bg-no-repeat bg-cover bg-notfound-light">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto">
          <img src="/assets/images/illustration/404.svg" alt="" />
          <div className="flex justify-center mt-10">
            <Link
              to={parseInt(user.user_type, 10) === 1 ? "/admin/dashboard" : "/"}
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
        <Suspense
          fallback={
            <div className="d-flex justify-content-center align-items-center min-vh-100">
              <span className="text-muted">Loading…</span>
            </div>
          }
        >
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

            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.FILE_UPLOAD) && (
              <Route
                path="/fileupload"
                element={
                  <Auth>
                    <FileUpload />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.VOICE) && (
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
            {Helpers.hasServiceLink(
              Helpers.authUser,
              SERVICE_LINK.CONTRACT_AUTOMATION
            ) && (
              <Route
                path="/contract_automation_solution"
                element={
                  <Auth>
                    <ContractAutomationSolution />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.DATA_PROCESS) && (
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
            {Helpers.hasServiceLink(
              Helpers.authUser,
              SERVICE_LINK.CLONE_DATA_PROCESS
            ) && (
              <Route
                path="/clone_data_process"
                element={
                  <Auth>
                    <CloneDataProcess />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(
              Helpers.authUser,
              SERVICE_LINK.DEMO_DATA_PROCESS
            ) && (
              <Route
                path="/demo_data_process"
                element={
                  <Auth>
                    <DemoDataProcess />
                  </Auth>
                }
              />
            )}

            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.WERTHENBACH) && (
              <Route
                path="/werthenbach"
                element={
                  <Auth>
                    <Werthenbach />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.SCHEREN) && (
              <Route
                path="/scheren"
                element={
                  <Auth>
                    <Scheren />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.SENNHEISER) && (
              <Route
                path="/sennheiser"
                element={
                  <Auth>
                    <Sennheiser />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.VERBUND) && (
              <Route
                path="/verbund"
                element={
                  <Auth>
                    <Verbund />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(Helpers.authUser, SERVICE_LINK.SURFACHEM) && (
              <Route
                path="/surfachem"
                element={
                  <Auth>
                    <Surfachem />
                  </Auth>
                }
              />
            )}
            {Helpers.hasServiceLink(
              Helpers.authUser,
              SERVICE_LINK.FREE_DATA_PROCESS
            ) && (
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
              path="/user/all-scheren-data/:userId"
              element={
                <Auth>
                  <AllScherenData />
                </Auth>
              }
            />
            <Route
              path="/user/all-sennheiser-data/:userId"
              element={
                <Auth>
                  <AllSennheiserData />
                </Auth>
              }
            />
            <Route
              path="/user/all-verbund-data/:userId"
              element={
                <Auth>
                  <AllVerbundData />
                </Auth>
              }
            />
            <Route
              path="/user/all-surfachem-data/:userId"
              element={
                <Auth>
                  <AllSurfachemData />
                </Auth>
              }
            />
            <Route
              path="/user/all-werthenbach-data/:userId"
              element={
                <Auth>
                  <AllWerthenbach />
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
                <Route
                  path="/reset-normal-user-password/:id"
                  element={
                    <Auth>
                      <ResetNormalUserPassword />
                    </Auth>
                  }
                />
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
              path="all-surfachem-data/:userId"
              element={
                <Auth isAdmin={true}>
                  <AllSurfachemData />
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
        </Suspense>
      </HeaderProvider>
    </BrowserRouter>
  );
};

export default App;
