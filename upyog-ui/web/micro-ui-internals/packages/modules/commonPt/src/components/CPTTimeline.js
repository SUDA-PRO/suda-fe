import React from "react";
import { useTranslation } from "react-i18next";
import { TickMark } from "@upyog/digit-ui-react-components";

let actions = [];

const getAction = (flow) => {
  switch (flow) {
    case "STAKEHOLDER": actions = []
      break;
    case "WS" : actions = [
      'WS_COMMON_PROPERTY_DETAILS',
      'WS_COMMON_CONNECTION_DETAIL',
      'WS_COMMON_DOCUMENT_DETAILS',
      'WS_COMMON_SUMMARY',
    ]
      break;
    case "TL":  actions = [
      'TL_COMMON_TR_DETAILS',
      'TL_LOCATION_AND_OWNER_DETAILS',
      'TL_DOCUMENT_DETAIL',
      'TL_COMMON_SUMMARY',
    ]
    default: actions = []
      break;
  }
}
const CPTTimeline = ({ currentStep = 1, flow = "" }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();
  getAction(flow);
  const totalSteps = actions.length;
  const stepName = actions[currentStep - 1] ? t(actions[currentStep - 1]) : "";
  const showBanner = flow === "WS" && actions.length > 0;
  return (
    <React.Fragment>
      <div className="timeline-container" style={isMobile ? {} : { maxWidth: "960px", minWidth: "640px", marginRight: "auto" }} >
        {actions.map((action, index, arr) => (
          <div className="timeline-checkpoint" key={index}>
            <div className="timeline-content">
              <span className={`circle ${index <= currentStep - 1 && 'active'}`}>{index < currentStep - 1 ? <TickMark /> : index + 1}</span>
              <span className="secondary-color">{t(action)}</span>
            </div>
            {index < arr.length - 1 && <span className={`line ${index < currentStep - 1 && 'active'}`}></span>}
          </div>
        ))}
      </div>

      {showBanner && (
        <div style={{
          background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
          borderRadius: "12px",
          padding: "32px 36px",
          marginBottom: "24px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          fontFamily: "'Roboto', sans-serif",
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>
              {"STEP " + currentStep + " OF " + totalSteps}
            </p>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", letterSpacing: "0.3px" }}>
              {stepName}
            </h2>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

export default CPTTimeline; 