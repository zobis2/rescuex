import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTab, setSelectedTab] = React.useState(location.pathname);

    useEffect(() => {
        setSelectedTab(location.pathname);
    }, [location.pathname]);

    const handleNavigation = (path) => {
        setSelectedTab(path);
        navigate(path);
    };

    return (
        <div className="container" style={{ direction: 'rtl', whiteSpace: 'nowrap' }}>
            <div className="buttons">
                <button className="button is-link" onClick={() => navigate(-1)}>
                    חזור אחורה
                </button>
                {/*<button*/}
                {/*    className={`button ${selectedTab === '/place-holder-replace' ? 'is-active' : ''}`}*/}
                {/*    onClick={() => handleNavigation('/place-holder-replace')}*/}
                {/*>*/}
                {/*    הפקת דוח נגר*/}
                {/*</button>*/}
                <button
                    className={`button ${selectedTab === '/project-manager' ? 'is-active' : ''}`}
                    onClick={() => handleNavigation('/project-manager')}
                >
                   הוספת תיק אבטחה
                </button>
            </div>
        </div>
    );
};

export default Navigation;
