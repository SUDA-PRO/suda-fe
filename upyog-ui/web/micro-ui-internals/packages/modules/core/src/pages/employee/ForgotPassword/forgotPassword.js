import { BackButton, Dropdown, FormComposer, Loader, Toast } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";
import Header from "../../../components/Header";

const ForgotPassword = ({ config: propsConfig, t }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [user, setUser] = useState(null);
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);
  const getUserType = () => Digit.UserService.getType();
  let sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";
  
  useEffect(() => {
    if (!user) {
      Digit.UserService.setType("employee");
      return;
    }
    Digit.UserService.setUser(user);
    const redirectPath = location.state?.from || "/upyog-ui/employee";
    history.replace(redirectPath);
  }, [user]);

  const closeToast = () => {
    setShowToast(null);
  };

  const onForgotPassword = async (data) => {
    if (!data.city) {
      alert("Please Select City!");
      return;
    }
    const requestData = {
      otp: {
        mobileNumber: data.mobileNumber,
        userType: "citizen",
        type: "passwordreset",
        tenantId: data.city.code,
      },
    };
    try {
      await Digit.UserService.sendOtp(requestData, data.city.code);
      history.push(`/upyog-ui/employee/user/change-password?mobile_number=${data.mobileNumber}&tenantId=${data.city.code}`);
    } catch (err) {
      setShowToast(err?.response?.data?.error?.fields?.[0]?.message || "Invalid login credentials!");
      setTimeout(closeToast, 5000);
    }
  };

  const navigateToLogin = () => {
    history.replace("/upyog-ui/employee/login");
  };

  const [userId, city] = propsConfig.inputs;
  const config = [
    {
      body: [
        {
          label: t(userId.label),
          type: userId.type,
          populators: {
            name: userId.name,
            componentInFront: "+91",
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
                optionKey="name"
                id={city.name}
                className="login-city-dd"
                select={(d) => {
                  props.onChange(d);
                }}
                {...customProps}
              />
            ),
          },
          isMandatory: true,
        },
      ],
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Background>
      <div className="employeeBackbuttonAlign">
        <BackButton variant="white" style={{ borderBottom: "none" }} />
      </div>
      <FormComposer
        onSubmit={onForgotPassword}
        noBoxShadow
        inline
        submitInForm
        config={config}
        label={propsConfig.texts.submitButtonLabel}
        secondaryActionLabel={propsConfig.texts.secondaryButtonLabel}
        onSecondayActionClick={navigateToLogin}
        heading={propsConfig.texts.header}
        description={propsConfig.texts.description}
        headingStyle={{ textAlign: "center" }}
        cardStyle={{ maxWidth: "408px", margin: "auto" }}
        className="employeeForgotPassword"
      >
        <Header />
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
  );
};

ForgotPassword.propTypes = {
  loginParams: PropTypes.any,
};

ForgotPassword.defaultProps = {
  loginParams: null,
};

export default ForgotPassword;
