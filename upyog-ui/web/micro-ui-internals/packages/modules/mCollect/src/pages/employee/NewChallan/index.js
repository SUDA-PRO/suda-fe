import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Toast, Header, Loader } from "@upyog/digit-ui-react-components";
import { newConfig as newConfigMcollect } from "../../../config/config";
import { useHistory, useRouteMatch } from "react-router-dom";
import { stringReplaceAll } from "../../../utils";
//import { convertDateToEpoch } from "../../../utils";

const getformDataforEdit = (ChallanData,fetchBillData) => {
  let defaultval = {
    ConsumerName: ChallanData[0].citizen.name,
    mobileNumber: ChallanData[0].citizen.mobileNumber,
    emailId: ChallanData[0].citizen.emailId,
    doorNo: ChallanData[0].address.doorNo,
    building: ChallanData[0].address.buildingName,
    streetName: ChallanData[0].address.street,
    pincode: ChallanData[0].address.pincode || "143001",
    mohalla: {...ChallanData[0].address.locality, i18nkey:`${stringReplaceAll(ChallanData[0].tenantId,".","_").toUpperCase()}_ADMIN_${ChallanData[0]?.address?.locality?.code}`},
    category: {code:ChallanData[0].businessService, i18nkey:`BILLINGSERVICE_BUSINESSSERVICE_${ChallanData[0]?.businessService.split(".")[0].toUpperCase()}`},
    categoryType: {code:ChallanData[0].businessService, i18nkey:`BILLINGSERVICE_BUSINESSSERVICE_${stringReplaceAll(ChallanData[0].businessService,".","_").toUpperCase()}`},
    fromDate : ChallanData[0]
        ? new Date(ChallanData[0].taxPeriodFrom).getFullYear().toString() +
          "-" +
          `${(new Date(ChallanData[0].taxPeriodFrom).getMonth() + 1) < 10?"0":""}${(new Date(ChallanData[0].taxPeriodFrom).getMonth() + 1)}` +
          "-" +
          `${(new Date(ChallanData[0].taxPeriodFrom).getDate() < 10?"0":"")}${new Date(ChallanData[0].taxPeriodFrom).getDate()}`
        : null,
    toDate : ChallanData[0]
        ? new Date(ChallanData[0].taxPeriodTo).getFullYear().toString() +
          "-" +
          `${(new Date(ChallanData[0].taxPeriodTo).getMonth() + 1) < 10?"0":""}${(new Date(ChallanData[0].taxPeriodTo).getMonth() + 1)}` +
          "-" +
          `${(new Date(ChallanData[0].taxPeriodTo).getDate() < 10?"0":"")}${new Date(ChallanData[0].taxPeriodTo).getDate()}`
        : null
  };
  defaultval[`${ChallanData[0]?.businessService.split(".")[0]}`] = {};
  if (fetchBillData.Bill[0].billDetails[0].billAccountDetails.length > 0) {
    fetchBillData.Bill[0].billDetails[0].billAccountDetails.map(
      (ele) => ((defaultval[`${ChallanData[0]?.businessService.split(".")[0]}`])[`${ele.taxHeadCode.split(".")[1]}`] = `${ele.amount}`)
    );
  }
  sessionStorage.setItem("InitialTaxFeilds",JSON.stringify(defaultval[`${ChallanData[0]?.businessService.split(".")[0]}`]));
  return defaultval;

}


