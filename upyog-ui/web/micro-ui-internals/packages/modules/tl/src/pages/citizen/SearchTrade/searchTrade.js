import { FormComposer,Dropdown } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const SearchTrade = ({ config: propsConfig, onSelect }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [canSubmit, setCanSubmit] = useState(false);
  const userInfo =  Digit.UserService.getUser(); 
  let user = userInfo?.info;
  let defaultMobileno = user.mobileNumber;

  const allCities = Digit.Hooks.tl.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));

  const [cityCode, setCityCode] = useState();


  useLayoutEffect(() => {
    const getActionBar = () => {
      let el = document.querySelector("div.action-bar-wrap");
      if (el) {
        el.style.position = "static";
        el.style.padding = "8px 0";
        el.style.boxShadow = "none";
        el.style.marginBottom = "16px";
      } else {
        setTimeout(() => {
          getActionBar();
        }, 100);
      }
    };
    getActionBar();
  }, []);


  const onTradeSearch = async (data) => {
    if (!data.mobileNumber && !data.LicenseNum) {
      alert(t("TL_ERROR_NEED_ONE_PARAM"));
    }
    else {
      history.push(
        `/suda-ui/citizen/tl/tradelicence/renewal-list?mobileNumber=${data?.mobileNumber ? data?.mobileNumber : ``}&LicenseNumber=${data?.LicenseNum ? data?.LicenseNum : ``}&tenantId=${cityCode?cityCode:``}`
      );
    }
  };

  const [mobileNumber, tradelicense] = propsConfig.inputs;

  const config = [
    {
      body: [
        {
          label: "CORE_COMMON_CITY",
          isMandatory: true,
          type: "custom",
          populators: {
            name: "city",
            defaultValue: null,
            rules: { required: true },
            customProps: { t, isMendatory: true, option: [...allCities], optionKey: "i18nKey" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  if (d.code !== cityCode) props.setValue("locality", null);
                  props.onChange(d);
                }}
              />
            ),
          },
        },
        {
          label: mobileNumber.label,
          type: mobileNumber.type,
          populators: {
            name: mobileNumber.name,
            validation: { pattern: /^[6-9]{1}[0-9]{9}$ / },
          },
          disable: true,
          isMandatory: false,
        },
        {
          label: tradelicense.label,
          type: tradelicense.type,
          populators: {
            name: tradelicense.name,
          },
          isMandatory: false,
        },
      ],
    },
  ];

  const onFormValueChange = (setValue, data, formState) => {
    const mobileNumberLength = data?.[mobileNumber.name]?.length;
    const Licenseno = data?.[tradelicense.name];
    // const propId = data?.[property.name];
    const city = data?.city;
    // const locality = data?.locality;

    if (city?.code !== cityCode) {
      setCityCode(city?.code);
    }

    // let { errors } = formState;

    // if (!_.isEqual(data, formValue)) {
    //   // if (data?.city.code !== formValue?.city?.code) setValue("locality", null);
    //   setFormValue(data);
    // }

    // if (!locality || !city) {
    //   setCanSubmit(false);
    //   return;
    // }

    if (mobileNumberLength > 0 && mobileNumberLength < 10) setCanSubmit(false);
    else if(!city) setCanSubmit(false);
    else if (!Licenseno && !mobileNumberLength && !city) setCanSubmit(false);
    else setCanSubmit(true);
  };

  //   if (isLoading) {
  //     return <Loader />;
  //   }

  return (
    <div style={{ padding: "4px 0 32px" }}>
      {/* ── PT-style header banner ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)",
        borderRadius: "14px",
        padding: "22px 28px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 4px 18px rgba(244,119,56,0.25)",
      }}>
        <div style={{
          width: "50px", height: "50px", borderRadius: "50%",
          background: "rgba(255,255,255,0.25)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0,
        }}>🔍</div>
        <div>
          <div style={{ color: "#fff", fontSize: "19px", fontWeight: 700, lineHeight: 1.2 }}>
            {propsConfig.texts.header || t("TL_SEARCH_TRADE_HEADER")}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "4px" }}>
            {t("TL_SEARCH_TRADE_SUBTITLE") || "Search by mobile number or licence number"}
          </div>
        </div>
      </div>

      <FormComposer
        onSubmit={onTradeSearch}
        noBoxShadow
        inline
        config={config}
        label={propsConfig.texts.submitButtonLabel}
        heading={""}
        text={propsConfig.texts.text}
        cardStyle={{ margin: "auto", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}
        headingStyle={{ fontSize: "32px", marginBottom: "16px", fontFamily: "Roboto Condensed,sans-serif" }}
        isDisabled={!canSubmit}
        defaultValues={{mobileNumber:defaultMobileno}}
        onFormValueChange={onFormValueChange}
      ></FormComposer>
    </div>
  );
};

SearchTrade.propTypes = {
  loginParams: PropTypes.any,
};

SearchTrade.defaultProps = {
  loginParams: null,
};

export default SearchTrade;
