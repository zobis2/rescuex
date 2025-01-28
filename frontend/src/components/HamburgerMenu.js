import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faTimes,
    faCamera,
    faNewspaper,
    faUser,
    faBell,
    faCog,
    faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./HamburgerMenu.css";

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button (Visible on Mobile) */}
            <button
                className="hamburger-button button is-dark"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="2x" />
            </button>

            {/* Sidebar Menu */}
            <div className={`hamburger-menu ${isOpen ? "is-active" : ""}`}>
                <div className="menu-content">
                    <ul>
                        <li>
                            <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" />
                            <span>מדרגות ויציאות חירום</span>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faCamera} className="menu-icon" />
                            <span>מצלמות אבטחה</span>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faNewspaper} className="menu-icon" />
                            <span>חדשות</span>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faUser} className="menu-icon" />
                            <span>החשבון שלי</span>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faBell} className="menu-icon" />
                            <span>התראות</span>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faCog} className="menu-icon" />
                            <span>הגדרות</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default HamburgerMenu;
