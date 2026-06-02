import {
  getPropertyTypeLocale,
  getPropertyOwnerTypeLocale,
  getPropertyUsageTypeLocale,
  getPropertySubUsageTypeLocale,
  getPropertyOccupancyTypeLocale,
  getMohallaLocale,
  getCityLocale,
} from "./utils";

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const pickOwners = (owners = [], preferredStatus) => {
  if (!Array.isArray(owners) || owners.length === 0) return [];
  if (!preferredStatus) return [...owners];
  const byStatus = owners.filter((owner) => owner?.status === preferredStatus);
  return byStatus.length > 0 ? byStatus : [...owners];
};

const resolveInstitutionTypeCode = (application, institutionalOwner) => {
  const rawType =
    institutionalOwner?.inistitutetype?.code ||
    institutionalOwner?.inistitutetype?.value ||
    institutionalOwner?.inistitutetype ||
    application?.institution?.type?.code ||
    application?.institution?.type?.value ||
    application?.institution?.type ||
    "";

  if (rawType) return rawType;
  const category = application?.ownershipCategory || "";
  if (category.includes(".")) return category.split(".")[1] || "";
  if (category.startsWith("INSTITUTIONAL")) return category.replace("INSTITUTIONAL", "") || "";
  return "";
};

const resolveInstitutionTypeLabel = (typeCode, t) => {
  if (!typeCode) return t("CS_NA");
  const keys = [
    `PROPERTYTAX_BILLING_SLAB_${typeCode}`,
    `PT_OWNERSHIP_${typeCode}`,
    `COMMON_MASTERS_OWNERSHIPCATEGORY_${typeCode}`,
  ];

  for (const key of keys) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }

  return typeCode;
};

const getIndividualOwnerValues = (owner, application, t) => [
  { title: t("PT_OWNERSHIP_INFO_NAME"), value: owner?.name || t("CS_NA") },
  { title: t("PT_OWNERSHIP_INFO_MOBILE_NO"), value: owner?.mobileNumber || t("CS_NA") },
  { title: t("PT_FORM3_ALT_MOBILE_NUMBER"), value: owner?.alternatemobilenumber || t("CS_NA") },
  { title: t("PT_FORM3_FATHER_HUSBAND_NAME"), value: owner?.fatherOrHusbandName || t("CS_NA") },
  { title: t("PT_FORM3_RELATIONSHIP"), value: owner?.relationship?.code ? t(owner?.relationship?.code) : (owner?.relationship ? t(owner?.relationship) : t("CS_NA")) },
  { title: t("PT_OWNERSHIP_INFO_GENDER"), value: owner?.gender ? t(owner?.gender) : t("CS_NA") },
  { title: t("PT_FORM3_OWNERSHIP_TYPE"), value: t(application?.ownershipCategory) || t("CS_NA") },
  { title: t("PT_OWNERSHIP_INFO_EMAIL_ID"), value: owner?.emailId || t("CS_NA") },
  { title: t("PT_OWNERSHIP_INFO_USER_CATEGORY"), value: t(getPropertyOwnerTypeLocale(owner?.ownerType)) || t("CS_NA") },
  { title: t("PT_OWNERSHIP_INFO_CORR_ADDR"), value: owner?.correspondenceAddress || owner?.permanentAddress || t("CS_NA") },
];

