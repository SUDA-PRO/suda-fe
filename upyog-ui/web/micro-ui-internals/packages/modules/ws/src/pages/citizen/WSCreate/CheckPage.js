import {
    Card, CardHeader, CardSubHeader, CardText,
    CitizenInfoLabel, LinkButton, Row, StatusTable, SubmitBar, EditIcon, Header, CardSectionHeader
  } from "@upyog/digit-ui-react-components";
  import React from "react";
  import { useTranslation } from "react-i18next";
  import { useHistory, useRouteMatch, Link } from "react-router-dom";
  import Timeline from "../../../components/Timeline";
  import WSDocument from "../../../pageComponents/WSDocument";

/* ─── inline style constants ─────────────────────────────────────────────── */
const GOLD      = "#e07b00";
const ORANGE      = "#d95f00";
const LIGHT     = "#f5f5f5";
const BORDER    = "#ddd";
const WHITE     = "#ffffff";
const DARK_GREY = "#1a3a5c";

const sectionWrap = {
  background: WHITE,
  borderRadius: "12px",
  border: `1px solid ${BORDER}`,
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  marginBottom: "20px",
  overflow: "hidden",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: DARK_GREY,
  color: WHITE,
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "15px",
  letterSpacing: "0.4px",
};

const sectionBody = {
  padding: "4px 16px 4px 20px",
};

const iconCircle = (icon) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    fontSize: "14px",
    flexShrink: 0,
  }}>{icon}</span>
);

