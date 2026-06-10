import { Banner, Card, CardText, LinkButton, LinkLabel, Loader, Row, StatusTable, SubmitBar } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import getPTAcknowledgementData from "../../../getPTAcknowledgementData";
import { convertToProperty, convertToUpdateProperty } from "../../../utils";

const GetActionMessage = (props) => {
  const { t } = useTranslation();
  if (props.isSuccess) {
    return !window.location.href.includes("edit-application") ? t("CS_PROPERTY_APPLICATION_SUCCESS") : t("CS_PROPERTY_UPDATE_APPLICATION_SUCCESS");
  } else if (props.isLoading) {
    return !window.location.href.includes("edit-application") ? t("CS_PROPERTY_APPLICATION_PENDING") : t("CS_PROPERTY_UPDATE_APPLICATION_PENDING");
  } else if (!props.isSuccess) {
    return !window.location.href.includes("edit-application") ? t("CS_PROPERTY_APPLICATION_FAILED") : t("CS_PROPERTY_UPDATE_APPLICATION_FAILED");
  }
};

const rowContainerStyle = {
  padding: "4px 0px",
  justifyContent: "space-between",
};

const BannerPicker = (props) => {
  return (
    <Banner
      message={GetActionMessage(props)}
      applicationNumber={props.data?.Properties?.[0]?.acknowldgementNumber}
      info={props.isSuccess ? props.t("PT_APPLICATION_NO") : ""}
      successful={props.isSuccess}
      style={{width: "100%"}}
    />
  );
};

