import { FormComposer, Loader, Dropdown, Localities, Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch,useLocation } from "react-router-dom";
import { newConfig } from "../../config/Create/config";
import _, { create, unset } from "lodash";

const CreatePropertyForm = ({ config, onSelect,value, userType, redirectUrl }) => {
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenants = Digit.Hooks.pt.useTenants();
  const { t } = useTranslation();
  const location = useLocation();

  const [canSubmit, setCanSubmit] = useState(false);
  const defaultValues = { ...value};
  const history = useHistory();
  const match = useRouteMatch();
  sessionStorage.setItem("VisitedCommonPTSearch",true);
  sessionStorage.setItem("VisitedLightCreate",true);
  const isMobile = window.Digit.Utils.browser.isMobile();

  let allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  if(window.location.href.includes("obps"))
  {
    allCities = Digit.SessionStorage.get("OBPS_TENANTS")
  }
  if(window.location.href.includes("fsm"))
  {
    allCities = Digit.SessionStorage.get("FSM_TENANTS")
  }
  const [formValue, setFormValue] = useState("");
  const [cityCode, setCityCode] = useState("");
  let enableSkip = userType=="employee"?false :config?.isSkipEnabled || sessionStorage.getItem("skipenabled");
  // delete
  // const [_formData, setFormData,_clear] = Digit.Hooks.useSessionStorage("store-data",null);
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", { });
  const { data: commonFields, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "PropertyTax", "CommonFieldsConfig");
  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const onSubmit = async () => {
    if((formValue?.owners?.ownershipCategory?.includes("MULTIPLEOWNERS") || formValue?.owners?.[0]?.ownershipCategory?.code?.includes("MULTIPLEOWNERS")) && formValue?.owners?.length==1){
      setShowToast({ key: true, label: "PT_COMMON_ONE_MORE_OWNER_INFROMATION_REQUIRED" });
    }else{

    if(onSelect) {
      onSelect('cptNewProperty', { property: formValue });
    } else {
      if(userType === 'employee') {
        history.push(`${match.path}/save-property?redirectToUrl=${redirectUrl}`, {
          data: formValue,
          prevState:{...location?.state}
        });
      } else {
        history.replace(`/suda-ui/citizen/commonPt/property/citizen-otp`,
          {
            // from: getFromLocation(location.state, searchParams),
            mobileNumber: formValue?.owners?.[0]?.mobileNumber,
            redirectBackTo: '/suda-ui/citizen/commonPt/property/new-application/save-property',
            redirectData: formValue,
          }
        );
      }
    }
  }
  };

  const onSkip = () => {
    onSelect("isSkip",true);
  }

  const onFormValueChange = (setValue, data, formState) => {
    // const city = data?.locationDet?.city;
    // const locality = data?.locationDet?.locality;

    // if (city?.code !== cityCode) {
    //   setCityCode(city?.code);
    // }
    if (!_.isEqual(data, formValue)) {
      // if (data?.city.code !== formValue?.city?.code) setValue("locality", null);
      setFormValue(data);
    }

    if(data.assemblyDet && data.locationDet && data.owners && !Object.keys(formState?.errors).length){
      setCanSubmit(true);
    }else{
      setCanSubmit(false);
    }

    // if (!locality) {
    //   setCanSubmit(false);
    //   return;
    // }

    // setCanSubmit(true);
  };

  const getHeaderLabel = () => {
    let url = window.location.href;
    let moduleName = url?.split("=")?.[1]?.split("/")?.[3];
    if (moduleName) return t(`ES_COMMON_CREATE_PROPERTY_HEADER_${moduleName?.toUpperCase()}`);
    else return t('ES_COMMON_CREATE_PROPERTY_HEADER');
  }

  return (
    <React.Fragment>
      {/* PT-style hero banner (matches PTAllPropertyDetails) */}
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
          <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>New Property</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t(getHeaderLabel())}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{t("ES_COMMON_CREATE_PROPERTY_SUBHEADER") || "Enter the property details below"}</p>
        </div>
      </div>
    <FormComposer
      onSkip = {onSkip}
      showSkip = {enableSkip}
      skipStyle = {isMobile?{}:{textAlign:"right",marginRight:"55px"}}
      sectionHeadStyle = {{marginBottom:"16px"}}
      onSubmit={onSubmit}
      noBoxShadow
      inline
      config={newConfig}
      label={t('SUBMIT')}
      isDisabled={!canSubmit}
      defaultValues={defaultValues}
      onFormValueChange={onFormValueChange}
    />
     {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default CreatePropertyForm;
