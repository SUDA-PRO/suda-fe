import { Row, StatusTable, SubmitBar, Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import TLDocument from "../../../pageComponents/TLDocumets";
import Timeline from "../../../components/TLTimeline";

/* ─── style tokens ──────────────────────────────────────────────────────── */
const WHITE     = "#ffffff";
const BORDER    = "#ddd";
const DARK_NAVY = "#1a3a5c";

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
const sectionBody = { padding: "4px 16px 4px 20px" };

const IconCircle = ({ icon }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "28px", height: "28px", borderRadius: "50%",
    background: "rgba(255,255,255,0.15)", fontSize: "14px", flexShrink: 0,
  }}>{icon}</span>
);

const SectionCard = ({ icon, title, onEdit, children }) => (
  <div style={sectionWrap}>
    <div style={sectionHeaderStyle}>
      <IconCircle icon={icon} />
      <span style={{ flex: 1 }}>{title}</span>
      {onEdit && (
        <button onClick={onEdit} style={{
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
          color: WHITE, borderRadius: "6px", padding: "4px 12px",
          fontSize: "12px", cursor: "pointer", fontWeight: 600,
        }}>✏️ Edit</button>
      )}
    </div>
    <div style={sectionBody}>{children}</div>
  </div>
);

const UnitBlock = ({ unit, index, t }) => (
  <div style={{ borderLeft: "3px solid #f47738", paddingLeft: "12px", marginBottom: "12px", marginTop: "4px" }}>
    <div style={{ fontWeight: 700, color: "#f47738", marginBottom: "6px", fontSize: "13px" }}>
      {t("TL_UNIT_HEADER")} – {index + 1}
    </div>
    <StatusTable>
      <Row className="border-none" label={t("TL_NEW_TRADE_DETAILS_TRADE_CAT_LABEL")} text={t(unit?.tradecategory?.i18nKey)} />
      <Row className="border-none" label={t("TL_NEW_TRADE_DETAILS_TRADE_TYPE_LABEL")} text={t(unit?.tradetype?.i18nKey)} />
      <Row className="border-none" label={t("TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL")} text={t(unit?.tradesubtype?.i18nKey)} />
      <Row className="border-none" label={t("TL_UNIT_OF_MEASURE_LABEL")} text={unit?.unit ? t(unit?.unit) : t("CS_NA")} />
      <Row className="border-none" label={t("TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL")} text={unit?.uom ? t(unit?.uom) : t("CS_NA")} />
    </StatusTable>
  </div>
);

const AccessoryBlock = ({ acc, index, t }) => (
  <div style={{ borderLeft: "3px solid #1a3a5c", paddingLeft: "12px", marginBottom: "12px", marginTop: "4px" }}>
    <div style={{ fontWeight: 700, color: "#1a3a5c", marginBottom: "6px", fontSize: "13px" }}>
      {t("TL_ACCESSORY_LABEL")} – {index + 1}
    </div>
    <StatusTable>
      <Row className="border-none" label={t("TL_TRADE_ACC_HEADER")} text={t(acc?.accessory?.i18nKey)} />
      <Row className="border-none" label={t("TL_NEW_TRADE_ACCESSORY_COUNT")} text={String(acc?.accessorycount)} />
      <Row className="border-none" label={t("TL_ACC_UOM_LABEL")} text={acc?.unit ? t(acc?.unit) : t("CS_NA")} />
      <Row className="border-none" label={t("TL_ACC_UOM_VALUE_LABEL")} text={acc?.unit ? t(acc?.uom) : t("CS_NA")} />
    </StatusTable>
  </div>
);
const getPath = (path, params) => {
  params && Object.keys(params)?.forEach((key) => { path = path.replace(`:${key}`, params[key]); });
  return path;
};