const getOwner = (application, t, customTitle) => {
  console.log("application",application)
  let owners = [];
  if(customTitle && customTitle.includes("TRANSFEROR")){
  if (application?.isTransferor && application?.transferorDetails) {
    application.ownershipCategory = application?.transferorDetails?.ownershipCategory
    owners = pickOwners(application?.transferorDetails?.owners, "ACTIVE");
  } else if(application?.ownersInit){
    owners = pickOwners(application?.ownersInit, "ACTIVE");
  } else {
    owners = pickOwners(application?.owners, "INACTIVE");
  }}
  else{
  owners = pickOwners(application?.owners, "ACTIVE");
  }
  if (application?.ownershipCategory == "INDIVIDUAL.SINGLEOWNER") {
    return {
      title: t(customTitle || "PT_OWNERSHIP_INFO_SUB_HEADER"),
      values: getIndividualOwnerValues(owners[0] || {}, application, t),
    };
  } else if (application?.ownershipCategory.includes("INDIVIDUAL")) {
    let values = [];
    owners.map((owner) => {
      let doc = getIndividualOwnerValues(owner, application, t);
         values.push(...doc);
    });
    return {
      title: t(customTitle || "PT_OWNERSHIP_INFO_SUB_HEADER"),
      values: values,
    };
    } else if (application?.ownershipCategory.includes("INSTITUTIONAL")) {
    const institutionalOwner = owners?.[0] || {};
    const resolvedInstitutionTypeCode = resolveInstitutionTypeCode(application, institutionalOwner);
    const hasInstitutionalDetails = Boolean(
      application?.institution?.name ||
      application?.institution?.type ||
      application?.institution?.designation ||
      institutionalOwner?.inistitutionName ||
      institutionalOwner?.inistitutetype ||
      institutionalOwner?.designation
    );

    if (!hasInstitutionalDetails) {
      return {
        title: t("PT_OWNERSHIP_INFO_SUB_HEADER"),
        values: getIndividualOwnerValues(institutionalOwner, application, t),
      };
    }

    const institutionType = resolveInstitutionTypeLabel(resolvedInstitutionTypeCode, t);

    const institutionName =
      application?.institution?.name ||
      institutionalOwner?.inistitutionName ||
      t("CS_NA");
    const authorizedPersonName =
      application?.institution?.nameOfAuthorizedPerson ||
      institutionalOwner?.name ||
      t("CS_NA");
    const authorizedPersonDesignation =
      application?.institution?.designation ||
      institutionalOwner?.designation ||
      t("CS_NA");

    const institutionalTelephone =
      institutionalOwner?.altContactNumber && institutionalOwner?.altContactNumber !== institutionalOwner?.mobileNumber
        ? institutionalOwner?.altContactNumber
        : institutionalOwner?.alternatemobilenumber || t("CS_NA");
    const ownerAddress =
      institutionalOwner?.correspondenceAddress ||
      institutionalOwner?.permanentAddress ||
      [
        application?.address?.doorNo,
        application?.address?.street,
        application?.address?.landmark,
        application?.address?.locality?.code ? t(`${getMohallaLocale(application?.address?.locality?.code, application?.tenantId)}`) : "",
        application?.tenantId ? t(getCityLocale(application?.tenantId)) : "",
        application?.address?.pincode,
      ]
        .filter(Boolean)
        .join(", ") ||
      t("CS_NA");
    return {
      title: t("PT_OWNERSHIP_INFO_SUB_HEADER"),
      values: [
        { title: t("PT_COMMON_INSTITUTION_NAME"), value: institutionName },
        { title: t("PT_TYPE_OF_INSTITUTION"), value: institutionType },
        { title: t("PT_OWNER_NAME"), value: authorizedPersonName },
        { title: t("PT_COMMON_AUTHORISED_PERSON_DESIGNATION"), value: authorizedPersonDesignation },
        { title: t("PT_FORM3_MOBILE_NUMBER"), value: institutionalOwner?.mobileNumber || t("CS_NA") },
        { title: t("PT_OWNERSHIP_INFO_TEL_PHONE_NO"), value: institutionalTelephone },
        { title: t("PT_OWNERSHIP_INFO_CORR_ADDR"), value: ownerAddress },
        { title: t("PT_FORM3_OWNERSHIP_TYPE"), value: t(application?.ownershipCategory) || t("CS_NA") },
        { title: t("PT_OWNERSHIP_INFO_EMAIL_ID"), value: institutionalOwner?.emailId || t("CS_NA") },
      ],
    };
  } else {
    return {
      title: t("PT_OWNERSHIP_INFO_SUB_HEADER"),
      values: [{ title: t("PT_NO_OWNERS"), value: t("CS_NA") }],
    };
  }
};

