import React, { Fragment } from "react";

import { useHistory } from "react-router-dom";

const ComingSoon = ({ title = "Coming Soon" }) => {
  const history = useHistory();
  const goBack = () => {
    if (history.length > 1) {
      history.goBack();
    } else {
      history.push("/suda-ui/dashboard"); // ✅ fallback route
    }
  };

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Noto Sans, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>🚧 {title}</h1>
      <p style={{ fontSize: 16, color: "#555", maxWidth: 450 }}>This page is under development and will be available soon.</p>

      {/* ✅ Back Button */}
      {!(window.location.href.includes("/citizen") || window.location.href.includes("/employee")) && (
        <button
          onClick={goBack}
          style={{
            backgroundColor: "#7A1E1C",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            marginTop: 10,
          }}
        >
          Go Back
        </button>
      )}
    </div>
  );
};

export default ComingSoon;
