import React from "react";
import HamburgerMenu from "./HamburgerMenu";
import "./UserPanel.css"; // Custom styles

const UserPanel = () => {
    return (
        <div className="user-panel">
            {/* Only Hamburger Menu for now */}
            <HamburgerMenu />
        </div>
    );
};

export default UserPanel;
