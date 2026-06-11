import { getPropertySubtypeLocale, getPropertyTypeLocale } from "../../../utils/pt";
import { PTService } from "../../elements/PT";

// Returns true if a value is an enc-service ciphertext (e.g. "663294|sHZM5oy...")
const isEncrypted = (val) => val && typeof val === "string" && /^\d+\|/.test(val);

// Returns plain-text owner data from additionalDetails when the user-service value is encrypted
const getPlainOwner = (additionalOwners, ownerSequence) =>
  additionalOwners?.find((o) => o?.additionalDetails?.ownerSequence === ownerSequence) ||
  additionalOwners?.[ownerSequence] ||
  {};

export const PTSearch = {
  all: async (tenantId, filters = {}) => {
    const response = await PTService.search({ tenantId, filters });
    return response;
  },
  /**
   * Custom service which can be make a
   * property search using property id and tenant id
   * and return the property generic template to show employee and citizen view
   *
   * @author jagankumar-egov
   *
   * @example
   *  PTSearch.genericPropertyDetails(t,
   *                                  tenantId,
   *                                  propertyId)
   *
   * @returns {Object} Returns the object which contains
   *                   applicationDetails [which is a template of property details ]
   *                   applicationData  {which is a property object itself}
   */
  genericPropertyDetails: async (t, tenantId, propertyIds) => {
    const filters = { propertyIds };
    const property = await PTSearch.application(tenantId, filters);
    const addressDetails = {
      title: "PT_PROPERTY_ADDRESS_SUB_HEADER",
      asSectionHeader: true,
      values: [
        { title: "PT_PROPERTY_ADDRESS_PINCODE", value: property?.address?.pincode },
        { title: "PT_PROPERTY_ADDRESS_CITY", value: property?.address?.city },
        {
          title: "PT_PROPERTY_ADDRESS_MOHALLA",
          value: `${property?.tenantId?.toUpperCase()?.split(".")?.join("_")}_REVENUE_${property?.address?.locality?.code}`,
        },
        {
          title: "PT_PROPERTY_ADDRESS_HOUSE_NO",
          value: property?.address?.doorNo,
          privacy: { uuid: property?.owners?.[0]?.uuid, fieldName: "doorNo", model: "Property",
          showValue: false,
          loadData: {
            serviceName: "/property-services/property/_search",
            requestBody: {},
            requestParam: { tenantId, propertyIds },
            jsonPath: "Properties[0].address.doorNo",
            isArray: false,
          }, },
        },
        {
          title: "PT_PROPERTY_ADDRESS_STREET_NAME",
          value: property?.address?.street,
          privacy: {
            uuid: property?.owners?.[0]?.uuid,
            fieldName: "street",
            model: "Property",
            showValue: false,
            loadData: {
              serviceName: "/property-services/property/_search",
              requestBody: {},
              requestParam: { tenantId, propertyIds },
              jsonPath: "Properties[0].address.street",
              isArray: false,
            },
          },
        },
      ],
    };
    const assessmentDetails = {
      title: "PT_ASSESMENT_INFO_SUB_HEADER",
      values: [
        { title: "PT_ASSESMENT_INFO_TYPE_OF_BUILDING", value: getPropertyTypeLocale(property?.propertyType) },
        { title: "PT_ASSESMENT_INFO_USAGE_TYPE", value: getPropertySubtypeLocale(property?.usageCategory) },
        { title: "PT_ASSESMENT_INFO_PLOT_SIZE", value: property?.landArea },
        { title: "PT_ASSESMENT_INFO_NO_OF_FLOOR", value: property?.noOfFloors },
      ],
    };
    const propertyDetail = {
      title: "PT_DETAILS",
      values: [
        { title: "TL_PROPERTY_ID", value: property?.propertyId || "NA" },
        { title: "PT_OWNER_NAME", value: property?.owners?.map((owner, idx) => {
            const seq = owner?.additionalDetails?.ownerSequence != null ? owner.additionalDetails.ownerSequence : idx;
            const plain = getPlainOwner(property?.additionalDetails?.owners, seq);
            return isEncrypted(owner?.name) ? (plain?.name || owner?.name) : owner?.name;
          }).reverse().join(",") || "NA" },
        { title: "PT_SEARCHPROPERTY_TABEL_STATUS", value: Digit.Utils.locale.getTransformedLocale(`WF_PT_${property?.status}`) || "NA" },
      ],
    };
    const ownersSequences=property?.owners?.additionalDetails!==null ? property?.owners?.sort((a,b)=>a?.additionalDetails?.ownerSequence-b?.additionalDetails?.ownerSequence): property?.owners
    const additionalOwners = property?.additionalDetails?.owners;
    const ownerdetails = {
      title: "PT_OWNERSHIP_INFO_SUB_HEADER",
      additionalDetails: {
        owners: ownersSequences
          ?.filter((owner) => owner.status !== "INACTIVE")
          .map((owner, index) => {
            const seq = owner?.additionalDetails?.ownerSequence != null ? owner.additionalDetails.ownerSequence : index;
            const plain = getPlainOwner(additionalOwners, seq);
            const ownerName = isEncrypted(owner?.name) ? (plain?.name || owner?.name) : owner?.name;
            const ownerMobile = isEncrypted(owner?.mobileNumber) ? (plain?.mobileNumber || owner?.mobileNumber) : owner?.mobileNumber;
            const ownerGuardian = isEncrypted(owner?.fatherOrHusbandName) ? (plain?.fatherOrHusbandName || owner?.fatherOrHusbandName) : owner?.fatherOrHusbandName;
            const ownerEmail = isEncrypted(owner?.emailId) ? (plain?.emailId || owner?.emailId) : owner?.emailId;
            const ownerAddr = isEncrypted(owner?.permanentAddress || owner?.correspondenceAddress)
              ? (plain?.permanentAddress || plain?.correspondenceAddress || owner?.permanentAddress || owner?.correspondenceAddress)
              : (owner?.permanentAddress || owner?.correspondenceAddress);
            return {
              status: owner.status,
              title: "ES_OWNER",
              values: [
                { title: "PT_OWNERSHIP_INFO_NAME", value: ownerName },
                { title: "PT_OWNERSHIP_INFO_GENDER", value: owner?.gender },
                {
                  title: "PT_OWNERSHIP_INFO_MOBILE_NO",
                  value: ownerMobile,
                },
                {
                  title: "PT_OWNERSHIP_INFO_USER_CATEGORY",
                  value: `COMMON_MASTERS_OWNERTYPE_${owner?.ownerType}` || "NA",
                },
                {
                  title: "PT_SEARCHPROPERTY_TABEL_GUARDIANNAME",
                  value: ownerGuardian,
                },
                { title: "PT_FORM3_OWNERSHIP_TYPE", value: property?.ownershipCategory },
                {
                  title: "PT_OWNERSHIP_INFO_EMAIL_ID",
                  value: ownerEmail,
                  hide: !(ownerEmail && ownerEmail !== "NA"),
                },
                {
                  title: "PT_OWNERSHIP_INFO_CORR_ADDR",
                  value: ownerAddr,
                  hide: !ownerAddr,
                },
              ],
            };
          }),
      },
    };

    const applicationDetails = [propertyDetail, addressDetails, assessmentDetails, ownerdetails];
    return {
      tenantId: property?.tenantId,
      applicationDetails,
      applicationData: property,
    };
  },
  application: async (tenantId, filters = {}) => {
    const response = await PTService.search({ tenantId, filters });
    return response.Properties[0];
  },
  transformPropertyToApplicationDetails: ({ property: response, t }) => {
    return [
      {
        title: "PT_PROPERTY_ADDRESS_SUB_HEADER",
        asSectionHeader: true,
        values: [
          { title: "PT_PROPERTY_ADDRESS_PINCODE", value: response?.address?.pincode },
          { title: "PT_PROPERTY_ADDRESS_CITY", value: response?.address?.city },
          {
            title: "PT_PROPERTY_ADDRESS_MOHALLA",
            value: `${response?.tenantId?.toUpperCase()?.split(".")?.join("_")}_REVENUE_${response?.address?.locality?.code}`,
          },
          {
            title: "PT_PROPERTY_ADDRESS_STREET_NAME",
            value: response?.address?.street,
            privacy: {
              uuid: response?.owners?.[0]?.uuid,
              fieldName: "street",
              model: "Property",
              showValue: false,
              loadData: {
                serviceName: "/property-services/property/_search",
                requestBody: {},
                requestParam: { tenantId : response?.tenantId, propertyIds:response?.propertyId },
                jsonPath: "Properties[0].address.street",
                isArray: false,
              },
            },
          },
          {
            title: "PT_PROPERTY_ADDRESS_HOUSE_NO",
            value: response?.address?.doorNo,
            privacy: {
              uuid: response?.owners?.[0]?.uuid,
              fieldName: "doorNo",
              model: "Property",
              showValue: false,
              loadData: {
                serviceName: "/property-services/property/_search",
                requestBody: {},
                requestParam: { tenantId : response?.tenantId, propertyIds:response?.propertyId },
                jsonPath: "Properties[0].address.doorNo",
                isArray: false,
              },
            },
          },
        ],
      },
      {
        title: "PT_ASSESMENT_INFO_SUB_HEADER",
        values: [
          { title: "PT_ASSESMENT_INFO_TYPE_OF_BUILDING", value: getPropertyTypeLocale(response?.propertyType) },
          { title: "PT_ASSESMENT_INFO_USAGE_TYPE", value: response?.usageCategory ? getPropertySubtypeLocale(response?.usageCategory) : `N/A` },
          { title: "PT_ASSESMENT_INFO_PLOT_SIZE", value: response?.landArea },
          { title: "PT_ASSESMENT_INFO_NO_OF_FLOOR", value: response?.noOfFloors },
        ],
        additionalDetails: {
          floors: response?.units
            ?.filter((e) => e.active)
            ?.sort?.((a, b) => a.floorNo - b.floorNo)
            ?.map((unit, index) => {
              let floorName = `PROPERTYTAX_FLOOR_${unit.floorNo}`;
              const values = [
                {
                  title: "PT_ASSESSMENT_UNIT_USAGE_TYPE",
                  value: `PROPERTYTAX_BILLING_SLAB_${
                    unit?.usageCategory != "RESIDENTIAL" ? unit?.usageCategory?.split(".")[1] : unit?.usageCategory
                  }`,
                },
                {
                  title: "PT_ASSESMENT_INFO_OCCUPLANCY",
                  value: unit?.occupancyType,
                },
                {
                  title: "PT_FORM2_BUILT_AREA",
                  value: unit?.constructionDetail?.builtUpArea,
                },
              ];

              if (unit.occupancyType === "RENTED") values.push({ title: "PT_FORM2_TOTAL_ANNUAL_RENT", value: unit.arv });

              return {
                title: floorName,
                values: [
                  {
                    title: `${t("ES_APPLICATION_DETAILS_UNIT")} ${index + 1}`,
                    values,
                  },
                ],
              };
            }),
        },
      },
      {
        title: "PT_OWNERSHIP_INFO_SUB_HEADER",
        additionalDetails: {
          owners: response?.owners?.map((owner, index) => {
            const seq = owner?.additionalDetails?.ownerSequence != null ? owner.additionalDetails.ownerSequence : index;
            const plain = getPlainOwner(response?.additionalDetails?.owners, seq);
            const ownerName = isEncrypted(owner?.name) ? (plain?.name || owner?.name) : owner?.name;
            const ownerMobile = isEncrypted(owner?.mobileNumber) ? (plain?.mobileNumber || owner?.mobileNumber) : owner?.mobileNumber;
            const ownerGuardian = isEncrypted(owner?.fatherOrHusbandName) ? (plain?.fatherOrHusbandName || owner?.fatherOrHusbandName) : owner?.fatherOrHusbandName;
            const ownerEmail = isEncrypted(owner?.emailId) ? (plain?.emailId || owner?.emailId) : owner?.emailId;
            const ownerAddr = isEncrypted(owner?.correspondenceAddress || owner?.permanentAddress)
              ? (plain?.permanentAddress || plain?.correspondenceAddress || owner?.correspondenceAddress || owner?.permanentAddress)
              : (owner?.correspondenceAddress || owner?.permanentAddress);
            return {
              status: owner.status,
              title: "ES_OWNER",
              values: [
                {
                  title: "PT_OWNERSHIP_INFO_NAME",
                  value: ownerName,
                },
                { title: "PT_OWNERSHIP_INFO_GENDER", value: owner?.gender },
                {
                  title: "PT_OWNERSHIP_INFO_MOBILE_NO",
                  value: ownerMobile,
                },
                {
                  title: "PT_OWNERSHIP_INFO_USER_CATEGORY",
                  value: `COMMON_MASTERS_OWNERTYPE_${owner?.ownerType}` || "NA",
                },
                {
                  title: "PT_SEARCHPROPERTY_TABEL_GUARDIANNAME",
                  value: ownerGuardian,
                },
                { title: "PT_FORM3_OWNERSHIP_TYPE", value: response?.ownershipCategory },
                {
                  title: "PT_OWNERSHIP_INFO_EMAIL_ID",
                  value: ownerEmail,
                  hide: !(ownerEmail && ownerEmail !== "NA"),
                },
                {
                  title: "PT_OWNERSHIP_INFO_CORR_ADDR",
                  value: ownerAddr,
                  hide: !ownerAddr,
                },
              ],
            };
          }),
          documents: [
            {
              title: "PT_COMMON_DOCS",
              values: response?.documents
                // ?.filter((e) => e.status === "ACTIVE")
                ?.map((document) => {
                  return {
                    title: `PT_${document?.documentType.replace(".", "_")}`,
                    documentType: document?.documentType,
                    documentUid: document?.documentUid,
                    fileStoreId: document?.fileStoreId,
                    status: document.status,
                  };
                }),
            },
          ],
        },
      },
    ];
  },
  applicationDetails: async (t, tenantId, propertyIds, userType, args) => {
    // Dash-format Acknowledgement IDs: "PG-PT-2024-01-000001" or "PG-AC-2026-06-02-000182"
    // No-dash Acknowledgement IDs: "PTCTYCTA0506260242" (pending properties with no propertyId yet)
    // Property IDs: "PG-PT-1013-000103", "CGBASJDP0000227" (no dashes but different pattern)
    const isDashAcknowledgementId = /^[A-Z]{2}-[A-Z]+-\d{4}-\d{2}(-\d{2})?-\d+$/.test(propertyIds);

    let response = null;

    if (isDashAcknowledgementId) {
      // Definitely an acknowledgement ID (dash format)
      response = await PTSearch.application(tenantId, { acknowledgementIds: propertyIds, ...args });
    } else {
      // Try as propertyId first
      response = await PTSearch.application(tenantId, { propertyIds, ...args });
      // If not found, it may be a no-dash acknowledgement number (e.g. pending property PTCTYCTA0506260242)
      if (!response) {
        response = await PTSearch.application(tenantId, { acknowledgementIds: propertyIds, ...args });
      }
    }

    if (!response) {
      throw new Error(`No property found for id: ${propertyIds}`);
    }

    return {
      tenantId: response.tenantId,
      applicationDetails: PTSearch.transformPropertyToApplicationDetails({ property: response, t }),
      additionalDetails: response?.additionalDetails,
      applicationData: response,
      transformToAppDetailsForEmployee: PTSearch.transformPropertyToApplicationDetails,
    };
  },
};