const getAssessmentInfo = (application, t) => {
  const activeUnits = application?.units?.filter((unit) => unit?.active == true) || application?.units || [];
  const fallbackUsageCategory = activeUnits?.[0]?.usageCategory;
  const resolvedUsageCategory = application?.usageCategory || fallbackUsageCategory || application?.additionalDetails?.subusagetype?.code || application?.additionalDetails?.Subusagetypeofrentedarea?.code;
  const usageValue = resolvedUsageCategory
    ? `${t(
        (resolvedUsageCategory !== "RESIDENTIAL" ? "COMMON_PROPUSGTYPE_NONRESIDENTIAL_" : "COMMON_PROPSUBUSGTYPE_") +
          (resolvedUsageCategory?.split(".")?.[1] ? resolvedUsageCategory.split(".")[1] : resolvedUsageCategory)
      )}`
    : "";

  let values = [
    ...(usageValue ? [{ title: t("PT_ASSESMENT_INFO_USAGE_TYPE"), value: usageValue }] : []),
    { title: t("PT_ASSESMENT_INFO_TYPE_OF_BUILDING"), value: t(getPropertyTypeLocale(application?.propertyType)) || t("CS_NA") },
    { title: t("PT_ASSESMENT_INFO_PLOT_SIZE"), value: t(application?.landArea) || t("CS_NA") },
    { title: t("PT_ASSESMENT_INFO_NO_OF_FLOOR"), value: t(application?.noOfFloors) || t("CS_NA") },
    { title: t("PT_ASSESMENT_INFO_ELECTRICITY_ID"), value: t(application?.additionalDetails?.electricity) || t("CS_NA") },
    { title:  t("PT_FORM2_PROPERTY_TYPE"),value: t(application?.additionalDetails?.structureType?.i18nKey) || t("CS_NA")},
     {title:  t("PT_FORM2_AGE_OF_PROPERTY"),value: t(application?.additionalDetails?.ageOfProperty?.code)|| t("CS_NA")},
  ];
  application.units = activeUnits;
  let flrno,
    i = 0;
  flrno = application.units && application.units[0]?.floorNo;
  application.units.map((unit, index) => {
    const unitDetail=application?.additionalDetails?.unit[index] || {};
    values.push({
      title:t("PT_UNIT")+" "+ (index+1),
      value:(flrno !== unit?.floorNo ? (i = 1) : (i = i + 1)) && i === 1 ? t(`PROPERTYTAX_FLOOR_${unit?.floorNo}`):"",
    })
    let unitInfo=[
      {
        title: (flrno = unit?.floorNo) > -3 ? t("PT_ASSESSMENT_UNIT_USAGE_TYPE") : "",
        value: (flrno = unit?.floorNo) > -3 ? t(getPropertySubUsageTypeLocale(unit?.usageCategory)) || t("CS_NA") : "",
      },
      {
        title: (flrno = unit?.floorNo) > -3 ? t("PT_ASSESMENT_INFO_OCCUPLANCY") : "",
        value: (flrno = unit?.floorNo) > -3 ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) || t("CS_NA") : "",
      },
      {
        title: (flrno = unit?.floorNo) > -3 ? t("PT_FORM2_BUILT_AREA") : "",
        value: (flrno = unit?.floorNo) > -3 ? t(unit?.constructionDetail?.builtUpArea) || t("CS_NA") : "",
      },
    ];
    if(t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"){
      unitInfo.push(
      {
        title:
          (flrno = unit?.floorNo) > -3
            ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
              ? t("PT_FORM2_TOTAL_ANNUAL_RENT")
              : t("")
            : "",
        value:
          (flrno = unit?.floorNo) > -3
            ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
              ? (unit?.arv && `₹${t(unit?.arv)}`) || "NA"
              : t("")
            : "",
      },
      {
      title:
        (flrno = unit?.floorNo) > -3
          ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
            ? t("PT_FORM2_RENTED_MONTHS")
            : t("")
          : "",
      value:
        (flrno = unit?.floorNo) > -3
          ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
            ? (unitDetail?.RentedMonths) || t("CS_NA")
            : t("")
          : "",
    },
    {
      title:
        (flrno = unit?.floorNo) > -3
          ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
            ? t("PT_FORM2_NONRENTED_MONTHS_USAGE")
            : t("")
          : "",
      value:
        (flrno = unit?.floorNo) > -3
          ? t(getPropertyOccupancyTypeLocale(unit?.occupancyType)) === "Rented"
            ? (unitDetail?.NonRentedMonthsUsage) || t("CS_NA")
            : t("")
          : "",
    },
    );
  }
    values.push(...unitInfo);
  });
  return {
    title: t("PT_ASSESMENT_INFO_SUB_HEADER"),
    values: values,
  };
};

