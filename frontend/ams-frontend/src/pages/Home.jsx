// src/pages/Home.jsx

import React from 'react';

export default function Home() {
  const bgStyle = {
    position: 'absolute',
    top: '44px', // Adjust this to your navbar's exact height.
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/background.jpg")', // Main overall background
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
  };

  const overlayStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the top
    width: '100%',
    height: '100%', 
    background: 'rgba(0, 0, 0, 0.45)', // Overlay color
    backdropFilter: 'blur(4px)',
    color: '#fff',
    paddingTop: '60px',
    
    // --- Logo as a background image within the overlay ---
    backgroundImage: 'url("https://play-lh.googleusercontent.com/L75lxecxWMJdaRitUINtGr_NdlR2pIdDSk3-g2kWCZqXozyHMA-kbp4aAUAe73vMiGU")', 
    backgroundSize: '250px', 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center', 
    backgroundBlendMode: 'soft-light', 
    opacity: 0.7, 
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#cf2424ff', 
    marginBottom: '1rem',
    fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
    padding: '0 20px',
    position: 'relative', 
    zIndex: 2, 
    marginTop:'55px'
  };

  const descStyle = {
    fontSize: '1.5rem',
    color: '#ddd', 
    lineHeight: 1.7,
    maxWidth: '700px',
    padding: '0 20px',
    fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
    position: 'relative', 
    zIndex: 2, 
     marginTop: '60px', 
  };

  return (
    <div style={bgStyle}>
      <div style={overlayStyle}>
        {/* The img tag is removed as the logo is now a background image of overlayStyle */}
        <h1 style={titleStyle}>Attendance Management System</h1>
        <p style={descStyle}>
          Easily manage, track, and analyze attendance for your institution.<br />
          Welcome to a smarter way to handle attendance!
        </p>
      </div>
    </div>
  );
}