import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, BrowserRouter as Router, Switch, useHistory, useRouteMatch, useLocation } from "react-router-dom";
import { TypeSelectCard, Loader } from "@upyog/digit-ui-react-components";
import { newConfig } from "../../../config/NewApplication/config";
import CheckPage from "./CheckPage";
import Response from "./Response";
import { useQueryClient } from "react-query";

const FileComplaint = ({ parentRoute }) => {
  const queryClient = useQueryClient();
  const match = useRouteMatch();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  let config = [];
  let configs = []
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("FSM_CITIZEN_FILE_PROPERTY", {});
  const { data: commonFields, isLoading } = Digit.Hooks.fsm.useMDMS(stateId, "FSM", "CommonFieldsConfig");

  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("FSM_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("FSM_ERROR_DATA", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("FSM_MUTATION_SUCCESS_DATA", false);

  useEffect(() => {
    if (!pathname?.includes('new-application/response')) {
      setMutationHappened(false);
      clearSuccessData();
      clearError();
    }
  }, []);

  const goNext = (skipStep, data) => {
    const currentPath = pathname.split("/").pop();
    const currentRouteObj = configs.find((routeObj) => routeObj.route === currentPath);
    if (!currentRouteObj) return;
    let { nextStep } = currentRouteObj;
    if (typeof nextStep === "object" && nextStep !== null) {
      const selectedKey = data && Object.keys(data).length > 0 ? Object.values(data)[0]?.i18nKey : null;
      nextStep = selectedKey && nextStep[selectedKey] ? nextStep[selectedKey] : Object.values(nextStep)[0];
    }
    let redirectWithHistory = history.push;
    if (skipStep) {
      redirectWithHistory = history.replace;
    }
    if (nextStep === null || nextStep === undefined) {
      return redirectWithHistory(`${parentRoute}/new-application/check`);
    }
    redirectWithHistory(`${match.path}/${nextStep}`);
  };

  const submitComplaint = async () => {
    history.push(`${parentRoute}/new-application/response`);
  };

  function handleSelect(key, data, skipStep) {
    setParams({ ...params, ...{ [key]: { ...params[key], ...data } }, ...{ source: "ONLINE" } });
    goNext(skipStep, data);
  }

  const handleSkip = () => { };

  const handleSUccess = () => {
    clearParams();
    queryClient.invalidateQueries("FSM_CITIZEN_SEARCH");
    setMutationHappened(true);
  };

  if (isLoading || !commonFields) {
    return <Loader />;
  }

  commonFields.forEach((obj) => {
    if (obj.body) {
      config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
    }
  });

  configs = [...config]
  const fallbackFsmPropertyRoute = (newConfig || [])
    .flatMap((section) => section.body || [])
    .find((routeObj) => routeObj?.route === "fsm-property-details");

  if (fallbackFsmPropertyRoute && !configs.some((routeObj) => routeObj?.route === "fsm-property-details")) {
    configs.push(fallbackFsmPropertyRoute);
  }

  configs.indexRoute = "select-trip-number";

  return (
    <Switch>
      {configs.map((routeObj, index) => {
        if (!routeObj.route) return null;
        const { component, texts, inputs, key } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;
        if (!Component) return null;
        return (
          <Route path={`${match.path}/${routeObj.route}`} key={index}>
            <Component config={{ texts, inputs, key }} onSelect={handleSelect} onSkip={handleSkip} t={t} formData={params} />
          </Route>
        );
      })}
      <Route path={`${match.path}/check`}>
        <CheckPage onSubmit={submitComplaint} value={params} />
      </Route>
      <Route path={`${match.path}/response`}>
        <Response data={params} onSuccess={handleSUccess} />
      </Route>
      <Route>
        <Redirect to={`${match.path}/${configs.indexRoute}`} />
      </Route>
    </Switch>
  );
};

export default FileComplaint;