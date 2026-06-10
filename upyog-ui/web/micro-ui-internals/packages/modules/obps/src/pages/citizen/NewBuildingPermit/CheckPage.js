import {
    Card, CardHeader, CardSubHeader, CardText,
    CitizenInfoLabel, Header, LinkButton, Row, StatusTable, SubmitBar, Table, CardSectionHeader, EditIcon, PDFSvg, Loader
  } from "@upyog/digit-ui-react-components";
  import React,{ useMemo, useEffect }  from "react";
  import { useTranslation } from "react-i18next";
  import { useHistory, useRouteMatch } from "react-router-dom";
  import Timeline from "../../../components/Timeline";
  import { convertEpochToDateDMY, stringReplaceAll, getOrderDocuments } from "../../../utils";
  import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
  import { format } from "date-fns";
  import { PreApprovedPlanService } from "../../../../../../libraries/src/services/elements/PREAPPROVEDPLAN";
  import usePreApprovedSearch from "../../../../../../libraries/src/hooks/obps/usePreApprovedSearch";
  import useEstimateDetails from "../../../../../../libraries/src/hooks/obps/useEstimateDetails";

  const CheckPage = ({ onSubmit, value }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const match = useRouteMatch();
    let user = Digit.UserService.getUser();
    const tenantId = Digit.ULBService.getCurrentTenantId() || user?.info?.permanentCity || value?.tenantId;
  
    let BusinessService;
    if(value.businessService === "BPA_LOW")
    BusinessService="BPA.LOW_RISK_PERMIT_FEE";
    else if(value.businessService === "BPA"||value.businessService ==="BPA-PAP")
    BusinessService="BPA.NC_APP_FEE";
    const checkingFlow = value?.businessService==="BPA-PAP"?"PRE_APPROVE":"";
    const { data, address, owners, nocDocuments, documents, additionalDetails, subOccupancy,PrevStateDocuments,PrevStateNocDocuments,applicationNo } = value;
    
    const isEditApplication = window.location.href.includes("editApplication");
    
      // for application documents
      let improvedDoc = [];
      PrevStateDocuments?.map(preDoc => { improvedDoc.push({...preDoc, module: "OBPS"}) });
      documents?.documents?.map(appDoc => { improvedDoc.push({...appDoc, module: "OBPS"}) });

      //for NOC documents 
      PrevStateNocDocuments?.map(preNocDoc => { improvedDoc.push({...preNocDoc, module: "NOC"}) });
      nocDocuments?.nocDocuments?.map(nocDoc => { improvedDoc.push({...nocDoc, module: "NOC"}) });

      const { data: pdfDetails, isLoading:pdfLoading, error } = Digit.Hooks.useDocumentSearch( improvedDoc, { enabled: improvedDoc?.length > 0 ? true : false});
      
      let applicationDocs = [], nocAppDocs = [];
      if (pdfDetails?.pdfFiles?.length > 0) {  
        pdfDetails?.pdfFiles?.map(pdfAppDoc => {
          if (pdfAppDoc?.module == "OBPS") applicationDocs.push(pdfAppDoc);
          if (pdfAppDoc?.module == "NOC") nocAppDocs.push(pdfAppDoc);
        });
      }

    const { data:datafromAPI, isLoading, refetch } = Digit.Hooks.obps.useScrutinyDetails(tenantId,value?.data?.scrutinyNumber, {
        enabled: value?.data?.scrutinyNumber.length!==8?true:false,
      })
      const CalculationCriteria=JSON.parse(sessionStorage.getItem("CalculationCriteria"))
      const { data: preApprovedResponse} = usePreApprovedSearch({drawingNo:value?.edcrNumber})
      const estimateResponse = useEstimateDetails({CalulationCriteria:CalculationCriteria}, true, null)       
    let consumerCode=value?.applicationNo;
    const fetchBillParams = { consumerCode };

    function getdate(date) {
      let newdate = Date.parse(date);
      return `${new Date(newdate).getDate().toString() + "/" + (new Date(newdate).getMonth() + 1).toString() + "/" + new Date(newdate).getFullYear().toString()
        }`;
    }


    const ActionButton = ({ label, jumpTo }) => {
      const { t } = useTranslation();
      const history = useHistory();
      function routeTo() {
        location.href = jumpTo;
      }
      return <LinkButton label={t(label)} onClick={routeTo} />;
    };
      const {data:paymentDetails} = Digit.Hooks.useFetchBillsForBuissnessService(
        { businessService: BusinessService, ...fetchBillParams, tenantId: tenantId },
        {
          enabled: consumerCode ? true : false,
          retry: false,
        }
      );

      const sendbacktocitizenApp = window.location.href.includes("sendbacktocitizen");
      let routeLink = value?.businessService==="BPA-PAP" ? `/suda-ui/citizen/obps/preApprovedPlan`:`/suda-ui/citizen/obps/bpa/${additionalDetails?.applicationType.toLowerCase()}/${additionalDetails?.serviceType.toLowerCase()}`;
      if (isEditApplication) routeLink = `/suda-ui/citizen/obps/editApplication/bpa/${value?.tenantId}/${value?.applicationNo}`;
      if( sendbacktocitizenApp ) routeLink = `/suda-ui/citizen/obps/sendbacktocitizen/bpa/${value?.tenantId}/${value?.applicationNo}`;

      const tableHeader = [
        {
            name:"BPA_TABLE_COL_FLOOR",
            id:"Floor",
        },
        {
            name:"BPA_TABLE_COL_LEVEL",
            id:"Level",
        },
        {
            name:"BPA_TABLE_COL_OCCUPANCY",
            id:"Occupancy",
        },
        {
            name:"BPA_TABLE_COL_BUILDUPAREA",
            id:"BuildupArea",
        },
        {
            name:"BPA_TABLE_COL_FLOORAREA",
            id:"FloorArea",
        },
        {
            name:"BPA_TABLE_COL_CARPETAREA",
            id:"CarpetArea",
        }
    ]

    const accessData = (plot) => {
        const name = plot;
        return (originalRow, rowIndex, columns) => { 
          return originalRow[name];
        }
      }


      const tableColumns = useMemo(
        () => {
          
          return tableHeader.map((ob)=> ({
            Header:t(`${ob.name}`),
            accessor: accessData(ob.id),
            id: ob.id,
            //symbol: plot?.symbol,
            //sortType: sortRows,
          }));
    
              
        });


      function getFloorData(block){
        let floors = [];
        block?.building?.floors.map((ob) => {
          floors.push({
            Floor: ob?.floorName||t(`BPA_FLOOR_NAME_${ob.number}`),
            Level: ob?.number || ob?.floorNo,
            Occupancy:  value?.data?.occupancyType,
            BuildupArea: ob?.occupancies?.[0]?.builtUpArea || ob?.builtUpArea,
            FloorArea: ob?.occupancies?.[0]?.floorArea || ob?.builtUpArea,
            CarpetArea: ob?.occupancies?.[0]?.carpetArea || 0,
            key: ob?.floorName||t(`BPA_FLOOR_NAME_${ob.number}`),
          });
        });
        return floors;
      }

      function routeTo(jumpTo) {
        location.href=jumpTo;
    }

    function getBlockSubOccupancy(index){
      let subOccupancyString = "";
      let returnValueArray = [];
      subOccupancy && subOccupancy[`Block_${index+1}`] && subOccupancy[`Block_${index+1}`].map((ob) => {
        // subOccupancyString += `${t(ob.i18nKey)}, `;
        returnValueArray.push(`${t(stringReplaceAll(ob?.i18nKey?.toUpperCase(), "-", "_"))}`);
      })
      return returnValueArray?.length ? returnValueArray.join(', ') : "NA"
      // return subOccupancyString;
    }

    if (pdfLoading || isLoading) {
      return <Loader />
    }

    /* ── helpers ── */
    const SectionHeader = ({ title, onEdit, editRoute }) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "2px solid #1D2D50", marginBottom: "16px", paddingBottom: "8px", marginTop: "28px" }}>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#1D2D50", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </span>
        {onEdit && (
          <LinkButton
            label={<EditIcon />}
            style={{ width: "auto", minWidth: "unset" }}
            onClick={() => routeTo(editRoute)}
          />
        )}
      </div>
    );

    const InfoRow = ({ label, value, valueStyle }) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "10px 0", borderBottom: "1px solid #f0f2f5", gap: "16px" }}>
        <span style={{ fontSize: "14px", color: "#505A5F", fontWeight: "500", minWidth: "180px", flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: "14px", color: "#0B0C0C", fontWeight: "600", textAlign: "right", wordBreak: "break-word", ...valueStyle }}>{value || t("CS_NA")}</span>
      </div>
    );

    return (
    <React.Fragment>
    <Timeline currentStep={checkingFlow==="PRE_APPROVE"? 8 : 4 } flow={checkingFlow}/>

    {/* ── Page header ── */}
    <div style={{ background: "linear-gradient(135deg, #1D2D50 0%, #2d4a7a 100%)", borderRadius: "12px",
      padding: "24px 28px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "4px" }}>
          {t("BPA_BUILDING_PERMIT") || "Building Permit"}
        </div>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>{t("BPA_STEPPER_SUMMARY_HEADER")}</h2>
      </div>
      {applicationNo && (
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px" }}>
          {applicationNo}
        </div>
      )}
    </div>

    {/* ── Main card ── */}
    <Card style={{ padding: "8px 24px 24px", maxWidth: "960px" }} className="employeeCard-override">

      {/* Application Overview */}
      <SectionHeader title={t("BPA_BASIC_DETAILS_TITLE")} />
      <InfoRow label={t("BPA_APPLICATION_NUMBER_LABEL")} value={applicationNo} />
      <InfoRow label={t("BPA_IS_PREAPPROVED")} value={t(value?.additionalDetails?.isPreApproved ? value?.additionalDetails?.isPreApproved : value.businessService==="BPA-PAP" ? "true" : "false")} />
      <InfoRow label={t("BPA_BASIC_DETAILS_APP_DATE_LABEL")} value={data?.applicationDate} />
      <InfoRow label={t("BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL")} value={t(`WF_BPA_${data?.applicationType}`)} />
      <InfoRow label={t("BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL")} value={t(data?.serviceType)} />
      <InfoRow label={t("BPA_BASIC_DETAILS_OCCUPANCY_LABEL")} value={data?.occupancyType} />
      <InfoRow label={t("BPA_BASIC_DETAILS_RISK_TYPE_LABEL")} value={t(`WF_BPA_${data?.riskType}`)} />
      <InfoRow label={t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")} value={data?.applicantName} />

      {/* Plot Details */}
      <SectionHeader title={t("BPA_PLOT_DETAILS_TITLE")} onEdit editRoute={`${routeLink}/plot-details`} />
      <InfoRow label={t("BPA_BOUNDARY_PLOT_AREA_LABEL")} value={datafromAPI?.planDetail?.planInformation?.plotArea ? `${datafromAPI?.planDetail?.planInformation?.plotArea} ${t("BPA_SQ_FT_LABEL")}` : `${preApprovedResponse?.[0]?.drawingDetail?.plotArea} ${t("BPA_SQ_FT_LABEL")}`} />
      <InfoRow label={t("BPA_PLOT_NUMBER_LABEL")} value={datafromAPI?.planDetail?.planInformation?.plotNo || value?.additionalDetails?.plotNo} />
      <InfoRow label={t("BPA_KHATHA_NUMBER_LABEL")} value={datafromAPI?.planDetail?.planInformation?.khataNo || value?.additionalDetails?.khataNo} />
      <InfoRow label={t("BPA_HOLDING_NUMBER_LABEL")} value={value?.additionalDetails?.holdingNo || data?.holdingNumber} />
      <InfoRow label={t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL")} value={value?.additionalDetails?.registrationDetails || data?.registrationDetails} />

      {/* Scrutiny / Plan Details */}
      <SectionHeader title={value.businessService==="BPA-PAP" ? t("BPA_STEPPER_PLAN_DETAILS_HEADER") : t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER")} />
      <InfoRow label={value.businessService==="BPA-PAP" ? t("BPA_DRAWING_NUMBER") : t("BPA_EDCR_NO_LABEL")} value={data?.scrutinyNumber?.edcrNumber || value?.edcrNumber} />

      {/* Building extract */}
      <div style={{ background: "#F7F8FD", borderRadius: "8px", padding: "14px 18px", marginBottom: "12px", marginTop: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#1D2D50", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          {preApprovedResponse?.[0]?.drawingDetail ? t("BPA_BUILDING_EXTRACT_DETAILS") : t("BPA_BUILDING_EXTRACT_HEADER")}
        </div>
        <InfoRow label={t("BPA_TOTAL_BUILT_UP_AREA_HEADER")} value={`${preApprovedResponse?.[0]?.drawingDetail?.totalBuitUpArea || datafromAPI?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea || ""} ${t("BPA_SQ_MTRS_LABEL")}`} />
        <InfoRow label={t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")} value={datafromAPI?.planDetail?.blocks?.[0]?.building?.totalFloors || preApprovedResponse?.[0]?.drawingDetail?.blocks?.[0]?.building?.totalFloors} />
        <InfoRow label={t("BPA_HEIGHT_FROM_GROUND_LEVEL_FROM_MUMTY")} value={`${preApprovedResponse?.[0]?.drawingDetail?.blocks?.[0]?.building?.buildingHeight || datafromAPI?.planDetail?.blocks?.[0]?.building?.declaredBuildingHeight || ""} ${t("BPA_MTRS_LABEL")}`} />
      </div>

      {/* Block / Sub-occupancy */}
      {datafromAPI?.planDetail?.blocks?.map((block, index) => (
        <div key={index} style={{ background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: "8px", padding: "14px 18px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1D2D50", marginBottom: "8px" }}>
            {t("BPA_BLOCK_SUBHEADER")} {index + 1}
          </div>
          <InfoRow label={t("BPA_SUB_OCCUPANCY_LABEL")} value={getBlockSubOccupancy(index) || t("CS_NA")} />
          <div style={{ overflowX: "auto", marginTop: "8px" }}>
            <Table
              className="customTable table-fixed-first-column table-border-style"
              t={t} disableSort={false} autoSort={true} manualPagination={false} isPaginationRequired={false}
              initSortId="S N " data={getFloorData(block)} columns={tableColumns}
              getCellProps={() => ({ style: {} })}
            />
          </div>
        </div>
      ))}
      {preApprovedResponse?.[0]?.drawingDetail?.blocks?.map((block, index) => (
        <div key={index} style={{ background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: "8px", padding: "14px 18px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1D2D50", marginBottom: "8px" }}>
            {t("BPA_BLOCK_SUBHEADER")} {index + 1}
          </div>
          <div style={{ overflowX: "auto", marginTop: "8px" }}>
            <Table
              className="customTable table-fixed-first-column table-border-style"
              t={t} disableSort={false} autoSort={true} manualPagination={false} isPaginationRequired={false}
              initSortId="S N " data={getFloorData(block)} columns={tableColumns}
              getCellProps={() => ({ style: {} })}
            />
          </div>
        </div>
      ))}

      {datafromAPI?.planReport && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            onClick={() => routeTo(datafromAPI?.updatedDxfFile || preApprovedResponse?.[0]?.documents?.find(d => d?.additionalDetails?.fileName?.includes("pdf"))?.additionalDetails?.fileUrl)}>
            <PDFSvg />
            <span style={{ fontSize: "13px", color: "#1D70B8" }}>{datafromAPI?.updatedDxfFile ? t("BPA_UPLOADED_PLAN_DXF") : t("BPA_UPLOADED_PLAN_PDF")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            onClick={() => routeTo(datafromAPI?.planReport)}>
            <PDFSvg />
            <span style={{ fontSize: "13px", color: "#1D70B8" }}>{t("BPA_SCRUTINY_REPORT_PDF")}</span>
          </div>
        </div>
      )}

      <InfoRow label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")} value={datafromAPI?.planDetail?.planInformation?.demolitionArea ? `${datafromAPI?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}` : t("CS_NA")} />

      {/* Location */}
      <SectionHeader title={t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS")} onEdit editRoute={`${routeLink}/location`} />
      <InfoRow label={t("BPA_DETAILS_PIN_LABEL")} value={address?.pincode} />
      <InfoRow label={t("BPA_CITY_LABEL")} value={address?.city?.name} />
      <InfoRow label={t("BPA_LOC_MOHALLA_LABEL")} value={address?.locality?.name} />
      <InfoRow label={t("BPA_DETAILS_SRT_NAME_LABEL")} value={address?.street} />
      <InfoRow label={t("ES_NEW_APPLICATION_LOCATION_LANDMARK")} value={address?.landmark} />

      {/* Applicant Details */}
      <SectionHeader title={t("BPA_APPLICANT_DETAILS_HEADER")} onEdit editRoute={`${routeLink}/owner-details`} />
      {owners?.owners?.map((ob, index) => (
        <div key={index} style={owners.owners.length > 1 ? { background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: "8px", padding: "14px 18px", marginBottom: "12px" } : {}}>
          {owners.owners.length > 1 && (
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1D2D50", marginBottom: "8px" }}>{t("COMMON_OWNER")} {index + 1}</div>
          )}
          <InfoRow label={t("CORE_COMMON_NAME")} value={ob?.name} />
          <InfoRow label={t("BPA_APPLICANT_GENDER_LABEL")} value={t(ob?.gender?.i18nKey || ob?.gender)} />
          <InfoRow label={t("CORE_COMMON_MOBILE_NUMBER")} value={ob?.mobileNumber} />
          {value.businessService === "BPA-PAP"
            ? <InfoRow label={t("PRIMARY_OWNER_LABEL")} value={owners.owners.length === 1 ? "Single Owner" : "Multiple Owner"} />
            : <InfoRow label={t("BPA_IS_PRIMARY_OWNER_LABEL")} value={`${ob?.isPrimaryOwner ? ob.isPrimaryOwner : owners.owners.length === 1 ? "true" : ""}`} />
          }
        </div>
      ))}

      {/* Documents */}
      <SectionHeader title={t("BPA_DOCUMENT_DETAILS_LABEL")} onEdit editRoute={`${routeLink}/document-details`} />
      <div style={{ marginBottom: "12px" }}>
        {<DocumentsPreview documents={getOrderDocuments(applicationDocs)} svgStyles={{}} isSendBackFlow={false} isHrLine={true}
          titleStyles={{ fontSize: "15px", lineHeight: "22px", fontWeight: 700, marginBottom: "10px" }} />}
      </div>

      {/* NOC Details */}
      {nocDocuments?.NocDetails?.map((noc, index) => (
        <div key={`noc-${index}`} style={{ background: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: "8px", padding: "14px 18px", marginBottom: "12px" }}>
          <SectionHeader title={`${t("BPA_NOC_DETAILS_SUMMARY")} – ${t(`BPA_${noc?.nocType}_HEADER`)}`} onEdit editRoute={`${routeLink}/noc-details`} />
          <InfoRow label={t(`BPA_${noc?.nocType}_LABEL`)} value={noc?.applicationNo} />
          <InfoRow label={t("BPA_NOC_STATUS")} value={t(noc?.applicationStatus)}
            valueStyle={noc?.applicationStatus === "APPROVED" || noc?.applicationStatus === "AUTO_APPROVED" ? { color: "#00703C" } : { color: "#D4351C" }} />
          {noc?.additionalDetails?.SubmittedOn && <InfoRow label={t("BPA_NOC_SUBMISSION_DATE")} value={convertEpochToDateDMY(Number(noc?.additionalDetails?.SubmittedOn))} />}
          {noc?.nocNo && <InfoRow label={t("BPA_APPROVAL_NUMBER_LABEL")} value={noc?.nocNo} />}
          {(noc?.applicationStatus === "APPROVED" || noc?.applicationStatus === "REJECTED" || noc?.applicationStatus === "AUTO_APPROVED" || noc?.applicationStatus === "AUTO_REJECTED") &&
            <InfoRow label={t("BPA_APPROVED_REJECTED_ON_LABEL")} value={convertEpochToDateDMY(Number(noc?.auditDetails?.lastModifiedTime))} />}
          {<DocumentsPreview documents={getOrderDocuments(nocAppDocs?.filter(d => d?.documentType?.includes(noc?.nocType?.split("_")?.[0])), true)}
            svgStyles={{}} isSendBackFlow={false} isHrLine={true} titleStyles={{ fontSize: "15px", lineHeight: "22px", fontWeight: 700, marginBottom: "10px" }} />}
        </div>
      ))}

      {/* Fee Summary */}
      <SectionHeader title={t("BPA_SUMMARY_FEE_EST")} />
      {paymentDetails?.Bill?.[0]?.billDetails?.[0]?.billAccountDetails?.map((bill, index) => (
        <InfoRow key={index} label={t(bill.taxHeadCode)} value={`₹ ${bill?.amount}`} />
      ))}

      {/* Total Amount + Submit */}
      <div style={{ background: "linear-gradient(135deg, #1D2D50 0%, #2d4a7a 100%)", borderRadius: "10px",
        padding: "20px 24px", marginTop: "24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
            {t("BPA_COMMON_TOTAL_AMT")}
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#fff" }}>
            ₹ {paymentDetails?.Bill?.[0]?.billDetails?.[0]?.amount || "0"}
          </div>
        </div>
        <SubmitBar label={value.businessService === "BPA-PAP" ? t("SUBMIT") : t("BPA_SEND_TO_CITIZEN_LABEL")} onSubmit={onSubmit} />
      </div>

    </Card>
    </React.Fragment>
    );
  };
  
  export default CheckPage;
  