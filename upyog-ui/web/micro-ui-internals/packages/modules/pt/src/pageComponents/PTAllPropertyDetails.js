import React, { useState, useEffect, useRef, Fragment } from "react";
import {
  CardLabel,
  CardLabelDesc,
  TextInput,
  TextArea,
  Dropdown,
  CardLabelError,
  Loader,
  RadioOrSelect,
  UploadFile,
} from "@upyog/digit-ui-react-components";
import FormStep from "../../../../react-components/src/molecules/FormStep";
import Timeline from "../components/TLTimeline";
import { stringReplaceAll } from "../utils";
import UploadFileDigiLocker from "../utils/UploadFile";
import PTMapPicker from "./PTMapPicker";

const getUsageCategoryParsed = (code = "") => {
  const arr = code.split(".");
  return {
    usageCategoryMinor: arr[1] || false,
    usageCategorySubMinor: arr[2] || false,
    usageCategoryDetail: arr[3] || false,
  };
};

const rentedMonthsList = [
  { i18nKey: "PROPERTYTAX_MONTH1", code: "1" },
  { i18nKey: "PROPERTYTAX_MONTH2", code: "2" },
  { i18nKey: "PROPERTYTAX_MONTH3", code: "3" },
  { i18nKey: "PROPERTYTAX_MONTH4", code: "4" },
  { i18nKey: "PROPERTYTAX_MONTH5", code: "5" },
  { i18nKey: "PROPERTYTAX_MONTH6", code: "6" },
  { i18nKey: "PROPERTYTAX_MONTH7", code: "7" },
  { i18nKey: "PROPERTYTAX_MONTH8", code: "8" },
  { i18nKey: "PROPERTYTAX_MONTH9", code: "9" },
  { i18nKey: "PROPERTYTAX_MONTH10", code: "10" },
  { i18nKey: "PROPERTYTAX_MONTH11", code: "11" },
  { i18nKey: "PROPERTYTAX_MONTH12", code: "12" },
];

