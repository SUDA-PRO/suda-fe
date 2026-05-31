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
import PTMapPicker from "./PTMapPicker";

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
    { i18nKey: "Semi Permanent", code: "semi permanent" },
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
  const [builtUpBlurred, setBuiltUpBlurred] = useState(false);

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
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(
    formData?.address?.documents?.ProofOfAddress?.fileName ||
    sessionStorage.getItem("pt-addr-proof-filename") || null
  );
  const [uploadedFileSize, setUploadedFileSize] = useState(
    formData?.address?.documents?.ProofOfAddress?.fileSize
      ? Number(formData.address.documents.ProofOfAddress.fileSize)
      : sessionStorage.getItem("pt-addr-proof-filesize")
        ? Number(sessionStorage.getItem("pt-addr-proof-filesize"))
        : null
  );
  const [uploadError, setUploadError] = useState(null);
  /* ── Map coordinates ── */
  const [latitude, setLatitude] = useState(
    formData?.address?.latitude || formData?.address?.geoLocation?.latitude || null
  );
  const [longitude, setLongitude] = useState(
    formData?.address?.longitude || formData?.address?.geoLocation?.longitude || null
  );
  const [mapAddress, setMapAddress] = useState(
    formData?.address?.mapAddress || { district: "", tehsil: "", zone: "", ward: "", state: "" }
  );
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

  const mapExistingUnitToForm = (existing, floorNo) => {
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
  };

  const [floorUnits, setFloorUnits] = useState(() => {
    const floorList = getFloorList(formData?.noOfFloors, formData?.noOofBasements);
    const existingUnits = formData?.units || [];
    const normalizedExistingUnits = existingUnits
      .map((u) => ({ ...u, floorCode: Number(typeof u.floorNo === "object" ? u.floorNo?.code : u.floorNo) }))
      .filter((u) => floorList.includes(u.floorCode))
      .map((u) => mapExistingUnitToForm(u, u.floorCode));

    return floorList.flatMap((floorNo) => {
      const unitsForFloor = normalizedExistingUnits.filter((u) => Number(u.floorNo?.code) === Number(floorNo));
      return unitsForFloor.length ? unitsForFloor : [createEmptyUnit(floorNo)];
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

  /* -- Compute sum of all built-up areas -- */
  const builtUpAreaSum = (() => {
    if (isIndependent) {
      return floorUnits.reduce((sum, u) => sum + (parseFloat(u.builtUpArea) || 0), 0);
    }
    if (isShared) {
      return flatUnits.reduce((sum, u) => sum + (parseFloat(u.builtUpArea) || 0), 0);
    }
    return null;
  })();

  /* â”€â”€ Regenerate floor units when basement/floor selection changes â”€â”€ */
  useEffect(() => {
    if (PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" && noOofBasements !== null && noOfFloors !== null) {
      const floorList = getFloorList(noOfFloors, noOofBasements);
      setFloorUnits((prev) => {
        const filteredPrev = prev.filter((u) => floorList.includes(Number(u.floorNo?.code)));
        return floorList.flatMap((floorNo) => {
          const unitsForFloor = filteredPrev.filter((u) => Number(u.floorNo?.code) === Number(floorNo));
          return unitsForFloor.length ? unitsForFloor : [createEmptyUnit(floorNo)];
        });
      });
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
  /* Sync prefill values when edit-property data loads asynchronously */
  useEffect(() => {
    if (formData?.landArea?.floorarea && !floorarea) {
      setFloorarea(String(formData.landArea.floorarea));
    }
  }, [formData?.landArea?.floorarea]);

  useEffect(() => {
    if (formData?.propertyStructureDetails?.structureType && !propertyStructureDetails?.structureType) {
      setPropertyStructureDetails(formData.propertyStructureDetails);
    }
  }, [formData?.propertyStructureDetails]);


  /* â”€â”€ Handlers â”€â”€ */
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

  const handleAddIndependentUnit = (floorNo) => {
    setFloorUnits((prev) => {
      const insertionIndex = prev.reduce((lastIdx, u, idx) => (Number(u.floorNo?.code) === Number(floorNo) ? idx : lastIdx), -1);
      const updated = [...prev];
      if (insertionIndex === -1) {
        updated.push(createEmptyUnit(floorNo));
      } else {
        updated.splice(insertionIndex + 1, 0, createEmptyUnit(floorNo));
      }
      return updated;
    });
  };

  const handleRemoveIndependentUnit = (idx, floorNo) => {
    setFloorUnits((prev) => {
      const totalForFloor = prev.filter((u) => Number(u.floorNo?.code) === Number(floorNo)).length;
      if (totalForFloor <= 1) return prev;
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
    const f = newFile || e.target.files[0];
    if (f) {
      sessionStorage.setItem("pt-addr-proof-filename", f.name);
      sessionStorage.setItem("pt-addr-proof-filesize", String(f.size));
      setUploadedFileName(f.name);
      setUploadedFileSize(f.size);
      setUploadedFileObj(f);
    }
  };
  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAddressResolve = (resolved) => {
    setMapAddress({
      district: resolved.district || "",
      tehsil:   resolved.tehsil   || "",
      zone:     resolved.zone     || "",
      ward:     resolved.ward     || "",
      state:    resolved.state    || "",
    });
    if (resolved.pincode) setPincode(resolved.pincode);
    if (resolved.street && !street) setStreet(resolved.street);
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
  /* â”€â”€ Validation â”€â”€ */
  const isFormValid = () => {
    if (!isResdential) return false;
    if (isNonResidential && !usageCategoryMajor) return false;
    if (!PropertyType) return false;
    if (!isVacant && (!electricity || electricity.length !== 10)) return false;
    if (isVacant && electricity && electricity.length !== 10) return false;
    if (!propertyStructureDetails?.structureType) return false;
    if (!propertyStructureDetails?.ageOfProperty) return false;
    if ((isIndependent || isVacant) && !floorarea) return false;
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
    /* shared/flat unit validation */
    if (isShared) {
      const allValid = flatUnits.every((unit) => {
        if (!unit.usageCategory || !unit.occupancyType || !unit.builtUpArea || !unit.floorNo) return false;
        if (unit.usageCategory?.code !== "RESIDENTIAL" && !unit.unitType) return false;
        return true;
      });
      if (!allValid) return false;
    }
    /* area vs built-up sum validation – only for Ground Floor Only */
    if (!isVacant && isIndependent && noOfFloors?.code === 0 && builtUpAreaSum !== null && floorarea) {
      if (parseFloat(floorarea) !== builtUpAreaSum) return false;
    }
    /* address validation */
    if (!selectedCity) return false;
    if (!selectedLocality) return false;
    if (!street) return false;
    if (!doorNo) return false;
    if (!proofDocType) return false;
    if (!uploadedFile) return false;
    if (uploadError) return false;
    if (!latitude || !longitude) return false;
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
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      mapAddress: (mapAddress?.district || mapAddress?.tehsil || mapAddress?.zone || mapAddress?.ward)
        ? mapAddress
        : undefined,
      documents: {
        ProofOfAddress: {
          documentType: proofDocType,
          fileStoreId: uploadedFile,
          fileName: uploadedFileName || uploadedFileObj?.name || null,
          fileSize: uploadedFileSize || uploadedFileObj?.size || null,
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
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>Step 1 of 3</div>
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
        <div style={{ maxWidth: "100%", width: "100%" }} className="pt-property-details-form">
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
              <label style={labelStyle}>{t("PT_ELECTRICITY_LABEL")}{!isVacant && <span style={requiredMark}>*</span>}</label>
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
              <TextInput t={t} type="text" value={floorarea} onChange={handleAreaChange} placeholder={t("PT_FORM2_PLOT_SIZE_PLACEHOLDER")} maxLength={10} />
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
            {getFloorList(noOfFloors, noOofBasements).map((floorNo) => {
              const floorSpecificUnits = floorUnits
                .map((unit, idx) => ({ unit, idx }))
                .filter(({ unit }) => Number(unit.floorNo?.code) === Number(floorNo));

              return (
                <div key={`floor-block-${floorNo}`} style={{ marginBottom: "14px" }}>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a2b49", marginBottom: "10px" }}>
                    {t(`PROPERTYTAX_FLOOR_${floorNo}`)}
                  </div>

                  {floorSpecificUnits.map(({ unit, idx }, floorUnitIdx) => (
                    <div key={`floor-unit-${floorNo}-${idx}-${unit.occupancyType?.code || "none"}`} style={unitCardStyle}>
                      {floorSpecificUnits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIndependentUnit(idx, floorNo)}
                          style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#888", lineHeight: 1 }}
                        >
                          x
                        </button>
                      )}

                      <div style={{ fontWeight: "600", fontSize: "12px", color: "#4e5d78", marginBottom: "12px" }}>
                        {`Unit ${floorUnitIdx + 1}`}
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
                          <TextInput t={t} type="text" value={unit.builtUpArea || ""} onChange={(e) => { const regex = /^(0|[1-9][0-9]{0,8}|)$/; if (regex.test(e.target.value) || e.target.value === " ") { updateUnit(idx, "builtUpArea", e.target.value); } }} onBlur={() => setBuiltUpBlurred(true)} isRequired={true} pattern="[0-9]+" title={t("CORE_COMMON_REQUIRED_ERRMSG")} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddIndependentUnit(floorNo)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#f47738", fontWeight: "700", fontSize: "14px", padding: "2px 0", marginTop: "2px" }}
                  >
                    + {t("PT_ADD_UNIT")}
                  </button>
                </div>
              );
            })}
            {/* Area vs built-up sum summary */}
            {builtUpBlurred && noOfFloors?.code === 0 && floorarea && builtUpAreaSum > 0 && parseFloat(floorarea) !== builtUpAreaSum && (
              <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#fff3e0", border: "1px solid #ffb74d", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#e65100", fontWeight: "600" }}>
                <span style={{ fontSize: "16px" }}>⚠</span>
                <span>{t("PT_AREA_MUST_EQUAL_BUILTUP_SUM") || "Total area must equal the sum of all built-up areas"} — {t("PT_BUILTUP_SUM_HINT") || "Sum:"} <strong>{builtUpAreaSum} sq ft</strong>, {t("PT_TOTAL_AREA_LABEL") || "Total area:"} <strong>{floorarea} sq ft</strong></span>
              </div>
            )}
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
                    <TextInput t={t} type="text" value={unit.builtUpArea || ""} onChange={(e) => { const regex = /^(0|[1-9][0-9]{0,8}|)$/; if (regex.test(e.target.value) || e.target.value === "") { updateFlatUnit(idx, "builtUpArea", e.target.value); } }} onBlur={() => setBuiltUpBlurred(true)} isRequired={true} pattern="[0-9]+" title={t("CORE_COMMON_REQUIRED_ERRMSG")} />
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
              <div style={{ position: "relative" }}>
                <RadioOrSelect
                  options={cities.sort((a, b) => a.name.localeCompare(b.name))}
                  selectedOption={selectedCity}
                  optionKey="i18nKey"
                  onSelect={handleSelectCity}
                  t={t}
                  isPTFlow={true}
                  optionCardStyles={{ position: "absolute", zIndex: 9999, width: "100%", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: "220px", overflowY: "auto" }}
                />
              </div>
            </div>

            {selectedCity && (
              <div style={col3}>
                <label style={labelStyle}>{t("PT_LOCALITY_LABEL")}<span style={requiredMark}>*</span></label>
                <div style={{ position: "relative" }}>
                  <Dropdown
                    isMandatory={true}
                    selected={selectedLocality}
                    option={(localities || []).sort((a, b) => a.name.localeCompare(b.name))}
                    select={setSelectedLocality}
                    optionKey="i18nkey"
                    t={t}
                    optionCardStyles={{ position: "absolute", zIndex: 9999, width: "100%", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: "220px", overflowY: "auto" }}
                  />
                </div>
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

          {/* Map Location Picker */}
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, marginBottom: "6px" }}>
              {t("PT_MAP_LOCATION_LABEL") || "Property Location on Map"}
              <span style={requiredMark}>*</span>
            </label>
            <PTMapPicker
              lat={latitude}
              lng={longitude}
              onLocationSelect={handleLocationSelect}
              onAddressResolve={handleAddressResolve}
              t={t}
            />
            {(mapAddress?.district || mapAddress?.tehsil || mapAddress?.zone || mapAddress?.ward || latitude || longitude) && (
              <div style={{ marginTop: "12px", background: "#F0F7FF", border: "1px solid #C3DEF0", borderRadius: "8px", padding: "12px 16px" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#505a5f", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("PT_MAP_DETECTED_ADDRESS") || "Detected from Map Pin"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                  {[
                    { label: t("PT_MAP_DISTRICT") || "District", key: "district" },
                    { label: t("PT_MAP_TEHSIL")   || "Tehsil",   key: "tehsil"   },
                    { label: t("PT_MAP_ZONE")     || "Zone",     key: "zone"     },
                    { label: t("PT_MAP_WARD")     || "Ward",     key: "ward"     },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{label}</div>
                      <input
                        type="text"
                        value={mapAddress[key] || ""}
                        onChange={(e) => setMapAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Not detected — enter manually"
                        style={{ width: "100%", height: "36px", padding: "0 10px", border: "1px solid #b1b4b6", borderRadius: "6px", fontSize: "13px", background: mapAddress[key] ? "#fff" : "#fafafa", boxSizing: "border-box", color: mapAddress[key] ? "#1a1a1a" : "#888" }}
                      />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{t("PT_MAP_LATITUDE") || "Latitude"}</div>
                    <input
                      type="text"
                      value={latitude !== null && latitude !== undefined ? latitude : ""}
                      onChange={(e) => { const v = e.target.value; if (v === "" || v === "-" || /^-?\d{0,3}(\.\d{0,8})?$/.test(v)) setLatitude(v === "" ? null : v); }}
                      placeholder="e.g. 26.8467"
                      style={{ width: "100%", height: "36px", padding: "0 10px", border: "1px solid #b1b4b6", borderRadius: "6px", fontSize: "13px", background: latitude ? "#fff" : "#fafafa", boxSizing: "border-box", color: latitude ? "#1a1a1a" : "#888" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#505a5f", marginBottom: "2px" }}>{t("PT_MAP_LONGITUDE") || "Longitude"}</div>
                    <input
                      type="text"
                      value={longitude !== null && longitude !== undefined ? longitude : ""}
                      onChange={(e) => { const v = e.target.value; if (v === "" || v === "-" || /^-?\d{0,3}(\.\d{0,8})?$/.test(v)) setLongitude(v === "" ? null : v); }}
                      placeholder="e.g. 80.9462"
                      style={{ width: "100%", height: "36px", padding: "0 10px", border: "1px solid #b1b4b6", borderRadius: "6px", fontSize: "13px", background: longitude ? "#fff" : "#fafafa", boxSizing: "border-box", color: longitude ? "#1a1a1a" : "#888" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proof of Address */}
          <div style={{ marginTop: "20px", background: "linear-gradient(135deg, #f8f9fe 0%, #eef2fb 100%)", border: "1px solid #dde4f0", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(26,43,73,0.06)" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #dde4f0" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(26,43,73,0.25)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2b49", letterSpacing: "0.1px" }}>Proof of Address</div>
                <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "2px" }}>{t("PT_UPLOAD_RESTRICTIONS_TYPES")} &middot; {t("PT_UPLOAD_RESTRICTIONS_SIZE")}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
              {/* Document Type — native select */}
              <div>
                <label style={labelStyle}>{t("PT_CATEGORY_DOCUMENT_TYPE")}<span style={requiredMark}>*</span></label>
                <div style={{ position: "relative" }}>
                  <select
                    style={{
                      display: "block", width: "100%", height: "46px",
                      padding: "0 40px 0 14px",
                      border: proofDocType ? "1.5px solid #1a2b49" : "1.5px solid #b0b8c1",
                      borderRadius: "10px", fontSize: "14px",
                      color: proofDocType ? "#1a2b49" : "#8a97a8",
                      backgroundColor: proofDocType ? "#ffffff" : "#f9fafc",
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%231a2b49' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", backgroundSize: "13px",
                      WebkitAppearance: "none", MozAppearance: "none", appearance: "none",
                      cursor: "pointer", outline: "none", boxSizing: "border-box",
                      fontFamily: "inherit", boxShadow: proofDocType ? "0 0 0 3px rgba(26,43,73,0.08)" : "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      fontWeight: proofDocType ? "600" : "400",
                    }}
                    value={proofDocType?.code || ""}
                    onChange={(e) => {
                      const selected = (addressDropdownData || []).find(d => d.code === e.target.value);
                      handleSelectProofDoc(selected || null);
                    }}
                  >
                    <option value="" disabled hidden>{t("PT_MUTATION_SELECT_DOC_LABEL")}</option>
                    {(addressDropdownData || []).map(doc => (
                      <option key={doc.code} value={doc.code}>{t(doc.i18nKey)}</option>
                    ))}
                  </select>
                  {proofDocType && (
                    <div style={{ position: "absolute", right: "32px", top: "50%", transform: "translateY(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "#4caf50" }} />
                  )}
                </div>
              </div>

              {/* File Upload — fully custom */}
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById("pt-addr-proof-native").click()}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("pt-addr-proof-native").click(); }}
                  style={{
                    border: (uploadedFile || uploadedFileObj) ? "2px solid #4caf50" : "2px dashed #b0b8c1",
                    borderRadius: "12px",
                    background: (uploadedFile || uploadedFileObj) ? "linear-gradient(135deg, #f0fff4, #e8f5e9)" : "#ffffff",
                    padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: "14px",
                    cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                    minHeight: "64px", boxSizing: "border-box",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                    background: (uploadedFile || uploadedFileObj)
                      ? "linear-gradient(135deg, #43a047, #2e7d32)"
                      : "linear-gradient(135deg, #e8edf5, #cfd7e8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: (uploadedFile || uploadedFileObj) ? "0 2px 6px rgba(46,125,50,0.3)" : "none",
                  }}>
                    {(uploadedFile || uploadedFileObj) ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#505a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                    )}
                  </div>

                  {/* Text info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "13px", fontWeight: "600",
                      color: (uploadedFile || uploadedFileObj) ? "#2e7d32" : "#3d4f6b",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {uploadedFileObj
                        ? uploadedFileObj.name
                        : (uploadedFile && uploadedFileName)
                          ? uploadedFileName
                          : uploadedFile
                            ? t("PT_ACTION_FILEUPLOADED")
                            : t("PT_ACTION_NO_FILEUPLOADED")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8a97a8", marginTop: "3px" }}>
                      {uploadedFileObj
                        ? `${(uploadedFileObj.size / 1024).toFixed(1)} KB · click × to remove`
                        : (uploadedFile && uploadedFileSize)
                          ? `${(uploadedFileSize / 1024).toFixed(1)} KB`
                          : uploadedFile
                            ? t("PT_ACTION_FILEUPLOADED")
                            : "JPG · PNG · PDF · Max 5MB"}
                    </div>
                  </div>

                  {/* Action button */}
                  {(uploadedFile || uploadedFileObj) ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadedFileObj(null); }}
                      style={{
                        background: "rgba(229,77,66,0.1)", border: "1px solid rgba(229,77,66,0.3)",
                        borderRadius: "6px", cursor: "pointer", color: "#e54d42",
                        fontSize: "16px", fontWeight: "700", lineHeight: 1,
                        padding: "4px 8px", flexShrink: 0, transition: "background 0.15s",
                      }}
                      title="Remove file"
                    >
                      ×
                    </button>
                  ) : (
                    <div style={{
                      background: "linear-gradient(135deg, #1a2b49 0%, #2d4a7a 100%)",
                      color: "#fff", fontSize: "12px", fontWeight: "600",
                      padding: "8px 16px", borderRadius: "8px",
                      whiteSpace: "nowrap", flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(26,43,73,0.3)",
                    }}>
                      Browse
                    </div>
                  )}

                  <input
                    type="file"
                    id="pt-addr-proof-native"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files && e.target.files[0]) handleSelectFile(e); }}
                  />
                </div>

                {uploadError && (
                  <div style={{ color: "#e54d42", fontSize: "12px", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px", fontWeight: "500" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {uploadError}
                  </div>
                )}
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