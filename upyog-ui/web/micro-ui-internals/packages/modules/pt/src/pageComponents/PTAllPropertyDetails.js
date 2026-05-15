import React, { useState, useEffect, Fragment } from "react";
import {
  CardLabel,
  CardLabelDesc,
  LabelFieldPair,
  TextInput,
  Dropdown,
  RadioOrSelect,
  CardLabelError,
  Loader,
  UploadFile,
} from "@upyog/digit-ui-react-components";
import FormStep from "../../../../react-components/src/molecules/FormStep";
import Timeline from "../components/TLTimeline";
import { stringReplaceAll } from "../utils";
import UploadFileDigiLocker from "../utils/UploadFile";

const getUsageCategoryParsed = (code = "") => {
  const arr = code.split(".");
  return {
    usageCategoryMinor: arr[1] || false,
    usageCategorySubMinor: arr[2] || false,
    usageCategoryDetail: arr[3] || false,
  };
};

const PTAllPropertyDetails = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();

  /* â”€â”€ Is Residential â”€â”€ */
  const isResOptions = [
    { i18nKey: "PT_COMMON_YES", code: "RESIDENTIAL" },
    { i18nKey: "PT_COMMON_NO", code: "NONRESIDENTIAL" },
  ];
  const [isResdential, setIsResdential] = useState(formData?.isResdential || null);

  /* â”€â”€ Usage Category Major (Non-residential only) â”€â”€ */
  const { data: usageCatMDMS = {}, isLoading: usageCatLoading } =
    Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "UsageCategory") || {};
  const usagecat = usageCatMDMS?.PropertyTax?.UsageCategory || [];
  const usageCategoryOptions = usagecat
    .filter((e) => e?.code.split(".").length <= 2 && e.code !== "NONRESIDENTIAL")
    .map((item) => {
      const arr = item?.code.split(".");
      return arr.length === 2
        ? { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + arr[1], code: item?.code }
        : { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + item?.code, code: item?.code };
    });
  const [usageCategoryMajor, setUsageCategoryMajor] = useState(formData?.usageCategoryMajor || null);

  /* â”€â”€ Property Type â”€â”€ */
  const { data: propTypeMDMS = {}, isLoading: propTypeLoading } =
    Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "PTPropertyType") || {};
  const proptype = propTypeMDMS?.PropertyTax?.PropertyType || [];
  const getPropertyTypeMenu = () =>
    proptype
      .map((item) => ({
        i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(item?.code, ".", "_"),
        code: item?.code,
      }))
      .sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
  const [PropertyType, setPropertyType] = useState(formData?.PropertyType || null);

  /* â”€â”€ Electricity â”€â”€ */
  const [electricity, setElectricity] = useState(
    formData?.electricity?.electricity || formData?.additionalDetails?.electricity || ""
  );
  const [electricityError, setElectricityError] = useState("");

  /* â”€â”€ Property Structure Details â”€â”€ */
  const structureTypeOptions = [
    { i18nKey: "Permanent", code: "permanent" },
    { i18nKey: "Temporary", code: "temporary" },
    { i18nKey: "SEMI_PERMANENT", code: "semi permanent" },
    { i18nKey: "RCC", code: "RCC" },
  ];
  const ageOfPropertyOptions = [
    { i18nKey: "PROPERTYTAX_MONTH>10", code: "10" },
    { i18nKey: "PROPERTYTAX_MONTH>15", code: "15" },
    { i18nKey: "PROPERTYTAX_MONTH>25", code: "25" },
  ];
  const [propertyStructureDetails, setPropertyStructureDetails] = useState(
    formData?.propertyStructureDetails || { structureType: null, ageOfProperty: null }
  );

  /* ── Area (sq ft) – mandatory for all property types ── */
  const [floorarea, setFloorarea] = useState(formData?.landArea?.floorarea || "");

  /* ── Number of Basements (Independent) ── */
  const basementOptions = [
    { code: 0, i18nKey: "PT_NO_BASEMENT_OPTION" },
    { code: 1, i18nKey: "PT_ONE_BASEMENT_OPTION" },
    { code: 2, i18nKey: "PT_TWO_BASEMENT_OPTION" },
  ];
  const [noOofBasements, setNoOofBasements] = useState(formData?.noOofBasements || null);

  /* â”€â”€ Number of Floors (Independent) â”€â”€ */
  const floorOptions = [
    { i18nKey: "PT_GROUND_FLOOR_OPTION", code: 0 },
    { i18nKey: "PT_GROUND_PLUS_ONE_OPTION", code: 1 },
    { i18nKey: "PT_GROUND_PLUS_TWO_OPTION", code: 2 },
  ];
  const [noOfFloors, setNoOfFloors] = useState(formData?.noOfFloors || null);

  /* â”€â”€ Property Address State â”€â”€ */
  const allCities = Digit.Hooks.pt.useTenants();
  const [cities, setCities] = useState(allCities || []);
  const [selectedCity, setSelectedCity] = useState(formData?.address?.city || null);
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    { enabled: !!selectedCity },
    t
  );
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality || null);
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");
  const [street, setStreet] = useState(formData?.address?.street || "");
  const [doorNo, setDoorNo] = useState(formData?.address?.doorNo || "");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || "");
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const addressDocs = Documentsob?.PropertyTax?.Documents;
  const proofOfAddress = Array.isArray(addressDocs) ? addressDocs.filter((doc) => doc.code.includes("ADDRESSPROOF")) : [];
  let addressDropdownData = [];
  if (proofOfAddress.length > 0) {
    addressDropdownData = proofOfAddress[0]?.dropdownData?.filter((doc) => doc?.active === true) || [];
    addressDropdownData.forEach((d) => { d.i18nKey = stringReplaceAll(d.code, ".", "_"); });
  }
  const [digiLockerUpload, setDigiLockerUpload] = useState(false);
  const [proofDocType, setProofDocType] = useState(formData?.address?.documents?.ProofOfAddress?.documentType || null);
  const [uploadedFile, setUploadedFile] = useState(formData?.address?.documents?.ProofOfAddress?.fileStoreId || null);
  const [uploadedFileObj, setUploadedFileObj] = useState(formData?.address?.documents?.ProofOfAddress || null);
  const [uploadError, setUploadError] = useState(null);

  /* â”€â”€ Floor Usage MDMS â”€â”€ */
  const { data: floorMdms } = Digit.Hooks.useCommonMDMSV2(
    stateId,
    "PropertyTax",
    ["OccupancyType", "UsageCategory", "Floor"],
    {
      select: (data) => {
        const usageCats = data?.PropertyTax?.UsageCategory?.map((c) => getUsageCategoryParsed(c.code))
          .filter((c) => !c.usageCategoryDetail && !c.usageCategorySubMinor && c.usageCategoryMinor)
          .map((c) => ({ code: c.usageCategoryMinor, i18nKey: `PROPERTYTAX_BILLING_SLAB_${c.usageCategoryMinor}` }));
        const subCats = Digit.Utils.getUnique(
          data?.PropertyTax?.UsageCategory?.map((e) => getUsageCategoryParsed(e.code))
            .filter((e) => e.usageCategorySubMinor)
            .map((e) => ({
              code: e.usageCategorySubMinor,
              i18nKey: `PROPERTYTAX_BILLING_SLAB_${e.usageCategorySubMinor}`,
              usageCategoryMinor: e.usageCategoryMinor,
            }))
        );
        return {
          Floor: data?.PropertyTax?.Floor?.filter((f) => f.active)?.map((f) => ({
            i18nKey: `PROPERTYTAX_FLOOR_${f.code}`,
            code: f.code,
          })),
          OccupancyType: data?.PropertyTax?.OccupancyType?.filter((o) => o.active)?.map((o) => ({
            i18nKey: `PROPERTYTAX_OCCUPANCYTYPE_${o.code}`,
            code: o.code,
          })),
          UsageCategory: [
            ...(usageCats || []),
            { code: "RESIDENTIAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL" },
          ],
          UsageSubCategory: subCats || [],
          usageDetails: data?.PropertyTax?.UsageCategory,
        };
      },
      retry: false,
    }
  );

  /* â”€â”€ Flat Units (Shared/Flat property) â”€â”€ */
  const createEmptyFlatUnit = () => ({
    usageCategory: null,
    unitType: null,
    occupancyType: null,
    builtUpArea: "",
    floorNo: null,
  });

  const [flatUnits, setFlatUnits] = useState(() => {
    const existing = formData?.units;
    if (existing && existing.length > 0) {
      return existing.map((unit) => {
        const usageCatCode = unit?.usageCategory?.includes?.("NONRESIDENTIAL") === false || unit?.usageCategory?.includes?.("NONRESIDENTIAL") === undefined
          ? "RESIDENTIAL"
          : getUsageCategoryParsed(unit?.usageCategory || "").usageCategoryMinor;
        return {
          usageCategory: usageCatCode ? { code: usageCatCode, i18nKey: `PROPERTYTAX_BILLING_SLAB_${usageCatCode}` } : null,
          unitType: unit?.unitType ? { code: unit.unitType, i18nKey: `PROPERTYTAX_BILLING_SLAB_${unit.unitType}` } : null,
          occupancyType: unit?.occupancyType ? { code: unit.occupancyType, i18nKey: `PROPERTYTAX_OCCUPANCYTYPE_${unit.occupancyType}` } : null,
          builtUpArea: unit?.constructionDetail?.builtUpArea || "",
          floorNo: unit?.floorNo !== undefined ? { code: unit.floorNo, i18nKey: `PROPERTYTAX_FLOOR_${unit.floorNo}` } : null,
        };
      });
    }
    return [createEmptyFlatUnit()];
  });

  /* â”€â”€ Floor Units helpers â”€â”€ */
  const getFloorList = (floors, basements) => {
    if (floors === null || floors === undefined) return [];
    const list = [];
    for (let i = 0; i <= floors.code; i++) list.push(i);
    if (basements && basements.code > 0) {
      for (let i = -1; i >= -(basements.code); i--) list.push(i);
    }
    return list;
  };

  const createEmptyUnit = (floorNo) => ({
    usageCategory: null,
    unitType: null,
    occupancyType: null,
    builtUpArea: "",
    floorNo: { code: floorNo, i18nKey: `PROPERTYTAX_FLOOR_${floorNo}` },
  });

  const [floorUnits, setFloorUnits] = useState(() => {
    const floorList = getFloorList(formData?.noOfFloors, formData?.noOofBasements);
    const existingUnits = formData?.units || [];
    return floorList.map((floorNo) => {
      const existing = existingUnits.find(
        (u) => (typeof u.floorNo === "object" ? u.floorNo?.code : u.floorNo) == floorNo
      );
      if (existing) {
        const usageCatCode = existing.usageCategory?.includes?.("RESIDENTIAL")
          ? "RESIDENTIAL"
          : getUsageCategoryParsed(existing.usageCategory || "").usageCategoryMinor;
        return {
          usageCategory: usageCatCode ? { code: usageCatCode, i18nKey: `PROPERTYTAX_BILLING_SLAB_${usageCatCode}` } : null,
          unitType: existing.unitType ? { code: existing.unitType, i18nKey: `PROPERTYTAX_BILLING_SLAB_${existing.unitType}` } : null,
          occupancyType: existing.occupancyType ? { code: existing.occupancyType, i18nKey: `PROPERTYTAX_OCCUPANCYTYPE_${existing.occupancyType}` } : null,
          builtUpArea: existing.constructionDetail?.builtUpArea || "",
          floorNo: { code: floorNo, i18nKey: `PROPERTYTAX_FLOOR_${floorNo}` },
        };
      }
      return createEmptyUnit(floorNo);
    });
  });

  const updateUnit = (idx, key, value) => {
    setFloorUnits((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };
      if (key === "usageCategory") updated[idx].unitType = null;
      return updated;
    });
  };

  /* â”€â”€ Derived flags â”€â”€ */
  const isIndependent = PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY";
  const isShared = PropertyType?.code === "BUILTUP.SHAREDPROPERTY";
  const isVacant = PropertyType?.code === "VACANT";
  const isNonResidential = isResdential?.i18nKey === "PT_COMMON_NO";

  /* â”€â”€ Regenerate floor units when basement/floor selection changes â”€â”€ */
  useEffect(() => {
    if (PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" && noOofBasements !== null && noOfFloors !== null) {
      const floorList = getFloorList(noOfFloors, noOofBasements);
      setFloorUnits((prev) =>
        floorList.map((floorNo) => {
          const existing = prev.find((u) => u.floorNo?.code == floorNo);
          return existing || createEmptyUnit(floorNo);
        })
      );
    }
  }, [noOofBasements, noOfFloors, PropertyType]);

  /* â”€â”€ Address: update city list when pincode/allCities changes â”€â”€ */
  useEffect(() => {
    if (!allCities?.length) return;
    if (pincode) {
      const filtered = allCities.filter((c) => c?.pincode?.some((p) => p == pincode));
      const list = filtered.length > 0 ? filtered : allCities;
      setCities(list);
      if (list.length === 1) setSelectedCity(list[0]);
    } else {
      setCities(allCities);
    }
  }, [pincode, allCities]);

  /* â”€â”€ Address: update localities when city/fetchedLocalities changes â”€â”€ */
  useEffect(() => {
    if (!selectedCity) {
      setLocalities([]);
      setSelectedLocality(null);
      return;
    }
    if (selectedCity && fetchedLocalities) {
      let list = fetchedLocalities;
      if (formData?.address?.locality) setSelectedLocality(formData.address.locality);
      if (pincode) {
        const filtered = list.filter((obj) => obj.pincode?.find((p) => p == pincode));
        if (filtered.length > 0) {
          list = filtered;
          if (!formData?.address?.locality) setSelectedLocality(null);
        }
      }
      setLocalities(list);
      if (list.length === 1) setSelectedLocality(list[0]);
    }
  }, [selectedCity, pincode, fetchedLocalities]);

  /* â”€â”€ Address: upload proof file â”€â”€ */
  useEffect(() => {
    if (!uploadedFileObj) return;
    (async () => {
      setUploadError(null);
      if (uploadedFileObj.size >= 2000000) {
        setUploadError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        return;
      }
      try {
        const response = await Digit.UploadServices.Filestorage(
          "property-upload",
          uploadedFileObj,
          Digit.ULBService.getStateId()
        );
        if (response?.data?.files?.length > 0) {
          setUploadedFile(response.data.files[0].fileStoreId);
        } else {
          setUploadError(t("PT_FILE_UPLOAD_ERROR"));
        }
      } catch (e) {
        setUploadError(t("PT_FILE_UPLOAD_ERROR"));
      }
    })();
  }, [uploadedFileObj]);

  /* â”€â”€ Handlers â”€â”€ */
  const handleElectricityChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setElectricity(value);
      setElectricityError(
        value.length > 0 && value.length !== 10 ? t("PT_ELECTRICITY_10_DIGIT_ERR") : ""
      );
    }
  };

  const handleAreaChange = (e) => {
    const regex = /^(|[1-9][0-9]{0,8}|)$/;
    if (regex.test(e.target.value) || e.target.value === "") {
      setFloorarea(e.target.value);
    }
  };

  /* â”€â”€ Flat unit handlers (Shared/Flat property) â”€â”€ */
  const updateFlatUnit = (idx, key, value) => {
    setFlatUnits((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };
      if (key === "usageCategory") updated[idx].unitType = null;
      return updated;
    });
  };

  const handleAddFlatUnit = () => {
    setFlatUnits((prev) => [...prev, createEmptyFlatUnit()]);
  };

  const handleRemoveFlatUnit = (idx) => {
    setFlatUnits((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSelectCity = (city) => {    setSelectedLocality(null);
    setLocalities([]);
    setSelectedCity(city);
  };

  const handleSelectProofDoc = (val) => {
    val?.digiLockerFetch === true ? setDigiLockerUpload(true) : setDigiLockerUpload(false);
    setUploadedFile(null);
    setProofDocType(val);
  };

  const handleSelectFile = (e, newFile) => {
    if (newFile) {
      setUploadedFileObj(newFile);
    } else {
      setUploadedFileObj(e.target.files[0]);
    }
  };

  /* â”€â”€ Validation â”€â”€ */
  const isFormValid = () => {
    if (!isResdential) return false;
    if (isNonResidential && !usageCategoryMajor) return false;
    if (!PropertyType) return false;
    if (!electricity || electricity.length !== 10) return false;
    if (!propertyStructureDetails?.structureType) return false;
    if (!propertyStructureDetails?.ageOfProperty) return false;
    if (!floorarea) return false;
    if (isIndependent && (noOofBasements === null || noOfFloors === null)) return false;
    if (isIndependent && floorUnits.length > 0) {
      const allValid = floorUnits.every((unit) => {
        if (!unit.usageCategory || !unit.occupancyType || !unit.builtUpArea) return false;
        if (unit.usageCategory?.code !== "RESIDENTIAL" && !unit.unitType) return false;
        return true;
      });
      if (!allValid) return false;
    }
    /* shared/flat unit validation */
    if (isShared) {
      const allValid = flatUnits.every((unit) => {
        if (!unit.usageCategory || !unit.occupancyType || !unit.builtUpArea || !unit.floorNo) return false;
        if (unit.usageCategory?.code !== "RESIDENTIAL" && !unit.unitType) return false;
        return true;
      });
      if (!allValid) return false;
    }
    /* address validation */
    if (!selectedCity) return false;
    if (!selectedLocality) return false;
    if (!street) return false;
    if (!doorNo) return false;
    if (!proofDocType) return false;
    if (!uploadedFileObj) return false;
    if (uploadError) return false;
    return true;
  };

  /* â”€â”€ Submit â”€â”€ */
  const goNext = () => {
    sessionStorage.setItem("PropertyType", PropertyType?.i18nKey);
    sessionStorage.setItem("isResdential", isResdential?.i18nKey);
    if (noOofBasements) sessionStorage.setItem("noOofBasements", noOofBasements?.i18nKey);

    const finalUsageCategory = isNonResidential
      ? usageCategoryMajor
      : { i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL", code: "RESIDENTIAL" };

    const unitsData =
      isIndependent && floorUnits.length > 0
        ? floorUnits.map((field) => {
            const unit = {};
            unit.floorNo = field.floorNo?.code;
            unit.usageCategory =
              floorMdms?.usageDetails?.find((e) => {
                const splitCode = e.code.split(".")[0];
                if (field.usageCategory?.code === "RESIDENTIAL") {
                  return splitCode === "RESIDENTIAL" && e.code.includes(field.unitType?.code || "");
                }
                return (
                  e.code.includes(field.usageCategory?.code || "") &&
                  e.code.includes(field.unitType?.code || "")
                );
              })?.code || field.usageCategory?.code;
            unit.occupancyType = field.occupancyType?.code;
            unit.constructionDetail = { builtUpArea: field.builtUpArea };
            if (field.unitType?.code) unit.unitType = field.unitType.code;
            return unit;
          })
        : isShared && flatUnits.length > 0
        ? flatUnits.map((field) => {
            const unit = {};
            unit.floorNo = field.floorNo?.code;
            unit.usageCategory =
              floorMdms?.usageDetails?.find((e) => {
                const splitCode = e.code.split(".")[0];
                if (field.usageCategory?.code === "RESIDENTIAL") {
                  return splitCode === "RESIDENTIAL" && e.code.includes(field.unitType?.code || "");
                }
                return (
                  e.code.includes(field.usageCategory?.code || "") &&
                  e.code.includes(field.unitType?.code || "")
                );
              })?.code || field.usageCategory?.code;
            unit.occupancyType = field.occupancyType?.code;
            unit.constructionDetail = { builtUpArea: field.builtUpArea };
            if (field.unitType?.code) unit.unitType = field.unitType.code;
            return unit;
          })
        : undefined;

    const addressData = {
      pincode,
      city: selectedCity,
      locality: selectedLocality,
      street,
      doorNo,
      landmark,
      documents: {
        ProofOfAddress: {
          documentType: proofDocType,
          fileStoreId: uploadedFile,
        },
      },
    };

    onSelect(config.key, {
      isResdential,
      usageCategoryMajor: finalUsageCategory,
      PropertyType,
      electricity: { electricity },
      propertyStructureDetails,
      landArea: { floorarea },
      noOofBasements: isIndependent ? noOofBasements : undefined,
      noOfFloors: isIndependent ? noOfFloors : undefined,
      units: unitsData,
      address: addressData,
    });
  };

  const onSkip = () => onSelect();

  if (propTypeLoading || usageCatLoading) return <Loader />;

  /* â”€â”€ Layout styles â”€â”€ */
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
  const col3 = {
    flex: "0 0 33.333%",
    maxWidth: "33.333%",
    padding: "0 10px",
    marginBottom: "18px",
    boxSizing: "border-box",
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
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}

      {/* ── Hero Banner ── */}
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
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 2 of 3</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("PT_PROPERTY_DETAILS_HEADER") || "Property Details"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("PT_PROPERTY_DETAILS_SUBHEADER") || "Fill in the property information below"}</p>
        </div>
      </div>

      <FormStep
        config={config}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={!isFormValid()}
        showErrorBelowChildren={true}
      >
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CARD 1 â€“ Property Details
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div style={{ maxWidth: "100%", width: "100%" }}>
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{t("PT_PROPERTY_DETAILS_HEADER") || "Property Details"}</div>
          <div style={rowStyle}>

            {/* Is Residential */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_PROPERTY_DETAILS_RESIDENTIAL_PROPERTY_HEADER")}<span style={requiredMark}>*</span></label>
              <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={isResOptions} selected={isResdential} select={setIsResdential} placeholder={t("PT_SELECT_PLACEHOLDER")} />
            </div>

            {/* Usage Category â€“ Non-residential only */}
            {isNonResidential && (
              <div style={col3}>
                <label style={labelStyle}>{t("PT_ASSESMENT_INFO_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
                <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={usageCategoryOptions} selected={usageCategoryMajor} select={setUsageCategoryMajor} placeholder={t("PT_SELECT_PLACEHOLDER")} />
              </div>
            )}

            {/* Property Type */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_ASSESMENT1_PROPERTY_TYPE")}<span style={requiredMark}>*</span></label>
              <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={getPropertyTypeMenu()} selected={PropertyType} select={setPropertyType} placeholder={t("PT_SELECT_PLACEHOLDER")} />
            </div>

            {/* Electricity Number */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_ELECTRICITY_LABEL")}<span style={requiredMark}>*</span></label>
              <TextInput t={t} type="text" value={electricity} onChange={handleElectricityChange} placeholder={t("PT_ASSESMENT1_ELECTRICITY_NUMBER")} maxLength={10} />
              {electricityError && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{electricityError}</CardLabelError>}
            </div>

            {/* Structure Type */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_STRUCTURE_TYPE")}<span style={requiredMark}>*</span></label>
              <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={structureTypeOptions} selected={propertyStructureDetails?.structureType} select={(val) => setPropertyStructureDetails({ ...propertyStructureDetails, structureType: val })} placeholder={t("PT_SELECT_STRUCTURE_TYPE")} />
            </div>

            {/* Age of Property */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_AGE_OF_PROPERTY")}<span style={requiredMark}>*</span></label>
              <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={ageOfPropertyOptions} selected={propertyStructureDetails?.ageOfProperty} select={(val) => setPropertyStructureDetails({ ...propertyStructureDetails, ageOfProperty: val })} placeholder={t("PT_SELECT_AGE_OF_PROPERTY")} />
            </div>

            {/* Area (sq ft) – all property types */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_PLOT_SIZE_SQUARE_FEET_LABEL")}<span style={requiredMark}>*</span></label>
              <TextInput t={t} type="text" isMandatory={true} value={floorarea} onChange={handleAreaChange} placeholder={t("PT_FORM2_PLOT_SIZE_PLACEHOLDER")} pattern="[0-9]+" title={t("CORE_COMMON_REQUIRED_ERRMSG")} />
            </div>

            {/* No. of Basements â€“ Independent only */}
            {isIndependent && (
              <div style={col3}>
                <label style={labelStyle}>{t("PT_PROPERTY_DETAILS_NO_OF_BASEMENTS_HEADER")}</label>
                <Dropdown t={t} optionKey="i18nKey" option={basementOptions} selected={noOofBasements} select={setNoOofBasements} placeholder={t("PT_SELECT_NO_OF_BASEMENTS")} />
              </div>
            )}

            {/* No. of Floors â€“ Independent only */}
            {isIndependent && (
              <div style={col3}>
                <label style={labelStyle}>{t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")}</label>
                <Dropdown t={t} optionKey="i18nKey" option={floorOptions} selected={noOfFloors} select={setNoOfFloors} placeholder={t("PT_SELECT_NO_OF_FLOORS")} />
              </div>
            )}

          </div>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CARD 2 â€“ Floor Usage (Independent)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {isIndependent && noOofBasements !== null && noOfFloors !== null && floorUnits.length > 0 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("PT_FLOOR_USAGE_DETAILS") || "Floor Usage Details"}</div>
            {floorUnits.map((unit, idx) => (
              <div key={`floor-unit-${idx}-${unit.occupancyType?.code || "none"}`} style={unitCardStyle}>
                <div style={{ fontWeight: "600", fontSize: "13px", color: "#1a2b49", marginBottom: "14px" }}>
                  {t(`PROPERTYTAX_FLOOR_${unit.floorNo?.code}`)}
                </div>
                <div style={rowStyle}>
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.UsageCategory || []} selected={unit.usageCategory} select={(val) => updateUnit(idx, "usageCategory", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                  </div>
                  {unit.usageCategory?.code && unit.usageCategory.code !== "RESIDENTIAL" && (
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM2_SUB_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
                      <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.UsageSubCategory?.filter((c) => c.usageCategoryMinor === unit.usageCategory?.code) || []} selected={unit.unitType} select={(val) => updateUnit(idx, "unitType", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                    </div>
                  )}
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_OCCUPANCY")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.OccupancyType || []} selected={unit.occupancyType} select={(val) => updateUnit(idx, "occupancyType", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                  </div>
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_BUILT_UP_AREA_HEADER")}<span style={requiredMark}>*</span></label>
                    <TextInput t={t} type="text" value={unit.builtUpArea || ""} onChange={(e) => { const regex = /^(0|[1-9][0-9]{0,8}|)$/; if (regex.test(e.target.value) || e.target.value === " ") { if (floorarea && parseInt(e.target.value) > parseInt(floorarea)) { alert(t("PT_BUILTUPAREA_PLOTSIZE_ERROR_MSG")); } else { updateUnit(idx, "builtUpArea", e.target.value); } } }} isRequired={true} pattern="[0-9]+" title={t("CORE_COMMON_REQUIRED_ERRMSG")} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CARD 3 â€“ Flat Details (Shared)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {isShared && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{t("PT_FLAT_DETAILS_HEADER") || "Flat Details"}</div>
            {flatUnits.map((unit, idx) => (
              <div key={`flat-unit-${idx}-${unit.occupancyType?.code || "none"}`} style={unitCardStyle}>
                {flatUnits.length > 1 && (
                  <button type="button" onClick={() => handleRemoveFlatUnit(idx)} style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#888", lineHeight: 1 }}>âœ•</button>
                )}
                <div style={rowStyle}>
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={[...(floorMdms?.UsageCategory || []), { code: "RESIDENTIAL", i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL" }].filter((v, i, arr) => arr.findIndex((x) => x.code === v.code) === i)} selected={unit.usageCategory} select={(val) => updateFlatUnit(idx, "usageCategory", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                  </div>
                  {unit.usageCategory?.code && unit.usageCategory.code !== "RESIDENTIAL" && (
                    <div style={col3}>
                      <label style={labelStyle}>{t("PT_FORM2_SUB_USAGE_TYPE")}<span style={requiredMark}>*</span></label>
                      <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.UsageSubCategory?.filter((c) => c.usageCategoryMinor === unit.usageCategory?.code) || []} selected={unit.unitType} select={(val) => updateFlatUnit(idx, "unitType", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                    </div>
                  )}
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_OCCUPANCY")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.OccupancyType || []} selected={unit.occupancyType} select={(val) => updateFlatUnit(idx, "occupancyType", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                  </div>
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_BUILT_UP_AREA")}<span style={requiredMark}>*</span></label>
                    <TextInput t={t} type="text" value={unit.builtUpArea || ""} onChange={(e) => { const regex = /^(0|[1-9][0-9]{0,8}|)$/; if (regex.test(e.target.value) || e.target.value === "") { updateFlatUnit(idx, "builtUpArea", e.target.value); } }} isRequired={true} pattern="[0-9]+" title={t("CORE_COMMON_REQUIRED_ERRMSG")} />
                  </div>
                  <div style={col3}>
                    <label style={labelStyle}>{t("PT_FORM2_SELECT_FLOOR")}<span style={requiredMark}>*</span></label>
                    <Dropdown t={t} optionKey="i18nKey" isMandatory={true} option={floorMdms?.Floor || []} selected={unit.floorNo} select={(val) => updateFlatUnit(idx, "floorNo", val)} placeholder={t("PT_SELECT_PLACEHOLDER")} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddFlatUnit} style={{ background: "none", border: "none", cursor: "pointer", color: "#f47738", fontWeight: "700", fontSize: "14px", padding: "4px 0", marginTop: "4px" }}>
              + {t("PT_ADD_UNIT")}
            </button>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CARD 4 â€“ Property Address
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>{t("CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT") || "Property Address"}</div>
          <div style={rowStyle}>

            {/* City */}
            <div style={col3}>
              <label style={labelStyle}>{t("MYCITY_CODE_LABEL")}<span style={requiredMark}>*</span></label>
              <span className="form-pt-dropdown-only">
                <RadioOrSelect options={cities.sort((a, b) => a.name.localeCompare(b.name))} selectedOption={selectedCity} optionKey="i18nKey" onSelect={handleSelectCity} t={t} isPTFlow={true} />
              </span>
            </div>

            {/* Locality */}
            {selectedCity && localities && localities.length > 0 && (
              <div style={col3}>
                <label style={labelStyle}>{t("PT_LOCALITY_LABEL")}<span style={requiredMark}>*</span></label>
                <span className="form-pt-dropdown-only">
                  <RadioOrSelect dropdownStyle={{ paddingBottom: "20px" }} options={localities.sort((a, b) => a.name.localeCompare(b.name))} selectedOption={selectedLocality} optionKey="i18nkey" onSelect={setSelectedLocality} t={t} />
                </span>
              </div>
            )}

            {/* Pincode */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_PROPERTY_ADDRESS_PINCODE")}</label>
              <TextInput type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={7} pattern="[0-9]+" />
            </div>

            {/* Street Name */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_PROPERTY_ADDRESS_STREET_NAME")}<span style={requiredMark}>*</span></label>
              <TextInput type="text" value={street} onChange={(e) => setStreet(e.target.value)} maxLength={64} />
            </div>

            {/* House / Door No */}
            <div style={col3}>
              <label style={labelStyle}>{t("PT_PROPERTY_ADDRESS_HOUSE_NO")}<span style={requiredMark}>*</span></label>
              <TextInput type="text" value={doorNo} onChange={(e) => setDoorNo(e.target.value)} maxLength={64} />
            </div>

            {/* Landmark */}
            <div style={col3}>
              <label style={labelStyle}>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK")}</label>
              <TextInput type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} maxLength={1024} />
            </div>

          </div>

          {/* Proof of Address */}
          <div style={{ marginTop: "20px", background: "#f8f9fe", border: "1px solid #e4e8f0", borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e4e8f0" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #1a2b49, #2d4a7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2b49" }}>Proof of Address</div>
                <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "2px" }}>{t("PT_UPLOAD_RESTRICTIONS_TYPES")} &middot; {t("PT_UPLOAD_RESTRICTIONS_SIZE")}</div>
              </div>
            </div>
            <div style={rowStyle}>
              <div style={col6}>
                <label style={labelStyle}>{t("PT_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
                <Dropdown t={t} isMandatory={false} option={addressDropdownData} selected={proofDocType} optionKey="i18nKey" select={handleSelectProofDoc} placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")} />
              </div>
              <div style={col6}>
                <div style={{ border: "2px dashed #c8d0dc", borderRadius: "10px", background: "#ffffff", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                    <span style={{ fontSize: "18px", lineHeight: 1 }}>📎</span>
                    <span style={{ fontSize: "10px", color: "#8a97a8", whiteSpace: "nowrap" }}>JPG &middot; PNG &middot; PDF | Max 5MB</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {digiLockerUpload ? (
                      <UploadFileDigiLocker id="pt-address-proof" extraStyleName="propertyCreate" accept=".jpg,.png,.pdf" onUpload={handleSelectFile} onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }} message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")} error={uploadError} />
                    ) : (
                      <UploadFile id="pt-address-proof" extraStyleName="propertyCreate" accept=".jpg,.png,.pdf" onUpload={handleSelectFile} onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }} message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")} error={uploadError} />
                    )}
                  </div>
                </div>
                {uploadError && <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span> {uploadError}</div>}
              </div>
            </div>
          </div>
        </div>
        </div>

      </FormStep>
    </React.Fragment>
  );
};

export default PTAllPropertyDetails;
