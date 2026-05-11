import {
  CardLabel,
  CardSectionHeader,
  CheckBox,
  Dropdown,
  FormStep,
  Loader,
  MobileNumber,
  RadioButtons,
  RadioOrSelect,
  TextInput,
  Toast,
} from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import Timeline from "../components/Timeline";
import { stringReplaceAll } from "../utils";

const WSConnectionStep = ({ t, config, onSelect, userType, formData }) => {
  let validation = {};
  let isMobile = window.Digit.Utils.browser.isMobile();
  const isEdit = window.location.href.includes("/ws/edit-application/");

  // ---- Connection Holder State ----
  const [name, setName] = useState(formData?.ConnectionHolderDetails?.name || formData?.formData?.ConnectionHolderDetails?.name || "");
  const [guardian, setGuardian] = useState(formData?.ConnectionHolderDetails?.guardian || formData?.formData?.ConnectionHolderDetails?.guardian || "");
  const [gender, setGender] = useState(formData?.ConnectionHolderDetails?.gender || formData?.formData?.ConnectionHolderDetails?.gender);
  const [relationship, setRelationship] = useState(formData?.ConnectionHolderDetails?.relationship || formData?.formData?.ConnectionHolderDetails?.relationship);
  const [mobileNumber, setMobileNumber] = useState(formData?.ConnectionHolderDetails?.mobileNumber || formData?.formData?.ConnectionHolderDetails?.mobileNumber || "");
  const [address, setAddress] = useState(formData?.ConnectionHolderDetails?.address || formData?.formData?.ConnectionHolderDetails?.address || "");
  const [documentId, setDocumentId] = useState(formData?.ConnectionHolderDetails?.documentId || formData?.formData?.ConnectionHolderDetails?.documentId || "");
  const [isOwnerSame, setIsOwnerSame] = useState(
    (formData?.ConnectionHolderDetails?.isOwnerSame == false || formData?.formData?.ConnectionHolderDetails?.isOwnerSame == false) ? false : true
  );
  const [uploadedFile, setUploadedFile] = useState(formData?.[config.key]?.fileStoreId || null);
  const [file, setFile] = useState(null);
  const [dropdownValue, setDropdownValue] = useState(formData?.ConnectionHolderDetails?.documentType || "");
  const [ownerType, setOwnerType] = useState(formData?.ConnectionHolderDetails?.specialCategoryType || {});
  const [emailId, setEmailId] = useState(formData?.ConnectionHolderDetails?.emailId || formData?.formData?.ConnectionHolderDetails?.emailId || "");
  const [emailError, setEmailError] = useState(null);

  // ---- Service Name State ----
  const [serviceName, setServiceName] = useState(formData?.serviceName || "");

  // ---- Water Connection State ----
  const [proposedTaps, setProposedTaps] = useState(formData?.waterConectionDetails?.proposedTaps || "");
  const [proposedPipeSize, setProposedPipeSize] = useState(formData?.waterConectionDetails?.proposedPipeSize || "");
  const [proposedPipeSizeList, setProposedPipeSizeList] = useState([]);

  // ---- Sewerage Connection State ----
  const [proposedWaterClosets, setProposedWaterClosets] = useState(
    formData?.sewerageConnectionDetails?.proposedWaterClosets || ""
  );
  const [proposedToilets, setProposedToilets] = useState(
    formData?.sewerageConnectionDetails?.proposedToilets || ""
  );

  // ---- Shared State ----
  const [isDisableForNext, setIsDisableForNext] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // ---- MDMS Data ----
  const { isLoading: isGenderLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", [
    "GenderType",
  ]);
  const { data: Menu, isLoading: isSpecialCategoryLoading } = Digit.Hooks.pt.usePropertyMDMS(
    stateId,
    "PropertyTax",
    "OwnerType"
  );
  Menu ? Menu.sort((a, b) => a.name.localeCompare(b.name)) : "";
  const { isLoading: wsServiceCalculationLoading, data: wsServiceCalculation } =
    Digit.Hooks.ws.WSSearchMdmsTypes.useWSServicesCalculation(stateId);
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;
  let dropdownData = [];
  const specialProofIdentity = Array.isArray(docs) && docs.filter((doc) => doc.code.includes("SPECIALCATEGORYPROOF"));
  if (specialProofIdentity.length > 0) {
    dropdownData = specialProofIdentity[0]?.dropdownData;
    dropdownData.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });
    dropdownData = dropdownData?.filter((dropdown) => dropdown.parentValue.includes(ownerType?.code));
    if (dropdownData.length == 1 && dropdownValue != dropdownData[0]) {
      setDropdownValue(dropdownData[0]);
    }
  }

  // Build gender menu
  let genderMenu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      genderMenu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      });
    });

  const GuardianOptions = [
    { name: "Father", code: "FATHER", i18nKey: "COMMON_MASTERS_OWNERTYPE_FATHER" },
    { name: "HUSBAND", code: "HUSBAND", i18nKey: "COMMON_MASTERS_OWNERTYPE_HUSBAND" },
  ];

  const serviceNameList = [
    { i18nKey: "WS_WATER_CONNECTION_ONLY", code: "WATER" },
    { i18nKey: "WS_SEWERAGE_CONNECTION_ONLY", code: "SEWERAGE" },
    { i18nKey: "WS_BOTH_WATER_AND_SEWERAGE", code: "BOTH" },
  ];

  const reversedOwners = Array.isArray(formData?.cpt?.details?.owners)
    ? formData?.cpt?.details?.owners.slice().reverse()
    : [];

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 2000000) {
          setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("PT_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("PT_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    if (wsServiceCalculation?.PipeSize?.length > 0) {
      let pipeLists = [];
      wsServiceCalculation?.PipeSize?.forEach((type) => {
        pipeLists.push({
          i18nKey: `${type.size} ${t("WS_INCHES_LABEL")}`,
          code: type.size,
          id: type.id,
          size: type.size,
        });
      });
      setProposedPipeSizeList(pipeLists);
    }
  }, [wsServiceCalculation]);

  const validateEmail = (value) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z.-]+\.(com|org|in)$/;
    if (value === "") {
      setEmailError("");
    } else if (emailPattern.test(value)) {
      setEmailError("");
    } else {
      setEmailError(t("CORE_INVALID_EMAIL_ID_PATTERN"));
    }
  };

  useEffect(() => {
    if (emailId) {
      validateEmail(emailId);
    }
  }, [emailId]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailId(value);
    validateEmail(value);
  };

  const showWaterFields = serviceName?.code === "WATER" || serviceName?.code === "BOTH";
  const showSewerageFields = serviceName?.code === "SEWERAGE" || serviceName?.code === "BOTH";

  const buildConnectionDet = () => {
    if (isOwnerSame) {
      return {
        isOwnerSame: true,
        name: reversedOwners?.[0]?.name,
        mobileNumber: reversedOwners?.[0]?.mobileNumber,
        gender: reversedOwners?.[0]?.gender
          ? { code: reversedOwners?.[0]?.gender, i18nKey: `COMMON_GENDER_${reversedOwners?.[0]?.gender}` }
          : null,
        guardian: reversedOwners?.[0]?.fatherOrHusbandName,
        address: reversedOwners?.[0]?.permanentAddress,
        emailId: reversedOwners?.[0]?.emailId,
        relationship: reversedOwners?.[0]?.relationship
          ? {
              code: reversedOwners?.[0]?.relationship,
              i18nKey: `COMMON_MASTERS_OWNERTYPE_${reversedOwners?.[0]?.relationship}`,
            }
          : null,
        specialCategoryType: ownerType,
        documentId: documentId,
        fileStoreId: uploadedFile,
        documentType: dropdownValue,
      };
    } else {
      return {
        isOwnerSame: false,
        name,
        mobileNumber,
        gender,
        guardian,
        address,
        relationship,
        specialCategoryType: ownerType,
        emailId,
        documentId: documentId,
        fileStoreId: uploadedFile,
        documentType: dropdownValue,
      };
    }
  };

  const handleSubmit = () => {
    if (emailError) return;

    const ConnectionDet = buildConnectionDet();

    if (serviceName?.code == "WATER") sessionStorage.setItem("serviceName", "WATER");
    else if (serviceName?.code == "SEWERAGE") sessionStorage.setItem("serviceName", "SEWERAGE");
    else sessionStorage.setItem("serviceName", "");

    const connectionHolders = ConnectionDet.isOwnerSame
      ? null
      : [
          {
            correspondenceAddress: ConnectionDet.address,
            fatherOrHusbandName: ConnectionDet.guardian,
            gender: ConnectionDet.gender?.code,
            mobileNumber: ConnectionDet.mobileNumber,
            name: ConnectionDet.name,
            emailId: ConnectionDet.emailId,
            ownerType: ConnectionDet.specialCategoryType?.code || "NONE",
            relationship: ConnectionDet.relationship?.code,
            sameAsPropertyAddress: false,
          },
        ];

    setIsDisableForNext(true);

    if (serviceName?.code === "WATER") {
      if (
        !(formData?.WaterConnectionResult && formData?.WaterConnectionResult?.WaterConnection?.[0]?.id) ||
        formData?.isModifyConnection
      ) {
        let payload = {};
        if (formData?.isModifyConnection) {
          payload = {
            WaterConnection: {
              ...formData?.WaterConnectionResult?.WaterConnection?.[0],
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        } else {
          payload = {
            WaterConnection: {
              water: true,
              sewerage: false,
              property: { ...formData?.cpt?.details },
              proposedTaps: proposedTaps,
              proposedPipeSize: proposedPipeSize?.code,
              proposedWaterClosets: null,
              proposedToilets: null,
              connectionHolders: connectionHolders,
              service: "Water",
              roadCuttingArea: null,
              noOfTaps: null,
              noOfWaterClosets: null,
              noOfToilets: null,
              propertyId: formData?.cptId?.id || formData?.cpt?.details?.propertyId,
              additionalDetails: {
                initialMeterReading: null,
                detailsProvidedBy: "",
                locality: formData?.cpt?.details?.address?.locality?.code,
              },
              tenantId: formData?.cpt?.details?.tenantId,
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        }

        Digit.WSService.create(payload, "WATER")
          .then((result) => {
            setIsDisableForNext(false);
            let data = {
              ...formData,
              ConnectionHolderDetails: ConnectionDet,
              serviceName,
              WaterConnectionResult: result,
              waterConectionDetails: { proposedTaps: proposedTaps, proposedPipeSize: proposedPipeSize },
            };
            onSelect("", data, "", true);
          })
          .catch((e) => {
            setIsDisableForNext(false);
            setShowToast({ key: "error" });
            setError(e?.response?.data?.Errors[0]?.message || null);
          });
      } else {
        setIsDisableForNext(false);
        let data = {
          ...formData,
          ConnectionHolderDetails: ConnectionDet,
          serviceName,
          waterConectionDetails: { proposedTaps: proposedTaps, proposedPipeSize: proposedPipeSize },
        };
        onSelect("", data, "", true);
      }
    } else if (serviceName?.code === "SEWERAGE") {
      if (
        (!(formData?.SewerageConnectionResult && formData?.SewerageConnectionResult?.SewerageConnections?.[0]?.id) ||
          formData?.isModifyConnection)
      ) {
        let payload = {};
        if (formData?.isModifyConnection) {
          payload = {
            SewerageConnection: {
              ...formData?.SewerageConnectionResult?.SewerageConnections?.[0],
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        } else {
          payload = {
            SewerageConnection: {
              water: false,
              sewerage: true,
              property: { ...formData?.cpt?.details },
              proposedTaps: null,
              proposedPipeSize: null,
              proposedWaterClosets: parseInt(proposedWaterClosets),
              proposedToilets: parseInt(proposedToilets),
              connectionHolders: connectionHolders,
              service: "Sewerage",
              roadCuttingArea: null,
              noOfTaps: null,
              noOfWaterClosets: null,
              noOfToilets: null,
              propertyId: formData?.cptId?.id || formData?.cpt?.details?.propertyId,
              additionalDetails: {
                initialMeterReading: null,
                detailsProvidedBy: "",
                locality: formData?.cpt?.details?.address?.locality?.code,
              },
              tenantId: formData?.cpt?.details?.tenantId,
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        }

        Digit.WSService.create(payload, "SEWERAGE")
          .then((result) => {
            setIsDisableForNext(false);
            let data = {
              ...formData,
              ConnectionHolderDetails: ConnectionDet,
              serviceName,
              SewerageConnectionResult: result,
              sewerageConnectionDetails: {
                proposedWaterClosets: proposedWaterClosets,
                proposedToilets: proposedToilets,
              },
            };
            onSelect("", data, "", true);
          })
          .catch((e) => {
            setIsDisableForNext(false);
            setShowToast({ key: "error" });
            setError(e?.response?.data?.Errors[0]?.message || null);
          });
      } else {
        setIsDisableForNext(false);
        let data = {
          ...formData,
          ConnectionHolderDetails: ConnectionDet,
          serviceName,
          sewerageConnectionDetails: {
            proposedWaterClosets: proposedWaterClosets,
            proposedToilets: proposedToilets,
          },
        };
        onSelect("", data, "", true);
      }
    } else {
      // BOTH
      if (
        (!(formData?.SewerageConnectionResult && formData?.SewerageConnectionResult?.SewerageConnection?.id) && !(formData?.WaterConnectionResult && formData?.WaterConnectionResult?.WaterConnection?.id) || formData?.isModifyConnection)
      ) {
        let payload1 = {};
        let payload2 = {};
        if (formData?.isModifyConnection) {
          payload1 = {
            WaterConnection: {
              ...formData?.WaterConnectionResult?.WaterConnection?.[0],
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
          payload2 = {
            SewerageConnection: {
              ...formData?.SewerageConnectionResult?.SewerageConnections?.[0],
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        } else {
          payload1 = {
            WaterConnection: {
              water: true,
              sewerage: true,
              property: { ...formData?.cpt?.details },
              proposedTaps: proposedTaps,
              proposedPipeSize: proposedPipeSize?.code,
              proposedWaterClosets: parseInt(proposedWaterClosets),
              proposedToilets: parseInt(proposedToilets),
              connectionHolders: connectionHolders,
              service: "Water and Sewerage",
              roadCuttingArea: null,
              noOfTaps: null,
              noOfWaterClosets: null,
              noOfToilets: null,
              propertyId: formData?.cptId?.id || formData?.cpt?.details?.propertyId,
              additionalDetails: {
                initialMeterReading: null,
                detailsProvidedBy: "",
                locality: formData?.cpt?.details?.address?.locality?.code,
              },
              tenantId: formData?.cpt?.details?.tenantId,
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
          payload2 = {
            SewerageConnection: {
              water: true,
              sewerage: true,
              property: { ...formData?.cpt?.details },
              proposedTaps: proposedTaps,
              proposedPipeSize: proposedPipeSize?.code,
              proposedWaterClosets: parseInt(proposedWaterClosets),
              proposedToilets: parseInt(proposedToilets),
              connectionHolders: connectionHolders,
              service: "Water and Sewerage",
              roadCuttingArea: null,
              noOfTaps: null,
              noOfWaterClosets: null,
              noOfToilets: null,
              propertyId: formData?.cptId?.id || formData?.cpt?.details?.propertyId,
              additionalDetails: {
                initialMeterReading: null,
                detailsProvidedBy: "",
                locality: formData?.cpt?.details?.address?.locality?.code,
              },
              tenantId: formData?.cpt?.details?.tenantId,
              processInstance: { action: "INITIATE" },
              channel: "CITIZEN",
            },
            reconnectRequest: false,
            disconnectRequest: false,
          };
        }

        Digit.WSService.create(payload1, "WATER")
          .then((result1) => {
            Digit.WSService.create(payload2, "SEWERAGE")
              .then((result2) => {
                setIsDisableForNext(false);
                let data = {
                  ...formData,
                  ConnectionHolderDetails: ConnectionDet,
                  serviceName,
                  WaterConnectionResult: result1,
                  SewerageConnectionResult: result2,
                  waterConectionDetails: { proposedTaps: proposedTaps, proposedPipeSize: proposedPipeSize },
                  sewerageConnectionDetails: {
                    proposedWaterClosets: proposedWaterClosets,
                    proposedToilets: proposedToilets,
                  },
                };
                onSelect("", data, "", true);
              })
              .catch((e) => {
                setIsDisableForNext(false);
                setShowToast({ key: "error" });
                setError(e?.response?.data?.Errors[0]?.message || null);
              });
          })
          .catch((e) => {
            setIsDisableForNext(false);
            setShowToast({ key: "error" });
            setError(e?.response?.data?.Errors[0]?.message || null);
          });
      } else {
        setIsDisableForNext(false);
        let data = {
          ...formData,
          ConnectionHolderDetails: ConnectionDet,
          serviceName,
          waterConectionDetails: { proposedTaps: proposedTaps, proposedPipeSize: proposedPipeSize },
          sewerageConnectionDetails: {
            proposedWaterClosets: proposedWaterClosets,
            proposedToilets: proposedToilets,
          },
        };
        onSelect("", data, "", true);
      }
    }
  };

  const onSkip = () => onSelect();

  const isHolderInvalid =
    !isOwnerSame && (!name || !mobileNumber || !gender || !guardian || !relationship || !(ownerType?.code) || !address);
  const isWaterInvalid = showWaterFields && (!proposedTaps || !proposedPipeSize);
  const isSewerageInvalid = showSewerageFields && (!proposedWaterClosets || !proposedToilets);
  const isSubmitDisabled =
    isHolderInvalid || !serviceName || isWaterInvalid || isSewerageInvalid || isDisableForNext || !!emailError;

  if (isGenderLoading || wsServiceCalculationLoading || isSpecialCategoryLoading) return <Loader />;

  return (
    <div>
      {userType === "citizen" && <Timeline currentStep={2} />}
      <FormStep config={config} onSelect={handleSubmit} onSkip={onSkip} t={t} isDisabled={isSubmitDisabled}>

        {/* ---- Connection Holder Section ---- */}
        <CardSectionHeader>{t("WS_COMMON_CONNECTION_HOLDER_DETAILS_HEADER")}</CardSectionHeader>
        <CheckBox
          label={t("WS_CONN_HOLDER_SAME_AS_OWNER_DETAILS")}
          onChange={(e) => setIsOwnerSame(!isOwnerSame)}
          checked={isOwnerSame}
          style={{ paddingBottom: "10px", paddingTop: "3px" }}
        />
        {!isOwnerSame && (
          <div
            style={{
              border: "solid",
              borderRadius: "5px",
              padding: "10px",
              paddingTop: "20px",
              marginTop: "10px",
              borderColor: "#f3f3f3",
              background: "#FAFAFA",
            }}
          >
            <CardLabel>{`${t("WS_OWN_DETAIL_NAME")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              t={t}
              type={"text"}
              style={{ background: "#FAFAFA" }}
              isMandatory={false}
              optionKey="i18nKey"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z ]*$",
                type: "text",
                title: t("WS_NAME_ERROR_MESSAGE"),
              })}
            />
            <CardLabel>{`${t("WS_OWN_DETAIL_GENDER_LABEL")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <RadioButtons
              t={t}
              options={genderMenu}
              optionsKey="code"
              name="gender"
              value={gender}
              selectedOption={gender}
              onSelect={setGender}
              isDependent={true}
              labelKey="COMMON_GENDER"
            />
            <CardLabel>{`${t("WS_OWN_MOBILE_NO")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <MobileNumber
              value={mobileNumber}
              name="mobileNumber"
              onChange={(value) => setMobileNumber(value)}
              style={{ background: "#FAFAFA" }}
              {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
            />
            <CardLabel>{`${t("WS_OWN_DETAIL_GUARDIAN_LABEL")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              t={t}
              type={"text"}
              isMandatory={false}
              optionKey="i18nKey"
              name="guardian"
              value={guardian}
              style={{ background: "#FAFAFA" }}
              onChange={(e) => setGuardian(e.target.value)}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z ]*$",
                type: "text",
                title: t("WS_NAME_ERROR_MESSAGE"),
              })}
            />
            <CardLabel>{`${t("WS_OWN_DETAIL_RELATIONSHIP_LABEL")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <RadioButtons
              t={t}
              optionsKey="i18nKey"
              name="relationship"
              options={GuardianOptions}
              value={relationship}
              selectedOption={relationship}
              onSelect={setRelationship}
              isDependent={true}
              labelKey="COMMON_MASTERS_OWNERTYPE"
            />
            <CardLabel>{`${t("WS_COMMON_TABLE_COL_ADDRESS")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              t={t}
              type={"text"}
              style={{ background: "#FAFAFA" }}
              isMandatory={false}
              optionKey="i18nKey"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              {...(validation = {
                isRequired: true,
                title: t("WS_ADDR_ERROR_MESSAGE"),
              })}
            />
            <CardLabel>{`${t("WS_OWN_SPECIAL_CAT_LABEL")}`}<span className="check-page-link-button"> *</span></CardLabel>
            <Dropdown
              className="form-field"
              selected={ownerType}
              style={isMobile ? {} : { width: "540px" }}
              isMandatory={true}
              option={Menu}
              select={setOwnerType}
              optionKey="i18nKey"
              t={t}
            />
            <div>
              <CardLabel>{`${t("WS_EMAIL_ID")}`}</CardLabel>
              <TextInput
                t={t}
                isMandatory={false}
                name="emailId"
                value={emailId}
                onChange={handleEmailChange}
                {...(validation = {
                  pattern: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$",
                  type: "Email",
                  title: t("CORE_COMMON_APPLICANT_EMAILI_ID_INVALID"),
                })}
              />
              {emailError && <span style={{ color: "red" }}>{emailError}</span>}
            </div>
          </div>
        )}

        {/* ---- Service Name Section ---- */}
        <CardSectionHeader style={{ marginTop: "24px" }}>{t("WS_SERVICE_NAME")}</CardSectionHeader>
        <CardLabel>{t("WS_SELECT_SERVICE_TYPE_WANT_TO_APPLY")}</CardLabel>
        <RadioOrSelect
          name="serviceName"
          options={serviceNameList}
          selectedOption={serviceName}
          optionKey="i18nKey"
          onSelect={setServiceName}
          t={t}
          disabled={isEdit}
        />

        {/* ---- Water Connection Section ---- */}
        {showWaterFields && (
          <div>
            <CardSectionHeader style={{ marginTop: "24px" }}>{t("WS_WATER_CONNECTION_DETAILS")}</CardSectionHeader>
            <CardLabel>{t("WS_NO_OF_TAPS_PROPOSED")}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              isMandatory={false}
              optionKey="i18nKey"
              t={t}
              name="proposedTaps"
              onChange={(e) => setProposedTaps(e.target.value)}
              value={proposedTaps}
              {...(validation = {
                isRequired: true,
                pattern: "^[1-9]+[0-9]*$",
                title: t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                type: "text",
              })}
            />
            <CardLabel>{t("WS_PROPOSED_PIPE_SIZE")}<span className="check-page-link-button"> *</span></CardLabel>
            <RadioOrSelect
              name="proposedPipeSize"
              options={proposedPipeSizeList}
              selectedOption={proposedPipeSize}
              optionKey="i18nKey"
              onSelect={setProposedPipeSize}
              t={t}
            />
          </div>
        )}

        {/* ---- Sewerage Connection Section ---- */}
        {showSewerageFields && (
          <div>
            <CardSectionHeader style={{ marginTop: "24px" }}>
              {t("PDF_STATIC_LABEL_SW_CONSOLIDATED_ACKNOWELDGMENT_LOGO_SUB_HEADER")}
            </CardSectionHeader>
            <CardLabel>{t("WS_NO_OF_WATER_CLOSETS")}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              type={"number"}
              isMandatory={false}
              optionKey="i18nKey"
              t={t}
              name="proposedWaterClosets"
              onChange={(e) => setProposedWaterClosets(e.target.value)}
              value={proposedWaterClosets}
              {...(validation = {
                isRequired: true,
                pattern: "^[1-9]+[0-9]*$",
                title: t("ERR_DEFAULT_INPUT_FIELD_MSG"),
              })}
            />
            <CardLabel>{t("WS_SERV_DETAIL_NO_OF_TOILETS")}<span className="check-page-link-button"> *</span></CardLabel>
            <TextInput
              type={"number"}
              isMandatory={false}
              optionKey="i18nKey"
              t={t}
              name="proposedToilets"
              onChange={(e) => setProposedToilets(e.target.value)}
              value={proposedToilets}
              {...(validation = {
                isRequired: true,
                pattern: "^[1-9]+[0-9]*$",
                title: t("ERR_DEFAULT_INPUT_FIELD_MSG"),
              })}
            />
          </div>
        )}

      </FormStep>
      {showToast && (
        <Toast
          error={showToast?.key === "error" ? true : false}
          label={error}
          isDleteBtn={true}
          onClose={() => {
            setShowToast(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
};

export default WSConnectionStep;