const PTAcknowledgement = ({ data, onSuccess }) => {
  const { t } = useTranslation();
  const [localError, setLocalError] = useState(null);
  const isPropertyMutation = window.location.href.includes("property-mutation");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const mutation = Digit.Hooks.pt.usePropertyAPI(
    data?.address?.city ? data.address?.city?.code : tenantId,
    !window.location.href.includes("edit-application") && !isPropertyMutation
  );
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const match = useRouteMatch();
  const { tenants } = storeData || {};

  useEffect(() => {
    try {
      const resolvedTenantId = isPropertyMutation ? data?.Property?.address?.tenantId : data?.address?.city?.code || tenantId;
      data.tenantId = resolvedTenantId;
      console.log("isPropertyMutation",isPropertyMutation,data)
      let formdata = !window.location.href.includes("edit-application")
        ? isPropertyMutation
          ? data
          : convertToProperty(data)
        : convertToUpdateProperty(data,t);
      formdata.Property.tenantId = formdata?.Property?.tenantId || resolvedTenantId;

      const ownershipCategory = formdata?.Property?.ownershipCategory;
      if (typeof ownershipCategory === "string" && ownershipCategory.includes("INSTITUTIONAL") && Array.isArray(formdata?.Property?.owners)) {
        formdata.Property.owners = formdata.Property.owners.map((owner) => ({
          ...owner,
          altContactNumber: owner?.altContactNumber || owner?.mobileNumber,
        }));
      }

      mutation.mutate(formdata, {
        onSuccess,
        onError: (err) => {
          setLocalError(err?.response?.data?.Errors?.[0]?.message || err?.message || t("CS_PROPERTY_APPLICATION_FAILED"));
        },
      });
    } catch (err) {
      console.log("error",err)
      setLocalError(err?.message || t("CS_PROPERTY_APPLICATION_FAILED"));
    }
  }, []);

  const handleDownloadPdf = async () => {
    const { Properties = [] } = mutation.data;
    const baseProperty = (Properties && Properties[0]) || {};
    const searchTenantId = baseProperty?.tenantId || tenantId;
    const preferNonEmpty = (primary = {}, secondary = {}) => {
      const merged = { ...secondary };
      Object.keys(primary || {}).forEach((key) => {
        const v = primary[key];
        if (v !== undefined && v !== null && v !== "") merged[key] = v;
      });
      return merged;
    };

    // Fetch full property payload so PDF fields do not resolve to NA due to partial mutation response.
    // propertyId is only assigned after approval; skip search if not yet assigned.
    let activeProperty = {};
    if (baseProperty?.propertyId) {
      const activePropertySearch = await Digit.PTService.search({ tenantId: searchTenantId, filters: { propertyIds: baseProperty?.propertyId } });
      activeProperty = activePropertySearch?.Properties?.find((p) => p?.status === "ACTIVE") || activePropertySearch?.Properties?.[0] || {};
    }
    const ownersCount = Math.max(activeProperty?.owners?.length || 0, baseProperty?.owners?.length || 0);
    const mergedOwners = Array.from({ length: ownersCount }, (_, index) =>
      preferNonEmpty(baseProperty?.owners?.[index] || {}, activeProperty?.owners?.[index] || {})
    ).filter((o) => Object.keys(o || {}).length > 0);

    const mergedInstitution = preferNonEmpty(baseProperty?.institution || {}, activeProperty?.institution || {});

    const Property = {
      ...preferNonEmpty(baseProperty || {}, activeProperty || {}),
      additionalDetails: preferNonEmpty(baseProperty?.additionalDetails || {}, activeProperty?.additionalDetails || {}),
      units: (activeProperty?.units && activeProperty?.units.length > 0 ? activeProperty?.units : baseProperty?.units) || [],
      owners: mergedOwners.length > 0 ? mergedOwners : baseProperty?.owners || activeProperty?.owners || [],
      institution: mergedInstitution,
    };

    if (Property?.creationReason === "MUTATION") {
      const inactivePropertySearch = await Digit.PTService.search({ tenantId: searchTenantId, filters: { propertyIds: Property?.propertyId, status: "INACTIVE" } });
      Property.transferorDetails = inactivePropertySearch?.Properties?.[0] || [];
      Property.isTransferor = true;
      Property.transferorOwnershipCategory = inactivePropertySearch?.Properties?.[0]?.ownershipCategory;
    }

    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const data = await getPTAcknowledgementData({ ...Property }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };

  return !localError && (mutation.isLoading || mutation.isIdle) ? (
    <Loader />
  ) : (
    <Card>
      <BannerPicker t={t} data={mutation.data} isSuccess={mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} />
      {mutation.isSuccess && <CardText>{t("CS_FILE_PROPERTY_RESPONSE")}</CardText>}
      {!mutation.isSuccess && <CardText>{t("CS_FILE_PROPERTY_FAILED_RESPONSE")}. {localError || mutation.error?.response?.data?.Errors?.[0]?.message || mutation.error?.message || ""} </CardText>}
      {/* {mutation.isSuccess && (
        <LinkButton
          label={
            <div className="response-download-button">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a82227">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
              </span>
              <span className="download-button">{t("CS_COMMON_DOWNLOAD")}</span> 
            </div>
          }
          onClick={handleDownloadPdf}
          className="w-full"
        />)}*/}
      <StatusTable>
        {mutation.isSuccess && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("PT_COMMON_TABLE_COL_PT_ID")}
            text={mutation?.data?.Properties[0]?.propertyId || t("PT_PROPERTY_ID_PENDING_APPROVAL")}
            textStyle={{ whiteSpace: "pre", width: "60%" }}
          />
        )}
      </StatusTable>
      {/* {mutation.isSuccess && <Link to={`/suda-ui/citizen/feedback?redirectedFrom=${match.path}&propertyId=${mutation.isSuccess ? mutation?.data?.Properties[0]?.propertyId : ""}&acknowldgementNumber=${mutation.isSuccess ? mutation?.data?.Properties[0]?.acknowldgementNumber : ""}&creationReason=${mutation.isSuccess ? mutation?.data?.Properties[0]?.creationReason : ""}&tenantId=${mutation.isSuccess ? mutation?.data?.Properties[0]?.tenantId : ""}&locality=${mutation.isSuccess ? mutation?.data?.Properties[0]?.address?.locality?.code : ""}`}>
          <SubmitBar label={t("CS_REVIEW_AND_FEEDBACK")}/>
      </Link>} */}
      {mutation.isSuccess && <SubmitBar label={t("PT_DOWNLOAD_ACK_FORM")} onSubmit={handleDownloadPdf} />}
      <Link to={`/suda-ui/citizen`}>
        <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
    </Card>
  );
};

export default PTAcknowledgement;
