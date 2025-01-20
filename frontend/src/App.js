import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import PlaceHolderReplace from './components/TemplateForm/TemplateForm';
// import UploadAPFilesPage from './components/Upload/UploadAPFilesPage';
// import UploadABFilesPage from './components/Upload/UploadABFilesPage';
// import DownloadFilesPage from './components/DownloadFilesPage';
// import ProjectImagePage from './components/ProjectImagePage';
import Navigation from './components/Navigation';
import SecurityCaseWizard from "./components/SecurityCase/SecurityCaseWizard";
// import OrthoPhotoMain from "./components/OrthoPhoto/OrthoPhotoMain";
// import CalcQuantities from "./components/CalcQuantities";
// import CompareRebar from "./components/CompareRebar";
// import ConstHierarchy from "./components/ConstHierarchy";
// import RTSPPlayer from "./components/RTSPPlayer";
// import RTSPProjectPage from "./components/RTSPCapture/RTSPProjectPage";
// import ManageUsers from './components/PlatformUser/ManageUsers';
// import ManageCameras from './components/Camera/ManageCameras';
// import ManageReports from './components/Reports/ManageReports';
import { SnackbarProvider } from 'notistack';
import 'bulma/css/bulma.css';
import AddUserForm from "./components/Admin/AddUserForm";

function App() {
    debugger;
    const LoggedAlready=    localStorage.getItem('loggedIn')?.toString()==='true';

    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };
    return (
        <SnackbarProvider maxSnack={3}>

        <Router basename="/">
            <div className="App">
                {isLoggedIn && <Navigation />}
                <Routes>
                    {!isLoggedIn ? (
                        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
                    ) : (
                        <>
                            {/*<Route path="/const-hierarchy" element={<ConstHierarchy />} />*/}
                            {/*<Route path="/rtsp" element={<RTSPProjectPage />} />*/}

                            <Route path="/place-holder-replace" element={<PlaceHolderReplace />} />
                            <Route path="/security-case-wizard" element={<SecurityCaseWizard />} />
                            <Route path="/add-user-form" element={<AddUserForm />} />

                            {/*<Route path="/upload-orthophoto-files" element={<OrthoPhotoMain />} />*/}
                            {/*<Route path="/upload-ap-files" element={<UploadAPFilesPage />} />*/}
                            {/*<Route path="/upload-ab-files" element={<UploadABFilesPage />} />*/}
                            {/*<Route path="/calc-quantities" element={<CalcQuantities />} />*/}
                            {/*<Route path="/compare-rebar" element={<CompareRebar />} />*/}
                            {/*/!*<Route path="/crop-orthophoto" element={<CropOrthophotoPage />} />*!/*/}
                            {/*<Route path="/download-files" element={<DownloadFilesPage />} />*/}
                            {/*<Route path="/project-image" element={<ProjectImagePage />} />*/}
                            {/*<Route path="/manage-platform-users" element={<ManageUsers />} />*/}
                            {/*<Route path="/manage-cameras" element={<ManageCameras />} />*/}
                            {/*<Route path="/manage-reports" element={<ManageReports />} />*/}
                            <Route path="/" element={<Navigate to="/security-case-wizard" />} />
                        </>
                    )}
                    <Route path="/" element={<Navigate to={isLoggedIn ? "/place-holder-replace" : "/login"} />} />
                </Routes>
            </div>
        </Router>
            </SnackbarProvider>
    );
}

export default App;
