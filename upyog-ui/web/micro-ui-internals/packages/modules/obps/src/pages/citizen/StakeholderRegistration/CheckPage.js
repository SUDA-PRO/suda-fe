import {
  Row,
  StatusTable,
  SubmitBar,
  LinkButton,
  EditIcon,
  BackButton,
} from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../../../components/Timeline";
import OBPSDocument from "../../../pageComponents/OBPSDocuments";

/* ─── style constants (PT-style) ──────────────────────────────────────────── */
const WHITE     = "#ffffff";
const DARK_NAVY = "#1a2b49";
const BORDER    = "#ddd";

const sectionWrap = {
  background: WHITE,
  borderRadius: "12px",
  border: `1px solid ${BORDER}`,
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  marginBottom: "20px",
  overflow: "hidden",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: DARK_NAVY,
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
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "28px", height: "28px", borderRadius: "50%",
    background: "rgba(255,255,255,0.15)", fontSize: "14px", flexShrink: 0,
  }}>{icon}</span>
);

const SectionCard = ({ icon, title, onEdit, children }) => (
  <div style={sectionWrap}>
    <div style={sectionHeaderStyle}>
      {iconCircle(icon)}
      <span style={{ flex: 1 }}>{title}</span>
      {onEdit && (
        <LinkButton
          label={<EditIcon style={{ fill: WHITE, width: "18px", height: "18px" }} />}
          style={{ minWidth: "auto", padding: 0, background: "transparent", border: "none" }}
          onClick={onEdit}
        />
      )}
    </div>
    <div style={sectionBody}>{children}</div>
  </div>
);

