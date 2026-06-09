import {
  CardHeader,
  FormStep, LinkButton, Loader, Row, StatusTable
} from "@upyog/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import Timeline from "../../components/CPTTimeline";
import PTMapPicker from "./PTMapPicker";

const PropertyDetails = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = (formData?.knowyourproperty?.KnowProperty?.code === "YES" || sessionStorage.getItem("VisitedLightCreate") === "false" ? formData?.cptSearchQuery?.city : formData?.cpt?.details?.tenantId ) || Digit.ULBService.getCitizenCurrentTenant();
  // if (window.location.href.includes("/tl/tradelicence/edit-application/") || window.location.href.includes("/renew-trade/")) {
  //   sessionStorage.setItem("EditFormData", JSON.stringify(formData));
  // }
  if(window.location.href.includes("/tl/tradelicence/edit-application/") || window.location.href.includes("/renew-trade/") && JSON.parse(sessionStorage.getItem("EditFormData") ))
  {
    let EditformData = JSON.parse(sessionStorage.getItem("EditFormData"));
    formData = {...formData,...EditformData};
  }
  const { isLoading, isError, error, data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    {
      filters: { propertyIds: formData?.cptId?.id || formData?.cpt?.details?.propertyId ? (formData?.knowyourproperty?.KnowProperty?.code === "YES" || sessionStorage.getItem("VisitedLightCreate") === "false" ? formData?.cptId?.id : formData?.cpt?.details?.propertyId) : (window.location.href.includes("/tl/tradelicence/edit-application") || window.location.href.includes("/renew-trade/")  ? formData?.tradeLicenseDetail?.additionalDetail?.propertyId : formData?.cptId?.id || formData?.cpt?.details?.propertyId ) },
      tenantId: tenantId,
      privacy: Digit.Utils.getPrivacyObject(),
    },
    { 
      filters: { propertyIds: formData?.cptId?.id || formData?.cpt?.details?.propertyId ? (formData?.knowyourproperty?.KnowProperty?.code === "YES" || sessionStorage.getItem("VisitedLightCreate") === "false" ? formData?.cptId?.id : formData?.cpt?.details?.propertyId) : (window.location.href.includes("/tl/tradelicence/edit-application") || window.location.href.includes("/renew-trade/")  ? formData?.tradeLicenseDetail?.additionalDetail?.propertyId : formData?.cptId?.id || formData?.cpt?.details?.propertyId ) }, 
      tenantId: tenantId,
      privacy: Digit.Utils.getPrivacyObject(), }
  );

  const onSkip = () => onSelect();

  const goNext = () => {
    sessionStorage.setItem("cpt", propertyDetails?.Properties[0]);
    onSelect("cpt", { details: propertyDetails?.Properties[0] });
  };

  const reversedOwners= Array.isArray(propertyDetails?.Properties?.[0]?.owners) ? propertyDetails?.Properties?.[0]?.owners.slice().reverse():[];

  let propAddArr = [];
  if (propertyDetails && propertyDetails?.Properties.length) {
    if (propertyDetails?.Properties[0]?.address?.doorNo) {
      propAddArr.push(propertyDetails?.Properties[0]?.address?.doorNo);
    }
    if (propertyDetails?.Properties[0]?.address?.street || propertyDetails?.Properties[0]?.address?.buildingName) {
      propAddArr.push(propertyDetails?.Properties[0]?.address?.street || propertyDetails?.Properties[0]?.address?.buildingName);
    }
    if (propertyDetails?.Properties[0]?.address?.landmark) {
      propAddArr.push(propertyDetails?.Properties[0]?.address?.landmark);
    }
    if (propertyDetails?.Properties[0]?.address?.locality?.code) {
      propAddArr.push(t(Digit.Utils.pt.getMohallaLocale(propertyDetails?.Properties[0]?.address?.locality?.code, propertyDetails?.Properties[0]?.tenantId)));
    }
    if (propertyDetails?.Properties[0]?.tenantId) {
      propAddArr.push(t(Digit.Utils.pt.getCityLocale(propertyDetails?.Properties[0]?.tenantId)));
    }
    if (propertyDetails?.Properties[0]?.address?.pincode) {
      propAddArr.push(propertyDetails?.Properties[0]?.address?.pincode);
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  function getChangePropertyPath() {
    if(window.location.href.includes("/ws/modify-connection/"))
    return `/suda-ui/citizen/ws/modify-connection/${formData?.tenantId}/search-property`
    else if(window.location.href.includes("/ws/edit-application/"))
    return `/suda-ui/citizen/ws/edit-application/${formData?.tenantId}/search-property`
    else if(window.location.href.includes("/ws/"))
    return `/suda-ui/citizen/ws/create-application/search-property`
    else if(window.location.href.includes("/renew-trade/"))
    return `/suda-ui/citizen/tl/tradelicence/renew-trade/${formData?.applicationNumber}/${formData?.tenantId}/know-your-property`
    else if(window.location.href.includes("/edit-application/"))
    return `/suda-ui/citizen/tl/tradelicence/edit-application/${formData?.applicationNumber}/${formData?.tenantId}/know-your-property`
    else
    return `/suda-ui/citizen/tl/tradelicence/new-application/know-your-property`
  }

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={window.location.href.includes("/ws/") ? 1 : 2} flow={window.location.href.includes("/ws/") ? "WS":""} businessService={"WS"} /> : null}
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip}>
        {propertyDetails && propertyDetails?.Properties.length && (
          <React.Fragment>
            <CardHeader>{t("PT_DETAILS")}</CardHeader>

            {/* ── Property Details Card ── */}
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              padding: "24px 28px",
              marginBottom: "24px",
              border: "1px solid #e8ecf0",
              fontFamily: "'Roboto', sans-serif",
            }}>
              <div style={{
                fontSize: "15px", fontWeight: "700", color: "#1a2b49",
                marginBottom: "20px", paddingBottom: "10px",
                borderBottom: "2px solid #f47738", letterSpacing: "0.3px",
              }}>
                🏠 {t("PT_DETAILS")}
              </div>
            <StatusTable>
              <Row className="border-none" label={t(`PROPERTY_ID`)} text={propertyDetails?.Properties[0]?.propertyId} />
              <Row className="border-none" label={t(`OWNER_NAME`)} text={reversedOwners?.[0]?.name} />
              <Row className="border-none" textStyle={{ wordBreak: "break-word" }} label={t(`PROPERTY_ADDRESS`)} text={propAddArr.join(', ')} 
              privacy={ {
                uuid: propertyDetails?.Properties?.[0]?.owners?.[0]?.uuid,
                fieldName: ["doorNo" , "street" , "landmark"], 
                model: "Property",
                showValue: true,
                loadData: {
                  serviceName: "/property-services/property/_search",
                  requestBody: {},
                  requestParam: { tenantId:propertyDetails?.Properties[0]?.tenantId, propertyIds:propertyDetails?.Properties[0]?.propertyId },
                  jsonPath: "Properties[0].address.street",
                  d: (res) => {
                    let resultString = (_.get(res,"Properties[0].address.doorNo") ?  `${_.get(res,"Properties[0].address.doorNo")}, ` : "") + (_.get(res,"Properties[0].address.street")? `${_.get(res,"Properties[0].address.street")}, ` : "") + (_.get(res,"Properties[0].address.landmark") ? `${_.get(res,"Properties[0].address.landmark")}`:"")
                    return resultString;
                  },
                  isArray: false,
                },
              }}/>
              <Row className="border-none" label={t(`PT_MUTATION_STATUS`)} text={t(propertyDetails?.Properties[0]?.status)} />
              <div style={{ textAlign: "left" }}>
                <Link
                  to={`/suda-ui/citizen/commonpt/view-property?propertyId=${propertyDetails?.Properties[0]?.propertyId}&tenantId=${propertyDetails?.Properties[0]?.tenantId}`}
                >
                  <LinkButton style={{ textAlign: "left" }} label={t("PT_VIEW_MORE_DETAILS")} />
                </Link>
                <Link
                  to={getChangePropertyPath()}
                >
                  <LinkButton style={{ textAlign: "left" }} label={t("PT_CHANGE_PROPERTY")} onClick={() => {sessionStorage.setItem("changePropertySelected", "yes"); sessionStorage.setItem("EditFormData", JSON.stringify(formData))}} />
                </Link>
              </div>
            </StatusTable>
            </div>

            {/* ── Property Location Map ── */}
            {(propertyDetails?.Properties[0]?.address?.geoLocation?.latitude || propertyDetails?.Properties[0]?.address?.geoLocation?.longitude) && (
              <div style={{
                background: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                padding: "24px 28px",
                marginBottom: "24px",
                border: "1px solid #e8ecf0",
                fontFamily: "'Roboto', sans-serif",
              }}>
                <div style={{
                  fontSize: "15px", fontWeight: "700", color: "#1a2b49",
                  marginBottom: "12px", paddingBottom: "8px",
                  borderBottom: "2px solid #f47738", letterSpacing: "0.3px",
                }}>
                  📍 {t("PT_PROPERTY_LOCATION_ON_MAP") || "Property Location on Map"}
                </div>
                <PTMapPicker
                  lat={propertyDetails?.Properties[0]?.address?.geoLocation?.latitude}
                  lng={propertyDetails?.Properties[0]?.address?.geoLocation?.longitude}
                  onLocationSelect={() => {}}
                  t={t}
                />
                {console.log("[PropertyDetails] geoLocation:", propertyDetails?.Properties[0]?.address?.geoLocation)}
              </div>
            )}

            {/* ── Action button ── */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
              <button
                onClick={goNext}
                style={{
                  flex: 1, minWidth: "180px",
                  background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
                  color: "#fff", border: "none",
                  borderRadius: "8px", padding: "14px 28px",
                  fontSize: "15px", fontWeight: "700",
                  cursor: "pointer", letterSpacing: "0.3px",
                  boxShadow: "0 4px 12px rgba(244,119,56,0.35)",
                  transition: "all 0.2s",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {t("CS_COMMON_NEXT")} →
              </button>
            </div>

          </React.Fragment>
        )}
      </FormStep>
    </React.Fragment>
  );
};
export default PropertyDetails;