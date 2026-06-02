// import React from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { newConfig } from "../../../config/Create/config";

import { checkArrayLength, stringReplaceAll,getSuperBuiltUpareafromob } from "../../../utils";

const getPropertyEditDetails = (inputData = {}) => {
  let data = JSON.parse(JSON.stringify(inputData));
  console.log("datadatagetPropertyEditDetails22222333",data)
  // converting owners details
  const getDocumentTypeCode = (documentType) => {
    if (typeof documentType === "string") return documentType;
    if (typeof documentType === "object") return documentType?.code;
    return "";
  };
  
  if((data?.propertyType === "BUILTUP.INDEPENDENTPROPERTY" && data.units.length == 0))
    {
      console.log("runnnnnssssss")
      data.units = [{
        constructionDetail:{builtUpArea: data?.superBuiltUpArea},
        floorNo: 0,
        occupancyType:data?.occupancyType,
        unitType:data?.occupancyType,
        usageCategory:data?.usageCategory,
      }]
    }

  if (data?.ownershipCategory === "INSTITUTIONALPRIVATE" || data?.ownershipCategory === "INSTITUTIONALGOVERNMENT") {
    let document = [];
    if (data?.owners[0]?.documents[0]?.documentType?.includes("IDENTITYPROOF")) {
      data.owners[0].documents[0].documentType = {
        code: data?.owners[0]?.documents[0]?.documentType,
        i18nKey: stringReplaceAll(data?.owners[0]?.documents[0]?.documentType, ".", "_"),
      };
      document["proofIdentity"] = data?.owners[0]?.documents[0];
    }
    (data.owners[0].designation = data?.institution?.designation),
      (data.owners[0].inistitutionName = data?.institution?.name),
      (data.owners[0].name = data?.institution?.nameOfAuthorizedPerson),
      (data.owners[0].inistitutetype = { value: data?.institution.type, code: data?.institution.type }),
      (data.owners[0].documents = document);
    data.owners[0].permanentAddress = data?.owners[0]?.correspondenceAddress;
    data.owners[0].isCorrespondenceAddress = data?.owners[0]?.isCorrespondenceAddress;
  } else {
    data.owners.map((owner, idx) => {
      let document = {};

      console.log(`[EditProperty] owner[${idx}].documents (owner-level):`, owner.documents);
      console.log(`[EditProperty] data.documents (property-level):`, data.documents);

      // 1. Try owner-level documents array (populated on edit/update)
      if (Array.isArray(owner.documents)) {
        owner.documents.forEach((doc) => {
          const dt = typeof doc?.documentType === "string" ? doc.documentType : doc?.documentType?.code || "";
          if (dt.includes("SPECIALCATEGORYPROOF")) {
            document["specialProofIdentity"] = { ...doc, documentType: { code: dt, i18nKey: stringReplaceAll(dt, ".", "_") } };
          }
          if (dt.includes("IDENTITYPROOF")) {
            document["proofIdentity"] = { ...doc, documentType: { code: dt, i18nKey: stringReplaceAll(dt, ".", "_") } };
          }
        });
      }

      // 2. Fallback: property-level documents array (populated on create)
      if (!document["proofIdentity"] || !document["specialProofIdentity"]) {
        const propDocs = Array.isArray(data.documents) ? data.documents : [];
        propDocs.forEach((doc) => {
          const dt = typeof doc?.documentType === "string" ? doc.documentType : doc?.documentType?.code || "";
          if (dt.includes("SPECIALCATEGORYPROOF") && !document["specialProofIdentity"]) {
            document["specialProofIdentity"] = { ...doc, documentType: { code: dt, i18nKey: stringReplaceAll(dt, ".", "_") } };
          }
          if (dt.includes("IDENTITYPROOF") && !document["proofIdentity"]) {
            document["proofIdentity"] = { ...doc, documentType: { code: dt, i18nKey: stringReplaceAll(dt, ".", "_") } };
          }
        });
      }

      owner.emailId = owner?.emailId;
      owner.fatherOrHusbandName = owner?.fatherOrHusbandName;
      owner.isCorrespondenceAddress = (owner?.isCorrespondenceAddress != null)
        ? owner.isCorrespondenceAddress
        : (data?.additionalDetails?.owners?.[idx]?.isCorrespondenceAddress != null
            ? data.additionalDetails.owners[idx].isCorrespondenceAddress
            : false);
      owner.mobileNumber = owner?.mobileNumber;
      owner.name = owner?.name;
      owner.permanentAddress = owner?.permanentAddress || data?.additionalDetails?.owners?.[idx]?.permanentAddress;
      owner.gender = { code: owner?.gender };
      owner.ownerType = { code: owner?.ownerType };
      owner.relationship = { code: owner?.relationship };
      owner.documents = document;
    });
  }
  //converting ownershipCategory
  data.ownershipCategory = { code: data?.ownershipCategory, value: data?.ownershipCategory };

  //converting address details
  if (data?.address?.geoLocation?.latitude && data?.address?.geoLocation?.longitude) {
    data.address.geoLocation = {
      latitude: data?.address?.geoLocation?.latitude,
      longitude: data?.address?.geoLocation?.longitude,
    };
  } else {
    data.address.geoLocation = { };
  }
  data.address.pincode = data?.address?.pincode;
  data.address.city = { code: data?.tenantId, i18nKey: `TENANT_TENANTS_${stringReplaceAll(data?.tenantId.toUpperCase(),".","_")}` };
  data.address.locality.i18nkey = data?.tenantId.replace(".", "_").toUpperCase() + "_" + "REVENUE" + "_" + data?.address?.locality?.code;
  let addressDocs = data?.documents?.filter((doc) =>
  getDocumentTypeCode(doc?.documentType)?.includes("ADDRESSPROOF")
);

  if (checkArrayLength(addressDocs)) {
    console.log("addressDocsaddressDocs",addressDocs)
    addressDocs[0].documentType = { code: addressDocs[0]?.documentType, i18nKey: stringReplaceAll(addressDocs[0]?.documentType, ".", "_") };
  }
  if(!data.documents)
  {
    data = {...data,documents:[]}
  }
  if (data?.address?.documents) {
    data.address.documents["ProofOfAddress"] = addressDocs[0];
  } else {
    data.address.documents = {};
    data.address.documents["ProofOfAddress"] = addressDocs && Array.isArray(addressDocs) && addressDocs.length > 0 && addressDocs[0];
  }
  data.documents["ProofOfAddress"] = addressDocs && Array.isArray(addressDocs) && addressDocs.length > 0 && addressDocs[0];

  const getunitobjectforInd = (data, ob, flrno, extraunits, unitedit) => {
    let totbuiltarea = 0;
    let selfoccupiedtf = false,
      rentedtf = false,
      unoccupiedtf = false;
    ob["plotSize"] = `${data?.landArea}`;
    data?.units &&
      data?.units.map((unit1, index) => {
        //to remove multiple units
        if (
          unit1?.floorNo == flrno &&
          ((unit1?.occupancyType === "RENTED" && rentedtf == true) ||
            (unit1?.occupancyType === "UNOCCUPIED" && unoccupiedtf == true) ||
            (unit1?.occupancyType === "SELFOCCUPIED" && selfoccupiedtf == true) ||
            flrno > unitedit.length)
        ) {
          if (!extraunits.includes(unit1)) {
            extraunits.push(unit1);
          }
        } else if (unit1?.floorNo == flrno && unit1?.occupancyType === "RENTED") {
          rentedtf = true;
          ob["AnnualRent"] = `${unit1.arv}` || "";
          ob["RentArea"] = `${unit1?.constructionDetail?.builtUpArea}`;
          ob["SubUsageTypeOfRentedArea"] = {
            i18nKey: `COMMON_PROPSUBUSGTYPE_${(
              unit1.usageCategory.split(".")[0] +
              `_${unit1.usageCategory.split(".")[1]}` +
              `_${unit1.usageCategory.split(".").pop()}`
            ).replaceAll(".", "_")}`,

            Subusagetypeofrentedareacode: unit1.usageCategory,
          };
          totbuiltarea = totbuiltarea + parseInt(unit1?.constructionDetail?.builtUpArea);
        } else if (unit1?.floorNo == flrno && unit1?.occupancyType === "UNOCCUPIED") {
          unoccupiedtf = true;
          ob["UnOccupiedArea"] = `${unit1?.constructionDetail?.builtUpArea}`;
          totbuiltarea = totbuiltarea + parseInt(unit1?.constructionDetail?.builtUpArea);
        } else if (unit1?.floorNo == flrno && unit1?.occupancyType === "SELFOCCUPIED") {
          selfoccupiedtf = true;
          ob["floorarea"] = `${unit1?.constructionDetail?.builtUpArea}`;
          ob["SubUsageType"] = {
            i18nKey: `COMMON_PROPSUBUSGTYPE_${(
              unit1.usageCategory.split(".")[0] +
              `_${unit1.usageCategory.split(".")[1]}` +
              `_${unit1.usageCategory.split(".").pop()}`
            ).replaceAll(".", "_")}`,
          };
          totbuiltarea = totbuiltarea + parseInt(unit1?.constructionDetail?.builtUpArea);
        }
      });
    if (unoccupiedtf == true && rentedtf == false && selfoccupiedtf == false) {
      ob["selfOccupied"] = "";
    } else {
      ob["selfOccupied"] =
        rentedtf == true
          ? selfoccupiedtf == true
            ? { i18nKey: "PT_PARTIALLY_RENTED_OUT", code: "RENTED" }
            : {
              i18nKey: "PT_FULLY_RENTED_OUT",
              code: "RENTED",
            }
          : {
            i18nKey: "PT_YES_IT_IS_SELFOCCUPIED",
            code: "SELFOCCUPIED",
          };
    }
    ob["IsAnyPartOfThisFloorUnOccupied"] =
      unoccupiedtf == true ? { i18nKey: "PT_COMMON_YES", code: "UNOCCUPIED" } : { i18nKey: "PT_COMMON_NO", code: "UNOCCUPIED" };
    ob["builtUpArea"] = `${totbuiltarea}`;

    return ob;
  };
  // asessment details
  if (data?.channel === "CFC_COUNTER" || (data?.PropertyType === "BUILTUP.INDEPENDENTPROPERTY" && data.units.length == 0) || (data?.additionalDetails?.isRainwaterHarvesting == false)) {
    if (data?.propertyType === "VACANT") {
      data.PropertyType = { code: data?.propertyType, i18nKey: `COMMON_PROPTYPE_${data.propertyType}` };
      data.isResdential =
        data?.usageCategory === "RESIDENTIAL"
          ? { code: "RESIDENTIAL", i18nKey: "PT_COMMON_YES" }
          : { code: "NONRESIDENTIAL", i18nKey: "PT_COMMON_NO" };
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      data.landarea = { floorarea: data?.landArea };
      data.landArea = { floorarea: data?.landArea };
    } else if (data?.propertyType === "BUILTUP.SHAREDPROPERTY") {
      let extraunitsFPB = [];
      let selfoccupiedtf = false,
        rentedtf = false,
        unoccupiedtf = false;
      data.isResdential =
        data?.usageCategory === "RESIDENTIAL"
          ? { code: "RESIDENTIAL", i18nKey: "PT_COMMON_YES" }
          : { code: "NONRESIDENTIAL", i18nKey: "PT_COMMON_NO" };
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      data.PropertyType = { code: data?.propertyType, i18nKey: `COMMON_PROPTYPE_BUILTUP_${data.propertyType.split(".").pop()}` };
      data.Floorno =
        data?.units[0]?.floorNo < 0
          ? { i18nKey: `PROPERTYTAX_FLOOR__${data?.units[0]?.floorNo * -1}` }
          : { i18nKey: `PROPERTYTAX_FLOOR_${data?.units[0]?.floorNo}` };
      data.Subusagetypeofrentedarea = {
        SubUsageTypeOfRentedArea: {
          i18nKey: `COMMON_PROPSUBUSGTYPE_${data?.units[0]?.usageCategory
            .slice(0, data?.units[0]?.usageCategory.lastIndexOf("."))
            .replaceAll(".", "_")}`,
        },
        Subusagetypeofrentedareacode: data?.units[0]?.usageCategory,
      };
      /* data.subusagetype = {
        SubUsageType: {
          i18nKey: `COMMON_PROPSUBUSGTYPE_${data?.units[0]?.usageCategory
            .slice(0, data?.units[0]?.usageCategory.lastIndexOf("."))
            .replaceAll(".", "_")}`,
        },
      }; */
      data?.units &&
        data?.units.map((unit, index) => {
          if (
            (unit?.occupancyType === "RENTED" && rentedtf == true && unit.floorNo == data?.units[0].floorNo) ||
            (unit?.occupancyType === "UNOCCUPIED" && unoccupiedtf == true && unit.floorNo == data?.units[0].floorNo) ||
            (unit?.occupancyType === "SELFOCCUPIED" && selfoccupiedtf == true && unit.floorNo == data?.units[0].floorNo)
          ) {
            if (!extraunitsFPB.includes(unit)) {
              extraunitsFPB.push(unit);
            }
          } else if (unit?.occupancyType === "RENTED" && unit.floorNo == data?.units[0].floorNo) {
            rentedtf = true;
            data.Constructiondetails = { RentArea: unit?.constructionDetail?.builtUpArea, AnnualRent: unit?.arv };
            data.Subusagetypeofrentedarea = {
              SubUsageTypeOfRentedArea: {
                i18nKey: `COMMON_PROPSUBUSGTYPE_${unit?.usageCategory.slice(0, unit?.usageCategory.lastIndexOf(".")).replaceAll(".", "_")}`,
              },
              Subusagetypeofrentedareacode: unit?.usageCategory,
            };
          } else if (unit?.occupancyType === "UNOCCUPIED" && unit.floorNo == data?.units[0].floorNo) {
            unoccupiedtf = true;
            data.UnOccupiedArea = { UnOccupiedArea: unit?.constructionDetail?.builtUpArea };
          } else if (unit?.occupancyType === "SELFOCCUPIED" && unit.floorNo == data?.units[0].floorNo) {
            selfoccupiedtf = true;
            data.landarea = { floorarea: unit?.constructionDetail?.builtUpArea };
            data.subusagetype = {
              SubUsageType: {
                i18nKey: `COMMON_PROPSUBUSGTYPE_${unit?.usageCategory.slice(0, unit?.usageCategory.lastIndexOf(".")).replaceAll(".", "_")}`,
              },
            };
          } else {
            if (!extraunitsFPB.includes(unit)) {
              extraunitsFPB.push(unit);
            }
          }
        });
      data.selfOccupied =
        rentedtf == true
          ? selfoccupiedtf == true
            ? { i18nKey: "PT_PARTIALLY_RENTED_OUT", code: "RENTED" }
            : {
              i18nKey: "PT_FULLY_RENTED_OUT",
              code: "RENTED",
            }
          : {
            i18nKey: "PT_YES_IT_IS_SELFOCCUPIED",
            code: "SELFOCCUPIED",
          };
      data.IsAnyPartOfThisFloorUnOccupied =
        unoccupiedtf == true ? { i18nKey: "PT_COMMON_YES", code: "UNOCCUPIED" } : { i18nKey: "PT_COMMON_NO", code: "UNOCCUPIED" };
      data.floordetails = { plotSize: data?.landArea, builtUpArea: getSuperBuiltUpareafromob(data) };
      data["extraunitFPB"] = extraunitsFPB;
      data.propertyStructureDetails = {
        usageCategory: "",
        structureType: data?.additionalDetails?.structureType,
        ageOfProperty: data?.additionalDetails?.ageOfProperty,
      };
    } else if (data?.propertyType === "BUILTUP.INDEPENDENTPROPERTY") {
      let nooffloor = 0,
        noofbasemement = 0;
      let floornumbers = [];
      data.landArea = {floorarea:data?.landArea}
      data.isResdential =
        data?.usageCategory === "RESIDENTIAL"
          ? { code: "RESIDENTIAL", i18nKey: "PT_COMMON_YES" }
          : { code: "NONRESIDENTIAL", i18nKey: "PT_COMMON_NO" };
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      data.PropertyType = { code: data?.propertyType, i18nKey: `COMMON_PROPTYPE_BUILTUP_${data.propertyType.split(".").pop()}` };
      /* data?.units &&
        data?.units.map((unit, index) => {
          //to remove the condition when only unoccupied unit is there
          if (!unit?.occupancyType.includes("UNOCCUPIED")) {
            floornumbers.push(unit.floorNo);
          }

        });
      data.noOfFloors = floornumbers.includes(2)
        ? { i18nKey: "PT_GROUND_PLUS_TWO_OPTION", code: 2 }
        : floornumbers.includes(1)
        ? { i18nKey: "PT_GROUND_PLUS_ONE_OPTION", code: 1 }
        : { i18nKey: "PT_GROUND_FLOOR_OPTION", code: 0 };
      data.noOofBasements = floornumbers.includes(-2)
        ? { i18nKey: "PT_TWO_BASEMENT_OPTION" }
        : floornumbers.includes(-1)
        ? { i18nKey: "PT_ONE_BASEMENT_OPTION" }
        : { i18nKey: "PT_NO_BASEMENT_OPTION" }; */
      let unitedit = [];
      let ob = { };
      let flooradded = [];
      let flrno;
      let extraunits = [];
      let totbuiltarea = 0;

      data.units &&
        data.units.sort((x, y) => {
          let a = x.floorNo,
            b = y.floorNo;
          if (x.floorNo < 0) {
            a = x.floorNo * -20;
          }
          if (y.floorNo < 0) {
            b = y.floorNo * -20;
          }
          if (a > b) {
            return 1;
          } else {
            return -1;
          }
        });

      data?.units &&
        data?.units.map((unit, index) => {
          ob = { };
          totbuiltarea = 0;
          let selfoccupiedtf = false,
            rentedtf = false,
            unoccupiedtf = false;
          if (unit.floorNo == 0 || unit.floorNo == 1 || unit.floorNo == 2 || unit.floorNo == -1 || unit.floorNo == -2) {
            flrno = unit.floorNo;
            ob = getunitobjectforInd(data, ob, flrno, extraunits, unitedit);
            if (ob.selfOccupied == "") {
              extraunits.push(unit);
            }
          } else {
            extraunits.push(unit);
          }
          if (ob == { }) {
            extraunits.push(unit);
          }
          (!flooradded.includes(unit.floorNo) && ob.builtUpArea > 0 && unit.floorNo > -1 && unit.floorNo < 3 && ob.selfOccupied !== "" && ob != { })&&unitedit.push(ob)
            
          unit.floorNo == -1 && ob != { } && ob.selfOccupied !== "" && ob.builtUpArea > 0 &&(unitedit["-1"] = ob) ;
          if (unitedit["-1"] && unit.floorNo == -2 && !extraunits.includes(unit)) {
            unit.floorNo == -2 && ob != { } && ob.selfOccupied !== "" && ob.builtUpArea > 0 && (unitedit["-2"] = ob) ;
          } else if (!unitedit["-1"] && unit.floorNo == -2 && !extraunits.includes(unit)) {
            extraunits.push(unit);
          }
          flooradded.push(flrno);
        });

      data.noOfFloors =
        unitedit.length == 3
          ? { i18nKey: "PT_GROUND_PLUS_TWO_OPTION", code: 2 }
          : unitedit.length == 2
            ? { i18nKey: "PT_GROUND_PLUS_ONE_OPTION", code: 1 }
            : { i18nKey: "PT_GROUND_FLOOR_OPTION", code: 0 };
      data.noOofBasements = unitedit["-2"]
        ? { i18nKey: "PT_TWO_BASEMENT_OPTION", code:2 }
        : unitedit["-1"]
          ? { i18nKey: "PT_ONE_BASEMENT_OPTION",code:1 }
          : { i18nKey: "PT_NO_BASEMENT_OPTION",code:0 };

      data.units = data?.units.map(ob => {
        return{...ob, unitType:{
          code: ob?.usageCategory === "RESIDENTIAL" ? ob?.usageCategory : ob?.usageCategory?.split(".")[3],
          i18nKey: ob?.usageCategory === "RESIDENTIAL" ? `PROPERTYTAX_BILLING_SLAB_${ob?.usageCategory}` : `PROPERTYTAX_BILLING_SLAB_${ob?.usageCategory?.split(".")[3]}`,
          usageCategoryMinor: ob?.usageCategory === "RESIDENTIAL" ? "" : ob?.usageCategory?.split(".")[1],
          usageCategorySubMinor: ob?.usageCategory === "RESIDENTIAL" ? "" : ob?.usageCategory?.split(".")[2],
        }
      }});
      //data.units = data?.units.concat(extraunits);
      //unitedit["-1"] ? (data.units["-1"] = unitedit["-1"]) : "";
      //unitedit["-2"] ? (data.units["-2"] = unitedit["-2"]) : "";
    }
  } else {
    if (data?.additionalDetails?.propertyType?.code === "VACANT" || data?.propertyType?.code === "VACANT") {
      data.PropertyType = data?.additionalDetails?.propertyType;
      data.isResdential = data?.additionalDetails?.isResdential;
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      const _vacantLandArea = data?.landArea;
      data.landarea = { floorarea: _vacantLandArea };
      data.landArea = { floorarea: _vacantLandArea };
      data.propertyStructureDetails = {
        usageCategory: "",
        structureType: data?.additionalDetails?.structureType,
        ageOfProperty: data?.additionalDetails?.ageOfProperty,
      };
    } else if (data?.additionalDetails?.propertyType?.code === "BUILTUP.SHAREDPROPERTY" || data?.propertyType?.code === "BUILTUP.SHAREDPROPERTY") {
      data.isResdential = data?.additionalDetails?.isResdential;
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      data.PropertyType = data?.additionalDetails?.propertyType;
      data.Floorno =
        data?.units[0]?.floorNo < 0
          ? { i18nKey: `PROPERTYTAX_FLOOR__${data?.units[0]?.floorNo * -1}` }
          : { i18nKey: `PROPERTYTAX_FLOOR_${data?.units[0]?.floorNo}` };
      data.selfOccupied = data?.additionalDetails?.selfOccupied;
      data.Subusagetypeofrentedarea = data?.additionalDetails?.Subusagetypeofrentedarea;
      data.subusagetype = data?.additionalDetails?.subusagetype;
      data.IsAnyPartOfThisFloorUnOccupied = data?.additionalDetails?.IsAnyPartOfThisFloorUnOccupied;
      data?.units &&
        data?.units.map((unit, index) => {
          if (unit?.occupancyType === "RENTED") {
            data.Constructiondetails = { RentArea: unit?.constructionDetail?.builtUpArea, AnnualRent: unit?.arv };
          } else if (unit?.occupancyType === "UNOCCUPIED") {
            data.UnOccupiedArea = { UnOccupiedArea: unit?.constructionDetail?.builtUpArea };
          } else if (unit?.occupancyType === "SELFOCCUPIED") {
            data.landarea = { floorarea: unit?.constructionDetail?.builtUpArea };
          }
        });
      // Always use Properties[0].landArea for Area (sq ft)* field
      // PTLandArea reads formData.landArea?.floorarea (capital A); also set landarea (lowercase) for utils
      const _landAreaVal = data?.landArea;
      data.landarea = { floorarea: _landAreaVal };
      data.landArea = { floorarea: _landAreaVal };
      data.floordetails = { plotSize: _landAreaVal, builtUpArea: data?.additionalDetails?.builtUpArea || data?.superBuiltUpArea || data?.units?.reduce((acc, u) => acc + (parseFloat(u?.constructionDetail?.builtUpArea) || 0), 0) };
      // Prefill structureType and ageOfProperty so PropertyStructureDetails reads them on first render
      data.propertyStructureDetails = {
        usageCategory: "",
        structureType: data?.additionalDetails?.structureType,
        ageOfProperty: data?.additionalDetails?.ageOfProperty,
      };
    } else if (data?.additionalDetails?.propertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" || data?.propertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" || data?.propertyType === "BUILTUP.INDEPENDENTPROPERTY") {
      data.isResdential = data?.additionalDetails?.isResdential;
      data.usageCategoryMajor = { code: data?.usageCategory, i18nKey: `PROPERTYTAX_BILLING_SLAB_${data?.usageCategory?.split(".").pop()}` };
      data.PropertyType = data?.additionalDetails?.propertyType || data?.propertyType;
      data.noOfFloors = data?.additionalDetails?.noOfFloors || data?.noOfFloors;
      data.noOofBasements = data?.additionalDetails?.noOofBasements;
      data.units = data?.additionalDetails?.unit;
     // data.units[0].selfOccupied = data?.additionalDetails?.unit[0]?.selfOccupied;
      // data.units["-1"] = data?.additionalDetails?.basement1 || "";
      // data.units["-2"] = data?.additionalDetails?.basement2 || "";
      data.landArea = { floorarea: data?.landArea };
      data.landarea = { floorarea: data?.landArea };
      data.propertyStructureDetails = {
        usageCategory: "",
        structureType: data?.additionalDetails?.structureType,
        ageOfProperty: data?.additionalDetails?.ageOfProperty,
      };
    }
  }
  return data;
};
const EditProperty = ({ parentRoute }) => {
  const queryClient = useQueryClient();
  const match = useRouteMatch();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();
  let config = [];
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("PT_CREATE_PROPERTY", { });
  const isParamsInitialized = React.useRef(false);
  const stateId = Digit.ULBService.getStateId();
  let { data: commonFields, isLoading } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "CommonFieldsConfig");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const acknowledgementIds = window.location.href.split("/").pop();
  //const propertyIds = window.location.href.split("/").pop();
  let application = { };
  const updateProperty = window.location.href.includes("edit-application");
  const typeOfProperty = window.location.href.includes("UPDATE") ? true : false;
  const ptProperty = JSON.parse(sessionStorage.getItem("pt-property")) || { };
  const propertyIds = ptProperty.propertyId;
  console.log("propertyIdspropertyIds",propertyIds,acknowledgementIds,ptProperty)
  //const data = { Properties: [ptProperty] };
  const { isLoading: isPTloading, isError, error, data } =
  Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds, isSearchInternal: true },
      searchedFrom: "myPropertyCitizen",
    },
    {
      enabled: true,
    }
  );