const DocCard = ({ header, children }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? DARK_GREY : BORDER}`,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 6px 20px rgba(26,58,92,0.18)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div style={{
        background: hovered ? "#253f5e" : DARK_GREY,
        color: WHITE,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.3px",
        padding: "8px 12px",
        lineHeight: 1.4,
        transition: "background 0.2s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }} title={header}>
        {header}
      </div>
      <div style={{
        flex: 1,
        background: hovered ? "#f0f4f8" : WHITE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        transition: "background 0.2s ease",
      }}>
        {children}
      </div>
    </div>
  );
};

const SectionCard = ({ icon, title, editButton, children }) => (
  <div style={sectionWrap}>
    <div style={{ ...sectionHeader, position: "relative" }}>
      {iconCircle(icon)}
      <span style={{ flex: 1 }}>{title}</span>
      {editButton && <div style={{ marginLeft: "auto" }}>{editButton}</div>}
    </div>
    <div style={sectionBody}>{children}</div>
  </div>
);

  const CheckPage = ({ onSubmit, value }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const match = useRouteMatch();
    let isMobile = window.Digit.Utils.browser.isMobile();
    const { ConnectionHolderDetails, plumberPreference, serviceName, waterConectionDetails, sewerageConnectionDetails, documents, cpt } = value;
    let routeLink = `/suda-ui/citizen/ws/create-application`;
    if(window.location.href.includes("/edit-application/"))
    routeLink=`/suda-ui/citizen/ws/edit-application/${value?.tenantId}`

    function routeTo(jumpTo) {
        location.href=jumpTo;
    }
   
    let propAddArr = [];
  if (cpt && cpt?.details && Object.keys(cpt?.details).length>0) {
    if (cpt?.details?.address?.doorNo) {
      propAddArr.push(cpt?.details?.address?.doorNo);
    }
    if (cpt?.details?.address?.street) {
      propAddArr.push(cpt?.details?.address?.street);
    }
    if (cpt?.details?.address?.landmark) {
      propAddArr.push(cpt?.details?.address?.landmark);
    }
    if (cpt?.details?.address?.locality?.code) {
      propAddArr.push(t(Digit.Utils.pt.getMohallaLocale(cpt?.details?.address?.locality?.code, cpt?.details?.tenantId)));
    }
    if (cpt?.details?.tenantId) {
      propAddArr.push(t(Digit.Utils.pt.getCityLocale(cpt?.details?.tenantId)));
    }
    if (cpt?.details?.address?.pincode) {
      propAddArr.push(cpt?.details?.address?.pincode);
    }
  }
  const reversedOwners= Array.isArray(cpt?.details?.owners) ? cpt?.details?.owners.slice().reverse() :[];

  return(
    <React.Fragment>
    <Timeline currentStep={4} />

    {/* ── Page wrapper ─────────────────────────────────────────── */}
    <div style={{ width: "100%", padding: "4px 0 32px" }}>

      {/* ── Basic Details ─────────────────────────────────────── */}
      <SectionCard icon="🏠" title={t(`WS_BASIC_DETAILS_HEADER`)}>
        <StatusTable>
          <Row label={t("WS_PROPERTY_ID_LABEL")} text={cpt?.details?.propertyId}/>
          <Row label={t("WS_OWNERS_NAME_LABEL")} text={t(reversedOwners[0]?.name)} />
          <Row label={t("WS_COMMON_TABLE_COL_ADDRESS")} text={propAddArr.join(', ')} />
          <Row label={t("WS_CONNECTION_DETAILS_STATUS_LABEL")} text={t(cpt?.details?.status)}/>
        </StatusTable>
        <div style={{ textAlign: "left", paddingBottom: "8px" }}>
          <Link
            to={`/suda-ui/citizen/commonpt/view-property?propertyId=${cpt?.details?.propertyId}&tenantId=${cpt?.details?.tenantId}`}
          >
            <LinkButton style={{ textAlign: "left", color: ORANGE }} label={t("PT_VIEW_PROPERTY")} />
          </Link>
        </div>
      </SectionCard>

      {/* ── Connection Holder Details ─────────────────────────── */}
      <SectionCard
        icon="👤"
        title={t("WS_COMMON_CONNECTION_HOLDER_DETAILS_HEADER")}
        editButton={
          <LinkButton
            label={<EditIcon style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }} />}
            style={{ minWidth: "unset" }}
            onClick={() => routeTo(`${routeLink}/connection-details`)}
          />
        }
      >
        <StatusTable>
          <Row textStyle={isMobile ? {marginRight:"-5px"} : {}} label={t("WS_OWN_MOBILE_NO")} text={ConnectionHolderDetails?.mobileNumber}/>
          <Row label={t("WS_OWN_DETAIL_NAME")} text={ConnectionHolderDetails?.name}/>
          <Row label={t("WS_OWN_DETAIL_GENDER_LABEL")} text={t(ConnectionHolderDetails?.gender?.i18nKey) || t("CS_NA")}/>
          <Row label={t("WS_FATHERS_HUSBAND_NAME")} text={ConnectionHolderDetails?.guardian || t("CS_NA")}/>
          <Row label={t("WS_CONN_HOLDER_OWN_DETAIL_RELATION_LABEL")} text={t(ConnectionHolderDetails?.relationship?.i18nKey) || t("CS_NA")} />
          <Row label={t("WS_OWN_DETAIL_CROSADD")} text={ConnectionHolderDetails?.address || t("CS_NA")} />
          <Row label={t("WS_OWN_DETAIL_SPECIAL_APPLICANT_LABEL")} text={t(ConnectionHolderDetails?.specialCategoryType?.i18nKey) || t("CS_NA")} />
          <Row label={t("WS_EMAIL_ID")} text={ConnectionHolderDetails?.emailId || t("CS_NA")}/>
        </StatusTable>
      </SectionCard>

      {/* ── Connection Details ────────────────────────────────── */}
      <SectionCard
        icon="🔧"
        title={t("WS_COMMON_CONNECTION_DETAIL")}
        editButton={
          <LinkButton
            label={<EditIcon style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }} />}
            style={{ minWidth: "unset" }}
            onClick={() => routeTo(`${routeLink}/connection-details`)}
          />
        }
      >
        <StatusTable>
          <Row textStyle={isMobile ? {marginRight:"-10px"}:{}} label={t("WS_SERVICE_NAME_LABEL")} text={t(serviceName?.i18nKey)}/>
          {waterConectionDetails && Object.keys(waterConectionDetails)?.length>0 && <div>
            <Row label={t("WS_NO_OF_TAPS_PROPOSED")} text={waterConectionDetails?.proposedTaps} />
            <Row label={t("WS_SERV_DETAIL_PIPE_SIZE")} text={t(waterConectionDetails?.proposedPipeSize?.i18nKey)} />
          </div>}
          {sewerageConnectionDetails && Object.keys(sewerageConnectionDetails)?.length>0 &&<div>
            <Row label={t("WS_NO_OF_WATER_CLOSETS")}   text={sewerageConnectionDetails?.proposedWaterClosets} />
            <Row label={t("WS_SERV_DETAIL_NO_OF_TOILETS")} text={sewerageConnectionDetails?.proposedToilets} />
          </div>}
        </StatusTable>
      </SectionCard>

      {/* ── Document Details ──────────────────────────────────── */}
      <SectionCard
        icon="📄"
        title={t("WS_COMMON_DOCUMENT_DETAILS")}
        editButton={
          <LinkButton
            label={<EditIcon style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }} />}
            style={{ minWidth: "unset" }}
            onClick={() => routeTo(`${routeLink}/document-details`)}
          />
        }
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px",
          padding: "12px 0 8px",
        }}>
          {documents && documents?.documents.map((doc, index) => (
            <DocCard
              key={`doc-${index}`}
              header={t(doc?.documentType?.split('.').slice(0, 2).join('_'))}
            >
              <WSDocument value={value} Code={doc?.documentType} index={index} showFileName={false} />
            </DocCard>
          ))}
        </div>
      </SectionCard>

    </div>

    <SubmitBar label={t("CS_COMMON_SUBMIT")} onSubmit={onSubmit} style={{marginLeft:"10px",maxWidth:"95%"}}/>
    </React.Fragment>
    )
  }
  export default CheckPage;
  