import React, {useEffect, useState} from 'react';
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
import {enqueueSnackbar, SnackbarProvider} from 'notistack';
import 'bulma/css/bulma.css';
import './App.css'
import AddUserForm from "./components/Admin/AddUserForm";
import FabricCanvas from "./components/Canvas/FabricCanvas";
import HomePage from "./components/Home";
const backgroundStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "radial-gradient(69.27% 51.64% at 50% 50%, rgba(0, 0, 0, 0) 0%, #002A45 100%), url('./bgBig.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
};

function App() {
    debugger;
    const LoggedAlready=    localStorage.getItem('loggedIn')?.toString()==='true';
    const [isLoading, setIsLoading] = useState(true);

    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        // Show HomePage for 2 seconds before rendering the app

        const timer = setTimeout(() => {
            enqueueSnackbar('ברוך הבא', {
                variant: 'info',
                anchorOrigin: {
                    vertical: 'top', // Change to 'bottom' if needed
                    horizontal: 'center'
                },
                autoHideDuration: 2000, // Optional: Close after 2 seconds
                style: { textAlign: "center", fontSize: "20px" } // Optional: Customize text
            });
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };
    return (
        <SnackbarProvider maxSnack={3}>
            <Router basename="/">
                <div className="App" style={backgroundStyle}>
                    {/* Show HomePage for 2 seconds before displaying the app */}
                    {isLoading ? (
                        <HomePage />
                    ) : (
                        <>
                            {isLoggedIn && <Navigation />}
                            <Routes>
                                {!isLoggedIn ? (
                                    <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
                                ) : (
                                    <>
                                        <Route path="/security-case-wizard" element={<SecurityCaseWizard />} />
                                        <Route path="/add-user-form" element={<AddUserForm />} />
                                        <Route path="/canvas" element={<FabricCanvas />} />
                                        <Route path="/" element={<Navigate to="/security-case-wizard" />} />
                                    </>
                                )}
                                <Route path="/" element={<Navigate to={isLoggedIn ? "/place-holder-replace" : "/login"} />} />
                            </Routes>
                        </>
                    )}
                </div>
            </Router>
        </SnackbarProvider>    );
}

export default App;
