import { BackButton, Dropdown, FormComposer, Loader, Toast } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";
import Header from "../../../components/Header";

/* set employee details to enable backward compatiable */
const setEmployeeDetail = (userObject, token) => {
  let locale = JSON.parse(sessionStorage.getItem("Digit.locale"))?.value || "en_IN";
  localStorage.setItem("Employee.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Employee.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Employee.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Employee.user-info", JSON.stringify(userObject));
};

const Login = ({ config: propsConfig, t, isDisabled }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const { data: storeData, isLoading: isStoreLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [disable, setDisable] = useState(false);
  const isMobile = window.innerWidth <= 640;

  const history = useHistory();
  // const getUserType = () => "EMPLOYEE" || Digit.UserService.getType();
  let   sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";
  
  useEffect(() => {
    if (!user) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    const filteredRoles = user?.info?.roles?.filter((role) => role.tenantId === Digit.SessionStorage.get("Employee.tenantId"));
    if (user?.info?.roles?.length > 0) user.info.roles = filteredRoles;
    Digit.UserService.setUser(user);
    setEmployeeDetail(user?.info, user?.access_token);
    let redirectPath = "/suda-ui/employee";

    /* logic to redirect back to same screen where we left off  */
    if (window?.location?.href?.includes("from=")) {
      redirectPath = decodeURIComponent(window?.location?.href?.split("from=")?.[1]) || "/suda-ui/employee";
    }

    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 &&  user?.info?.roles?.every((e) => e.code === "NATADMIN")) {
      redirectPath = "/suda-ui/employee/dss/landing/NURT_DASHBOARD";
    }
    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "STADMIN")) {
      redirectPath = "/suda-ui/employee/dss/landing/home";
    }

    history.replace(redirectPath);
  }, [user]);

  const onLogin = async (data) => {
    if (!data.city) {
      alert("Please Select City!");
      return;
    }
    setDisable(true);

    const requestData = {
      ...data,
      userType: "EMPLOYEE",
    };
    requestData.tenantId = data.city.code;
    delete requestData.city;
    try {
      const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      Digit.SessionStorage.set("Employee.tenantId", info?.tenantId);
      setUser({ info, ...tokens });
    } catch (err) {
      setShowToast(err?.response?.data?.error_description || "Invalid login credentials!");
      setTimeout(closeToast, 5000);
    }
    setDisable(false);
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const onForgotPassword = () => {
    sessionStorage.getItem("User") && sessionStorage.removeItem("User")
    history.push("/suda-ui/employee/user/forgot-password");
  };

  const [userId, password, city] = propsConfig.inputs;
  const config = [
    {
      body: [
        {
          label: t(userId.label),
          type: userId.type,
          populators: {
            name: userId.name,
          },
          isMandatory: true,
        },
        {
          label: t(password.label),
          type: password.type,
          populators: {
            name: password.name,
          },
          isMandatory: true,
        },
        {
          label: t(city.label),
          type: city.type,
          populators: {
            name: city.name,
            customProps: {},
            component: (props, customProps) => (
              <Dropdown
                option={cities}
                className="login-city-dd"
                optionKey="i18nKey"
                select={(d) => {
                  props.onChange(d);
                }}
                t={t}
                {...customProps}
              />
            ),
          },
          isMandatory: true,
        },
      ],
    },
  ];

  return isLoading || isStoreLoading ? (
    <Loader />
  ) : (
    <React.Fragment>
      <Background>
        <div className="employeeBackbuttonAlign">
          <BackButton variant="white" style={{ borderBottom: "none" }} />
        </div>

        <FormComposer 
          onSubmit={onLogin}
          isDisabled={isDisabled || disable}
          noBoxShadow
          inline
          submitInForm
          config={config}
          label={propsConfig.texts.submitButtonLabel}
          secondaryActionLabel={propsConfig.texts.secondaryButtonLabel}
          onSecondayActionClick={onForgotPassword}
          heading={propsConfig.texts.header}
          headingStyle={{ textAlign: "center" }}
          cardStyle={{ margin: "auto", minWidth: "408px", borderRadius: 10 }}
          className="loginFormStyleEmployee"
          buttonStyle={{ maxWidth: "100%", width: "100%"}}
        >
          {/* <Header /> */}
        </FormComposer>
        {showToast && <Toast error={true} label={t(showToast)} onClose={closeToast} />}
        <div
                style={{
                  background: "#04113c",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  padding: isMobile ? "10px 16px" : "10px 48px",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 8 : 0,
                }}
              >
                <span style={{ fontSize: 12, color: "#c8cfe8" }}>
                  © 2026 Copyright &nbsp;|&nbsp; {t("LANDING_PAGE_GOV_CG")} &nbsp;|&nbsp; {t("LANDING_PAGE_ALL_RIGHTS_RESERVED")} &nbsp;|&nbsp; {t("LANDING_PAGE_ALL_RIGHTS_RESERVED")}
                </span>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <a href="#" style={{ fontSize: 12, color: "#c8cfe8", textDecoration: "none" }}>
                    {t("LANDING_PAGE_TERMS_CONDITIONS")}
                  </a>
                  <span style={{ color: "#c8cfe8" }}>|</span>
                  <a href="#" style={{ fontSize: 12, color: "#c8cfe8", textDecoration: "none" }}>
                    {t("LANDING_PAGE_PRIVACY_POLICY")}
                  </a>
                </div>
              </div>
      </Background>
    </React.Fragment>
  );
};

Login.propTypes = {
  loginParams: PropTypes.any,
};

Login.defaultProps = {
  loginParams: null,
};

export default Login;