function getdate(date) {
  const d = new Date(Date.parse(date));
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/* ─── guard wrapper ─────────────────────────────────────────────────────── */
const CheckPage = (props) => {
  if (localStorage.getItem("TLAppSubmitEnabled") !== "true") {
    window.location.replace("/suda-ui/citizen");
    return null;
  }
  return <WrapCheckPage {...props} />;
};

/* ─── main component ────────────────────────────────────────────────────── */
const WrapCheckPage = ({ onSubmit, value }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch();
  const [toast, setToast] = useState(null);
  const { TradeDetails, address, owners, isEditProperty, cpt } = value;

  const { data: billingSlabTradeTypeData } = Digit.Hooks.tl.useTradeLicenseBillingslab(
    { tenantId: value?.tenantId || Digit.ULBService.getCurrentTenantId(), filters: {} },
    {
      select: (data) =>
        data?.billingSlab.filter(
          (e) =>
            e.tradeType &&
            e.applicationType === (window.location.href.includes("renew-trade") ? "RENEWAL" : "NEW") &&
            e.licenseType === "PERMANENT" &&
            e.uom
        ),
    }
  );

  useEffect(() => { return () => { localStorage.setItem("TLAppSubmitEnabled", "false"); }; }, []);

  useEffect(() => {
    if (sessionStorage.getItem("isCreateEnabledEmployee") === "true") {
      sessionStorage.removeItem("isCreateEnabledEmployee");
      history.replace("/employee");
    } else {
      sessionStorage.removeItem("isCreateEnabledEmployee");
    }
  });

  const routeTo = (jumpTo) => {
    sessionStorage.getItem("isDirectRenewal") && sessionStorage.removeItem("isDirectRenewal");
    history.push(jumpTo);
  };

  const CheckForBillingSlab = () => {
    if (window.location.href.includes("renew-trade") && value) {
      let flag = true;
      value?.TradeDetails?.units?.forEach((val) => {
        if (
          val &&
          billingSlabTradeTypeData?.filter(
            (ob) =>
              ob?.tradeType === val?.tradesubtype?.code &&
              (ob?.structureType === value?.TradeDetails?.VehicleType?.code ||
                ob?.structureType === value?.TradeDetails?.BuildingType?.code)
          )?.length <= 0
        ) {
          flag = false;
          setToast({ key: "error", message: "TL_BILLING_SLAB_NOT_FOUND_FOR_COMB" });
        }
      });
      if (flag) onSubmit();
    } else {
      onSubmit();
    }
  };

  const typeOfApplication = !isEditProperty ? "new-application" : "renew-trade";
  let routeLink = `/suda-ui/citizen/tl/tradelicence/${typeOfApplication}`;
  if (window.location.href.includes("edit-application") || window.location.href.includes("renew-trade")) {
    routeLink = getPath(match.path, match.params).replace("/check", "");
  }

  const isMovable = TradeDetails?.StructureType?.code === "MOVABLE";

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={4} /> : null}

      <div style={{ width: "100%", padding: "4px 0 32px" }}>

        {/* ── Banner ────────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
          borderRadius: "14px",
          padding: "24px 28px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 4px 18px rgba(244,119,56,0.25)",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "rgba(255,255,255,0.25)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0,
          }}>🏪</div>
          <div>
            <div style={{ color: WHITE, fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
              {t("TL_COMMON_SUMMARY")}
            </div>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "13px", marginTop: "4px" }}>
              {t("TL_CHECK_YOUR_ANSWERS_TEXT") || "Review your application details before submitting"}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              background: "rgba(255,255,255,0.25)", color: WHITE, borderRadius: "20px",
              padding: "4px 14px", fontSize: "12px", fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.5)",
            }}>Step 4 of 4</span>
          </div>
        </div>

        {/* ── Trade Details ──────────────────────────────────────────── */}
        <SectionCard icon="🏪" title={t("TL_LOCALIZATION_TRADE_DETAILS")} onEdit={() => { sessionStorage.setItem("editFromCheck", "true"); routeTo(`${routeLink}/select-combined-trade-details`); }}>
          <StatusTable>
            <Row className="border-none" label={t("TL_LOCALIZATION_TRADE_NAME")} text={t(TradeDetails?.TradeName)} />
            <Row className="border-none" label={t("TL_STRUCTURE_TYPE")} text={t(`TL_${TradeDetails?.StructureType?.code}`)} />
            <Row
              className="border-none"
              label={t("TL_STRUCTURE_SUB_TYPE")}
              text={t(
                TradeDetails?.StructureType?.code !== "IMMOVABLE"
                  ? TradeDetails?.VehicleType?.i18nKey
                  : TradeDetails?.BuildingType?.i18nKey
              )}
            />
            <Row className="border-none" label={t("TL_TRADE_GST_NO")} text={TradeDetails?.TradeGSTNumber || t("CS_NA")} />
            <Row className="border-none" label={t("TL_OPERATIONAL_AREA")} text={TradeDetails?.OperationalSqFtArea || t("CS_NA")} />
            <Row className="border-none" label={t("TL_NO_OF_EMPLOYEES")} text={TradeDetails?.NumberOfEmployees || t("CS_NA")} />
            <Row className="border-none" label={t("TL_NEW_TRADE_DETAILS_TRADE_COMM_DATE_LABEL")} text={getdate(TradeDetails?.CommencementDate)} />
          </StatusTable>
          {TradeDetails?.units?.map((unit, idx) => (
            <UnitBlock key={idx} unit={unit} index={idx} t={t} />
          ))}
          {TradeDetails?.accessories &&
            TradeDetails?.isAccessories?.i18nKey?.includes("YES") &&
            TradeDetails.accessories.map((acc, idx) => (
              <AccessoryBlock key={idx} acc={acc} index={idx} t={t} />
            ))}
        </SectionCard>

        {/* ── Location Details ───────────────────────────────────────── */}
        {!isMovable && (
          <SectionCard
            icon="📍"
            title={t("TL_NEW_TRADE_DETAILS_HEADER_TRADE_LOC_DETAILS")}
            onEdit={() => routeTo(`${routeLink}/${cpt?.details?.propertyId ? "know-your-property" : "map"}`)}
          >
            <StatusTable>
              {cpt?.details?.propertyId ? (
                <React.Fragment>
                  <Row className="border-none" label={t("TL_PROPERTY_ID")} text={cpt.details.propertyId.trim()} />
                  <Row
                    className="border-none"
                    label={t("TL_CHECK_ADDRESS")}
                    text={[
                      cpt.details?.address?.doorNo?.trim() && `${cpt.details.address.doorNo.trim()},`,
                      cpt.details?.address?.street?.trim() && `${cpt.details.address.street.trim()},`,
                      cpt.details?.address?.buildingName?.trim() && `${cpt.details.address.buildingName.trim()},`,
                      t(cpt.details?.address?.locality?.name),
                      t(cpt.details?.address?.city),
                      cpt.details?.address?.pincode?.trim(),
                    ].filter(Boolean).join(" ")}
                  />
                </React.Fragment>
              ) : (
                <Row
                  className="border-none"
                  label={t("TL_CHECK_ADDRESS")}
                  text={[
                    address?.doorNo?.trim() && `${address.doorNo.trim()},`,
                    address?.street?.trim() && `${address.street.trim()},`,
                    t(address?.locality?.i18nkey),
                    t(address?.city?.code),
                    address?.pincode?.trim(),
                  ].filter(Boolean).join(" ")}
                />
              )}
            </StatusTable>
          </SectionCard>
        )}

        {/* ── Owner Details ──────────────────────────────────────────── */}
        <SectionCard icon="👤" title={t("TL_NEW_OWNER_DETAILS_HEADER")} onEdit={() => routeTo(`${routeLink}/owner-details`)}>
          {owners?.owners?.map((owner, idx) => (
            <div key={idx}>
              <div style={{
                fontWeight: 700, color: DARK_NAVY, marginTop: idx > 0 ? "12px" : "8px",
                marginBottom: "6px", fontSize: "13px", paddingLeft: "4px",
              }}>
                {t("TL_PAYMENT_PAID_BY_PLACEHOLDER")} – {idx + 1}
              </div>
              <StatusTable>
                <Row className="border-none" label={t("TL_COMMON_TABLE_COL_OWN_NAME")} text={owner?.name} />
                <Row className="border-none" label={t("TL_NEW_OWNER_DETAILS_GENDER_LABEL")} text={t(owner?.gender?.i18nKey) || t("CS_NA")} />
                <Row className="border-none" label={t("TL_MOBILE_NUMBER_LABEL")} text={owner?.mobilenumber} />
                <Row className="border-none" label={t("TL_GUARDIAN_S_NAME_LABEL")} text={owner?.fatherOrHusbandName || t("CS_NA")} />
                <Row className="border-none" label={t("TL_RELATIONSHIP_WITH_GUARDIAN_LABEL")} text={t(owner?.relationship?.i18nKey) || t("CS_NA")} />
                <Row className="border-none" label={t("TL_EMAIL_ID_LABEL")} text={owner?.emailId || t("CS_NA")} />
                <Row className="border-none" label={t("TL_COMMON_TABLE_COL_OWN_CATEGORY_SHIP")} text={t(value?.ownershipCategory?.code)} />
                <Row className="border-none" label={t("TL_CORRESPONDENCE_ADDRESS")} text={owners?.permanentAddress || t("CS_NA")} />
              </StatusTable>
            </div>
          ))}
        </SectionCard>

        {/* ── Documents ──────────────────────────────────────────────── */}
        <SectionCard icon="📄" title={t("TL_COMMON_DOCS")} onEdit={() => routeTo(`${routeLink}/select-combined-proof-details`)}>
          {owners?.documents?.["OwnerPhotoProof"] ||
          owners?.documents?.["ProofOfIdentity"] ||
          owners?.documents?.["ProofOfOwnership"] ? (
            <TLDocument
              key={[
                owners?.documents?.["ProofOfIdentity"]?.fileStoreId || "",
                owners?.documents?.["ProofOfOwnership"]?.fileStoreId || "",
                owners?.documents?.["OwnerPhotoProof"]?.fileStoreId || "",
              ].join("-")}
              value={value}
            />
          ) : (
            <StatusTable>
              <Row className="border-none" text={t("TL_NO_DOCUMENTS_MSG")} />
            </StatusTable>
          )}
        </SectionCard>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div style={{ marginTop: "8px" }}>
          <SubmitBar label={t("CS_COMMON_SUBMIT")} onSubmit={CheckForBillingSlab} />
        </div>

        {toast && (
          <Toast
            error={toast.key === "error"}
            label={t(toast.message)}
            onClose={() => setToast(null)}
            style={{ maxWidth: "670px" }}
            isDleteBtn={true}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default CheckPage;
