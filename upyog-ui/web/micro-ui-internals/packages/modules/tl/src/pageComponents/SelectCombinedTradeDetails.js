import React, { useState, useEffect } from "react";
import {
  CardLabel,
  CitizenInfoLabel,
  DatePicker,
  Dropdown,
  FormStep,
  Loader,
  RadioButtons,
  TextInput,
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";
import { currentFinancialYear, sortDropdownNames } from "../utils";

const SelectCombinedTradeDetails = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const stateId = Digit.ULBService.getStateId();
  const isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");

  // ── Trade Name ──────────────────────────────────────────────────────────────
  const [TradeName, setTradeName] = useState(formData?.TradeDetails?.TradeName || "");

  // ── Structure Type ───────────────────────────────────────────────────────────
  const structureMenu = [
    { i18nKey: "TL_COMMON_YES", code: "IMMOVABLE" },
    { i18nKey: "TL_COMMON_NO",  code: "MOVABLE"   },
  ];
  const [StructureType, setStructureType] = useState(formData?.TradeDetails?.StructureType || null);

  // ── Building Type (only for IMMOVABLE) ───────────────────────────────────────
  const [BuildingType, setBuildingType] = useState(formData?.TradeDetails?.BuildingType || null);
  const { isLoading: isBuildingLoading, data: BuildingMenu = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "common-masters", "StructureType");
  let buildingMenuOptions = [];
  BuildingMenu?.["common-masters"]?.StructureType?.forEach((ob) => {
    if (ob.code.includes("IMMOVABLE")) {
      buildingMenuOptions.push({ i18nKey: `COMMON_MASTERS_STRUCTURETYPE_${ob.code.replaceAll(".", "_")}`, code: ob.code });
    }
  });

  // ── Vehicle Type (only for MOVABLE) ─────────────────────────────────────────
  const [VehicleType, setVehicleType] = useState(formData?.TradeDetails?.VehicleType || null);
  let vehicleMenuOptions = [];
  BuildingMenu?.["common-masters"]?.StructureType?.forEach((ob) => {
    if (!ob.code.includes("IMMOVABLE")) {
      vehicleMenuOptions.push({ i18nKey: `COMMON_MASTERS_STRUCTURETYPE_${ob.code.replaceAll(".", "_")}`, code: ob.code });
    }
  });

  // ── Commencement Date ────────────────────────────────────────────────────────
  const [CommencementDate, setCommencementDate] = useState(formData?.TradeDetails?.CommencementDate || "");
  useEffect(() => {
    if (
      (window.location.href.includes("/tl/tradelicence/renew-trade") ||
        window.location.href.includes("/tl/tradelicence/edit-application")) &&
      formData?.TradeDetails?.CommencementDate
    ) {
      let d = Date.parse(CommencementDate);
      let formatted =
        new Date(d).getFullYear() + "-" +
        (new Date(d).getMonth() + 1 > 9 ? "" : "0") + (new Date(d).getMonth() + 1) + "-" +
        (new Date(d).getDate() > 9 ? "" : "0") + new Date(d).getDate();
      setCommencementDate(formatted);
    }
  }, []);

  // ── Financial Year (for info label) ──────────────────────────────────────────
  const { isLoading: isFYLoading, data: fydata = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "egf-master", "FinancialYear");
  let mdmsFY = fydata["egf-master"] ? fydata["egf-master"].FinancialYear.filter((y) => y.module === "TL") : [];
  let FY = mdmsFY?.length > 0 ? mdmsFY.sort((x, y) => y.endingDate - x.endingDate)[0]?.code : "";

  // ── Trade Units ──────────────────────────────────────────────────────────────
  const [fields, setFields] = useState(
    formData?.TradeDetails?.units?.length > 0
      ? formData.TradeDetails.units
      : [{ tradecategory: "", tradetype: "", tradesubtype: "", unit: null, uom: null }]
  );
  const [unitsError, setUnitsError] = useState(null);

  const { isLoading: isTradeUnitsLoading, data: TradeUnitsData = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "TradeLicense", "TradeUnits", "[?(@.type=='TL')]");
  const { data: billingSlabTradeTypeData, isLoading: isBillingSlabLoading } = Digit.Hooks.tl.useTradeLicenseBillingslab(
    { tenantId, filters: {} },
    {
      select: (data) =>
        data?.billingSlab.filter(
          (e) => e.tradeType && (e.applicationType === (window.location.href.includes("renew-trade") ? "RENEWAL" : "NEW")) && e.licenseType === "PERMANENT"
        ),
    }
  );

  let TradeCategoryMenu = [];
  TradeUnitsData?.TradeLicense?.TradeType?.forEach((ob) => {
    if (!TradeCategoryMenu.some((m) => m.code === ob.code.split(".")[0])) {
      TradeCategoryMenu.push({ i18nKey: `TRADELICENSE_TRADETYPE_${ob.code.split(".")[0]}`, code: ob.code.split(".")[0] });
    }
  });

  function getTradeTypeMenu(cat) {
    if (!cat || !TradeUnitsData?.TradeLicense?.TradeType?.length) return [];
    let menu = [];
    TradeUnitsData.TradeLicense.TradeType.forEach((ob) => {
      if (ob.code.split(".")[0] === cat.code && !menu.some((m) => m.code === ob.code.split(".")[1])) {
        menu.push({ i18nKey: `TRADELICENSE_TRADETYPE_${ob.code.split(".")[1]}`, code: ob.code.split(".")[1] });
      }
    });
    return menu;
  }

  function getTradeSubTypeMenu(tt) {
    if (!tt || !TradeUnitsData?.TradeLicense?.TradeType?.length) return [];
    let menu = [];
    TradeUnitsData.TradeLicense.TradeType.forEach((ob) => {
      if (ob.code.split(".")[1] === tt.code && !menu.some((m) => m.code === ob.code)) {
        menu.push({ i18nKey: `TL_${ob.code}`, code: ob.code });
      }
    });
    return menu;
  }

  function handleAddUnit() {
    setFields([...fields, { tradecategory: "", tradetype: "", tradesubtype: "", unit: null, uom: null }]);
  }
  function handleRemoveUnit(index) {
    if (fields.length > 1) {
      const vals = [...fields];
      vals.splice(index, 1);
      setFields(vals);
    }
  }
  function selectTradeCategory(i, value) {
    const vals = [...fields];
    vals[i] = { ...vals[i], tradecategory: value, tradetype: "", tradesubtype: "", unit: null, uom: null };
    setFields(vals);
    setUnitsError(null);
  }
  function selectTradeType(i, value) {
    const vals = [...fields];
    vals[i] = { ...vals[i], tradetype: value, tradesubtype: "", unit: null, uom: null };
    setFields(vals);
    setUnitsError(null);
  }
  function selectTradeSubType(i, value) {
    const vals = [...fields];
    vals[i] = { ...vals[i], tradesubtype: value, uom: null };
    let uomFound = false;
    billingSlabTradeTypeData?.forEach((ob) => {
      if (
        value?.code === ob.tradeType &&
        (ob.structureType === BuildingType?.code || ob.structureType === VehicleType?.code)
      ) {
        vals[i].unit = ob.uom;
        uomFound = true;
      }
    });
    if (!uomFound) vals[i].unit = null;
    setFields(vals);
    setUnitsError(null);
    if (
      value &&
      billingSlabTradeTypeData?.filter(
        (ob) =>
          ob.tradeType === value.code &&
          (ob.structureType === BuildingType?.code || ob.structureType === VehicleType?.code)
      ).length === 0
    ) {
      setUnitsError("TL_BILLING_SLAB_NOT_FOUND_FOR_COMB");
    }
  }
  function selectUomValue(i, e) {
    const vals = [...fields];
    vals[i] = { ...vals[i], uom: e === "" ? "" : e.target.value };
    setFields(vals);
    setUnitsError(null);
    if (e !== "" && !(e.target.value && parseFloat(e.target.value) > 0)) {
      setUnitsError(t("TL_UOM_VALUE_GREATER_O"));
    }
  }

  // ── Accessories (Yes / No) ────────────────────────────────────────────────────
  const accessoriesMenu = [
    { i18nKey: "TL_COMMON_YES", code: "ACCESSORY"    },
    { i18nKey: "TL_COMMON_NO",  code: "NONACCESSORY" },
  ];
  const [isAccessories, setIsAccessories] = useState(formData?.TradeDetails?.isAccessories || null);

  // ── Accessories Details ───────────────────────────────────────────────────────
  const [accFields, setAccFields] = useState(
    formData?.TradeDetails?.accessories?.length > 0
      ? formData.TradeDetails.accessories
      : [{ accessory: "", accessorycount: "", unit: null, uom: null }]
  );
  const [accCountError, setAccCountError] = useState(null);
  const [accUOMError, setAccUOMError]     = useState(null);

  const { isLoading: isAccLoading, data: AccData = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "TradeLicense", "AccessoryCategory");
  const { data: billingSlabAccData } = Digit.Hooks.tl.useTradeLicenseBillingslab(
    { tenantId, filters: {} },
    { select: (data) => data?.billingSlab.filter((e) => e.accessoryCategory && e.uom) }
  );
  const [accessoriesList, setAccessoriesList] = useState([]);
  useEffect(() => {
    if (billingSlabAccData?.length > 0) {
      const seen = new Set();
      const list = [];
      billingSlabAccData.forEach((item) => {
        if (item.accessoryCategory && item.tradeType === null && !seen.has(item.accessoryCategory) && item.rate > 0) {
          seen.add(item.accessoryCategory);
          list.push({
            code: item.accessoryCategory,
            uom: item.uom,
            rate: item.rate,
            fromUom: item.fromUom,
            toUom: item.toUom,
            i18nKey: t(`TRADELICENSE_ACCESSORIESCATEGORY_${item.accessoryCategory.toUpperCase().replace(/-/g, "_")}`),
          });
        }
      });
      setAccessoriesList(list);
    }
  }, [billingSlabAccData]);

  function handleAddAcc() {
    setAccFields([...accFields, { accessory: "", accessorycount: "", unit: null, uom: null }]);
  }
  function handleRemoveAcc(index) {
    if (accFields.length > 1) {
      const vals = [...accFields];
      vals.splice(index, 1);
      setAccFields(vals);
    }
  }
  function selectAccessory(i, value) {
    const vals = [...accFields];
    vals[i] = { ...vals[i], accessory: value, accessorycount: "", uom: "", unit: value?.uom || "" };
    setAccFields(vals);
  }
  function selectAccessoryCount(i, e) {
    setAccCountError(null);
    const v = e.target.value;
    if (v && (v.length > 7 || !/^\d+$/.test(v))) { setAccCountError("TL_ONLY_NUM_ALLOWED"); return; }
    const vals = [...accFields];
    vals[i] = { ...vals[i], accessorycount: v };
    setAccFields(vals);
  }
  function selectAccUomValue(i, e) {
    setAccUOMError(null);
    const v = e.target.value;
    if (!(v && parseFloat(v) > 0)) { setAccUOMError(t("TL_UOM_VALUE_GREATER_O")); }
    const vals = [...accFields];
    vals[i] = { ...vals[i], uom: v };
    setAccFields(vals);
  }

  // ── Other Trade Details ──────────────────────────────────────────────────────
  const [TradeGSTNumber, setTradeGSTNumber]           = useState(formData?.TradeDetails?.TradeGSTNumber || "");
  const [OperationalSqFtArea, setOperationalSqFtArea] = useState(formData?.TradeDetails?.OperationalSqFtArea || "");
  const [NumberOfEmployees, setNumberOfEmployees]     = useState(formData?.TradeDetails?.NumberOfEmployees || "");
  const [otherError, setOtherError] = useState(null);

  function onGSTChange(e) {
    const v = e.target.value;
    setOtherError(null);
    if (v.length > 0 && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(v)) setOtherError("GST_PATTERN_ERROR");
    setTradeGSTNumber(v);
  }
  function onAreaChange(e) {
    const v = e.target.value;
    setOtherError(null);
    if (v && (v.length > 7 || !/^\d+$/.test(v))) setOtherError("TL_ONLY_NUM_ALLOWED");
    setOperationalSqFtArea(v);
  }
  function onEmployeesChange(e) {
    const v = e.target.value;
    setOtherError(null);
    if (v && (v.length > 7 || !/^\d+$/.test(v))) setOtherError("TL_ONLY_NUM_ALLOWED");
    setNumberOfEmployees(v);
  }

  // ── Derived flags ────────────────────────────────────────────────────────────
  const showBuildingType = StructureType?.code === "IMMOVABLE";
  const showVehicleType  = StructureType?.code === "MOVABLE";
  const showAccDetails   = isAccessories?.code === "ACCESSORY";

  const isDisabled =
    !TradeName ||
    !StructureType ||
    (showBuildingType && !BuildingType) ||
    (showVehicleType && !VehicleType) ||
    !CommencementDate ||
    !fields[0]?.tradecategory || !fields[0]?.tradetype || !fields[0]?.tradesubtype ||
    !isAccessories ||
    (showAccDetails && (!accFields[0]?.accessory || !accFields[0]?.accessorycount)) ||
    !!unitsError || !!accCountError || !!accUOMError || !!otherError;

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSkip = () => onSelect();
  const goNext = () => {
    sessionStorage.setItem("CurrentFinancialYear", currentFinancialYear());
    sessionStorage.setItem("StructureType", StructureType?.i18nKey || "");
    sessionStorage.setItem("isAccessories", isAccessories?.i18nKey || "");
    sessionStorage.setItem("VisitedisAccessories", true);
    if (showAccDetails) sessionStorage.setItem("VisitedAccessoriesDetails", true);

    onSelect(config.key, {
      TradeName,
      StructureType,
      BuildingType: showBuildingType ? BuildingType : null,
      VehicleType: showVehicleType ? VehicleType : null,
      CommencementDate,
      units: fields,
      isAccessories,
      accessories: showAccDetails ? accFields : [],
      TradeGSTNumber,
      OperationalSqFtArea,
      NumberOfEmployees,
    });
  };

  /* ── PT-style shared styles (matches PTAllPropertyDetails exactly) ── */
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "24px 28px",
    marginBottom: "24px",
    border: "1px solid #e8ecf0",
  };
  const sectionTitleStyle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a2b49",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f47738",
    letterSpacing: "0.3px",
  };
  const rowStyle = {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: "-10px",
    marginRight: "-10px",
  };
  const col6 = {
    flex: "0 0 50%",
    maxWidth: "50%",
    padding: "0 10px",
    marginBottom: "18px",
    boxSizing: "border-box",
  };
  const col12 = {
    flex: "0 0 100%",
    maxWidth: "100%",
    padding: "0 10px",
    marginBottom: "18px",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontWeight: "600",
    fontSize: "13px",
    color: "#3d4f6b",
    marginBottom: "6px",
    letterSpacing: "0.2px",
  };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };
  const unitCardStyle = {
    background: "#f8fafc",
    border: "1px solid #dde3ea",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "14px",
    position: "relative",
  };

  const isDataLoading = isFYLoading || isBuildingLoading || isTradeUnitsLoading || isBillingSlabLoading || isAccLoading;
  if (isDataLoading) return <Loader />;

  return (
    <React.Fragment>
      <style>{`
        .tl-trade-details-form .select,
        .tl-trade-details-form .select-active {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .tl-trade-details-form .select-wrap,
        .tl-trade-details-form .employee-select-wrap {
          max-width: none !important;
          position: relative !important;
          overflow: visible !important;
        }
        .tl-trade-details-form .select-wrap .options-card,
        .tl-trade-details-form .employee-select-wrap .options-card {
          position: absolute !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 4px !important;
          max-height: 220px !important;
          overflow-y: auto !important;
          z-index: 9999 !important;
          width: 100% !important;
          background: #fff !important;
          border: 1px solid #b1b4b6 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .tl-trade-details-form .text-input-width {
          max-width: none !important;
        }
        .tl-trade-details-form .citizen-card-input,
        .tl-trade-details-form .card-input {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          height: 40px !important;
        }
      `}</style>

      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}

      {/* ── Hero Banner — matches PTAllPropertyDetails exactly ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
        borderRadius: "12px",
        padding: "28px 36px",
        marginBottom: "24px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: "26px",
        }}>🏪</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 1 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("TL_COMMON_TR_DETAILS")}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("TL_TRADE_DETAILS_SUBTITLE") || "Provide trade name, structure, units and accessories"}</p>
        </div>
      </div>

      <FormStep t={t} config={config} onSelect={goNext} isDisabled={isDisabled} forcedError={t(unitsError || accCountError || accUOMError || otherError || "")}>
        <div style={{ maxWidth: "100%", width: "100%" }} className="tl-trade-details-form">

          {/* ══ CARD 1 – Trade Name & Structure ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_TRADE_NAME_HEADER") || "Trade Information"}</div>
            <div style={rowStyle}>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_LOCALIZATION_TRADE_NAME")}<span style={requiredMark}>*</span></label>
                <TextInput t={t} type="text" name="TradeName" value={TradeName} onChange={(e) => setTradeName(e.target.value)} disable={isEdit} isMandatory pattern=".*" />
              </div>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_TRADE_COMM_DATE_LABEL")}<span style={requiredMark}>*</span></label>
                <DatePicker date={CommencementDate} name="CommencementDate" onChange={(v) => setCommencementDate(v)} disabled={isEdit} />
              </div>
            </div>

            <div style={{ ...labelStyle, marginBottom: "10px" }}>{t("TL_STRUCTURE_TYPE_HEADER") || "Structure Type"}<span style={requiredMark}>*</span></div>
            <RadioButtons
              t={t}
              optionsKey="i18nKey"
              options={structureMenu}
              selectedOption={StructureType}
              onSelect={(v) => { setStructureType(v); setBuildingType(null); setVehicleType(null); }}
              disabled={isEdit}
            />

            {showBuildingType && (
              <React.Fragment>
                <div style={{ ...labelStyle, marginTop: "16px", marginBottom: "10px" }}>{t("TL_BUILDING_TYPE_HEADER") || "Building Type"}<span style={requiredMark}>*</span></div>
                <RadioButtons
                  t={t}
                  optionsKey="i18nKey"
                  options={buildingMenuOptions}
                  selectedOption={BuildingType}
                  onSelect={(v) => setBuildingType(v)}
                  disabled={isEdit}
                />
              </React.Fragment>
            )}

            {showVehicleType && (
              <React.Fragment>
                <div style={{ ...labelStyle, marginTop: "16px", marginBottom: "10px" }}>{t("TL_VEHICLE_TYPE_HEADER") || "Vehicle Type"}<span style={requiredMark}>*</span></div>
                <RadioButtons
                  t={t}
                  optionsKey="i18nKey"
                  options={vehicleMenuOptions}
                  selectedOption={VehicleType}
                  onSelect={(v) => setVehicleType(v)}
                  disabled={isEdit}
                />
              </React.Fragment>
            )}
          </div>

          {/* ══ CARD 2 – Trade Units ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_TRADE_UNITS_HEADER") || "Trade Units"}</div>
            {fields.map((field, index) => (
              <div key={index} style={unitCardStyle}>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(index)}
                    style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px", lineHeight: 1 }}
                  >✕</button>
                )}
                <div style={{ fontWeight: "600", fontSize: "12px", color: "#4e5d78", marginBottom: "12px" }}>
                  {`Unit ${index + 1}`}
                </div>
                <div style={rowStyle}>
                  <div style={col12}>
                    <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_TRADE_CAT_LABEL")}<span style={requiredMark}>*</span></label>
                    <RadioButtons t={t} options={TradeCategoryMenu} optionsKey="i18nKey" name={`TradeCategory-${index}`} selectedOption={field.tradecategory} onSelect={(e) => selectTradeCategory(index, e)} isPTFlow={true} />
                  </div>
                  <div style={col6}>
                    <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_TRADE_TYPE_LABEL")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" option={sortDropdownNames(getTradeTypeMenu(field.tradecategory), "i18nKey", t)} selected={field.tradetype} select={(e) => selectTradeType(index, e)} />
                  </div>
                  <div style={col6}>
                    <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" option={sortDropdownNames(getTradeSubTypeMenu(field.tradetype), "i18nKey", t)} selected={field.tradesubtype} select={(e) => selectTradeSubType(index, e)} optionCardStyles={{ maxHeight: "125px", overflow: "scroll" }} />
                  </div>
                  <div style={col6}>
                    <label style={labelStyle}>{t("TL_UNIT_OF_MEASURE_LABEL")}</label>
                    <TextInput style={{ background: "#f8fafc" }} t={t} type="text" name="UnitOfMeasure" value={field.unit || ""} disable={true} />
                  </div>
                  <div style={col6}>
                    <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL")}{field.unit && <span style={requiredMark}>*</span>}</label>
                    <TextInput style={{ background: "#f8fafc" }} t={t} type="text" name="UomValue" value={field.uom || ""} onChange={(e) => selectUomValue(index, e)} disable={!field.unit} />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddUnit}
              style={{
                display: "block", width: "100%", padding: "10px",
                background: "none", border: "2px dashed #f47738",
                borderRadius: "8px", color: "#f47738", fontWeight: "600",
                fontSize: "14px", cursor: "pointer", marginTop: "4px",
              }}
            >+ {t("TL_ADD_MORE_TRADE_UNITS")}</button>
          </div>

          {/* ══ CARD 3 – Accessories ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_ISACCESSORIES_HEADER") || "Accessories"}</div>
            <div style={{ ...labelStyle, marginBottom: "10px" }}>{t("TL_ISACCESSORIES_HEADER")}<span style={requiredMark}>*</span></div>
            <RadioButtons
              t={t}
              optionsKey="i18nKey"
              options={accessoriesMenu}
              selectedOption={isAccessories}
              onSelect={(v) => { setIsAccessories(v); }}
            />

            {showAccDetails && (
              <React.Fragment>
                <div style={{ ...sectionTitleStyle, marginTop: "20px" }}>{t("TL_TRADE_ACCESSORIES_HEADER") || "Accessory Details"}</div>
                {accFields.map((acc, index) => (
                  <div key={index} style={unitCardStyle}>
                    {accFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAcc(index)}
                        style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px", lineHeight: 1 }}
                      >✕</button>
                    )}
                    <div style={{ fontWeight: "600", fontSize: "12px", color: "#4e5d78", marginBottom: "12px" }}>
                      {`Accessory ${index + 1}`}
                    </div>
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_ACCESSORY_LABEL")}<span style={requiredMark}>*</span></label>
                        <Dropdown t={t} optionKey="i18nKey" option={accessoriesList} selected={acc.accessory} select={(v) => selectAccessory(index, v)} />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_ACCESSORY_COUNT_LABEL")}<span style={requiredMark}>*</span></label>
                        <TextInput t={t} type="text" name="accessorycount" value={acc.accessorycount} onChange={(e) => selectAccessoryCount(index, e)} />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_UNIT_OF_MEASURE_LABEL")}</label>
                        <TextInput t={t} type="text" name="unit" value={acc.unit || ""} disable={true} />
                      </div>
                      {acc.unit && (
                        <div style={col6}>
                          <label style={labelStyle}>{t("TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL")}<span style={requiredMark}>*</span></label>
                          <TextInput t={t} type="text" name="uom" value={acc.uom || ""} onChange={(e) => selectAccUomValue(index, e)} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddAcc}
                  style={{
                    display: "block", width: "100%", padding: "10px",
                    background: "none", border: "2px dashed #f47738",
                    borderRadius: "8px", color: "#f47738", fontWeight: "600",
                    fontSize: "14px", cursor: "pointer", marginTop: "4px",
                  }}
                >+ {t("TL_ADD_MORE_ACCESSORIES")}</button>
              </React.Fragment>
            )}
          </div>

          {/* ══ CARD 4 – Other Trade Details ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("TL_OTHER_TRADE_DETAILS_HEADER") || "Other Details"}</div>
            <div style={rowStyle}>
              <div style={col12}>
                <label style={labelStyle}>{t("TL_TRADE_GST_NO")}</label>
                <TextInput t={t} isMandatory={false} type="text" name="TradeGSTNumber" value={TradeGSTNumber} onChange={onGSTChange} pattern="^[a-zA-Z-0-9_@/#&+-.`' ]*$" title={t("TL_INVALID_TRADE_GST_NO")} />
              </div>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_OPERATIONAL_AREA")}</label>
                <TextInput t={t} isMandatory={false} type="number" name="OperationalSqFtArea" value={OperationalSqFtArea} onChange={onAreaChange} />
              </div>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_NO_OF_EMPLOYEES")}</label>
                <TextInput t={t} isMandatory={false} type="number" name="NumberOfEmployees" value={NumberOfEmployees} onChange={onEmployeesChange} />
              </div>
            </div>
          </div>

        </div>
      </FormStep>
      {FY && <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("TL_LICENSE_ISSUE_YEAR_INFO_MSG") + FY} />}
      {showBuildingType && <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("TL_BUILDING_TYPE_INFO_MSG")} />}
    </React.Fragment>
  );
};

export default SelectCombinedTradeDetails;