const getMutationDetails = (application, t) => {
  return {
    title: t("PT_MUTATION_DETAILS"),
    values: [
      {
        title: t("PT_MUTATION_COURT_PENDING_OR_NOT"),
        value: application?.additionalDetails?.isMutationInCourt
          ? t(`PT_MUTATION_PENDING_${application?.additionalDetails.isMutationInCourt}`)
          : t("CS_NA"),
      },
      { title: t("PT_MUTATION_COURT_CASE_DETAILS"), value: application?.additionalDetails?.caseDetails || t("CS_NA") },
      { title: t("PT_MUTATION_STATE_ACQUISITION"), value: application?.additionalDetails?.isPropertyUnderGovtPossession ? t(`PT_MUTATION_STATE_ACQUISITION_${application?.additionalDetails?.isPropertyUnderGovtPossession}`) : t("CS_NA") },
      { title: t("PT_MUTATION_GOVT_ACQUISITION_DETAILS"), value: application?.additionalDetails?.govtAcquisitionDetails || t("CS_NA") },
    ],
  };
};

const mutationRegistrationDetails = (application, t) => {
  return {
    title: t("PT_MUTATION_REGISTRATION_DETAILS"),
    values: [
      {
        title: t("PT_MUTATION_TRANSFER_REASON"),
        value: t(`PROPERTYTAX_REASONFORTRANSFER_${application?.additionalDetails?.reasonForTransfer.replaceAll(".", "_")}`),
      },
      { title: t("PT_MUTATION_MARKET_VALUE"), value: application?.additionalDetails?.marketValue || t("CS_NA") },
      { title: t("PT_MUTATION_DOCUMENT_NO"), value: application?.additionalDetails?.documentNumber || t("CS_NA") },
      { title: t("PT_MUTATION_DOCUMENT_VALUE"), value: application?.additionalDetails?.documentValue || t("CS_NA") },
      {
        title: t("PT_MUTATION_DOCUMENT_ISSUE_DATE"),
        value: application?.additionalDetails?.documentDate ? new Date(application?.additionalDetails?.documentDate).toDateString() : t("CS_NA"),
      },
      {
        title: t(""),
      },
      { title: t("PT_MUTATION_REMARKS"), value: application?.additionalDetails?.remarks || t("CS_NA") },
    ],
  };
};

