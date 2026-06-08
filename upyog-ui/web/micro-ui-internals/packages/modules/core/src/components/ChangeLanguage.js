import { ActionBar, Button, Dropdown } from "@upyog/digit-ui-react-components";
import React, { useState } from "react";
import { CustomButton, Menu } from "@upyog/digit-ui-react-components";

const ChangeLanguage = (prop) => {
  const isDropdown = prop.dropdown || false;
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { languages, stateInfo } = storeData || {};
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();
  const [selected, setselected] = useState(selectedLanguage);
  const handleChangeLanguage = (language) => {
    setselected(language.value);
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
    window.location.reload();
  };

  if (isLoading) return null;

  if (isDropdown) {
    return (
      <div style={{ marginBottom: 0 }}>
        <Dropdown
          option={languages}
          selected={languages.find((language) => language.value === selectedLanguage)}
          optionKey={"label"}
          select={handleChangeLanguage}
          freeze={true}
          style={{ marginBottom: 0 }}
          customSelector={<label className="cp">{languages.find((language) => language.value === selected).label}</label>}
        />
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <div style={{ marginBottom: "5px" }}>Language</div>
        <div className="language-selector">
          {languages.map((language, index) => (
            <div className="language-button-container" key={index}>
              <CustomButton
                selected={language.value === selected}
                text={language.label}
                onClick={() => handleChangeLanguage(language)}
              ></CustomButton>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
};

export default ChangeLanguage;
