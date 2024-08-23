import React from "react";

const NotFoundScreen = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="oops-text">Oops!</h1>
        <h2 className="title">404 - Page Not Found</h2>
        <p className="message">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <a href="/" className="back-home">
          Go back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundScreen;