const getPTAcknowledgementData = async (application, tenantInfo, t) => {
  if (application.creationReason === "MUTATION") {
    return {
      t: t,
      tenantId: tenantInfo?.code,
      name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
      email: tenantInfo?.emailId,
      phoneNumber: tenantInfo?.contactNumber,
      heading: t("PT_ACKNOWLEDGEMENT"),
      applicationNumber:application?.acknowldgementNumber,
      details: [
        {
          title: t("CS_TITLE_APPLICATION_DETAILS"),
          values: [
            { title: t("PT_APPLICATION_NO"), value: application?.acknowldgementNumber },
            { title: t("PT_PROPERRTYID"), value: application?.propertyId },
            {
              title: t("CS_APPLICATION_DETAILS_APPLICATION_DATE"),
              value: Digit.DateUtils.ConvertTimestampToDate(application?.auditDetails?.createdTime, "dd/MM/yyyy"),
            },
          ],
        },
        {
          title: t("PT_PROPERTY_ADDRESS_SUB_HEADER"),
          values: [
            { title: t("PT_PROPERTY_ADDRESS_PINCODE"), value: application?.address?.pincode || t("CS_NA") },
            { title: t("PT_PROPERTY_ADDRESS_CITY"), value: t(getCityLocale(application?.tenantId)) || t("CS_NA") },
            {
              title: t("PT_PROPERTY_ADDRESS_MOHALLA"),
              value: t(`${getMohallaLocale(application?.address?.locality?.code, application?.tenantId)}`) || t("CS_NA"),
            },
            { title: t("PT_PROPERTY_ADDRESS_STREET_NAME"), value: application?.address?.street || t("CS_NA") },
            { title: t("PT_PROPERTY_ADDRESS_HOUSE_NO"), value: application?.address?.doorNo || t("CS_NA") },
            { title: t("PT_PROPERTY_ADDRESS_LANDMARK"), value: application?.address?.landmark || t("CS_NA") },
          ],
        },
        getOwner(application, t, "PT_MUTATION_TRANSFEROR_DETAILS"),
        getOwner(application, t, "PT_MUTATION_TRANSFEREE_DETAILS_HEADER"),
        getMutationDetails(application, t),
        mutationRegistrationDetails(application, t),
      ],
    };
  }

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("NEW_PROPERTY_REGISTRATION"),
    applicationNumber:application?.acknowldgementNumber,
    details: [
      {
        title: t("CS_TITLE_APPLICATION_DETAILS"),
        values: [
          { title: t("PT_PROPERRTYID"), value: application?.propertyId },
          {
            title: t("CS_APPLICATION_DETAILS_APPLICATION_DATE"),
            value: Digit.DateUtils.ConvertTimestampToDate(application?.auditDetails?.createdTime, "dd/MM/yyyy"),
          },
        ],
      },
      getOwner(application, t),
      getAssessmentInfo(application, t),
      {
        title: t("PT_PROPERTY_ADDRESS_SUB_HEADER"),
        values: [
          { title: t("PT_PROPERTY_ADDRESS_PINCODE"), value: application?.address?.pincode || t("CS_NA") },
          { title: t("PT_PROPERTY_ADDRESS_CITY"), value: t(getCityLocale(application?.tenantId)) || t("CS_NA") },
          {
            title: t("PT_PROPERTY_ADDRESS_MOHALLA"),
            value: t(`${getMohallaLocale(application?.address?.locality?.code, application?.tenantId)}`) || t("CS_NA"),
          },
          { title: t("PT_PROPERTY_ADDRESS_STREET_NAMEE"), value: application?.address?.street || t("CS_NA") },
          { title: t("PT_PROPERTY_ADDRESS_HOUSE_NOO"), value: application?.address?.doorNo || t("CS_NA") },
          { title: t("PT_PROPERTY_ADDRESS_LANDMARK"), value: application?.address?.landmark || t("CS_NA") },
        ],
      },
      {
        title: t("PT_COMMON_DOCS"),
        values:
        application.documents && application.documents.length > 0
            ? application.documents.map((document) => ({
                title: t(document?.documentType || t("CS_NA")),
                value: " ",
              }))
            : {
              title: t("PT_NO_DOCUMENTS"),
              value: " ",
            },
      },
    ],
  };
};

export default getPTAcknowledgementData;