console.log("property search data", data);

  console.log("datadatadatadatadatadatadatadatadata",data)
  sessionStorage.setItem("isEditApplication", false);

  useEffect(() => {
    if (!data?.Properties?.length) return;
    if (isParamsInitialized.current) return; // prevent overwriting user edits on re-fetch
    isParamsInitialized.current = true;
  
    const clonedProperty = JSON.parse(JSON.stringify(data.Properties[0]));
  
    clonedProperty.isUpdateProperty = updateProperty;
    clonedProperty.isEditProperty = !updateProperty;
  
    sessionStorage.setItem(
      "propertyInitialObject",
      JSON.stringify(clonedProperty)
    );
  
    const propertyEditDetails = getPropertyEditDetails(clonedProperty);
    console.log("clonedProperty",clonedProperty,propertyEditDetails)
    propertyEditDetails.units =clonedProperty.units
    // Set sessionStorage routing keys so wizard routes correctly (e.g. uid → area for VACANT)
    if (propertyEditDetails.PropertyType?.i18nKey) {
      sessionStorage.setItem("PropertyType", propertyEditDetails.PropertyType.i18nKey);
    }
    setParams((prev) => ({ ...prev, ...propertyEditDetails }));
  }, [data, updateProperty]);
  

  const goNext = (skipStep, index, isAddMultiple, key) => {
    let currentPath = pathname.split("/").pop(),
      lastchar = currentPath.charAt(currentPath.length - 1),
      isMultiple = false,
      nextPage;
    if (Number(parseInt(currentPath)) || currentPath == "0" || currentPath == "-1") {
      if (currentPath == "-1" || currentPath == "-2") {
        currentPath = pathname.slice(0, -3);
        currentPath = currentPath.split("/").pop();
        isMultiple = true;
      } else {
        currentPath = pathname.slice(0, -2);
        currentPath = currentPath.split("/").pop();
        isMultiple = true;
      }
    } else {
      isMultiple = false;
    }
    if (!isNaN(lastchar)) {
      isMultiple = true;
    }
    let { nextStep = { } } = config.find((routeObj) => routeObj.route === currentPath);
    if (typeof nextStep == "object" && nextStep != null && isMultiple != false) {
      if (nextStep[sessionStorage.getItem("ownershipCategory")]) {
        nextStep = `${nextStep[sessionStorage.getItem("ownershipCategory")]}/${index}`;
      } else if (nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")]) {
        if (`${nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")]}` === "un-occupied-area") {
          nextStep = `${nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")]}/${index}`;
        } else {
          nextStep = `${nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")]}`;
        }
      } else if (nextStep[sessionStorage.getItem("subusagetypevar")]) {
        nextStep = `${nextStep[sessionStorage.getItem("subusagetypevar")]}/${index}`;
      } else if (nextStep[sessionStorage.getItem("area")]) {
        // nextStep = `${nextStep[sessionStorage.getItem("area")]}/${index}`;

        if (`${nextStep[sessionStorage.getItem("area")]}` !== "map") {
          nextStep = `${nextStep[sessionStorage.getItem("area")]}/${index}`;
        } else {
          nextStep = `${nextStep[sessionStorage.getItem("area")]}`;
        }
      } else if (nextStep[sessionStorage.getItem("IsThisFloorSelfOccupied")]) {
        nextStep = `${nextStep[sessionStorage.getItem("IsThisFloorSelfOccupied")]}/${index}`;
      } else {
        nextStep = `${nextStep[sessionStorage.getItem("noOofBasements")]}/${index}`;
        //nextStep = `${"floordetails"}/${index}`;
      }
    }
    if (typeof nextStep == "object" && nextStep != null && isMultiple == false) {
      if (
        nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")] &&
        (nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")] == "map" ||
          nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")] == "un-occupied-area")
      ) {
        nextStep = `${nextStep[sessionStorage.getItem("IsAnyPartOfThisFloorUnOccupied")]}`;
      } else if (nextStep[sessionStorage.getItem("subusagetypevar")]) {
        nextStep = `${nextStep[sessionStorage.getItem("subusagetypevar")]}`;
      } else if (nextStep[sessionStorage.getItem("area")]) {
        nextStep = `${nextStep[sessionStorage.getItem("area")]}`;
      } else if (nextStep[sessionStorage.getItem("IsThisFloorSelfOccupied")]) {
        nextStep = `${nextStep[sessionStorage.getItem("IsThisFloorSelfOccupied")]}`;
      } else if (nextStep[sessionStorage.getItem("PropertyType")]) {
        nextStep = `${nextStep[sessionStorage.getItem("PropertyType")]}`;
      } else if (nextStep[sessionStorage.getItem("isResdential")]) {
        nextStep = `${nextStep[sessionStorage.getItem("isResdential")]}`;
      }
    }
    /* if (nextStep === "is-this-floor-self-occupied") {
      isMultiple = false;
    } */
    let redirectWithHistory = history.push;
    if (skipStep) {
      redirectWithHistory = history.replace;
    }
    if (isAddMultiple) {
      nextStep = key;
    }
    if (nextStep === null) {
      return redirectWithHistory(`${match.path}/check`);
    }
    if (!isNaN(nextStep.split("/").pop())) {
      nextPage = `${match.path}/${nextStep}`;
    } else {
      nextPage = isMultiple && nextStep !== "map" ? `${match.path}/${nextStep}/${index}` : `${match.path}/${nextStep}`;
    }

    redirectWithHistory(nextPage);
  };

  const createProperty = async () => {
    history.push(`${match.path}/acknowledgement`);
  };

  function handleSelect(key, data, skipStep, index, isAddMultiple = false) {
    console.log("[handleSelect] key:", key, "data:", data);
    if (key === "owners") {
      let owners = params.owners || [];
      owners[index] = data;
      setParams({ ...params, ...{ [key]: [...owners] } });
    } else if (key === "units") {
      // let units = params.units || [];
      // units[index] = data;
      // setParams({ ...params, units });
      setParams({ ...params, ...{ [key]: [...data] } });
    } else {
      let newParams = { ...params, [key]: { ...params[key], ...data } };
      // Keep landarea (lowercase) and landArea (uppercase) in sync — Area.js saves "landarea" but CheckPage reads "landArea"
      if (key === "landarea") {
        newParams.landArea = { ...params.landArea, ...data };
      } else if (key === "landArea") {
        newParams.landarea = { ...params.landarea, ...data };
      }
      // PTAllPropertyDetails saves everything nested under "allPropertyDetails" but CheckPage reads top-level keys
      if (key === "allPropertyDetails") {
        if (data.landArea) {
          newParams.landArea = data.landArea;
          newParams.landarea = data.landArea;
        }
        if (data.address) newParams.address = { ...params.address, ...data.address };
        if (data.PropertyType) newParams.PropertyType = data.PropertyType;
        if (data.isResdential) newParams.isResdential = data.isResdential;
        if (data.usageCategoryMajor) newParams.usageCategoryMajor = data.usageCategoryMajor;
        if (data.electricity) newParams.electricity = data.electricity;
        if (data.propertyStructureDetails) newParams.propertyStructureDetails = data.propertyStructureDetails;
        if (data.units !== undefined) newParams.units = data.units;
      }
      setParams(newParams);
    }
    goNext(skipStep, index, isAddMultiple, key);
  }

  const handleSkip = () => { };
  const handleMultiple = () => { };

  const onSuccess = () => {
    clearParams();
    isParamsInitialized.current = false;
    queryClient.invalidateQueries("PT_CREATE_PROPERTY");
    sessionStorage.setItem("propertyInitialObject", JSON.stringify({ }));
    sessionStorage.setItem("pt-property", JSON.stringify({ }));
  };


  if (isLoading || isPTloading) {
    return <Loader />;
  }

  /* use newConfig instead of commonFields for local development in case needed */
  commonFields=newConfig;
  commonFields.forEach((obj) => {
    config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
  });
  // In edit mode, after updating VACANT area send user straight to check page
  config = config.map((routeObj) => routeObj.route === "area" ? { ...routeObj, nextStep: null } : routeObj);
  config.indexRoute = `info`;
  const  CheckPage = Digit?.ComponentRegistryService?.getComponent('PTCheckPage');
  const PTAcknowledgement = Digit?.ComponentRegistryService?.getComponent('PTAcknowledgement');

  return (
    <Switch>
      {config.map((routeObj, index) => {
        const { component, texts, inputs, key } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;
        return (
          <Route path={`${match.path}/${routeObj.route}`} key={index}>
            <Component config={{ texts, inputs, key }} onSelect={handleSelect} onSkip={handleSkip} t={t} formData={params} onAdd={handleMultiple} />
          </Route>
        );
      })}
      <Route path={`${match.path}/check`}>
        <CheckPage onSubmit={createProperty} value={params} />
      </Route>
      <Route path={`${match.path}/acknowledgement`}>
        <PTAcknowledgement data={params} onSuccess={onSuccess} />
      </Route>
      <Route>
        <Redirect to={`${match.path}/${config.indexRoute}`} />
      </Route>
    </Switch>
  );
};

export default EditProperty;
