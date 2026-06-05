import {
  FormStep,
  MultiSelectDropdown,
  Table,
  Row,
  CardSubHeader,
  StatusTable,
  LinkButton,
  CardSectionHeader,
  RemoveableTag,
  Toast,
  Loader,
} from "@upyog/digit-ui-react-components";
import React, { useEffect, useState, useMemo } from "react";
import { render } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import Timeline from "../components/Timeline";
import { stringReplaceAll } from "../utils";

const ScrutinyDetails = ({ onSelect, userType, formData, config }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [subOccupancy, setsubOccupancy] = useState([]);
  const [subOccupancyObject, setsubOccupancyObject] = useState(formData?.subOccupancy || formData?.landInfo?.unit || {});
  const [subOccupancyOption, setsubOccupancyOption] = useState([]);
  const [floorData, setfloorData] = useState([]);
  //let scrutinyNumber = `DCR82021WY7QW`;
  let user = Digit.UserService.getUser();
  const stateId = Digit.ULBService.getStateId();
  const tenantId = user?.info?.permanentCity ||
    user?.info?.roles?.find(r => r.tenantId && r.tenantId !== stateId)?.tenantId ||
    Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow ? formData?.uiFlow?.flow : formData?.selectedPlot||formData?.businessService==="BPA-PAP" ? "PRE_APPROVE" : "";
  const [showToast, setShowToast] = useState(null);
  const stateCode = Digit.ULBService.getStateId();
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["SubOccupancyType"]);
  const { data, isLoading, refetch } = Digit.Hooks.obps.useScrutinyDetails(tenantId, formData?.data?.scrutinyNumber, {
    enabled: formData?.data?.scrutinyNumber.length!==8 ? true: false,
  });


  function getFloorData(block) {
    let floors = [];
    block?.building?.floors?.map((ob) => {
      floors.push({
        Floor: ob?.floorName||t(`BPA_FLOOR_NAME_${ob.number}`),
        Level: ob?.number || ob?.floorNo,
        Occupancy: formData?.data?.occupancyType,
        BuildupArea: ob?.occupancies?.[0]?.builtUpArea || ob?.builtUpArea,
        FloorArea: ob?.occupancies?.[0]?.floorArea || ob?.builtUpArea,
        CarpetArea: ob?.occupancies?.[0]?.carpetArea || 0,
        key: ob?.floorName||t(`BPA_FLOOR_NAME_${ob.number}`),
      });
    });
    return floors;
  }

  function getsuboptions() {
    let suboccoption = [];
    // data &&
      // data?.planDetail?.mdmsMasterData?.SubOccupancyType?.map((ob) => {
        mdmsData?.BPA?.SubOccupancyType?.map((ob) => {
        suboccoption.push({ code: ob.code, name: ob.name, i18nKey: `BPA_SUBOCCUPANCYTYPE_${stringReplaceAll(ob?.code?.toUpperCase(), "-", "_")}` });
      });
    return Digit.Utils.locale.sortDropdownNames(suboccoption,'i18nKey',t);
  }

  const ActionButton = ({ label, jumpTo }) => {
    const { t } = useTranslation();
    const history = useHistory();
    function routeTo() {
      location.href = jumpTo;
    }
    return <LinkButton label={t(label)} onClick={routeTo} />;
  };

  const tableHeader = [
    {
      name: "BPA_TABLE_COL_FLOOR",
      id: "Floor",
    },
    {
      name: "BPA_TABLE_COL_LEVEL",
      id: "Level",
    },
    {
      name: "BPA_TABLE_COL_OCCUPANCY",
      id: "Occupancy",
    },
    {
      name: "BPA_TABLE_COL_BUILDUPAREA",
      id: "BuildupArea",
    },
    {
      name: "BPA_TABLE_COL_FLOORAREA",
      id: "FloorArea",
    },
    {
      name: "BPA_TABLE_COL_CARPETAREA",
      id: "CarpetArea",
    },
  ];
  const selectOccupancy = (e, data, num) => {
    let blocks = subOccupancyObject;
    let newSubOccupancy = [];
    e &&
      e?.map((ob) => {
        newSubOccupancy.push(ob?.[1]);
      });
    blocks[`Block_${num}`] = newSubOccupancy;
    setsubOccupancy(newSubOccupancy);
    setsubOccupancyObject(blocks);
  };

  const onRemove = (index, key, num) => {
    let afterRemove = subOccupancyObject[`Block_${num}`].filter((value, i) => {
      return i !== index;
    });
    setsubOccupancy(afterRemove);
    let temp = subOccupancyObject;
    temp[`Block_${num}`] = afterRemove;
    setsubOccupancyObject(temp);
  };

  const accessData = (plot) => {
    const name = plot;
    return (originalRow, rowIndex, columns) => {
      return originalRow[name];
    };
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const tableColumns = useMemo(() => {
    return tableHeader?.map((ob) => ({
      Header: t(`${ob.name}`),
      accessor: accessData(ob.id),
      id: ob.id,
      //symbol: plot?.symbol,
      //sortType: sortRows,
    }));
  });

  const onSkip = () => onSelect();

  const goNext = () => {
    if (checkingFlow === "OCBPA") {
      if (!formData?.id) {
        let payload = {};
        payload.edcrNumber = formData?.edcrNumber?.edcrNumber ? formData?.edcrNumber?.edcrNumber : formData?.data?.scrutinyNumber?.edcrNumber ? formData?.data?.scrutinyNumber?.edcrNumber : formData?.edcrDetails?.scrutinyNumber;
        payload.riskType = formData?.data?.riskType;
        payload.applicationType = formData?.data?.applicationType;
        payload.serviceType = formData?.data?.serviceType;

        const userInfo = Digit.UserService.getUser();
        const accountId = userInfo?.info?.uuid;
        payload.tenantId = formData?.data?.bpaData?.bpaApprovalResponse?.[0]?.landInfo?.tenantId;
        payload.workflow = { action: "INITIATE", assignes : [userInfo?.info?.uuid] };
        payload.accountId = accountId;
        payload.documents = null;

        // Additonal details
        payload.additionalDetails = {};
        if (formData?.data?.holdingNumber) payload.additionalDetails.holdingNo = formData?.data?.holdingNumber;
        if (formData?.data?.boundaryWallLength) payload.additionalDetails.boundaryWallLength = formData?.data?.boundaryWallLength;
        if (formData?.data?.registrationDetails) payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails;
        if (formData?.data?.applicationType) payload.additionalDetails.applicationType = formData?.data?.applicationType;
        if (formData?.data?.serviceType) payload.additionalDetails.serviceType = formData?.data?.serviceType;
        if(formData?.data?.bpaData?.bpaApprovalResponse[0]?.additionalDetails?.propertyID) payload.additionalDetails.propertyID=formData?.data?.bpaData?.bpaApprovalResponse[0]?.additionalDetails?.propertyID

        //For LandInfo
        payload.landInfo = formData?.data?.bpaData?.bpaApprovalResponse?.[0].landInfo || {};

        let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
        let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
        payload.additionalDetails.typeOfArchitect = parsedArchitectName;
        // create BPA call
        Digit.OBPSService.create({ BPA: payload }, tenantId)
          .then((result, err) => {
            if (result?.BPA?.length > 0) {
              result.BPA[0].data = formData.data;
              result.BPA[0].uiFlow = formData?.uiFlow;
              onSelect("", result.BPA[0], "", true);
            }
          })
          .catch((e) => {
            setShowToast({ key: "true", message: e?.response?.data?.Errors[0]?.message || null });
          });
      } else {
        onSelect("", formData, "", true);
      }
    } else {
      onSelect(config.key, subOccupancyObject);
    }
  };

  const clearall = (num) => {
    let res = [];
    let temp = subOccupancyObject;
    temp[`Block_${num}`] = res;
    setsubOccupancy(res);
    setsubOccupancyObject(temp);
  };

  function getSubOccupancyValues(index) {
    let values = formData?.data?.bpaData?.bpaApprovalResponse?.[0]?.landInfo?.unit;
    let returnValue = "";
    if (values?.length > 0) {
      let splitArray = values[index]?.usageCategory?.split(",");
      if (splitArray?.length) {
        const returnValueArray = splitArray?.map((data) =>
          data ? `${t(`BPA_SUBOCCUPANCYTYPE_${stringReplaceAll(data?.toUpperCase(), "-", "_")}`)}` : "NA"
        );
        returnValue = returnValueArray.join(", ");
      }
    }
    return returnValue ? returnValue : "NA";
  }

  if (isMdmsLoading) return <Loader />

  const cardStyle = { background: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: "24px", border: "1px solid #e8ecf0" };
  const sectionTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a2b49", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };
  const subSectionStyle = { fontSize: "14px", fontWeight: "700", color: "#1a2b49", marginBottom: "12px", marginTop: "20px", paddingBottom: "6px", borderBottom: "1px solid #e8ecf0" };
  const labelStyle = { display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px" };

  return (
    <div className="scrutiny-details-page">
      <style>{".scrutiny-details-page .card-caption, .scrutiny-details-page .card-text { display: none !important; }"}</style>
      <Timeline currentStep={checkingFlow === "OCBPA" ? 2 : checkingFlow==="PRE_APPROVE"? 4: 1 } flow={checkingFlow}/>

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
            {t("BPA_BUILDING_PERMIT") || "Building Permit"}
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER") || "Scrutiny Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
            {t("BPA_SCRUTINY_SUBTEXT") || "Review EDCR scrutiny and building details"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Step 1 of 3</div>
      </div>

      <FormStep t={t} config={config} onSelect={goNext} onSkip={!(formData?.data?.edcrDetails?.drawingDetail) ? onSkip : undefined}>
        {/* EDCR / Drawing Details Card */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{formData?.data?.edcrDetails?.drawingDetail ? t("BPA_DRAWING_DETAILS") : t("BPA_EDCR_DETAILS")}</div>
          <StatusTable style={{ border: "none" }}>
            <Row className="border-none" style={{ border: "none" }} label={checkingFlow === "OCBPA" ? t("BPA_OC_EDCR_NO_LABEL") : formData?.data?.edcrDetails?.drawingDetail ? t("BPA_DRAWING_NUMBER") : t("BPA_EDCR_NO_LABEL")} text={data?.edcrNumber || formData?.data?.scrutinyNumber} labelStyle={{wordBreak: "break-all"}} textStyle={{wordBreak: "break-all"}}></Row>
            {formData?.data?.edcrDetails?.drawingDetail ? (
              <div>
                <Row className="border-none" label={t("BPA_UPLOADED_PDF_DIAGRAM")} text={<ActionButton label={t(formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("pdf"))?.additionalDetails?.fileName)} jumpTo={formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("dxf"))?.additionalDetails?.fileUrl} />}></Row>
                <Row className="border-none" label={t("BPA_UPLOADED_CAD_DIAGRAM")} text={<ActionButton label={t(formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("dxf"))?.additionalDetails?.fileName)} jumpTo={formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("dxf"))?.additionalDetails?.fileUrl} />}></Row>
                <Row className="border-none" label={t("BPA_UPLOADED_IMAGE_DIAGRAM")} text={<ActionButton label={t(formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("jpg"))?.additionalDetails?.fileName)} jumpTo={formData?.data?.edcrDetails?.documents.find(doc => doc?.additionalDetails?.fileName.includes("jpg"))?.additionalDetails?.fileUrl} />}></Row>
              </div>
            ) : null}
            {data?.planReport ? (
              <div>
                <Row className="border-none" label={t("BPA_UPLOADED_PLAN_DIAGRAM")} text={<ActionButton label={t("Uploaded Plan.pdf")} jumpTo={data?.planReport} />}></Row>
                <Row className="border-none" label={t("BPA_SCRUNTINY_REPORT_OUTPUT")} text={<ActionButton label={t("BPA_SCRUTINY_REPORT_PDF")} jumpTo={data?.planReport} />}></Row>
              </div>
            ) : null}
          </StatusTable>
        </div>

        {/* Building Extract Card */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{checkingFlow === "OCBPA" ? t("BPA_ACTUAL_BUILDING_EXTRACT_HEADER") : formData?.data?.edcrDetails?.drawingDetail ? t("BPA_BUILDING_EXTRACT_DETAILS") : t("BPA_BUILDING_EXTRACT_HEADER")}</div>
          <StatusTable style={{ border: "none" }}>
            <Row className="border-none" label={t("BPA_TOTAL_BUILT_UP_AREA_HEADER")} text={data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea ? `${data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea} ${t("BPA_SQ_MTRS_LABEL")}` : formData?.data?.edcrDetails?.drawingDetail?.totalBuitUpArea ? `${formData?.data?.edcrDetails?.drawingDetail?.totalBuitUpArea} ${t("BPA_SQ_MTRS_LABEL")}` : "NA"}></Row>
            <Row className="border-none" label={t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")} text={data?.planDetail?.blocks?.[0]?.building?.totalFloors || formData?.data?.edcrDetails?.drawingDetail?.blocks?.[0]?.building?.totalFloors || "NA"}></Row>
            <Row className="border-none" label={t("BPA_HEIGHT_FROM_GROUND_LEVEL_FROM_MUMTY")} text={data?.planDetail?.blocks?.[0]?.building?.declaredBuildingHeight ? `${data?.planDetail?.blocks?.[0]?.building?.declaredBuildingHeight} ${t("BPA_MTRS_LABEL")}` : formData?.data?.edcrDetails?.drawingDetail?.blocks?.[0]?.building?.buildingHeight ? `${formData?.data?.edcrDetails?.drawingDetail?.blocks?.[0]?.building?.buildingHeight} ${t("BPA_MTRS_LABEL")}` : "NA"}></Row>
          </StatusTable>
        </div>

        {/* Blocks / Occupancy Card */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{formData?.data?.edcrDetails?.drawingDetail ? t("BPA_BLOCK_HEADER") : t("BPA_OCC_SUBOCC_HEADER")}</div>
          {data?.planDetail?.blocks?.map((block, index) => (
            <div key={index} style={{ marginTop: index > 0 ? "20px" : 0 }}>
              <div style={subSectionStyle}>{t("BPA_BLOCK_SUBHEADER")} {index + 1}</div>
              {!(checkingFlow === "OCBPA") ? (
                <div style={labelStyle}>{t("BPA_SUB_OCCUPANCY_LABEL")}</div>
              ) : null}
              {!(checkingFlow === "OCBPA") ? (
                <MultiSelectDropdown BlockNumber={block.number} className="form-field" isMandatory={true} defaultUnit="Selected" selected={subOccupancyObject[`Block_${block.number}`]} options={getsuboptions()} onSelect={(e) => selectOccupancy(e, data, block.number)} isOBPSMultiple={true} optionsKey="i18nKey" ServerStyle={{ width: "100%", overflowX: "hidden" }} t={t} />
              ) : null}
              {!(checkingFlow === "OCBPA") ? (
                <div className="tag-container">
                  {subOccupancyObject[`Block_${block.number}`] && subOccupancyObject[`Block_${block.number}`].length > 0 && subOccupancyObject[`Block_${block.number}`]?.map((value, index) => (
                    <RemoveableTag key={index} text={`${t(value["i18nKey"])}`} onClick={() => onRemove(index, value, block.number)} />
                  ))}
                </div>
              ) : null}
              {!(checkingFlow === "OCBPA") ? subOccupancyObject[`Block_${block.number}`] && subOccupancyObject[`Block_${block.number}`].length > 0 && (<LinkButton style={{ textAlign: "left" }} label={"Clear All"} onClick={() => clearall(block.number)} />) : null}
              <div style={{ marginTop: "20px" }}>
                {checkingFlow === "OCBPA" ? (<StatusTable><Row className="border-none" label={`${t("BPA_SUB_OCCUPANCY_LABEL")}`} text={getSubOccupancyValues(index)}></Row></StatusTable>) : null}
                <div style={{ overflowX: "scroll" }}>
                  <Table className="customTable table-fixed-first-column table-border-style" t={t} disableSort={false} autoSort={true} manualPagination={false} isPaginationRequired={false} initSortId="S N " data={getFloorData(block)} columns={tableColumns} getCellProps={(cellInfo) => ({ style: {} })} />
                </div>
              </div>
            </div>
          ))}
          {formData?.data?.edcrDetails?.drawingDetail?.blocks?.map((block, index) => (
            <div key={index} style={{ marginTop: index > 0 ? "20px" : 0 }}>
              <div style={subSectionStyle}>{t("BPA_BLOCK_SUBHEADER")} {index + 1}</div>
              {!(checkingFlow === "OCBPA") && !(formData?.data?.edcrDetails?.drawingDetail) ? (<div style={labelStyle}>{t("BPA_SUB_OCCUPANCY_LABEL")}</div>) : null}
              {!(checkingFlow === "OCBPA") && !(formData?.data?.edcrDetails?.drawingDetail) ? (<MultiSelectDropdown BlockNumber={block.number} className="form-field" isMandatory={true} defaultUnit="Selected" selected={subOccupancyObject[`Block_${block.number}`]} options={getsuboptions()} onSelect={(e) => selectOccupancy(e, data, block.number)} isOBPSMultiple={true} optionsKey="i18nKey" ServerStyle={{ width: "100%", overflowX: "hidden" }} t={t} />) : null}
              {!(checkingFlow === "OCBPA") ? (<div className="tag-container">{subOccupancyObject[`Block_${block.number}`] && subOccupancyObject[`Block_${block.number}`].length > 0 && subOccupancyObject[`Block_${block.number}`]?.map((value, index) => (<RemoveableTag key={index} text={`${t(value["i18nKey"])}`} onClick={() => onRemove(index, value, block.number)} />))}</div>) : null}
              {!(checkingFlow === "OCBPA") ? subOccupancyObject[`Block_${block.number}`] && subOccupancyObject[`Block_${block.number}`].length > 0 && (<LinkButton style={{ textAlign: "left" }} label={"Clear All"} onClick={() => clearall(block.number)} />) : null}
              <div style={{ marginTop: "20px" }}>
                {checkingFlow === "OCBPA" ? (<StatusTable><Row className="border-none" label={`${t("BPA_SUB_OCCUPANCY_LABEL")}`} text={getSubOccupancyValues(index)}></Row></StatusTable>) : null}
                <div style={{ overflowX: "scroll" }}>
                  <Table className="customTable table-fixed-first-column table-border-style" t={t} disableSort={false} autoSort={true} manualPagination={false} isPaginationRequired={false} initSortId="S N " data={getFloorData(block)} columns={tableColumns} getCellProps={(cellInfo) => ({ style: {} })} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demolition Details Card */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</div>
          <StatusTable style={{ border: "none" }}>
            <Row label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")} text={data?.planDetail?.planInformation?.demolitionArea ? `${data?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}` : "NA"}></Row>
          </StatusTable>
        </div>
      </FormStep>
      {showToast && <Toast error={true} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />}
    </div>
  );
};

export default ScrutinyDetails;
