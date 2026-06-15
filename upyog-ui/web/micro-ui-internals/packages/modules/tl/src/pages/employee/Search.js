import React, { useEffect, useState } from "react";
import {
  TextInput,
  Label,
  SubmitBar,
  LinkLabel,
  ActionBar,
  CloseSvg,
  DatePicker,
  CardLabelError,
  SearchForm,
  SearchField,
  Dropdown,
} from "@upyog/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Search = ({ path }) => {
  const { variant } = useParams();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [payload, setPayload] = useState({});

  const Search = Digit.ComponentRegistryService.getComponent(variant === "license" ? "SearchLicense" : "SearchLicenseApplication");

  function onSubmit(_data) {
    Digit.SessionStorage.set("SEARCH_APPLICATION_DETAIL", {
      applicationNumber: _data?.applicationNumber,
      licenseNumbers: _data?.licenseNumbers,
      applicationType: _data?.applicationType,
      tradeName: _data?.tradeName,
      fromDate: _data?.fromDate,
      toDate: _data?.toDate,
      limit: 10,
      sortBy: "commencementDate",
      sortOrder: "DESC",
      status: _data.status,
    });
    var fromDate = new Date(_data?.fromDate);
    fromDate?.setSeconds(fromDate?.getSeconds() - 19800);
    var toDate = new Date(_data?.toDate);
    toDate?.setSeconds(toDate?.getSeconds() + 86399 - 19800);
    const data = {
      ..._data,
      ...(_data.toDate ? { toDate: toDate?.getTime() } : {}),
      ...(_data.fromDate ? { fromDate: fromDate?.getTime() } : {}),
    };

    setPayload(
      Object.keys(data)
        .filter((k) => data[k])
        .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {})
    );
  }
  useEffect(() => {
    const storedPayload = Digit.SessionStorage.get("SEARCH_APPLICATION_DETAIL") || {};
    if (storedPayload) {
      var fromDate = new Date(storedPayload?.fromDate);
      fromDate?.setSeconds(fromDate?.getSeconds() - 19800);
      var toDate = new Date(storedPayload?.toDate);
      toDate?.setSeconds(toDate?.getSeconds() + 86399 - 19800);
      const data = {
        ...storedPayload,
        ...(storedPayload.toDate ? { toDate: toDate?.getTime() } : {}),
        ...(storedPayload.fromDate ? { fromDate: fromDate?.getTime() } : {}),
      };

      setPayload(
        Object.keys(data)
          .filter((k) => data[k])
          .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {})
      );
    }
  }, []);
  const config = {
    enabled: !!(payload && Object.keys(payload).length > 0),
  };

  const { data: { Licenses: searchReult, Count: count } = {}, isLoading, isSuccess } = Digit.Hooks.tl.useSearch({
    tenantId,
    filters: payload,
    config,
  });

  const workFlowConfig = {
    enabled: (payload && Object.keys(payload).length > 0 && !isLoading && isSuccess),
  };

  const { data: { ProcessInstances: assigneeResults } = {} , isLoading: isWorkflowLoading, isSuccess: isWorkflowSuccess } = Digit.Hooks.tl.useTLWorkflowData({
    tenantId,
    filters: { businessIds: searchReult?.map((license) => license?.applicationNumber).join(",")},
    config: { ...workFlowConfig }
  });

  console.log("search")

  return (
    <div>
      {/* PT-style header banner */}
      <div style={{
        background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
        borderRadius: "12px",
        padding: "18px 24px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 3px 12px rgba(244,119,56,0.22)",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: "rgba(255,255,255,0.22)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0,
        }}>🔍</div>
        <div>
          <div style={{ color: "#fff", fontSize: "18px", fontWeight: 700, lineHeight: 1.2 }}>
            {t("ES_COMMON_SEARCH")}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginTop: "3px" }}>
            {t("TL_SEARCH_SUBTITLE") || "Search Trade Licence Applications"}
          </div>
        </div>
      </div>
      <Search
        t={t}
        tenantId={tenantId}
        onSubmit={onSubmit}
      data={!isLoading && isSuccess && !isWorkflowLoading && isWorkflowSuccess ? (searchReult?.length > 0
         ? searchReult?.map((obj) => ({
        ...obj,
        CurrentOwners: assigneeResults?.length > 0 ? assigneeResults?.filter((elem) => elem.businessId === obj.applicationNumber)?.map((item) => ({
          currentOwner: item.assignes !== null && item.assignes[0].name !== null ?  item.assignes[0].name : "NA"
        }))
        : {
            currentOwner: "NA"
          }
      })) : { display: "ES_COMMON_NO_DATA" }) : ""}
      count={count}
    />
    </div>
  );
};

export default Search;
