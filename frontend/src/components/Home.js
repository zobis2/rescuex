import React from 'react';

const HomePage = () => {
    return (
        <div className="hero is-fullheight" style={{ backgroundColor: '#002A45' }}>
            {/* Full height background */}
            <div className="hero-body">
                <div className="container">
                    <div
                        className="box has-text-centered"
                        style={{
                            width: '540px',
                            height: '956px',
                            borderRadius: '30px',
                            backgroundColor: '#002A45', // Match the Figma background color
                            color: 'white', // Ensure text is visible
                            margin: '0 auto',
                        }}
                    >
                        <figure className="image is-256x256" style={{ margin: '0 auto' }}>
                            <img
                                src="/logo.png" // Path to the logo in public folder
                                alt="Logo"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                }}
                            />
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
