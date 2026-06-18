import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const BackButton = ({ style, className = "" }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [hovered, setHovered] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 18px 7px 12px",
    borderRadius: "20px",
    border: "1.5px solid #1E3A8A",
    background: hovered ? "#EEF2FF" : "#ffffff",
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "16px",
    userSelect: "none",
    width: "fit-content",
    boxShadow: hovered
      ? "0 4px 16px rgba(30,58,138,0.18)"
      : "0 1px 4px rgba(30,58,138,0.10)",
    transform: hovered ? "translateY(-1px)" : "translateY(0)",
    transition: "background 0.18s, box-shadow 0.18s, transform 0.15s",
    ...style,
  };
  return (
    <div
      className={`back-btn-local ${className}`}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => history.goBack()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style={{ fill: "#1E3A8A", flexShrink: 0 }}>
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      <span style={{ margin: 0, color: "#1E3A8A" }}>{t("CS_COMMON_BACK")}</span>
    </div>
  );
};

const FireNocCitizenHome = ({ matchPath }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleApply = () => {
    history.push(`${matchPath || "/suda-ui/citizen/firenoc"}/apply`);
  };

  const toLocaleKey = (code) => code && code.trim().toUpperCase().replace(/[.:\-\s/]/g, "_");

  const requiredDocs = [
    {
      sectionKey: "FIRENOC_DOCS_SECTION_OWNER",
      noteKey: "FIRENOC_DOCS_OWNER_NOTE",
      color: "#1565c0",
      bgColor: "#e3f2fd",
      icon: "👤",
      docs: [
        {
          labelKey: "FIRENOC_DOCS_OWNER_IDENTITYPROOF",
          itemCodes: ["OWNER.IDENTITYPROOF.AADHAAR","OWNER.IDENTITYPROOF.VOTERID","OWNER.IDENTITYPROOF.DRIVING","OWNER.IDENTITYPROOF.PAN","OWNER.IDENTITYPROOF.PASSPORT"],
        },
        {
          labelKey: "FIRENOC_DOCS_OWNER_ADDRESSPROOF",
          itemCodes: ["OWNER.ADDRESSPROOF.ELECTRICITYBILL","OWNER.ADDRESSPROOF.DL","OWNER.ADDRESSPROOF.VOTERID","OWNER.ADDRESSPROOF.AADHAAR","OWNER.ADDRESSPROOF.PAN","OWNER.ADDRESSPROOF.PASSPORT"],
        },
      ],
    },
    {
      sectionKey: "FIRENOC_DOCS_SECTION_BUILDING",
      noteKey: "FIRENOC_DOCS_BUILDING_NOTE",
      color: "#1b5e20",
      bgColor: "#e8f5e9",
      icon: "🏢",
      docs: [
        {
          labelKey: "FIRENOC_DOCS_BUILDING_BUILDING_PLAN",
          itemCodes: ["BUILDING.BUILDING_PLAN.SITE_PLAN","BUILDING.BUILDING_PLAN.GROUND_FLOOR_PLAN","BUILDING.BUILDING_PLAN.SECTION_PLAN","BUILDING.BUILDING_PLAN.ELEVATION_PLAN","BUILDING.BUILDING_PLAN.BUILTUP_AREA_STATEMENT"],
        },
        {
          labelKey: "FIRENOC_DOCS_BUILDING_FIRE_FIGHTING_PLAN",
          itemCodes: ["BUILDING.FIRE_FIGHTING_PLAN.SD_FIRE_FIGHTING_SYSTEM","BUILDING.FIRE_FIGHTING_PLAN.SD_FIRE_DETECTING_SYSTEM"],
        },
        {
          labelKey: "FIRENOC_DOCS_BUILDING_OWNERS_CHECKLIST",
          itemCodes: ["BUILDING.OWNERS_CHECKLIST.FLS_CHECKLIST","BUILDING.OWNERS_CHECKLIST.COPY_PROVISIONAL_NOC"],
        },
      ],
    },
  ];

  // Running counter across all sections
  let counter = 0;

  return (
    <div style={{ paddingBottom: 48, padding: "0 16px 48px" }}>
        <div style={{ paddingTop: 20 }}><BackButton /></div>

        {/* ── Hero Banner ── */}
        <div style={{
          background: "linear-gradient(120deg, #b83c0a 0%, #f47738 60%, #ffa366 100%)",
          borderRadius: 6,
          padding: "28px 36px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 2px 8px rgba(244,119,56,0.3)",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, flexShrink: 0,
          }}>🔥</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
              {t("FIRENOC_HOME_APPLICATION_LABEL")}
            </div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
              {t("FIRENOC_HOME_REQUIRED_DOCS_HEADING")}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", margin: "8px 0 0", fontSize: 13 }}>
              {t("FIRENOC_HOME_HOW_IT_WORKS")}
            </p>
          </div>
        </div>

        {/* ── Info Alert ── */}
        <div style={{
          background: "#fff8e1",
          border: "1px solid #ffe082",
          borderLeft: "4px solid #f9a825",
          borderRadius: 4,
          padding: "12px 18px",
          marginBottom: 24,
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontSize: 13,
          color: "#5d4037",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <span>{t("FIRENOC_HOME_DOCS_READINESS_NOTE")}</span>
        </div>

        {/* ── Document sections ── */}
        {requiredDocs.map((section, si) => (
          <div key={si} style={{
            background: "#fff",
            borderRadius: 6,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            marginBottom: 20,
            overflow: "hidden",
          }}>
            {/* Section header */}
            <div style={{
              background: section.bgColor,
              borderBottom: `2px solid ${section.color}22`,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>{section.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: section.color }}>
                  {t(section.sectionKey)}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#777", fontStyle: "italic" }}>
                  {t(section.noteKey)}
                </p>
              </div>
            </div>

            {/* Doc rows */}
            {section.docs.map((doc, di) => {
              counter++;
              const num = counter;
              return (
                <div key={di} style={{
                  display: "flex",
                  gap: 18,
                  padding: "18px 24px",
                  borderBottom: di < section.docs.length - 1 ? "1px solid #f5f5f5" : "none",
                  alignItems: "flex-start",
                }}>
                  {/* Number badge */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "#f47738",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14,
                    flexShrink: 0, marginTop: 1,
                    boxShadow: "0 2px 6px rgba(244,119,56,0.4)",
                  }}>
                    {num}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "#212121",
                      marginBottom: 10, lineHeight: 1.4,
                    }}>
                      {t(doc.labelKey)}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {doc.itemCodes.map((code, ci) => (
                        <span key={ci} style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "#fafafa",
                          border: "1px solid #e8e8e8",
                          borderRadius: 20,
                          padding: "5px 14px",
                          fontSize: 12, color: "#333",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          transition: "background 0.15s",
                        }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#e8f5e9", color: "#2e7d32",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 10, flexShrink: 0,
                          }}>✓</span>
                          {t(`FIRENOC_DOCS_${toLocaleKey(code)}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* ── Action buttons ── */}
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "flex-end",
          marginTop: 8,
        }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "12px 32px",
              border: "2px solid #f47738",
              color: "#f47738",
              background: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {t("FIRENOC_HOME_BTN_PRINT")}
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: "12px 40px",
              background: "#f47738",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
              boxShadow: "0 3px 10px rgba(244,119,56,0.4)",
            }}
          >
            {t("FIRENOC_HOME_BTN_APPLY")}
          </button>
        </div>
    </div>
  );
};

export default FireNocCitizenHome;


