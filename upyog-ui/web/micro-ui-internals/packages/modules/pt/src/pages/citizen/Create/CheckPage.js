import {
  Card,
  CardHeader,
  CardSubHeader,
  CardText,
  CheckBox,
  LinkButton,
  Row,
  StatusTable,
  SubmitBar
} from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  checkForNA,
  getFixedFilename, isPropertyIndependent, isPropertyselfoccupied,
  ispropertyunoccupied
} from "../../../utils";
import Timeline from "../../../components/TLTimeline";

const ActionButton = ({ jumpTo }) => null;

/* ─── inline style constants ─────────────────────────────────────────────── */
const GOLD    = "#e07b00";
const NAVY    = "#d95f00";
const LIGHT   = "#fff4e8";
const BORDER  = "#f5c99a";
const WHITE   = "#ffffff";

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
  background: `linear-gradient(135deg, #d95f00 0%, #f07e1a 100%)`,
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
    background: "rgba(255,255,255,0.2)",
    fontSize: "14px",
    flexShrink: 0,
  }}>{icon}</span>
);

const SectionCard = ({ icon, title, children }) => (
  <div style={sectionWrap}>
    <div style={sectionHeader}>
      {iconCircle(icon)}
      <span>{title}</span>
    </div>
    <div style={sectionBody}>{children}</div>
  </div>
);

