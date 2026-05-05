import React, { useState } from "react";
import {
  CardLabel,
  LabelFieldPair,
  TextInput,
  Dropdown,
  CardLabelError,
  Loader,
} from "@upyog/digit-ui-react-components";
import FormStep from "../../../../react-components/src/molecules/FormStep";
import Timeline from "../components/TLTimeline";
import { stringReplaceAll } from "../utils";

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

  /* ── UID ── */
  const [uid, setUid] = useState(
    formData?.uid?.uid || formData?.additionalDetails?.uid || ""
  );
  const [uidError, setUidError] = useState("");

  /* ── Land Area (Independent & Vacant) ── */
  const [floorarea, setFloorarea] = useState(formData?.landArea?.floorarea || "");

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

  /* ── Derived flags ── */
  const isIndependent = PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY";
  const isShared = PropertyType?.code === "BUILTUP.SHAREDPROPERTY";
  const isVacant = PropertyType?.code === "VACANT";
  const isNonResidential = isResdential?.i18nKey === "PT_COMMON_NO";

  /* ── Handlers ── */
  const handleElectricityChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setElectricity(value);
      setElectricityError(
        value.length > 0 && value.length !== 10 ? t("PT_ELECTRICITY_10_DIGIT_ERR") : ""
      );
    }
  };

  const handleUIDChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9-]{0,15}$/.test(value)) {
      setUid(value);
      setUidError(
        value.length > 0 && value.length !== 15 ? t("ERR_DEFAULT_INPUT_FIELD_MSG") : ""
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
    if (!electricity || electricity.length !== 10) return false;
    if (!propertyStructureDetails?.structureType) return false;
    if (!propertyStructureDetails?.ageOfProperty) return false;
    if (!uid || uid.length !== 15) return false;
    if ((isIndependent || isVacant) && !floorarea) return false;
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

    onSelect(config.key, {
      isResdential,
      usageCategoryMajor: finalUsageCategory,
      PropertyType,
      electricity: { electricity },
      propertyStructureDetails,
      uid: { uid },
      landArea: isIndependent || isVacant ? { floorarea } : undefined,
      noOofBasements: isIndependent ? noOofBasements : undefined,
      noOfFloors: isIndependent ? noOfFloors : undefined,
    });
  };

  const onSkip = () => onSelect();

  if (propTypeLoading || usageCatLoading) return <Loader />;

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep
        config={config}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={!isFormValid()}
        showErrorBelowChildren={true}
      >
        {/* Is Residential */}
        <LabelFieldPair>
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
        </LabelFieldPair>

        {/* Usage Category Major – shown only for Non-residential */}
        {isNonResidential && (
          <LabelFieldPair>
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
          </LabelFieldPair>
        )}

        {/* Property Type */}
        <LabelFieldPair>
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
        </LabelFieldPair>

        {/* Electricity Number */}
        <LabelFieldPair>
          <CardLabel>
            {t("PT_ELECTRICITY_LABEL")}
            <span className="check-page-link-button"> *</span>
          </CardLabel>
          <div className="field">
            <TextInput
              t={t}
              type="text"
              value={electricity}
              onChange={handleElectricityChange}
              placeholder={t("PT_ASSESMENT1_ELECTRICITY_NUMBER")}
              maxLength={10}
            />
            {electricityError && (
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                {electricityError}
              </CardLabelError>
            )}
          </div>
        </LabelFieldPair>

        {/* Structure Type */}
        <LabelFieldPair>
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
        </LabelFieldPair>

        {/* Age of Property */}
        <LabelFieldPair>
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
        </LabelFieldPair>

        {/* UID */}
        <LabelFieldPair>
          <CardLabel>
            {t("PT_ELECTRICITY_UID")}
            <span className="check-page-link-button"> *</span>
          </CardLabel>
          <div className="field">
            <TextInput
              t={t}
              type="text"
              value={uid}
              onChange={handleUIDChange}
              placeholder={t("PT_ASSESMENT1_ELECTRICITY_UID_NUMBER")}
              maxLength={15}
            />
            {uidError && (
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                {t(uidError)}
              </CardLabelError>
            )}
          </div>
        </LabelFieldPair>

        {/* Land Area – Independent & Vacant */}
        {(isIndependent || isVacant) && (
          <LabelFieldPair>
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
          </LabelFieldPair>
        )}

        {/* Number of Basements – Independent only */}
        {isIndependent && (
          <LabelFieldPair>
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
          </LabelFieldPair>
        )}

        {/* Number of Floors – Independent only */}
        {isIndependent && (
          <LabelFieldPair>
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
          </LabelFieldPair>
        )}
      </FormStep>
    </React.Fragment>
  );
};

export default PTAllPropertyDetails;
