import { lazy } from "react";

export const AdminLayout = lazy(() => import("./Screens/Admin/Layout/Layout"));
export const AddOrganizationalUser = lazy(() =>
  import("./Screens/User/AddUser/AddOrganizationalUser")
);
export const Users = lazy(() => import("./Screens/Admin/User/Users"));
export const Login = lazy(() => import("./Screens/Auth/Login"));
export const Adduser = lazy(() => import("./Screens/Admin/User/AddUser/Adduser"));
export const Edituser = lazy(() => import("./Screens/Admin/User/Edituser"));
export const UserDashboard = lazy(() => import("./Screens/User/Dashboard"));
export const UserLayout = lazy(() => import("./Screens/User/Layout/Layout"));
export const FileUpload = lazy(() => import("./Screens/User/Fileupload"));
export const ChangePass = lazy(() => import("./Screens/User/ChangePass"));
export const Voice = lazy(() => import("./Screens/User/Voice"));
export const SentEmails = lazy(() => import("./Screens/User/SentEmails"));
export const Transcription = lazy(() => import("./Screens/User/Transcription"));
export const ResendEmail = lazy(() => import("./Screens/User/ResendEmail"));
export const Services = lazy(() => import("./Screens/Admin/Service/Services"));
export const AddService = lazy(() => import("./Screens/Admin/Service/AddService"));
export const EditService = lazy(() => import("./Screens/Admin/Service/EditService"));
export const Orgs = lazy(() => import("./Screens/Admin/Organization/Orgs"));
export const AddOrg = lazy(() => import("./Screens/Admin/Organization/AddOrg"));
export const EditOrg = lazy(() => import("./Screens/Admin/Organization/EditOrg"));
export const Trans = lazy(() => import("./Screens/Admin/Translation/Translations"));
export const AddTrans = lazy(() => import("./Screens/Admin/Translation/AddTrans"));
export const EditTrans = lazy(() => import("./Screens/Admin/Translation/EditTrans"));
export const ContractAutomationSolution = lazy(() =>
  import("./Screens/User/ContractAutomationSolution")
);
export const Tools = lazy(() => import("./Screens/Admin/Tools/Tools"));
export const AddTool = lazy(() => import("./Screens/Admin/Tools/AddTool"));
export const EditTool = lazy(() => import("./Screens/Admin/Tools/EditTool"));
export const DataProcess = lazy(() => import("./Screens/User/DataProcess"));
export const CloneDataProcess = lazy(() => import("./Screens/User/CloneDataProcess"));
export const DemoDataProcess = lazy(() => import("./Screens/User/DemoDataProcess"));
export const ChangeLogo = lazy(() => import("./Screens/User/ChangeLogo"));
export const Settings = lazy(() => import("./Screens/User/Settings"));
export const OrganizationalUserTable = lazy(() =>
  import("./Components/OrganizationalUserTable")
);
export const OrganizationUsers = lazy(() =>
  import("./Screens/Admin/User/OrganizationUsers")
);
export const EditOrganizationalUser = lazy(() =>
  import("./Screens/User/EditOrganizationalUser")
);
export const Register = lazy(() => import("./Screens/Auth/Register"));
export const AddCustomerAdmin = lazy(() =>
  import("./Screens/User/AddUser/AddCustomerAdmin")
);
export const CustomerUserTable = lazy(() => import("./Components/CustomerUserTable"));
export const CustomerChildTable = lazy(() => import("./Components/CustomerChildTable"));
export const NormalUsers = lazy(() => import("./Screens/Admin/User/NormalUsers"));
export const LoginCustomer = lazy(() => import("./Screens/Auth/LoginCustomer"));
export const AllUsers = lazy(() => import("./Screens/Admin/User/AllUsers"));
export const LinkUsers = lazy(() => import("./Screens/Admin/User/LinkUsers"));
export const FreeDataProcess = lazy(() => import("./Screens/User/FreeDataProcess"));
export const InstructionsPage = lazy(() =>
  import("./Screens/Admin/Instruction/InstructionsPage")
);
export const InstructionForm = lazy(() =>
  import("./Screens/Admin/Instruction/InstructionForm")
);
export const SettingsPage = lazy(() => import("./Screens/Admin/Setting/SettingsPage"));
export const SettingForm = lazy(() => import("./Screens/Admin/Setting/SettingForm"));
export const DeliveryBills = lazy(() => import("./Screens/User/DeliveryBills"));
export const InvoiceDetails = lazy(() => import("./Screens/User/InvoiceDetails"));
export const PastInvoices = lazy(() => import("./Screens/User/PastInvoices"));
export const InvoiceRecords = lazy(() => import("./Screens/User/InvoiceRecords"));
export const DetialsWithDate = lazy(() => import("./Screens/User/DetialsWithDate"));
export const EditCustomerUser = lazy(() =>
  import("./Screens/User/AddUser/EditCustomerUser")
);
export const EditOrganizationalUserPage = lazy(() =>
  import("./Screens/User/AddUser/EditOrganizationalUser")
);
export const ResetUserPassword = lazy(() =>
  import("./Screens/Admin/User/ResetUserPassword")
);
export const ResetOrganizationalUserPassword = lazy(() =>
  import("./Screens/Admin/User/AddUser/ResetOrganizationalUserPassword")
);
export const ResetNormalUserPassword = lazy(() =>
  import("./Screens/Admin/User/AddUser/ResetNormalUserPassword")
);
export const GetProcessedData = lazy(() => import("./Screens/User/GetProcessedData"));
export const AllProcessedData = lazy(() =>
  import("./Screens/User/Layout/AllProcessedData")
);
export const Werthenbach = lazy(() => import("./Screens/User/Werthenbach"));
export const AllWerthenbach = lazy(() =>
  import("./Screens/User/Layout/AllWerthenbachData")
);
export const Scheren = lazy(() => import("./Screens/User/Scheren"));
export const AllScherenData = lazy(() =>
  import("./Screens/User/Layout/AllScherenData")
);
export const AllSennheiserData = lazy(() =>
  import("./Screens/User/Layout/AllSennheiserData")
);
export const Sennheiser = lazy(() => import("./Screens/User/Sennheiser"));
export const AllVerbundData = lazy(() =>
  import("./Screens/User/Layout/AllVerbundData")
);
export const Verbund = lazy(() => import("./Screens/User/Verbund"));
export const Surfachem = lazy(() => import("./Screens/User/Surfachem"));
export const AllSurfachemData = lazy(() =>
  import("./Screens/User/Layout/AllSurfachemData")
);