const CheckPage = ({ onSubmit, value }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch();
  let user = Digit.UserService.getUser();
  const tenantId = user?.info?.permanentCity ? user.info.permanentCity : Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isMobile = window.Digit.Utils.browser.isMobile();

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  const { result, formData, documents } = value;
  let consumerCode = value?.result?.Licenses[0].applicationNumber;

  const { data: paymentDetails } = Digit.Hooks.obps.useBPAREGgetbill(
    { businessService: "BPAREG", consumerCode, tenantId: tenant ? tenant : tenantId.split(".")[0] },
    { enabled: !!consumerCode, retry: false }
  );

  let routeLink = isopenlink
    ? `/suda-ui/citizen/obps/openlink/stakeholder/apply`
    : `/suda-ui/citizen/obps/stakeholder/apply`;

  const routeTo = (path) => history.push(path);

  return (
    <React.Fragment>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        <div>
          {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
          <Timeline currentStep={4} flow="STAKEHOLDER" />

          {/* ── Hero Banner ──────────────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
            borderRadius: "14px",
            padding: "24px 28px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 4px 18px rgba(26,43,73,0.25)",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "rgba(255,255,255,0.18)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0,
            }}>📋</div>
            <div>
              <div style={{ color: WHITE, fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
                {t("BPA_STEPPER_SUMMARY_HEADER")}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "4px" }}>
                {t("BPA_SUMMARY_REVIEW_SUBTEXT") || "Review your details before submitting"}
              </div>
            </div>
          </div>

          {/* ── Application Number ────────────────────────────────── */}
          <SectionCard icon="🔖" title={t("BPA_APPLICATION_NUMBER_LABEL")}>
            <StatusTable>
              <Row
                className="border-none"
                label={t("BPA_APPLICATION_NUMBER_LABEL")}
                text={result?.Licenses?.[0]?.applicationNumber || ""}
              />
            </StatusTable>
          </SectionCard>

          {/* ── License Details ───────────────────────────────────── */}
          <SectionCard
            icon="📄"
            title={t("BPA_LICENSE_DETAILS_LABEL")}
            onEdit={() => routeTo(`${routeLink}/provide-license-type`)}
          >
            <StatusTable>
              <Row
                className="border-none"
                label={t("BPA_LICENSE_TYPE")}
                text={t(formData?.LicneseType?.LicenseType?.i18nKey)}
              />
              {formData?.LicneseType?.LicenseType?.i18nKey?.includes("ARCHITECT") && (
                <Row className="border-none" label={t("BPA_COUNCIL_NUMBER")} text={formData?.LicneseType?.ArchitectNo} />
              )}
            </StatusTable>
          </SectionCard>

          {/* ── Applicant Details ─────────────────────────────────── */}
          <SectionCard
            icon="👤"
            title={t("BPA_LICENSE_DET_CAPTION")}
            onEdit={() => routeTo(`${routeLink}/license-details`)}
          >
            <StatusTable>
              <Row className="border-none" label={t("BPA_APPLICANT_NAME_LABEL")} text={formData?.LicneseDetails?.name} />
              <Row className="border-none" label={t("BPA_APPLICANT_GENDER_LABEL")} text={t(formData?.LicneseDetails?.gender?.i18nKey)} />
              <Row className="border-none" label={t("BPA_OWNER_MOBILE_NO_LABEL")} text={formData?.LicneseDetails?.mobileNumber} />
              <Row className="border-none" label={t("BPA_APPLICANT_EMAIL_LABEL")} text={formData?.LicneseDetails?.email || t("CS_NA")} />
              <Row className="border-none" label={t("BPA_APPLICANT_PAN_NO")} text={formData?.LicneseDetails?.PanNumber || t("CS_NA")} />
            </StatusTable>
          </SectionCard>

          {/* ── Permanent Address ─────────────────────────────────── */}
          <SectionCard
            icon="🏠"
            title={t("BPA_LICENSEE_PERMANENT_LABEL")}
            onEdit={() => routeTo(`${routeLink}/Permanent-address`)}
          >
            <div style={{ padding: "12px 4px", color: "black", fontSize: isMobile ? "14px" : "16px" }}>
              {t(formData?.LicneseDetails?.PermanentAddress)}
            </div>
          </SectionCard>

          {/* ── Correspondence Address ────────────────────────────── */}
          <SectionCard
            icon="✉️"
            title={t("BPA_COMMUNICATION_ADDRESS_HEADER_DETAILS")}
            onEdit={() => routeTo(`${routeLink}/correspondence-address`)}
          >
            <div style={{ padding: "12px 4px", color: "black", fontSize: isMobile ? "14px" : "16px" }}>
              {t(value?.Correspondenceaddress)}
            </div>
          </SectionCard>

          {/* ── Documents ─────────────────────────────────────────── */}
          <SectionCard
            icon="📎"
            title={t("BPA_DOC_DETAILS_SUMMARY")}
            onEdit={() => routeTo(`${routeLink}/stakeholder-document-details`)}
          >
            {documents?.documents?.map((doc, index) => (
              <div key={index}>
                <div style={{
                  fontWeight: 600, fontSize: "14px", color: DARK_NAVY,
                  margin: "12px 0 4px",
                  borderBottom: "1px solid #eee", paddingBottom: "6px",
                }}>
                  {t(`BPAREG_HEADER_${doc?.documentType?.replace(".", "_")}`)}
                </div>
                {doc?.info && (
                  <div style={{ fontSize: "12px", color: "#505A5F", fontWeight: 400, lineHeight: "15px", marginBottom: "6px" }}>
                    {t(doc?.info)}
                  </div>
                )}
                <StatusTable>
                  <OBPSDocument value={value} Code={doc?.documentType} index={index} isNOC={false} svgStyles={{}} isStakeHolder={true} />
                </StatusTable>
                {documents?.documents?.length !== index + 1 && (
                  <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "12px 0" }} />
                )}
              </div>
            ))}
          </SectionCard>

          {/* ── Fee Estimate + Submit ──────────────────────────────── */}
          <SectionCard icon="💰" title={t("BPA_SUMMARY_FEE_EST")}>
            <StatusTable>
              {paymentDetails?.billResponse?.Bill?.[0]?.billDetails?.[0]?.billAccountDetails?.map((bill, index) => (
                <Row key={index} className="border-none" label={t(bill.taxHeadCode)} text={`₹ ${bill?.amount}` || t("CS_NA")} />
              ))}
              <Row
                className="border-none"
                label={t("BPA_COMMON_TOTAL_AMT")}
                text={`₹ ${paymentDetails?.billResponse?.Bill?.[0]?.billDetails?.[0]?.amount}` || t("CS_NA")}
              />
            </StatusTable>
            <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "12px 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0 16px" }}>
              <span style={{ fontWeight: 700, fontSize: "18px", color: DARK_NAVY }}>{t("BPA_COMMON_TOTAL_AMT")}</span>
              <span style={{ fontWeight: 700, fontSize: "20px", color: "#f47738" }}>
                ₹ {paymentDetails?.billResponse?.Bill?.[0]?.billDetails?.[0]?.amount || "—"}
              </span>
            </div>
            <SubmitBar
              label={t("CS_COMMON_SUBMIT")}
              onSubmit={onSubmit}
              disabled={!paymentDetails?.billResponse?.Bill?.[0]?.billDetails?.[0]?.amount}
            />
          </SectionCard>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CheckPage;