const PTAllPropertyDetails = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();

  /* ── Is Residential ── */
  const isResOptions = [
    { i18nKey: "PT_COMMON_YES", code: "RESIDENTIAL" },
    { i18nKey: "PT_COMMON_NO", code: "NONRESIDENTIAL" },
  ];
  const [isResdential, setIsResdential] = useState(formData?.isResdential || null);

  /* ── Usage Category Major (Non-residential only) ── */
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

  /* ── Property Type ── */
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

  /* ── Electricity ── */
  const [electricity, setElectricity] = useState(
    formData?.electricity?.electricity || formData?.additionalDetails?.electricity || ""
  );
  const [electricityError, setElectricityError] = useState("");

  /* ── Property Structure Details ── */
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

  /* ── Land Area (Independent & Vacant) ── */
  const [floorarea, setFloorarea] = useState(formData?.landArea?.floorarea || "");

  /* ── Vacant Land Rented ── */
  const vacantLandRentedOptions = [
    { i18nKey: "PT_COMMON_YES", code: "YES" },
    { i18nKey: "PT_COMMON_NO", code: "NO" },
  ];
  const [isVacantLandRented, setIsVacantLandRented] = useState(formData?.isVacantLandRented || null);

  /* ── Number of Basements (Independent) ── */
  const basementOptions = [
    { code: 0, i18nKey: "PT_NO_BASEMENT_OPTION" },
    { code: 1, i18nKey: "PT_ONE_BASEMENT_OPTION" },
    { code: 2, i18nKey: "PT_TWO_BASEMENT_OPTION" },
  ];
  const [noOofBasements, setNoOofBasements] = useState(formData?.noOofBasements || null);

  /* ── Number of Floors (Independent) ── */
  const floorOptions = [
    { i18nKey: "PT_GROUND_FLOOR_OPTION", code: 0 },
    { i18nKey: "PT_GROUND_PLUS_ONE_OPTION", code: 1 },
    { i18nKey: "PT_GROUND_PLUS_TWO_OPTION", code: 2 },
  ];
  const [noOfFloors, setNoOfFloors] = useState(formData?.noOfFloors || null);

  /* ── Floor Usage MDMS ── */
  const { data: floorMdms } = Digit.Hooks.useCommonMDMSV2(
    stateId,
    "PropertyTax",
    ["OccupancyType", "UsageCategory"],
    {
      select: (data) => {
        const usageCats = data?.PropertyTax?.UsageCategory?.map((c) => getUsageCategoryParsed(c.code))
          .filter((c) => !c.usageCategoryDetail && !c.usageCategorySubMinor && c.usageCategoryMinor)
          .map((c) => ({ code: c.usageCategoryMinor, i18nKey: `PROPERTYTAX_BILLING_SLAB_${c.usageCategoryMinor}` }));
        const subCats = Digit.Utils.getUnique(
          data?.PropertyTax?.UsageCategory?.map((e) => getUsageCategoryParsed(e.code))
            .filter((e) => e.usageCategoryDetail)
            .map((e) => ({
              code: e.usageCategoryDetail,
              i18nKey: `PROPERTYTAX_BILLING_SLAB_${e.usageCategoryDetail}`,
              usageCategoryMinor: e.usageCategoryMinor,
            }))
        );
        return {
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

  /* ── Floor Units helpers ── */
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
    arv: "",
    rentedMonths: null,
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
          arv: existing.arv || "",
          rentedMonths: rentedMonthsList.find((m) => m.code === existing.rentedMonths) || null,
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
      if (key === "occupancyType" && value?.code !== "RENTED") {
        updated[idx].arv = "";
        updated[idx].rentedMonths = null;
      }
      return updated;
    });
  };

  /* ── Derived flags ── */
  const isIndependent = PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY";
  const isShared = PropertyType?.code === "BUILTUP.SHAREDPROPERTY";
  const isVacant = PropertyType?.code === "VACANT";
  const isNonResidential = isResdential?.i18nKey === "PT_COMMON_NO";

  /* ── Regenerate floor units when basement/floor selection changes ── */
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

  /* ── Handlers ── */
  const handleElectricityChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setElectricity(value);
      setElectricityError(
        value.length > 0 && value.length !== 10 ? t("PT_BP_NUMBER_10_DIGIT_ERR") : ""
      );
    }
  };

  const handleAreaChange = (e) => {
    const regex = /^(|[1-9][0-9]{0,8}|)$/;
    if (regex.test(e.target.value) || e.target.value === "") {
      setFloorarea(e.target.value);
    }
  };

  /* ── Validation ── */
  const isFormValid = () => {
    if (!isResdential) return false;
    if (isNonResidential && !usageCategoryMajor) return false;
    if (!PropertyType) return false;
    if (!isVacant && (!electricity || electricity.length !== 10)) return false;
    if (isVacant && electricity && electricity.length !== 10) return false;
    if (!propertyStructureDetails?.structureType) return false;
    if (!propertyStructureDetails?.ageOfProperty) return false;
    if ((isIndependent || isVacant) && !floorarea) return false;
    if (isVacant && !isVacantLandRented) return false;
    if (isIndependent && (noOofBasements === null || noOfFloors === null)) return false;
    if (isIndependent && floorUnits.length > 0) {
      const allValid = floorUnits.every((unit) => {
        if (!unit.usageCategory || !unit.occupancyType || !unit.builtUpArea) return false;  
        if (unit.usageCategory?.code !== "RESIDENTIAL" && !unit.unitType) return false;
        if (unit.occupancyType?.code === "RENTED" && !unit.builtUpArea) return false;
        return true;
      });
      if (!allValid) return false;
    }
    if (!selectedCity || !selectedLocality || !street || !doorNo || !proofDocType || !uploadedFileObj) return false;
    return true;
  };

  /* ── Submit ── */
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
            if (field.occupancyType?.code === "RENTED") {
              // arv and rentedMonths removed
            }
            if (field.unitType?.code) unit.unitType = field.unitType.code;
            return unit;
          })
        : undefined;

    onSelect(config.key, {
      isResdential,
      usageCategoryMajor: finalUsageCategory,
      PropertyType,
      electricity: { electricity },
      propertyStructureDetails,
      landArea: isIndependent || isVacant ? { floorarea } : undefined,
      isVacantLandRented: isVacant ? isVacantLandRented : undefined,
      noOofBasements: isIndependent ? noOofBasements : undefined,
      noOfFloors: isIndependent ? noOfFloors : undefined,
      units: unitsData,
      address: {
        pincode,
        city: selectedCity,
        locality: selectedLocality,
        street,
        doorNo,
        landmark,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        mapAddress: (mapAddress?.district || mapAddress?.tehsil || mapAddress?.zone || mapAddress?.ward)
          ? mapAddress
          : undefined,
        documents: {
          ...(formData?.address?.documents || {}),
          ProofOfAddress: { documentType: proofDocType, fileStoreId: uploadedFile },
        },
      },
    });
  };

  const onSkip = () => onSelect();

  /* ── Address state ── */
  const allCities = Digit.Hooks.pt.useTenants();
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");
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
  const [street, setStreet] = useState(formData?.address?.street || "");
  const [doorNo, setDoorNo] = useState(formData?.address?.doorNo || "");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || "");
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;
  const proofOfAddress = Array.isArray(docs) ? docs.filter((doc) => doc.code.includes("ADDRESSPROOF")) : [];
  let dropdownData = [];
  if (proofOfAddress.length > 0) {
    dropdownData = proofOfAddress[0]?.dropdownData?.filter((doc) => doc?.active === true) || [];
    dropdownData.forEach((d) => { d.i18nKey = stringReplaceAll(d.code, ".", "_"); });
  }
  const [digiLockerUpload, setDigiLockerUpload] = useState(false);
  const [proofDocType, setProofDocType] = useState(formData?.address?.documents?.ProofOfAddress?.documentType || null);
  const [uploadedFile, setUploadedFile] = useState(formData?.address?.documents?.ProofOfAddress?.fileStoreId || null);
  const [uploadedFileObj, setUploadedFileObj] = useState(formData?.address?.documents?.ProofOfAddress || null);
  const [uploadError, setUploadError] = useState(null);

  /* ── Map coordinates ── */
  const [latitude, setLatitude] = useState(formData?.address?.latitude || null);
  const [longitude, setLongitude] = useState(formData?.address?.longitude || null);

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  /* ── Map-resolved address attributes ── */
  const [mapAddress, setMapAddress] = useState(
    formData?.address?.mapAddress || { district: "", tehsil: "", zone: "", ward: "", state: "" }
  );

  const handleAddressResolve = (resolved) => {
    setMapAddress({
      district: resolved.district || "",
      tehsil:   resolved.tehsil   || "",
      zone:     resolved.zone     || "",
      ward:     resolved.ward     || "",
      state:    resolved.state    || "",
    });
    // Always update pincode from map (more accurate)
    if (resolved.pincode) setPincode(resolved.pincode);
    // Auto-populate street if currently empty
    if (resolved.street && !street) setStreet(resolved.street);
    // Match city from tenant list (case-insensitive) and auto-select
    if (resolved.city && allCities?.length) {
      const resolvedCity = resolved.city.toLowerCase();
      const matched = allCities.find(
        (c) =>
          c.name?.toLowerCase() === resolvedCity ||
          c.code?.toLowerCase() === resolvedCity ||
          c.name?.toLowerCase().includes(resolvedCity) ||
          resolvedCity.includes(c.name?.toLowerCase())
      );
      if (matched) {
        setSelectedCity(matched);
        setSelectedLocality(null);
        setLocalities([]);
      }
    }
  };

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

  useEffect(() => {
    if (!selectedCity) { setLocalities([]); setSelectedLocality(null); return; }
    if (selectedCity && fetchedLocalities) {
      let list = fetchedLocalities;
      if (formData?.address?.locality) setSelectedLocality(formData.address.locality);
      if (pincode) {
        const filtered = list.filter((obj) => obj.pincode?.find((p) => p == pincode));
        if (filtered.length > 0) { list = filtered; if (!formData?.address?.locality) setSelectedLocality(null); }
      }
      setLocalities(list);
      if (list.length === 1) setSelectedLocality(list[0]);
    }
  }, [selectedCity, pincode, fetchedLocalities]);

  useEffect(() => {
    if (!uploadedFileObj || uploadedFileObj.fileStoreId || uploadedFile) return;
    (async () => {
      setUploadError(null);
      if (uploadedFileObj.size >= 2000000) { setUploadError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED")); return; }
      try {
        const response = await Digit.UploadServices.Filestorage("property-upload", uploadedFileObj, Digit.ULBService.getStateId());
        if (!mountedRef.current) return;
        if (response?.data?.files?.length > 0) setUploadedFile(response.data.files[0].fileStoreId);
      } catch (e) {}
    })();
  }, [uploadedFileObj]);

  function selectCity(city) { setSelectedLocality(null); setLocalities([]); setSelectedCity(city); }
  function selectLocality(locality) { setSelectedLocality(locality); }
  function setTypeOfProofDoc(val) {
    val?.digiLockerFetch === true ? setDigiLockerUpload(true) : setDigiLockerUpload(false);
    setUploadedFile(null); setProofDocType(val);
  }
  function selectFile(e, newFile) {
    if (newFile) { setUploadedFileObj(newFile); } else { setUploadedFileObj(e.target.files[0]); }
  }

  const formRef = useRef(null);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (propTypeLoading || usageCatLoading) return <Loader />;

  return (
    <React.Fragment>
      <style>{`
        .pt-property-details-form .select,
        .pt-property-details-form .select-active {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .pt-property-details-form .select:hover,
        .pt-property-details-form .select-active:hover {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
        }
        .pt-property-details-form .select-wrap,
        .pt-property-details-form .employee-select-wrap {
          max-width: none !important;
          position: relative !important;
          overflow: visible !important;
        }
        .pt-property-details-form .select-wrap .options-card,
        .pt-property-details-form .employee-select-wrap .options-card {
          position: absolute !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
          max-height: 220px !important;
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
          z-index: 9999 !important;
          width: 100% !important;
          background: #fff !important;
          border: 1px solid #b1b4b6 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        #pt-doc-type-dropdown .options-card {
          top: auto !important;
          bottom: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 4px !important;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.15) !important;
        }
        .pt-property-details-form .text-input-width {
          max-width: none !important;
        }
        .pt-property-details-form .citizen-card-input,
        .pt-property-details-form .employee-card-input,
        .pt-property-details-form .card-input,
        .pt-property-details-form .card-input-error,
        .pt-property-details-form .employee-card-input-error {
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        .pt-property-details-form .upload-file,
        .pt-property-details-form .upload-file-max-width {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          max-width: none !important;
          min-height: 40px !important;
          border: 1px solid #b1b4b6 !important;
          border-radius: 8px !important;
          background: #fff !important;
          padding: 0 8px !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        .pt-property-details-form .upload-file > div {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .pt-property-details-form .input-mirror-selector-button {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          cursor: pointer !important;
          z-index: 2 !important;
          min-height: unset !important;
          max-height: unset !important;
          background: transparent !important;
          border: none !important;
        }
        .pt-property-details-form .file-upload-status {
          font-size: 14px !important;
          color: #505a5f !important;
          font-weight: normal !important;
          margin: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .pt-property-details-form .selector-button-border {
          position: relative !important;
          z-index: 1 !important;
          pointer-events: none !important;
          height: 32px !important;
          min-height: 32px !important;
          width: 30% !important;
          flex-shrink: 0 !important;
          padding: 0 8px !important;
          font-size: 14px !important;
          white-space: nowrap !important;
          border-radius: 6px !important;
        }
        .pt-property-details-form .file-upload-status {
          flex: 1 !important;
          min-width: 0 !important;
        }
        .pt-property-details-form .upload-file .tag-container {
          width: 65% !important;
        }
      `}</style>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep
        config={config}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={!isFormValid()}
        showErrorBelowChildren={true}
      >
        <div className="pt-property-details-form" ref={formRef}>
        {/* Row 1: Is Residential | Type of Property */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <div>
            <CardLabel>
              {t("PT_PROPERTY_DETAILS_RESIDENTIAL_PROPERTY_HEADER")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <div className="field">
              <Dropdown
                t={t}
                optionKey="i18nKey"
                isMandatory={true}
                option={isResOptions}
                selected={isResdential}
                select={setIsResdential}
                placeholder={t("PT_SELECT_PLACEHOLDER")}
              />
            </div>
          </div>
          <div>
            <CardLabel>
              {t("PT_ASSESMENT1_PROPERTY_TYPE")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <div className="field">
              <Dropdown
                t={t}
                optionKey="i18nKey"
                isMandatory={true}
                option={getPropertyTypeMenu()}
                selected={PropertyType}
                select={setPropertyType}
                placeholder={t("PT_SELECT_PLACEHOLDER")}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Is Vacant Land Rented (when vacant) | BP Number | Usage Category (when non-res) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: (() => {
              const cols = [];
              if (isVacant) cols.push("1fr");
              cols.push("1fr");
              if (isNonResidential) cols.push("1fr");
              return cols.join(" ");
            })(),
            gap: "0 24px",
          }}
        >
          {isVacant && (
            <div>
              <CardLabel>
                {t("PT_IS_VACANT_LAND_RENTED")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <Dropdown
                  t={t}
                  optionKey="i18nKey"
                  isMandatory={true}
                  option={vacantLandRentedOptions}
                  selected={isVacantLandRented}
                  select={setIsVacantLandRented}
                  placeholder={t("PT_SELECT_PLACEHOLDER")}
                />
              </div>
            </div>
          )}
          <div>
            <CardLabel>
              {t("PT_BP_NUMBER")}
              {!isVacant && <span className="check-page-link-button"> *</span>}
            </CardLabel>
            <div className="field">
              <TextInput
                t={t}
                type="text"
                value={electricity}
                onChange={handleElectricityChange}
                placeholder={t("PT_BP_NUMBER")}
                maxLength={10}
              />
              {electricityError && (
                <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                  {electricityError}
                </CardLabelError>
              )}
            </div>
          </div>
          {isNonResidential && (
            <div>
              <CardLabel>
                {t("PT_ASSESMENT_INFO_USAGE_TYPE")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <Dropdown
                  t={t}
                  optionKey="i18nKey"
                  isMandatory={true}
                  option={usageCategoryOptions}
                  selected={usageCategoryMajor}
                  select={setUsageCategoryMajor}
                  placeholder={t("PT_SELECT_PLACEHOLDER")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Structure Type | Age of Property */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <div>
            <CardLabel>
              {t("PT_STRUCTURE_TYPE")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <div className="field">
              <Dropdown
                t={t}
                optionKey="i18nKey"
                isMandatory={true}
                option={structureTypeOptions}
                selected={propertyStructureDetails?.structureType}
                select={(val) =>
                  setPropertyStructureDetails({ ...propertyStructureDetails, structureType: val })
                }
                placeholder={t("PT_SELECT_STRUCTURE_TYPE")}
              />
            </div>
          </div>
          <div>
            <CardLabel>
              {t("PT_AGE_OF_PROPERTY")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <div className="field">
              <Dropdown
                t={t}
                optionKey="i18nKey"
                isMandatory={true}
                option={ageOfPropertyOptions}
                selected={propertyStructureDetails?.ageOfProperty}
                select={(val) =>
                  setPropertyStructureDetails({ ...propertyStructureDetails, ageOfProperty: val })
                }
                placeholder={t("PT_SELECT_AGE_OF_PROPERTY")}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Plot Size | No. of Basements (conditional) */}
        {(isIndependent || isVacant) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isIndependent ? "1fr 1fr" : "1fr 1fr",
              gap: "0 24px",
            }}
          >
            <div>
              <CardLabel>
                {t("PT_PLOT_SIZE_SQUARE_FEET_LABEL")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <TextInput
                  t={t}
                  type="number"
                  value={floorarea}
                  onChange={handleAreaChange}
                  placeholder={t("PT_FORM2_PLOT_SIZE_PLACEHOLDER")}
                />
              </div>
            </div>
            {isIndependent && (
              <div>
                <CardLabel>{t("PT_PROPERTY_DETAILS_NO_OF_BASEMENTS_HEADER")}</CardLabel>
                <div className="field">
                  <Dropdown
                    t={t}
                    optionKey="i18nKey"
                    option={basementOptions}
                    selected={noOofBasements}
                    select={setNoOofBasements}
                    placeholder={t("PT_SELECT_NO_OF_BASEMENTS")}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* No. of Floors (full-width, Independent only) */}
        {isIndependent && (
          <div>
            <CardLabel>{t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")}</CardLabel>
            <div className="field">
              <Dropdown
                t={t}
                optionKey="i18nKey"
                option={floorOptions}
                selected={noOfFloors}
                select={setNoOfFloors}
                placeholder={t("PT_SELECT_NO_OF_FLOORS")}
              />
            </div>
          </div>
        )}

        {/* Floor Usage Details */}
        {isIndependent && noOofBasements !== null && noOfFloors !== null && floorUnits.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <CardLabel style={{ fontWeight: "bold", marginBottom: "8px" }}>
              {t("PT_FLOOR_USAGE_DETAILS")}
            </CardLabel>
            {floorUnits.map((unit, idx) => (
              <div
                key={`floor-unit-${idx}`}
                style={{
                  border: "1px solid #b1b4b6",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  background: "#ffffff",
                }}
              >
                <div style={{ borderBottom: "1px solid #b1b4b6", marginBottom: "16px", paddingBottom: "8px" }}>
                  <CardLabel style={{ fontWeight: "700", marginBottom: "0", fontSize: "16px" }}>
                    {t(`PROPERTYTAX_FLOOR_${unit.floorNo?.code}`)}
                  </CardLabel>
                </div>

                {/* Usage Type | Sub Usage Type */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: unit.usageCategory?.code && unit.usageCategory.code !== "RESIDENTIAL" ? "1fr 1fr" : "1fr 1fr",
                    gap: "0 24px",
                  }}
                >
                  <div>
                    <CardLabel>
                      {t("PT_FORM2_USAGE_TYPE")}
                      <span className="check-page-link-button"> *</span>
                    </CardLabel>
                    <div className="field">
                      <Dropdown
                        t={t}
                        optionKey="i18nKey"
                        isMandatory={true}
                        option={floorMdms?.UsageCategory || []}
                        selected={unit.usageCategory}
                        select={(val) => updateUnit(idx, "usageCategory", val)}
                        placeholder={t("PT_SELECT_PLACEHOLDER")}
                      />
                    </div>
                  </div>
                  {unit.usageCategory?.code && unit.usageCategory.code !== "RESIDENTIAL" ? (
                    <div>
                      <CardLabel>
                        {t("PT_FORM2_SUB_USAGE_TYPE")}
                        <span className="check-page-link-button"> *</span>
                      </CardLabel>
                    <div className="field">
                        <Dropdown
                          t={t}
                          optionKey="i18nKey"
                          isMandatory={true}
                          option={floorMdms?.UsageSubCategory?.filter((cat) => cat.usageCategoryMinor === unit.usageCategory?.code) || []}
                          selected={unit.unitType}
                          select={(val) => updateUnit(idx, "unitType", val)}
                          placeholder={t("PT_SELECT_PLACEHOLDER")}
                        />
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Occupancy | Built-up Area */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                  <div>
                    <CardLabel>
                      {t("PT_FORM2_OCCUPANCY")}
                      <span className="check-page-link-button"> *</span>
                    </CardLabel>
                    <div className="field">
                      <Dropdown
                        t={t}
                        optionKey="i18nKey"
                        isMandatory={true}
                        option={floorMdms?.OccupancyType || []}
                        selected={unit.occupancyType}
                        select={(val) => updateUnit(idx, "occupancyType", val)}
                        placeholder={t("PT_SELECT_PLACEHOLDER")}
                      />
                    </div>
                  </div>
                  <div>
                    <CardLabel>
                      {t("PT_BUILT_UP_AREA_HEADER")}
                      <span className="check-page-link-button"> *</span>
                    </CardLabel>
                    <div className="field">
                      <TextInput
                        t={t}
                        type="text"
                        value={unit.builtUpArea || ""}
                        onChange={(e) => {
                          const regex = /^(0|[1-9][0-9]{0,8}|)$/;
                          if (regex.test(e.target.value) || e.target.value === " ") {
                            if (floorarea && parseInt(e.target.value) > parseInt(floorarea)) {
                              alert(t("PT_BUILTUPAREA_PLOTSIZE_ERROR_MSG"));
                            } else {
                              updateUnit(idx, "builtUpArea", e.target.value);
                            }
                          }
                        }}
                        style={{ background: "#FAFAFA" }}
                        isRequired={true}
                        pattern="[0-9]+"
                        title={t("CORE_COMMON_REQUIRED_ERRMSG")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Address Details Section ── */}
        <div style={{ marginTop: "32px", borderTop: "1px solid #D6D5D4", paddingTop: "24px", marginBottom: "32px" }}>
          <CardLabel style={{ fontWeight: "700", fontSize: "18px", marginBottom: "16px" }}>
            {t("CS_FILE_APPLICATION_PROPERTY_LOCATION_ADDRESS_TEXT")}
          </CardLabel>

          {/* Pincode | City */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <div>
              <CardLabel>{t("PT_PROPERTY_ADDRESS_PINCODE")}</CardLabel>
              <div className="field">
                <TextInput
                  name="pincode"
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={7}
                  pattern="[0-9]+"
                  placeholder={t("PT_PROPERTY_ADDRESS_PINCODE")}
                />
              </div>
            </div>
            <div>
              <CardLabel>
                {t("MYCITY_CODE_LABEL")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <RadioOrSelect
                  options={cities.sort((a, b) => a.name.localeCompare(b.name))}
                  selectedOption={selectedCity}
                  optionKey="i18nKey"
                  onSelect={selectCity}
                  t={t}
                  isPTFlow={true}
                />
              </div>
            </div>
          </div>

          {/* Locality */}
          {selectedCity && localities && localities.length > 0 && (
            <div>
              <CardLabel>
                {t("PT_LOCALITY_LABEL")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <RadioOrSelect
                  options={localities.sort((a, b) => a.name.localeCompare(b.name))}
                  selectedOption={selectedLocality}
                  optionKey="i18nkey"
                  onSelect={selectLocality}
                  t={t}
                />
              </div>
            </div>
          )}

          {/* Street Name | House No */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <div>
              <CardLabel>
                {t("PT_PROPERTY_ADDRESS_STREET_NAME")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <TextInput
                  name="street"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  maxLength={64}
                  placeholder={t("PT_PROPERTY_ADDRESS_STREET_NAME")}
                />
              </div>
            </div>
            <div>
              <CardLabel>
                {t("PT_PROPERTY_ADDRESS_HOUSE_NO")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                <TextInput
                  name="doorNo"
                  type="text"
                  value={doorNo}
                  onChange={(e) => setDoorNo(e.target.value)}
                  maxLength={64}
                  placeholder={t("PT_PROPERTY_ADDRESS_HOUSE_NO")}
                />
              </div>
            </div>
          </div>

          {/* Landmark — full width */}
          <div>
            <CardLabel>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK")}</CardLabel>
            <TextArea
              name="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              maxLength={1024}
              style={{ border: "1px solid #b1b4b6", borderRadius: "8px", width: "100%" }}
            />
          </div>

          {/* Map Location Picker */}
          <div style={{ marginBottom: "24px" }}>
            <CardLabel style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
              {t("PT_MAP_LOCATION_LABEL") || "Property Location on Map"}
              <span style={{ fontSize: "13px", fontWeight: "400", color: "#505a5f", marginLeft: "8px" }}>
                ({t("PT_MAP_OPTIONAL_LABEL") || "optional"})
              </span>
            </CardLabel>
            <PTMapPicker
              lat={latitude}
              lng={longitude}
              onLocationSelect={handleLocationSelect}
              onAddressResolve={handleAddressResolve}
              t={t}
            />

            {/* Auto-populated address attributes from map */}
            {(mapAddress?.district || mapAddress?.tehsil || mapAddress?.zone || mapAddress?.ward || latitude || longitude) && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#F0F7FF",
                  border: "1px solid #C3DEF0",
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#505a5f", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("PT_MAP_DETECTED_ADDRESS") || "Detected from Map Pin"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                  {[
                    { label: t("PT_MAP_DISTRICT") || "District",  key: "district" },
                    { label: t("PT_MAP_TEHSIL")   || "Tehsil",    key: "tehsil"   },
                    { label: t("PT_MAP_ZONE")     || "Zone",      key: "zone"     },
                    { label: t("PT_MAP_WARD")     || "Ward",      key: "ward"     },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{label}</div>
                      <input
                        type="text"
                        value={mapAddress[key] || ""}
                        onChange={(e) => setMapAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={mapAddress[key] ? "" : "Not detected — enter manually"}
                        style={{
                          width: "100%",
                          height: "36px",
                          padding: "0 10px",
                          border: "1px solid #b1b4b6",
                          borderRadius: "6px",
                          fontSize: "13px",
                          background: mapAddress[key] ? "#fff" : "#fafafa",
                          boxSizing: "border-box",
                          color: mapAddress[key] ? "#1a1a1a" : "#888",
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{t("PT_MAP_LATITUDE") || "Latitude"}</div>
                    <input
                      type="text"
                      value={latitude ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || v === "-" || /^-?\d{0,3}(\.\d{0,8})?$/.test(v)) setLatitude(v === "" ? null : v);
                      }}
                      placeholder="e.g. 26.8467"
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        border: "1px solid #b1b4b6",
                        borderRadius: "6px",
                        fontSize: "13px",
                        background: latitude ? "#fff" : "#fafafa",
                        boxSizing: "border-box",
                        color: latitude ? "#1a1a1a" : "#888",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{t("PT_MAP_LONGITUDE") || "Longitude"}</div>
                    <input
                      type="text"
                      value={longitude ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || v === "-" || /^-?\d{0,3}(\.\d{0,8})?$/.test(v)) setLongitude(v === "" ? null : v);
                      }}
                      placeholder="e.g. 80.9462"
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        border: "1px solid #b1b4b6",
                        borderRadius: "6px",
                        fontSize: "13px",
                        background: longitude ? "#fff" : "#fafafa",
                        boxSizing: "border-box",
                        color: longitude ? "#1a1a1a" : "#888",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proof of Address */}
          <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_TYPES")}</CardLabelDesc>
          <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_SIZE")}</CardLabelDesc>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <div style={{ position: "relative" }}>
              <CardLabel>
                {t("PT_CATEGORY_DOCUMENT_TYPE")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field" id="pt-doc-type-dropdown">
                <Dropdown
                  t={t}
                  isMandatory={false}
                  option={dropdownData}
                  selected={proofDocType}
                  optionKey="i18nKey"
                  select={setTypeOfProofDoc}
                  placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")}
                />
              </div>
            </div>
            <div>
              <CardLabel>
                {t("PT_PROOF_OF_ADDRESS")}
                <span className="check-page-link-button"> *</span>
              </CardLabel>
              <div className="field">
                {digiLockerUpload ? (
                  <UploadFileDigiLocker
                    id="pt-address-proof"
                    extraStyleName="propertyCreate"
                    accept=".jpg,.png,.pdf"
                    onUpload={selectFile}
                    onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }}
                    message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
                    error={uploadError}
                  />
                ) : (
                  <UploadFile
                    id="pt-address-proof"
                    extraStyleName="propertyCreate"
                    accept=".jpg,.png,.pdf"
                    onUpload={selectFile}
                    onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }}
                    message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
                    error={uploadError}
                  />
                )}
              </div>
              {uploadError && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{uploadError}</div>}
            </div>
          </div>
        </div>

        </div>{/* end pt-property-details-form */}
      </FormStep>
    </React.Fragment>
  );
};

export default PTAllPropertyDetails;
