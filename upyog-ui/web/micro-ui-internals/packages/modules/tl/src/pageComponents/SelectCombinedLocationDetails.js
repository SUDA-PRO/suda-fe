import React, { useState, useEffect, useReducer, useMemo } from "react";
import {
  CardLabel,
  CardLabelDesc,
  CardLabelError,
  CardHeader,
  CheckBox,
  CitizenInfoLabel,
  Dropdown,
  FormStep,
  LinkButton,
  Loader,
  LocationSearchCard,
  LocationSearch,
  RadioButtons,
  RadioOrSelect,
  TextArea,
  TextInput,
} from "@upyog/digit-ui-react-components";
import { useHistory, useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";

const SelectCombinedLocationDetails = ({ t, config, onSelect, userType, formData }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  const stateId = Digit.ULBService.getStateId();
  const _tenantHook = Digit.Hooks.tl.useTenants();
  const [allCities, setAllCities] = useState(_tenantHook || Digit.SessionStorage.get("TL_TENANTS") || null);
  useEffect(() => {
    if (!allCities) {
      const tenants = Digit.SessionStorage.get("TL_TENANTS");
      if (tenants?.length) setAllCities(tenants);
    }
  }, []);
  const isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");

  // ── SECTION 0: Geolocation / Map ────────────────────────────────────────────
  const [geoLocation, setGeoLocation] = useState(formData?.address?.geoLocation || {});
  const [mapPincodeError, setMapPincodeError] = useState(null);
  const { data: defaultConfig = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "MapConfig");
  const defaultcoord = defaultConfig?.PropertyTax?.MapConfig;
  const defaultcoord1 = defaultcoord ? defaultcoord[0] : {};

  function onMapChange(code, location) {
    setMapPincodeError(null);
    const foundValue = allCities?.find((obj) => obj.pincode?.find((item) => item == code));
    if (!foundValue) {
      setMapPincodeError("TL_COMMON_PINCODE_NOT_SERVICABLE");
      setGeoLocation({});
    } else {
      setPincode(code);
      setPincodeError(null);
      setGeoLocation(location);
      setSelectedCity(null);
      setSelectedLocality(null);
      setLocalities(null);
    }
  }

  // ── SECTION 1: Pincode ────────────────────────────────────────────────────────
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");
  const [pincodeError, setPincodeError] = useState(null);

  // ── SECTION 2: City & Locality ───────────────────────────────────────────────
  const cities = useMemo(() => {
    const safe = allCities || [];
    return pincode
      ? safe.filter((city) => city?.pincode?.some((pin) => pin == pincode))
      : safe;
  }, [allCities, pincode]);

  const [selectedCity, setSelectedCity] = useState(formData?.address?.city || null);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    { enabled: !!selectedCity },
    t
  );

  const [localities, setLocalities] = useState(null);
  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality || null);

  useEffect(() => {
    if (cities?.length === 1) setSelectedCity(cities[0]);
  }, [cities]);

  useEffect(() => {
    if (selectedCity && fetchedLocalities) {
      let list = fetchedLocalities;
      let filtered = [];

      if (formData?.address?.locality) setSelectedLocality(formData.address.locality);

      if (pincode) {
        filtered = list.filter((obj) => obj.pincode?.find((item) => item == pincode));
        if (!formData?.address?.locality) setSelectedLocality(null);
      }

      const finalList = filtered.length > 0 ? filtered : list;
      setLocalities(finalList);

      if (finalList.length === 1) setSelectedLocality(finalList[0]);
    }
  }, [selectedCity, pincode, fetchedLocalities]);

  function selectCity(city) {
    setSelectedLocality(null);
    setLocalities(null);
    setSelectedCity(city);
  }

  // ── SECTION 3: Street & Door No ──────────────────────────────────────────────
  const [street, setStreet] = useState(formData?.address?.street || "");
  const [doorNo, setDoorNo] = useState(formData?.address?.doorNo || "");

  // ── SECTION 4: Landmark ───────────────────────────────────────────────────────
  const [landmark, setLandmark] = useState(formData?.address?.landmark || "");
  const [landmarkError, setLandmarkError] = useState(null);

  function onLandmarkChange(e) {
    if (e.target.value.length > 1024) {
      setLandmarkError("CS_COMMON_LANDMARK_MAX_LENGTH");
    } else {
      setLandmarkError(null);
      setLandmark(e.target.value);
    }
  }

  // ── SECTION 5: Ownership Details ─────────────────────────────────────────────
  const [ownershipCategory, setOwnershipCategory] = useState(formData?.ownershipCategory || null);
  const [isSameAsPropertyOwner, setIsSameAsPropertyOwner] = useState(
    formData?.ownershipCategory?.isSameAsPropertyOwner === "false"
      ? false
      : formData?.ownershipCategory?.isSameAsPropertyOwner || null
  );

  const { data: ownershipDropdownData } = Digit.Hooks.tl.useTradeLicenseMDMS(
    stateId,
    "common-masters",
    "TLOwnerTypeWithSubtypes",
    { userType }
  );

  function selectIsSameAsPropertyOwner(e) {
    setIsSameAsPropertyOwner(e.target.checked);
    if (e.target.checked) {
      if (
        window.location.href.includes("/citizen/tl") &&
        formData?.cpt?.details?.ownershipCategory?.includes("INSTITUTIONAL")
      ) {
        setOwnershipCategory({
          code: `${formData?.cpt?.details?.ownershipCategory}`,
          i18nKey: `PT_OWNERSHIP_${
            formData?.cpt?.details?.ownershipCategory?.includes("GOVERNMENT")
              ? "OTHERGOVERNMENTINSTITUITION"
              : "OTHERSPRIVATEINSTITUITION"
          }`,
          label: undefined,
          value: `${formData?.cpt?.details?.ownershipCategory}${
            formData?.cpt?.details?.ownershipCategory?.includes("GOVERNMENT")
              ? ".OTHERGOVERNMENTINSTITUITION"
              : ".OTHERSPRIVATEINSTITUITION"
          }`,
        });
      } else if (window.location.href.includes("/citizen/tl")) {
        const ptCategory = formData?.cpt?.details?.ownershipCategory;
        let matchedOption = ownershipDropdownData?.find(
          (opt) => opt.code === ptCategory || opt.value === ptCategory
        );
        if (!matchedOption && ptCategory?.includes("INDIVIDUAL")) {
          const ownerCount = formData?.cpt?.details?.owners?.length || 0;
          const subtype =
            ownerCount > 1 ? "INDIVIDUAL.MULTIPLEOWNERS" : "INDIVIDUAL.SINGLEOWNER";
          matchedOption = ownershipDropdownData?.find(
            (opt) => opt.code === subtype || opt.value === subtype
          );
        }
        if (matchedOption) setOwnershipCategory(matchedOption);
      }
    } else {
      setOwnershipCategory({ code: "", i18nKey: "", label: undefined, value: "" });
    }
  }

  // ── SECTION 6: Owner Details ──────────────────────────────────────────────────
  const typeOfOwner = useMemo(() => {
    if (!ownershipCategory?.code) return "SINGLEOWNER";
    if (ownershipCategory.code.includes("SINGLEOWNER")) return "SINGLEOWNER";
    if (ownershipCategory.code.includes("INSTITUTIONAL")) return "INSTITUTIONAL";
    return "MULTIOWNER";
  }, [ownershipCategory]);

  const storedOwnerData = formData?.owners?.owners;

  function initOwners(initData) {
    switch (typeOfOwner) {
      case "SINGLEOWNER":
        return [
          {
            name: initData?.[0]?.name || "",
            gender: initData?.[0]?.gender || null,
            mobilenumber: initData?.[0]?.mobilenumber || "",
            isprimaryowner: true,
            fatherOrHusbandName: initData?.[0]?.fatherOrHusbandName || "",
            emailId: initData?.[0]?.emailId || "",
            relationship: initData?.[0]?.relationship || null,
            id: initData?.[0]?.id || "",
            uuid: initData?.[0]?.uuid || "",
          },
        ];
      case "MULTIOWNER":
        return initData?.length > 1
          ? initData.map((o) => ({
              name: o?.name || "",
              gender: o?.gender || null,
              mobilenumber: o?.mobilenumber || "",
              isprimaryowner: o?.isprimaryowner,
              fatherOrHusbandName: o?.fatherOrHusbandName || "",
              emailId: o?.emailId || "",
              relationship: o?.relationship || null,
              id: o.id || "",
              uuid: o.uuid || "",
            }))
          : [
              {
                name: "",
                gender: null,
                mobilenumber: "",
                isprimaryowner: true,
                fatherOrHusbandName: "",
                emailId: "",
                relationship: null,
              },
            ];
      case "INSTITUTIONAL":
        return [
          {
            name: initData?.[0]?.name || "",
            mobilenumber: initData?.[0]?.mobilenumber || "",
            institutionName: initData?.[0]?.institutionName || "",
            subOwnerShipCategory: initData?.[0]?.subOwnerShipCategory || "",
            designation: initData?.[0]?.designation || "",
            altContactNumber: initData?.[0]?.altContactNumber || "",
            emailId: initData?.[0]?.emailId || "",
            id: initData?.[0]?.id || "",
            uuid: initData?.[0]?.uuid || "",
          },
        ];
      default:
        return [
          {
            name: "",
            gender: null,
            mobilenumber: "",
            isprimaryowner: true,
            fatherOrHusbandName: "",
            emailId: "",
            relationship: null,
          },
        ];
    }
  }

  function ownersReducer(state, action) {
    switch (action.type) {
      case "ADD_NEW_OWNER":
        return [
          ...state,
          {
            name: "",
            gender: null,
            mobilenumber: "",
            relationship: null,
            fatherOrHusbandName: "",
            emailId: "",
            isprimaryowner: false,
          },
        ];
      case "REMOVE_THIS_OWNER":
        return state.filter((_, i) => i !== action.payload.index);
      case "SET_PRIMARY_OWNER":
        return state.map((o, i) => ({ ...o, isprimaryowner: i === action.payload.index }));
      case "EDIT_CURRENT_OWNER_PROPERTY":
        return state.map((o, i) =>
          i === action.payload.index ? { ...o, [action.payload.key]: action.payload.value } : o
        );
      case "RESET":
        return action.payload;
      default:
        return state;
    }
  }

  const [ownersState, dispatchOwners] = useReducer(ownersReducer, storedOwnerData, initOwners);

  // Reset owners list when ownership type changes
  useEffect(() => {
    if (ownershipCategory?.code) {
      dispatchOwners({ type: "RESET", payload: initOwners(storedOwnerData) });
    }
  }, [typeOfOwner]);

  const { data: genderMenu, isLoading: isGenderLoading } = Digit.Hooks.tl.useTLGenderMDMS(
    stateId,
    "common-masters",
    "GenderType"
  );
  const TLmenu = (genderMenu || []).map((g) => ({
    i18nKey: `TL_GENDER_${g.code}`,
    code: g.code,
  }));

  let keyToSearchOwnershipSubtype = ownershipCategory?.code || "";
  if (isEdit) keyToSearchOwnershipSubtype = keyToSearchOwnershipSubtype.split(".")[0];
  const { data: institutionOwnershipTypeOptions } = Digit.Hooks.tl.useTradeLicenseMDMS(
    stateId,
    "common-masters",
    "TradeOwnershipSubType",
    { keyToSearchOwnershipSubtype }
  );

  const relationshipMenu = [
    { code: "FATHER", i18nKey: "COMMON_RELATION_FATHER" },
    { code: "HUSBAND", i18nKey: "COMMON_RELATION_HUSBAND" },
  ];

  // ── SECTION 7: Owner Address ──────────────────────────────────────────────────
  const [permanentAddress, setPermanentAddress] = useState(formData?.owners?.permanentAddress || "");
  const [isCorrespondenceAddress, setIsCorrespondenceAddress] = useState(
    formData?.owners?.isCorrespondenceAddress || false
  );
  const isMovable = formData?.TradeDetails?.StructureType?.code === "MOVABLE";
  const isMultipleOwners = !ownershipCategory?.code?.includes("SINGLEOWNER");

  function handleCorrespondenceAddress(e) {
    if (e.target.checked) {
      const obj = {
        doorNo,
        street,
        landmark,
        locality: selectedLocality?.name,
        city: selectedCity?.name,
        pincode,
      };
      let addr = "";
      for (const key in obj) {
        if (key === "pincode" || (!obj["pincode"] && key === "city")) {
          addr += obj[key] ? obj[key] : "";
        } else if (obj[key]) {
          addr += t(`${obj[key]}`) + ", ";
        }
      }
      setPermanentAddress(addr);
    } else {
      setPermanentAddress("");
    }
    setIsCorrespondenceAddress(e.target.checked);
  }

  // ── Disabled flag ─────────────────────────────────────────────────────────────
  const isDisabled =
    !selectedLocality ||
    !ownershipCategory?.code ||
    !ownersState?.[0]?.name ||
    (typeOfOwner !== "INSTITUTIONAL" && !ownersState?.[0]?.gender) ||
    !ownersState?.[0]?.mobilenumber ||
    !!pincodeError ||
    !!landmarkError;

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSkip = () => onSelect();

  const goNext = () => {
    if (pincodeError || landmarkError) return;

    // Validate pincode serviceability only when pincode is provided
    if (pincode) {
      const foundCity = allCities?.find((obj) =>
        obj.pincode?.find((item) => item == pincode)
      );
      if (!foundCity) {
        setPincodeError("TL_COMMON_PINCODE_NOT_SERVICABLE");
        return;
      }
    }

    const newAddress = {
      city: selectedCity,
      locality: selectedLocality,
      pincode,
      street,
      doorNo,
      landmark,
      geoLocation,
    };

    const newOwnership = { ...ownershipCategory, isSameAsPropertyOwner };

    const newOwners = {
      ...(formData?.owners || {}),
      owners: ownersState,
      permanentAddress,
      isCorrespondenceAddress,
    };

    sessionStorage.setItem("ownershipCategory", ownershipCategory?.value);
    sessionStorage.setItem("isSameAsPropertyOwner", isSameAsPropertyOwner);

    // Update all keys at once without triggering the built-in navigation
    onSelect("formData", {
      ...formData,
      address: { ...formData?.address, ...newAddress },
      ownershipCategory: newOwnership,
      owners: newOwners,
    });

    // Navigate to the next step manually
    const nextPath = pathname.replace(
      "select-combined-location-details",
      "select-combined-proof-details"
    );
    history.push(nextPath);
  };

  /* ── Shared grid styles (matches SelectCombinedTradeDetails) ── */
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

  return (
    <React.Fragment>
      <style>{`
        .tl-location-form .select,
        .tl-location-form .select-active {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .tl-location-form .select-wrap,
        .tl-location-form .employee-select-wrap {
          max-width: none !important;
          position: relative !important;
          overflow: visible !important;
        }
        .tl-location-form .select-wrap .options-card,
        .tl-location-form .employee-select-wrap .options-card {
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
        .tl-location-form .text-input-width {
          max-width: none !important;
        }
        .tl-location-form .citizen-card-input,
        .tl-location-form .card-input {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          height: 40px !important;
        }
      `}</style>

      {window.location.href.includes("/citizen") ? <Timeline currentStep={2} /> : null}

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)",
        borderRadius: "12px", padding: "28px 36px", marginBottom: "24px",
        color: "#fff", display: "flex", alignItems: "center", gap: "20px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "26px",
        }}>📍</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 2 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("ES_NEW_APPLICATION_LOCATION_DETAILS")}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("TL_LOCATION_OWNER_SUBTITLE") || "Trade location, ownership type and owner details"}</p>
        </div>
      </div>

      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={isDisabled} forcedError={t(pincodeError || landmarkError || "")}>
        <div style={{ maxWidth: "100%", width: "100%" }} className="tl-location-form">

          {/* ══ CARD 1 – Trade Location + Location Details ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🗺️ {t("TL_GEOLOCATION_HEADER") || "Map / Pick Location"}</div>

            {/* Map */}
            <LocationSearch
              position={geoLocation}
              onChange={(code, location) => onMapChange(code, location)}
              isPTDefault={true}
              PTdefaultcoord={defaultcoord1}
            />
            {mapPincodeError && <CardLabelError style={{ marginTop: "4px" }}>{t(mapPincodeError)}</CardLabelError>}

            <div style={{ borderTop: "1px solid #e8ecf0", margin: "20px 0 16px" }} />
            <div style={{ ...sectionTitleStyle, marginBottom: "16px" }}>📍 {t("TL_ADDRESS_DETAILS") || "Location Details"}</div>

            {/* Row 1: Pincode + City */}
            <div style={rowStyle}>
              <div style={col6}>
                <label style={labelStyle}>{t("CORE_COMMON_PINCODE")}</label>
                <TextInput
                  t={t}
                  type="text"
                  name="pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setPincodeError(null);
                    setSelectedCity(null);
                    setSelectedLocality(null);
                    setLocalities(null);
                  }}
                  disable={isEdit}
                  minlength={6}
                  maxlength={7}
                  pattern="^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$"
                  title={t("CORE_COMMON_PINCODE_INVALID")}
                />
                {pincodeError && <CardLabelError style={{ marginTop: "-14px" }}>{t(pincodeError)}</CardLabelError>}
              </div>

              <div style={col6}>
                <label style={labelStyle}>{t("MYCITY_CODE_LABEL")}<span style={requiredMark}>*</span></label>
                <span className="form-pt-dropdown-only">
                  <RadioOrSelect
                    options={(cities || []).sort((a, b) => a.name?.localeCompare(b.name))}
                    selectedOption={selectedCity}
                    optionKey="i18nKey"
                    onSelect={selectCity}
                    t={t}
                    isDependent={true}
                    labelKey=""
                    disabled={isEdit}
                  />
                </span>
              </div>
            </div>

            {/* Locality — shown once city is selected */}
            {selectedCity && localities && (
              <div style={rowStyle}>
                <div style={col12}>
                  <label style={labelStyle}>{t("TL_LOCALIZATION_LOCALITY")}<span style={requiredMark}>*</span></label>
                  <span className="form-pt-dropdown-only">
                    <RadioOrSelect
                      isMandatory={true}
                      options={(localities || []).sort((a, b) => a.name?.localeCompare(b.name))}
                      selectedOption={selectedLocality}
                      optionKey="i18nkey"
                      onSelect={setSelectedLocality}
                      t={t}
                      dropdownStyle={{ paddingBottom: "20px" }}
                      optionCardStyles={{ maxHeight: "210px", overflow: "scroll" }}
                      labelKey=""
                      disabled={isEdit}
                    />
                  </span>
                </div>
              </div>
            )}

            {/* Row 2: Street + Door No */}
            <div style={rowStyle}>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_LOCALIZATION_STREET_NAME")}</label>
                <TextInput t={t} type="text" name="street" value={street} onChange={(e) => setStreet(e.target.value)} disable={isEdit} maxlength={256} />
              </div>
              <div style={col6}>
                <label style={labelStyle}>{t("TL_LOCALIZATION_BUILDING_NO")}</label>
                <TextInput t={t} type="text" name="doorNo" value={doorNo} onChange={(e) => setDoorNo(e.target.value)} disable={isEdit} maxlength={256} />
              </div>
            </div>

            {/* Row 3: Landmark (full width) */}
            <div style={rowStyle}>
              <div style={col12}>
                <label style={labelStyle}>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK")}</label>
                <TextArea name="landmark" value={landmark} onChange={onLandmarkChange} maxLength={1024} />
                {landmarkError && <CardLabelError style={{ marginTop: "-14px" }}>{t(landmarkError)}</CardLabelError>}
              </div>
            </div>
          </div>

          {/* ══ CARD 2 – Ownership Details ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>💼 {t("TL_PROVIDE_OWNERSHIP_DETAILS")}</div>

            {formData?.cpt?.details && (
              <div style={{ marginBottom: "16px" }}>
                <CheckBox
                  label={t("TL_COMMON_SAME_AS_PROPERTY_OWNERS")}
                  onChange={selectIsSameAsPropertyOwner}
                  value={isSameAsPropertyOwner}
                  checked={isSameAsPropertyOwner || false}
                />
              </div>
            )}

            <div style={rowStyle}>
              <div style={col12}>
                <label style={labelStyle}>{t("TL_NEW_OWNER_DETAILS_OWNERSHIP_TYPE_LABEL")}<span style={requiredMark}>*</span></label>
                <Dropdown
                  t={t}
                  optionKey="i18nKey"
                  option={ownershipDropdownData}
                  selected={ownershipCategory?.code ? ownershipCategory : {}}
                  select={(v) => setOwnershipCategory(v)}
                  disable={isSameAsPropertyOwner}
                />
              </div>
            </div>
          </div>

          {/* ══ CARD 3 – Owner Details ══ */}
          {ownershipCategory?.code && <div style={cardStyle}>
            <div style={sectionTitleStyle}>👤 {t("TL_OWNERSHIP_INFO_SUB_HEADER")}</div>

            {typeOfOwner === "INSTITUTIONAL"
              ? ownersState.map((field, index) => (
                  <div key={index} style={unitCardStyle}>
                    {/* Row: Institution Name + Institution Type */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_INSTITUTION_NAME_LABEL")}<span style={requiredMark}>*</span></label>
                        <TextInput
                          t={t} type="text" name="institutionName" value={field.institutionName}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "institutionName", value: e.target.value } })}
                        />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_INSTITUTION_TYPE_LABEL")}<span style={requiredMark}>*</span></label>
                        <Dropdown
                          t={t} option={institutionOwnershipTypeOptions} selected={field.subOwnerShipCategory} optionKey="i18nKey"
                          select={(v) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "subOwnerShipCategory", value: v } })}
                        />
                      </div>
                    </div>

                    <div style={{ ...sectionTitleStyle, fontSize: "13px", marginTop: "8px" }}>{t("TL_AUTHORIZED_PERSON_DETAILS")}</div>

                    {/* Row: Name + Mobile */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_NEW_OWNER_DETAILS_NAME_LABEL")}<span style={requiredMark}>*</span></label>
                        <TextInput
                          t={t} type="text" name="name" value={field.name}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "name", value: e.target.value } })}
                          validation={{ pattern: "^[a-zA-Z]+( [a-zA-Z]+)*$", title: t("TL_NAME_ERROR_MESSAGE") }}
                        />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_MOBILE_NUMBER_LABEL")}<span style={requiredMark}>*</span></label>
                        <div className="field-container">
                          <span className="employee-card-input employee-card-input--front" style={{ marginTop: "-1px" }}>+91</span>
                          <TextInput
                            t={t} type="text" name="mobilenumber" value={field.mobilenumber}
                            maxlength={10}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                              dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "mobilenumber", value: val } });
                            }}
                            validation={{ pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row: Designation + Telephone */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_NEW_OWNER_DESIG_LABEL")}</label>
                        <TextInput
                          t={t} type="text" name="designation" value={field.designation}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "designation", value: e.target.value } })}
                        />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_TELEPHONE_NUMBER_LABEL")}</label>
                        <div className="field-container">
                          <span className="employee-card-input employee-card-input--front" style={{ marginTop: "-1px" }}>+91</span>
                          <TextInput
                            t={t} type="text" name="altContactNumber" value={field.altContactNumber}
                            onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "altContactNumber", value: e.target.value } })}
                            validation={{ pattern: "[0][1-9][0-9]{9}|[1-9][0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row: Email (full width) */}
                    <div style={rowStyle}>
                      <div style={col12}>
                        <label style={labelStyle}>{t("NOC_APPLICANT_EMAIL_LABEL")}</label>
                        <TextInput
                          t={t} type="text" name="emailId" value={field.emailId}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "emailId", value: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                ))
              : ownersState.map((field, index) => (
                  <div key={index} style={unitCardStyle}>
                    {typeOfOwner === "MULTIOWNER" && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "600", fontSize: "12px", color: "#4e5d78" }}>{`Owner ${index + 1}`}</span>
                        {ownersState.length > 1 && (
                          <button
                            type="button"
                            onClick={() => dispatchOwners({ type: "REMOVE_THIS_OWNER", payload: { index } })}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}
                          >✕</button>
                        )}
                      </div>
                    )}

                    {/* Row: Name + Mobile */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_NEW_OWNER_DETAILS_NAME_LABEL")}<span style={requiredMark}>*</span></label>
                        <TextInput
                          t={t} type="text" name="name" value={field.name}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "name", value: e.target.value } })}
                          validation={{ isRequired: true, pattern: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]$", type: "text", title: t("TL_NAME_ERROR_MESSAGE") }}
                        />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_MOBILE_NUMBER_LABEL")}<span style={requiredMark}>*</span></label>
                        <div className="field-container">
                          <span className="employee-card-input employee-card-input--front" style={{ marginTop: "-1px" }}>+91</span>
                          <TextInput
                            t={t} type="text" name="mobilenumber" value={field.mobilenumber}
                            maxlength={10}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                              dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "mobilenumber", value: val } });
                            }}
                            validation={{ isRequired: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row: Guardian Name + Relationship */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_NEW_OWNER_DETAILS_GUARDIAN_LABEL")}<span style={requiredMark}>*</span></label>
                        <TextInput
                          t={t} type="text" name="fatherOrHusbandName" value={field.fatherOrHusbandName}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "fatherOrHusbandName", value: e.target.value } })}
                          validation={{ isRequired: true, pattern: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]$", type: "text", title: t("TL_NAME_ERROR_MESSAGE") }}
                        />
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_RELATIONSHIP_WITH_GUARDIAN_LABEL")}<span style={requiredMark}>*</span></label>
                        <RadioButtons
                          t={t} options={relationshipMenu} optionsKey="i18nKey"
                          name={`relationship-${index}`} selectedOption={field.relationship}
                          onSelect={(v) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "relationship", value: v } })}
                        />
                      </div>
                    </div>

                    {/* Row: Gender + Email */}
                    <div style={rowStyle}>
                      <div style={col6}>
                        <label style={labelStyle}>{t("TL_NEW_OWNER_DETAILS_GENDER_LABEL")}<span style={requiredMark}>*</span></label>
                        {isGenderLoading ? (
                          <Loader />
                        ) : (
                          <RadioButtons
                            t={t} options={TLmenu} optionsKey="i18nKey"
                            name={`gender-${index}`} selectedOption={field.gender}
                            onSelect={(v) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "gender", value: v } })}
                            isPTFlow={true}
                          />
                        )}
                      </div>
                      <div style={col6}>
                        <label style={labelStyle}>{t("NOC_APPLICANT_EMAIL_LABEL")}</label>
                        <TextInput
                          t={t} type="text" name="emailId" value={field.emailId}
                          onChange={(e) => dispatchOwners({ type: "EDIT_CURRENT_OWNER_PROPERTY", payload: { index, key: "emailId", value: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

            {typeOfOwner === "MULTIOWNER" && (
              <button
                type="button"
                onClick={() => dispatchOwners({ type: "ADD_NEW_OWNER" })}
                style={{
                  display: "block", width: "100%", padding: "10px",
                  background: "none", border: "2px dashed #f47738",
                  borderRadius: "8px", color: "#f47738", fontWeight: "600",
                  fontSize: "14px", cursor: "pointer", marginTop: "4px",
                }}
              >+ {t("PT_COMMON_ADD_APPLICANT_LABEL")}</button>
            )}
          </div>}

          {/* ══ CARD 4 – Owner Address ══ */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>🏠 {t("TL_OWNERS_ADDRESS")}</div>
            <div style={rowStyle}>
              <div style={col12}>
                <TextArea
                  isMandatory={false}
                  name="permanentAddress"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                />
                {!isMovable && (
                  <CheckBox
                    label={t("TL_COMMON_SAME_AS_TRADE_ADDRESS")}
                    onChange={handleCorrespondenceAddress}
                    value={isCorrespondenceAddress}
                    checked={isCorrespondenceAddress || false}
                    style={{ paddingTop: "10px" }}
                  />
                )}
                {isMultipleOwners && (
                  <CitizenInfoLabel
                    info={t("CS_FILE_APPLICATION_INFO_LABEL")}
                    text={t("TL_PRIMARY_ADDR_INFO_MSG")}
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default SelectCombinedLocationDetails;
