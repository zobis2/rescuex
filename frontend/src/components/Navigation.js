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
                    className={`button ${selectedTab === '/user' ? 'is-active' : ''}`}
                    onClick={() => handleNavigation('/user')}
                >
                  עבור לתצוגת יוזר
                </button>
                <button

                    className={`button ${selectedTab === '/security-case-wizard' ? 'is-active' : ''}`}
                    onClick={() => handleNavigation('/security-case-wizard')}
                >
                    הוספת תיק אבטחה
                </button>
                <button
                    className={`button ${selectedTab === '/add-user-form' ? 'is-active' : ''}`}
                    onClick={() => handleNavigation('/add-user-form')}
                >
                    הוספת יוזר למערכת
                </button>
                <button
                    className={`button ${selectedTab === '/canvas' ? 'is-active' : ''}`}
                    onClick={() => handleNavigation('/canvas')}
                >
                    ערוך קנבס
                </button>
            </div>
        </div>
    );
};

export default Navigation;