const CheckPage = ({ onSubmit, value = {} }) => {
  const { t } = useTranslation();
  const history = useHistory();
  console.log("value",value)
  const {
    address,
    isResdential,
    PropertyType,
    electricity,
    noOfFloors,
    noOofBasements,
    additionalDetails,
    units = [{}],
    landarea,
    landArea,
    UnOccupiedArea,
    city_complaint,
    locality_complaint,
    street,
    doorNo,
    landmark,
    ownerType,
    Floorno,
    ownershipCategory,
    Constructiondetails,
    IsAnyPartOfThisFloorUnOccupied,
    propertyArea,
    selfOccupied,
    floordetails,
    owners,
    isEditProperty,
    isUpdateProperty,
    propertyStructureDetails,
  } = value;
  const typeOfApplication = !isEditProperty && !isUpdateProperty ? `new-application` : `edit-application`; 
  let flatplotsize;
  if (isPropertyselfoccupied(selfOccupied?.i18nKey)) {
    flatplotsize = parseInt(landarea?.floorarea);
    if (ispropertyunoccupied(IsAnyPartOfThisFloorUnOccupied?.i18nKey)) {
      flatplotsize = flatplotsize + parseInt(UnOccupiedArea?.UnOccupiedArea);
    }
  } else {
    flatplotsize = parseInt(landarea?.floorarea) + parseInt(Constructiondetails?.RentArea);
    if (!ispropertyunoccupied(IsAnyPartOfThisFloorUnOccupied?.i18nKey)) {
      flatplotsize = flatplotsize + parseInt(UnOccupiedArea?.UnOccupiedArea);
    }
  }
  if (isPropertyIndependent(PropertyType?.i18nKey)) {
    flatplotsize = parseInt(propertyArea?.builtUpArea) + parseInt(propertyArea?.plotSize);
  }

  const [agree, setAgree] = useState(false);
  const setdeclarationhandler = () => {
    setAgree(!agree);
  };
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={4}/> : null}

      {/* ── Page wrapper ─────────────────────────────────────────── */}
      <div style={{ width: "100%", padding: "4px 0 32px" }}>

        {/* ── Page title banner ──────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, #d95f00 0%, #f07e1a 100%)`,
          borderRadius: "14px",
          padding: "24px 28px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 4px 18px rgba(217,95,0,0.25)",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "24px", flexShrink: 0,
          }}>🏠</div>
          <div>
            <div style={{ color: WHITE, fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
              {t("PT_CHECK_CHECK_YOUR_ANSWERS")}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "4px" }}>
              {t("PT_CHECK_CHECK_YOUR_ANSWERS_TEXT")}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <span style={{
              background: "rgba(255,255,255,0.25)", color: WHITE, borderRadius: "20px",
              padding: "4px 14px", fontSize: "12px", fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.5)",
            }}>Step 4 of 4</span>
          </div>
        </div>

        {/* ── Property Address ───────────────────────────────────── */}
        <SectionCard icon="📍" title={t("PT_PROPERTY_ADDRESS_SUB_HEADER")}>
          <StatusTable>
            <Row
              label={t("PT_PROPERTY_ADDRESS_SUB_HEADER")}
              text={`${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
                address?.landmark ? `${address?.landmark}, ` : ""
              }${t(address?.locality?.code)}, ${t(address?.city?.code)},${t(address?.pincode) ? `${address.pincode}` : " "}`}
              actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/pincode`} />}
            />
            <Row
              label={t("PT_PROOF_OF_ADDRESS_SUB_HEADER")}
              text={address?.documents?.ProofOfAddress?.documentType?.i18nKey ? t(address.documents.ProofOfAddress.documentType.i18nKey) : t("CS_NA")}
              actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/proof`} />}
            />
          </StatusTable>
        </SectionCard>

        {/* ── Ownership Details ─────────────────────────────────── */}
        <SectionCard icon="👤" title={t("PT_OWNERSHIP_DETAILS_SUB_HEADER")}>
          <StatusTable>
            <Row
              label={t("PT_FORM3_OWNERSHIP_TYPE")}
              text={t(checkForNA(`PT_OWNERSHIP_${ownershipCategory?.code}`))}
              actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-ship-details@0`} />}
            />
          </StatusTable>
          {owners &&
            owners.map &&
            owners.map((owner, index) => (
              <div key={index}>
                {owners.length > 1 && (
                  <div style={{
                    background: LIGHT, borderTop: `3px solid ${GOLD}`,
                    padding: "8px 16px", fontWeight: 600, color: "#b34e00",
                    fontSize: "13px", letterSpacing: "0.3px",
                  }}>
                    {t("PT_OWNER_SUB_HEADER")} — {index + 1}
                  </div>
                )}
                {ownershipCategory?.value == "INSTITUTIONALPRIVATE" || ownershipCategory?.value == "INSTITUTIONALGOVERNMENT" ? (
                  <div>
                    <StatusTable>
                      <Row
                        label={t("PT_COMMON_INSTITUTION_NAME")}
                        text={`${t(checkForNA(owner?.inistitutionName))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={t("PT_TYPE_OF_INSTITUTION")}
                        text={owner?.inistitutetype?.label || t("CS_NA")}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={t("PT_OWNER_NAME")}
                        text={`${t(checkForNA(owner?.name))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_COMMON_AUTHORISED_PERSON_DESIGNATION")}`}
                        text={`${t(checkForNA(owner?.designation))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_FORM3_MOBILE_NUMBER")}`}
                        text={`${t(checkForNA(owner?.mobileNumber))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={t("PT_FORM3_ALT_MOBILE_NUMBER") || "Alternate Mobile Number"}
                        text={`${t(checkForNA(owner?.alternatemobilenumber))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={t("PT_LANDLINE_NUMBER_FLOATING_LABEL") || "Landline Number"}
                        text={`${t(checkForNA(owner?.altContactNumber))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_FORM3_EMAIL_ID")}`}
                        text={`${t(checkForNA(owner?.emailId))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/inistitution-details/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_OWNERSHIP_INFO_CORR_ADDR")}`}
                        text={`${t(checkForNA(owner?.permanentAddress))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/institutional-owner-address/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_COMMON_SAME_AS_PROPERTY_ADDRESS")}`}
                        text={`${t(checkForNA(owner?.isCorrespondenceAddress))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/institutional-owner-address/`}${index}`} />
                        }
                      />
                      <Row
                        label={t("PT_PROOF_IDENTITY_HEADER")}
                        text={owner?.documents["proofIdentity"]?.documentType?.i18nKey ? t(owner.documents["proofIdentity"].documentType.i18nKey) : t("CS_NA")}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/institutional-proof-of-identity/`}${index}`} />
                        }
                      />
                    </StatusTable>
                  </div>
                ) : (
                  <div>
                    <StatusTable>
                      <Row
                        label={t("PT_OWNER_NAME")}
                        text={`${t(checkForNA(owner?.name))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={t("PT_FORM3_GENDER")}
                        text={`${t(checkForNA(owner?.gender?.code))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={`${t("PT_FORM3_MOBILE_NUMBER")}`}
                        text={`${t(checkForNA(owner?.mobileNumber))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={t("PT_FORM3_ALT_MOBILE_NUMBER")}
                        text={`${t(checkForNA(owner?.alternatemobilenumber))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={t("PT_FORM3_FATHER_HUSBAND_NAME")}
                        text={`${t(checkForNA(owner?.fatherOrHusbandName))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={t("PT_FORM3_RELATIONSHIP")}
                        text={`${t(checkForNA(owner?.relationship?.code))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />
                      <Row
                        label={t("PT_FORM3_EMAIL_ID")}
                        text={`${t(checkForNA(owner?.emailId))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-details/`}${index}`} />}
                      />

                      <Row
                        label={t("PT_SPECIAL_OWNER_CATEGORY")}
                        text={`${t(checkForNA(owner?.ownerType?.code))}`}
                        actionButton={
                          <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/special-owner-category/`}${index}`} />
                        }
                      />
                      <Row
                        label={`${t("PT_OWNERS_ADDRESS")}`}
                        text={`${t(checkForNA(owner?.permanentAddress))}`}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/owner-address/`}${index}`} />}
                      />
                      
                      {owner?.ownerType?.code !== "NONE" ? (
                        <Row
                          label={t("PT_SPECIAL_OWNER_CATEGORY_PROOF_HEADER")}
                          text={owner?.documents["specialProofIdentity"]?.documentType?.i18nKey ? t(owner.documents["specialProofIdentity"].documentType.i18nKey) : t("CS_NA")}
                          actionButton={
                            <ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/special-owner-category-proof/`}${index}`} />
                          }
                        />
                      ) : (
                        ""
                      )}
                      <Row
                        label={t("PT_PROOF_IDENTITY_HEADER")}
                        text={owner?.documents["proofIdentity"]?.documentType?.i18nKey ? t(owner.documents["proofIdentity"].documentType.i18nKey) : t("CS_NA")}
                        actionButton={<ActionButton jumpTo={`${`/suda-ui/citizen/pt/property/${typeOfApplication}/proof-of-identity/`}${index}`} />}
                      />
                    </StatusTable>
                  </div>
                )}
              </div>
            ))}
        </SectionCard>

        {/* ── Assessment Info ───────────────────────────────────── */}
        <SectionCard icon="📋" title={t("PT_ASSESMENT_INFO_SUB_HEADER")}>
          <StatusTable>
            <Row
              label={t("PT_ASSESMENT1_PROPERTY_TYPE")}
              text={`${t(checkForNA(PropertyType?.i18nKey))}`}
              actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/property-type`} />}
          />
          <Row
            label={t("PT_BP_NUMBER")}
            text={`${t(checkForNA(electricity?.electricity))}`}
            actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/electricity-number`} />}
          />
          {PropertyType?.code !== "VACANT" &&<Row
            label={t("PT_ASSESMENT1_PLOT_SIZE")}
            text={`${landArea?.floorarea}`}
            actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/landarea`} />}
          />}
          {PropertyType?.code === "VACANT" && (
            <Row 
              label={t("PT_ASSESMENT1_PLOT_SIZE")}
              text={`${landArea?.floorarea || landarea?.floorarea}`}
              actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
            />
          )}
          {PropertyType?.code !== "VACANT" &&
            units
              .sort((x, y) => x.floorNo - y.floorNo)
              .map((unit, unitIndex) => {
                return (
                  <div key={unitIndex}>
                    {units.length > 1 && (
                      <div style={{
                        background: LIGHT, borderTop: `3px solid ${GOLD}`,
                        padding: "8px 16px", fontWeight: 600, color: "#b34e00",
                        fontSize: "13px",
                      }}>
                        {t("PT_UNIT")} — {unitIndex + 1}
                      </div>
                    )}
                    <Row
                      label={t("PT_BUILT_UP_AREA")}
                      text={`${unit?.constructionDetail?.builtUpArea}`}
                      actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                    />
                    <Row
                      label={t("PT_ASSESMENT_INFO_OCCUPLANCY")}
                      text={t(`PROPERTYTAX_OCCUPANCYTYPE_${unit?.occupancyType}`)}
                      actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                    />
                    <Row
                      label={t("PT_FORM2_USAGE_TYPE")}
                      text={t(
                        `PROPERTYTAX_BILLING_SLAB_${
                          unit?.usageCategory?.split(".").length > 2 ? unit?.usageCategory?.split(".")[1] : unit?.usageCategory?.split(".")[0]
                        }`
                      )}
                      actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                    />{" "}
                    {unit?.unitType && (
                      <Row
                        label={t("PT_FORM2_SUB_USAGE_TYPE")}
                        text={t(`PROPERTYTAX_BILLING_SLAB_${unit?.unitType}`)}
                        actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                      />
                    )}
                    <Row
                      label={t("PT_FLOOR_NO")}
                      text={unit?.floorNo===0? t("PT_GROUND_FLOOR_OPTION") :( unit?.floorNo<0) ? `${unit?.floorNo} and Ground floor` : `Ground floor +${unit?.floorNo}`}
                      actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                    />
                    {unit?.arv && (
                      <Row
                        label={t("PT_PROPERTY_ANNUAL_RENT_LABEL")}
                        text={`${unit?.arv}`}
                        actionButton={<ActionButton jumpTo={`/suda-ui/citizen/pt/property/${typeOfApplication}/PtUnits`} />}
                      />
                    )}
                  </div>
                );
              })}
          </StatusTable>
        </SectionCard>

        {/* ── Declaration ───────────────────────────────────────── */}
        <div style={{
          background: agree
            ? "linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 100%)"
            : "linear-gradient(135deg, #fff4e8 0%, #fffbf4 100%)",
          border: `2px solid ${agree ? "#66bb6a" : GOLD}`,
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          boxShadow: agree
            ? "0 2px 12px rgba(102,187,106,0.15)"
            : "0 2px 12px rgba(198,146,47,0.12)",
          transition: "all 0.25s ease",
        }}>
          <span style={{ fontSize: "22px", marginTop: "2px", flexShrink: 0 }}>
            {agree ? "✅" : "📜"}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: "14px", marginBottom: "6px" }}>
              {t("PT_FINAL_DECLARATION_MESSAGE") || "Declaration"}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={setdeclarationhandler}
                style={{
                  width: "18px", height: "18px", accentColor: GOLD,
                  cursor: "pointer", flexShrink: 0,
                }}
              />
              <span style={{ color: "#555", fontSize: "13px", lineHeight: 1.5 }}>
                {t("PT_FINAL_DECLARATION_MESSAGE")}
              </span>
            </label>
          </div>
        </div>

        {/* ── Submit button ────────────────────────────────────── */}
        <div style={{
          background: agree
            ? `linear-gradient(135deg, #43a047 0%, #66bb6a 100%)`
            : `linear-gradient(135deg, #d95f00 0%, #f07e1a 100%)`,
          borderRadius: "10px",
          padding: "16px 28px",
          textAlign: "center",
          cursor: agree ? "pointer" : "not-allowed",
          boxShadow: agree ? "0 4px 16px rgba(67,160,71,0.4)" : "0 4px 16px rgba(217,95,0,0.25)",
          transition: "all 0.25s ease",
          opacity: agree ? 1 : 0.65,
        }}
          onClick={agree ? onSubmit : undefined}
        >
          <span style={{
            color: WHITE, fontWeight: 700, fontSize: "16px",
            letterSpacing: "0.5px", textTransform: "uppercase",
          }}>
            {t("PT_COMMON_BUTTON_SUBMIT")}
          </span>
        </div>

      </div>{/* end page wrapper */}
    </React.Fragment>
  );
};

export default CheckPage;