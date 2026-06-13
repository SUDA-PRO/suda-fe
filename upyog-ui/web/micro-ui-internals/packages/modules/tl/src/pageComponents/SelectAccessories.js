import React, { useEffect } from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";

/* Accessories is mandatory — auto-advance to accessories-details with YES */
const SelectAccessories = ({ t, config, onSelect, formData }) => {
  useEffect(() => {
    const yesOption = { i18nKey: "TL_COMMON_YES", code: "ACCESSORY" };
    sessionStorage.setItem("isAccessories", yesOption.i18nKey);
    sessionStorage.setItem("VisitedisAccessories", "true");
    onSelect(config.key, {
      isAccessories: yesOption,
      accessories: formData?.TradeDetails?.accessories?.length > 0
        ? formData.TradeDetails.accessories
        : [{ accessory: "", accessorycount: "", unit: null, uom: null }],
    });
  }, []);

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline /> : null}
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Loader />
      </div>
    </React.Fragment>
  );
};
export default SelectAccessories;