const NewChallan = ({ChallanData}) => {
  if (typeof window !== "undefined") {
    window.__MCOLLECT_NEWCHALLAN_SOURCE = "src/pages/employee/NewChallan/index.js";
  }
  const fieldLabelMap = {
    ConsumerName: "Consumer Name",
    mobileNumber: "Mobile Number",
    city: "City",
    mohalla: "Mohalla",
    category: "Service Category",
    categoryType: "Service Type",
    fromDate: "From Date",
    toDate: "To Date",
  };

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  let isEdit = false;
  if (url.includes("modify-challan")) {
    isEdit = true;
  }
  const [canSubmit, setSubmitValve] = useState(false);
  const defaultValues = {};
  const history = useHistory();
  // delete
  const [_formData, setFormData, _clear] = Digit.Hooks.useSessionStorage("store-data", null);
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", {});
  const [defaultUpdatedValue, setdefaultUpdatedValue] = useState(false)
  const isMobile = window.Digit.Utils.browser.isMobile();



  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig, isLoading } = Digit.Hooks.mcollect.useMcollectFormConfig.getFormConfig(stateId, {});
  let lastModTime = ChallanData ? ChallanData[0].auditDetails.lastModifiedTime : null;
  const { data: fetchBillData } = ChallanData
    ? Digit.Hooks.useFetchBillsForBuissnessService(
        {
          businessService: ChallanData[0].businessService,
          consumerCode: ChallanData[0].challanNo,
        },
        { lastModTime }
      )
    : {};

  useEffect(() => {
    if(isEdit && fetchBillData)
    {
      let formdata = getformDataforEdit(ChallanData, fetchBillData);
      setdefaultUpdatedValue(true)
      sessionStorage.setItem("mcollectEditObject", JSON.stringify({consomerDetails1:[{...formdata}]}))
    }
  },[isEdit,fetchBillData])

  const closeToast = () => {
    setShowToast(null);
    setError(null);
  };

  const isNonEmptyObject = (value) => {
    return !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
  };

  const getMissingMandatoryKeysFromPayload = (payload) => {
    const missing = [];

    if (!payload?.ConsumerName) missing.push("ConsumerName");
    if (!payload?.mobileNumber) missing.push("mobileNumber");
    if (!payload?.city?.code) missing.push("city");
    if (!payload?.mohalla?.code) missing.push("mohalla");
    if (!payload?.category?.code) missing.push("category");
    if (!payload?.categoryType?.code) missing.push("categoryType");
    if (!payload?.fromDate) missing.push("fromDate");
    if (!payload?.toDate) missing.push("toDate");

    return missing;
  };

  const getLikelyMissingFieldKeys = () => {
    const snapshot = JSON.parse(sessionStorage.getItem("mcollectFormData") || "{}");
    const missing = [];

    if (!snapshot?.ConsumerName) missing.push("ConsumerName");
    if (!snapshot?.mobileNumber) missing.push("mobileNumber");
    if (!snapshot?.mohalla?.code) missing.push("mohalla");
    if (!snapshot?.city?.code) missing.push("city");
    if (!snapshot?.category?.code) missing.push("category");
    if (!snapshot?.categoryType?.code) missing.push("categoryType");
    if (!snapshot?.fromDate) missing.push("fromDate");
    if (!snapshot?.toDate) missing.push("toDate");

    return missing;
  };

  const collectRequiredFieldKeys = (node, fallbackKey, bag = new Set()) => {
    if (!node || typeof node !== "object") return bag;

    if (node?.type === "required") {
      bag.add(node?.ref?.name || fallbackKey);
    }

    Object.entries(node).forEach(([key, value]) => {
      const nextFallback = key === "type" || key === "message" || key === "ref" ? fallbackKey : key;
      collectRequiredFieldKeys(value, nextFallback, bag);
    });

    return bag;
  };

  const onFormValidationError = (formErrors) => {
    sessionStorage.setItem("mcollectSubmitAttempted", "true");
    const requiredFromErrors = [...collectRequiredFieldKeys(formErrors, "")].filter(Boolean);
    const requiredFromSnapshot = getLikelyMissingFieldKeys();
    const requiredKeys = [...new Set([...requiredFromErrors, ...requiredFromSnapshot])];
    const label = requiredKeys.length ? "fill all mandatory fields" : "Submit blocked due to invalid input. Please check highlighted fields.";

    setShowToast({ key: "error", label });
  };

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(null), 5000);
    return () => clearTimeout(timer);
  }, [showToast]);

  
  window.onunload = function () {
    sessionStorage.removeItem("mcollectFormData");
    sessionStorage.removeItem("mcollectSubmitAttempted");
  }
  const onFormValueChange = (setValue, formData, formState) => {
    if (!Object.keys(formState.errors || {}).length) {
      sessionStorage.removeItem("mcollectSubmitAttempted");
    }
    setSubmitValve(!Object.keys(formState.errors).length);
  };

  const onSubmit = (data) => {
    sessionStorage.setItem("mcollectSubmitAttempted", "true");
    if (typeof window !== "undefined") {
      window.__MCOLLECT_ONSUBMIT_MARKER = "V4";
    }

    try {
      let mcollectFormValue;
      try {
        const stored = sessionStorage.getItem("mcollectFormData");
        mcollectFormValue = JSON.parse(stored);
      } catch (parseErr) {
        mcollectFormValue = null;
      }
      // consomerDetails1 is shared by all three form sections; each onSelect overwrites the
      // previous, so search ALL elements of the array to find the one that holds citizen fields.
      const consomerArray = Array.isArray(data?.consomerDetails1) ? data.consomerDetails1 : [];
      const consumerFormData = consomerArray.find(
        (item) => item && (item.ConsumerName || item.mobileNumber)
      ) || {};
      const submittedData = data?.consomerDetails1?.[0];
      data = isNonEmptyObject(mcollectFormValue) ? mcollectFormValue : submittedData;
      // Patch citizen fields from the raw form submission when sessionStorage is missing them
      if (!data.ConsumerName && consumerFormData.ConsumerName) data.ConsumerName = consumerFormData.ConsumerName;
      if (!data.mobileNumber && consumerFormData.mobileNumber) data.mobileNumber = consumerFormData.mobileNumber;
      if (!data.emailId && consumerFormData.emailId) data.emailId = consumerFormData.emailId;
      if (!data.workTitle && consumerFormData.workTitle) data.workTitle = consumerFormData.workTitle;

      const missingMandatoryKeys = getMissingMandatoryKeysFromPayload(data);
      if (!isNonEmptyObject(data) || missingMandatoryKeys.length > 0) {
        const label = "fill all mandatory fields";

        setShowToast({ key: "error", label });
        return;
      }


    const categoryPrefix = data?.category?.code?.split(".")?.[0];
    let TaxHeadMasterKeys = [];
    let TaxHeadMasterValues = [];
    if (categoryPrefix) {
      if (data[categoryPrefix] && typeof data[categoryPrefix] === "object") {
        // edit flow: data["CH"] = { "TAX_SUFFIX": "500", ... }
        TaxHeadMasterKeys = Object.keys(data[categoryPrefix]);
        TaxHeadMasterValues = Object.values(data[categoryPrefix]);
      } else {
        // new challan flow: flat keys stored as "CH.TAX_SUFFIX": "500"
        const flatEntries = Object.entries(data).filter(([k]) => k.startsWith(categoryPrefix + "."));
        TaxHeadMasterKeys = flatEntries.map(([k]) => k.slice(categoryPrefix.length + 1));
        TaxHeadMasterValues = flatEntries.map(([, v]) => v);
      }
    }
    let Challan = {};
    if(!isEdit){
      let temp = data?.category?.code;
      Challan = {
        citizen: {
          name: data.ConsumerName || "",
          workTitle: data.workTitle || "",
          mobileNumber: data.mobileNumber || "",
          emailId: data.emailId || "",
        },
        //businessService: selectedCategoryType ? temp + "." + humanized(selectedCategoryType.code, temp) : "",
        businessService:data?.categoryType?.code,
        consumerType: data?.category?.code?.split(".")[0],
        description: data?.comments,
        taxPeriodFrom: Date.parse(data?.fromDate),
        taxPeriodTo: Date.parse(data?.toDate),
        tenantId: tenantId,
        address: {
          buildingName: data.building,
          doorNo: data.doorNo,
          street: data.streetName,
          locality: { code: data?.mohalla?.code },
          pincode: data.pincode,
        },
        amount: TaxHeadMasterKeys.map((ele,index) => {
          return {
            taxHeadCode: `${data?.category?.code?.split(".")[0]}.${ele}`,
            amount: TaxHeadMasterValues[index] ? Math.round(TaxHeadMasterValues[index]) : 0,
          };
        }),
      };
    } else {
      Challan = {
        accountId: ChallanData[0].accountId,
        citizen: ChallanData[0].citizen,
        applicationStatus: ChallanData[0].applicationStatus,
        auditDetails: ChallanData[0].auditDetails,
        id: ChallanData[0].id,
        businessService: ChallanData[0].businessService,
        challanNo: ChallanData[0].challanNo,
        consumerType: data?.category?.code,
        description: data.comments,
        taxPeriodFrom: Date.parse(data.fromDate),
        taxPeriodTo: Date.parse(data.toDate),
        tenantId: tenantId,
        address: ChallanData[0].address,
          amount: TaxHeadMasterKeys.map((ele,index) => {
          return {
            taxHeadCode: `${data?.category?.code?.split(".")[0]}.${ele}`,
            amount: TaxHeadMasterValues[index] ? Math.round(TaxHeadMasterValues[index]) : 0,
          };
        }),
      };
    }

    if (isEdit) {
      Digit.MCollectService.update({ Challan: Challan }, tenantId)
        .then((result, err) => {
          if (result.challans && result.challans.length > 0) {
            const challan = result.challans[0];
            sessionStorage.removeItem('mcollectEditObject');
            let LastModifiedTime = Digit.SessionStorage.set("isMcollectAppChanged", challan.auditDetails.lastModifiedTime);
            Digit.MCollectService.generateBill(challan.challanNo, tenantId, challan.businessService, "challan").then((response) => {
              if (response.Bill && response.Bill.length > 0) {
                history.push(
                  `/suda-ui/employee/mcollect/acknowledgement?purpose=challan&status=success&tenantId=${tenantId}&billNumber=${
                    response.Bill[0].billNumber
                  }&serviceCategory=${response.Bill[0].businessService}&challanNumber=${response.Bill[0].consumerCode}&isEdit=${true}`,
                  { from: url }
                );
              }
            });
          }
        })
        .catch((e) => setShowToast({ key: "error", label: e?.response?.data?.Errors[0].message }));
    } else {

      Digit.MCollectService.create({ Challan: Challan }, tenantId)
        .then((result, err) => {
          if (result.challans && result.challans.length > 0) {
            const challan = result.challans[0];

            sessionStorage.removeItem("mcollectFormData");
            Digit.MCollectService.generateBill(challan.challanNo, tenantId, challan.businessService, "challan").then((response) => {
              if (response.Bill && response.Bill.length > 0) {
                history.push(
                  `/suda-ui/employee/mcollect/acknowledgement?purpose=challan&status=success&tenantId=${tenantId}&billNumber=${response.Bill[0].billNumber}&serviceCategory=${response.Bill[0].businessService}&challanNumber=${response.Bill[0].consumerCode}`,
                  { from: url }
                );
              }
            });
          }
        })
        .catch((e) => {setShowToast({ key: "error", label: e?.response?.data?.Errors[0].message })});
    }
    } catch (error) {

      setShowToast({ key: "error", label: `Form submission error: ${error.message}` });
    }
  };
  let configs = newConfig || [];
  //let configs = [];
  //let newConfig;
  newConfig=newConfig?newConfig:newConfigMcollect;
  newConfig?.map((conf) => {
    if (conf.head !== "ES_NEW_APPLICATION_PROPERTY_ASSESSMENT" && conf.head) {
      configs.push(conf);
    }
  });
  configs=newConfig;
  function checkHead(head) {
    if (head === "ES_NEW_APPLICATION_LOCATION_DETAILS") {
      return "TL_CHECK_ADDRESS";
    } else if (head === "ES_NEW_APPLICATION_OWNERSHIP_DETAILS") {
      return "TL_OWNERSHIP_DETAILS_HEADER";
    } else {
      return head;
    }
  }

  return (
    <div className="mcollect-challan-form">
      <div style={isMobile?{}:{ marginLeft: "16px" }}>
        <Header>{isEdit ? t("UC_UPDATE_CHALLAN"):t("UC_COMMON_HEADER")}</Header>
      </div>
      {isEdit && !(JSON.parse(sessionStorage.getItem("mcollectEditObject"))) && !defaultUpdatedValue ? <Loader />
       :<FormComposer
        heading={t("")}
        isDisabled={false}
        label={t("ES_COMMON_APPLICATION_SUBMIT")}
        config={configs.map((config) => {
          return {
            ...config,
            body: config.body.filter((a) => {
              return !a.hideInEmployee;
            }),
            head: checkHead(config.head),
          };
        })}
        fieldStyle={{ marginRight: 0 }}
        cardStyle={{ margin: "0 24px 4px", padding: "20px 24px" }}
        buttonStyle={{ width: "80px", height: "40px", display: "block", marginLeft: "auto", borderRadius: "8px", boxShadow: "none", fontSize: "20px", fontWeight: "600" }}
        onSubmit={onSubmit}
          onFormValidationError={onFormValidationError}
        defaultValues={defaultValues}
        onFormValueChange={onFormValueChange}
        breaklineStyle={{ border: "0px" }}
        submitInForm={true}
      />}
      {showToast && <Toast error={showToast?.key === "error" ? true : false} isDleteBtn={true} label={showToast?.label} onClose={closeToast} style={showToast?.key === "error" ? { backgroundColor: "#C62828" } : {}} />}
    </div>
  );
};

export default NewChallan;