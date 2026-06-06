import { FormStep, LinkButton, RadioOrSelect, TextInput } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GIS from "./GIS";
import Timeline from "../components/Timeline";
import { stringReplaceAll } from "../utils";

const LocationDetails = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isShowToast }) => {
  let propertyData =JSON.parse(sessionStorage.getItem("Digit_OBPS_PT"))
  let currCity = JSON.parse(sessionStorage.getItem("currentCity")) || null;
  let currPincode = sessionStorage.getItem("currentPincode");
  let currLocality = JSON.parse(sessionStorage.getItem("currentLocality")) || { };
  const allCities = Digit.Hooks.obps.useTenants();
  const { pathname: url } = useLocation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [Pinerror, setPinerror] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinTouched, setIsPinTouched] = useState(false);
  const [pincode, setPincode] = useState(currPincode || formData?.address?.pincode ||propertyData?.address?.pincode|| "");
  const [geoLocation, setgeoLocation] = useState(formData?.address?.geoLocation || "")
  const [tenantIdData, setTenantIdData] = useState(formData?.Scrutiny?.[0]?.tenantIdData);
  const [selectedCity, setSelectedCity] = useState(() => formData?.address?.city || (currCity?.code ? currCity : null) || null);
  const [street, setStreet] = useState(formData?.address?.street || propertyData?.address.street||"");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || formData?.address?.Landmark || propertyData?.address.landmark|| "");
  const [placeName, setplaceName] = useState(formData?.address?.placeName || formData?.placeName || "");
  const checkingFlow = formData?.uiFlow?.flow ? formData?.uiFlow?.flow :formData?.selectedPlot||formData?.businessService==="BPA-PAP" ? "PRE_APPROVE":"";
  //const { isLoading, data: citymodules } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);
  let [cities, setcitiesopetions] = useState(allCities);
  let validation = { };
  let cityCode = !(formData?.selectedPlot) ? (formData?.data?.edcrDetails?.tenantId || propertyData?.address?.tenantId) :  Digit.ULBService.getCitizenCurrentTenant(true);
  formData = { address: { ...formData?.address } };
  const isMobile = window.Digit.Utils.browser.isMobile();
  useEffect(() => {
    if (!allCities || allCities.length === 0) return;
  
    if (!selectedCity || !localities) {
      let filteredCities =
        userType === "employee"
          ? allCities.filter(city => city.code === tenantId)
          : pincode
            ? allCities.filter(city =>
                city?.pincode?.some(pin => pin == Number(pincode))
              )
            : allCities;
  
      setcitiesopetions(filteredCities);
  
      const isFromPT = !!propertyData?.address?.pincode;
  
      if (!isFromPT && isPinTouched && pincode && filteredCities.length === 0) {
        setPinerror("BPA_PIN_NOT_VALID_ERROR");
      } else {
        setPinerror(null);
      }
    }
  }, [pincode, allCities, isPinTouched]);
  
  


  // When a property is selected, auto-set city from its tenantId (bypasses pincode filter issues)
  useEffect(() => {
    if (!allCities || allCities.length === 0) return;
    const propertyTenantId = propertyData?.address?.tenantId;
    if (propertyTenantId) {
      const matchedCity = allCities.find(c => c.code === propertyTenantId);
      if (matchedCity) {
        setcitiesopetions(allCities);
        setSelectedCity(matchedCity);
        sessionStorage.setItem("currentCity", JSON.stringify(matchedCity));
      }
    }
  }, [allCities]);

  useEffect(() =>{
    cities.map((city,index) => {
      if(city.code === cityCode)
      {
        setSelectedCity(city);
        sessionStorage.setItem("currentCity", JSON.stringify(city));
      }
    })
  },[cities, formData?.data])

  useEffect(() => {
    if (cities) {
      if (cities.length === 1 && cities?.[0].code === selectedCity?.code) {
        setSelectedCity(cities[0]);
        sessionStorage.setItem("currentCity", JSON.stringify(cities[0]));
      }
    }
  }, [cities]);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity,
    },
    t
  );

  let isEditApplication = window.location.href.includes("editApplication");
  let isSendBackTOCitizen = window.location.href.includes("sendbacktocitizen");


  const [localities, setLocalities] = useState();

  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality||propertyData?.address.locality ||null);
  

  useEffect(() => {
    
    if (selectedCity && fetchedLocalities  && !Pinerror) {
      let __localityList = fetchedLocalities;
      let filteredLocalityList = [];
      
      if (formData?.address?.locality && formData?.address?.locality?.code === selectedLocality?.code) {
        setSelectedLocality(formData.address.locality);
      }

      if ((formData?.address?.pincode || pincode) && !Pinerror) {
        filteredLocalityList = __localityList.filter((obj) => obj.pincode?.find((item) => item == pincode));
        // Don't clear selectedLocality if it came from a selected property
        if (!formData?.address?.locality && filteredLocalityList.length<=0 && !propertyData?.address?.locality) setSelectedLocality();
      }
      if(!localities || (filteredLocalityList.length > 0 && localities.length !== filteredLocalityList.length) || (filteredLocalityList.length <=0 && localities && localities.length !==__localityList.length))
      {
        
        setLocalities(() => (filteredLocalityList.length > 0 ? filteredLocalityList : __localityList));
      }
      if (filteredLocalityList.length === 1 && ((selectedLocality == null) || (selectedLocality && filteredLocalityList[0]?.code !== selectedLocality?.code))) {
        setSelectedLocality(filteredLocalityList[0]);
        sessionStorage.setItem("currLocality", JSON.stringify(filteredLocalityList[0]));
      }
    }

    //setSelectedLocality(propertyData?.address?.locality)
  }, [selectedCity, formData?.pincode, fetchedLocalities, pincode,geoLocation]);


  const handleGIS = () => {
    setIsOpen(!isOpen);
  }

  const handleRemove = () => {
    setIsOpen(!isOpen);
  }



  const handleSubmit = () => {
    const address = { }
    address.pincode = pincode;
    address.city = selectedCity;
    address.locality = selectedLocality;
    address.street = street;
    address.landmark = landmark;
    address.geoLocation = geoLocation;
    address.placeName = placeName;
    onSelect(config.key, address);
  };


  function onSave(geoLocation, pincode, placeName) {
    selectPincode(pincode);
    sessionStorage.setItem("currentPincode", pincode);
    setgeoLocation(geoLocation);
    setplaceName(placeName);
    setIsOpen(false);
    setPinerror(null);
  }
  function selectPincode(e) {
    setIsPinTouched(true); // ✅ ADD THIS
  
    setPinerror(null);
    const value = (typeof e === 'object' && e !== null) ? e.target.value : e;
  
    if (value !== "" && !value.match(/^[1-9][0-9]{5}$/)) {
      setPinerror("BPA_PIN_NOT_VALID_ERROR");
    }
  
    formData.address["pincode"] = value;
    setPincode(value);
  
    sessionStorage.setItem("currentPincode", value);
    sessionStorage.setItem("currentCity", JSON.stringify({ }));
    sessionStorage.setItem("currLocality", JSON.stringify({ }));
  
    setSelectedLocality(null);
    setLocalities(null);
  }
  

  function selectStreet(e) {
    setStreet(e.target.value)
  }

  function selectGeolocation(e) {
    formData.address["geoLocation"] = (typeof e === 'object' && e !== null) ? e.target.value : e;
    setgeoLocation((typeof e === 'object' && e !== null) ? e.target.value : e);
    setplaceName((typeof e === 'object' && e !== null) ? e.target.value : e);
    sessionStorage.setItem("currentPincode", "");
    sessionStorage.setItem("currentCity", JSON.stringify({ }));
    sessionStorage.setItem("currLocality", JSON.stringify({ }));
    setPincode("");
    setSelectedLocality(null);
    //setLocalities(null);
    //setSelectedCity(null);
  }

  function selectLandmark(e) {
    setLandmark(e.target.value);
  }

  function selectCity(city) {
    setSelectedLocality(null);
    setLocalities(null);
    setSelectedCity(city);
    sessionStorage.setItem("currentCity", JSON.stringify(city));
    formData.address["city"] = city;
  }

  function selectLocality(locality) {
    if (formData?.address?.locality) {
      formData.address["locality"] = locality;
    }
    setSelectedLocality(locality);
    sessionStorage.setItem("currLocality", JSON.stringify(locality));
  }

  const sectionTitleStyle = { fontSize: "15px", fontWeight: "700", color: "#1a2b49", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f47738", letterSpacing: "0.3px" };
  const labelStyle = { display: "block", fontWeight: "600", fontSize: "13px", color: "#3d4f6b", marginBottom: "6px", letterSpacing: "0.2px" };
  const requiredMark = { color: "#e54d42", marginLeft: "2px" };
  const cardStyle = { background: "#ffffff", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: "24px", border: "1px solid #e8ecf0" };

  return (
    <div className="location-details-page">
      <style>{".location-details-page .card-caption, .location-details-page .card-text { display: none !important; }"}</style>
      {!isOpen && <Timeline currentStep={checkingFlow === "OCBPA" ? 2 : checkingFlow==="PRE_APPROVE"? 5: 1 } flow={checkingFlow}/>}
      {isOpen && <GIS t={t} onSelect={onSelect} formData={formData} handleRemove={handleRemove} onSave={onSave} />}
      {!isOpen && (
        <div style={{ background: "linear-gradient(135deg, #1a2b49 0%, #f47738 100%)", borderRadius: "12px", padding: "28px 36px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.75, marginBottom: "4px" }}>
              {t("BPA_BUILDING_PERMIT") || "Building Permit"}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS") || "Location Details"}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>
              {t("BPA_LOCATION_SUBTEXT") || "Provide the property location details"}
            </p>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0, background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Step 1 of 3</div>
        </div>
      )}
    {!isOpen && <FormStep
      t={t}
      config={config}
      onSelect={handleSubmit}
      isDisabled={!selectedCity || !selectedLocality || Pinerror }
      isMultipleAllow={true}
      forcedError={t(Pinerror)}
    >
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>{t("BPA_LOCATION_SECTION") || "Location Information"}</div>
        <label style={labelStyle}>{t("BPA_GIS_LABEL")}</label>
        <div style={{/* position:"relative",height:"100px",width:"200px" */ }}>
        <TextInput
          style={{ }}
          isMandatory={false}
          optionKey="i18nKey"
          t={t}
          name="gis"
          value={isEditApplication || isSendBackTOCitizen?(geoLocation.latitude !== null?`${geoLocation.latitude}, ${geoLocation.longitude}`:""):placeName}
          onChange={selectGeolocation}
        />
        <LinkButton
          label={
            <div>
              <span>
                <svg 
                style={!isMobile ? {position: "relative", left: "515px", bottom: "35px", marginTop: "-20px"} : { float: "right", position: "relative", bottom: "35px", marginTop: "-20px", marginRight: "5px" }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7C8.79 7 7 8.79 7 11C7 13.21 8.79 15 11 15C13.21 15 15 13.21 15 11C15 8.79 13.21 7 11 7ZM19.94 10C19.48 5.83 16.17 2.52 12 2.06V0H10V2.06C5.83 2.52 2.52 5.83 2.06 10H0V12H2.06C2.52 16.17 5.83 19.48 10 19.94V22H12V19.94C16.17 19.48 19.48 16.17 19.94 12H22V10H19.94ZM11 18C7.13 18 4 14.87 4 11C4 7.13 7.13 4 11 4C14.87 4 18 7.13 18 11C18 14.87 14.87 18 11 18Z" fill="#505A5F" />
                </svg>
              </span>
            </div>
          }
          style={{ }}
          onClick={(e) => handleGIS()}
        />
      </div>
      <label style={labelStyle}>{t("BPA_DETAILS_PIN_LABEL")}</label>
      {!isOpen && <TextInput
        isMandatory={false}
        optionKey="i18nKey"
        type={"text"}
        t={t}
        name="pincode"
        onChange={selectPincode}
        value={pincode}
        disabled={propertyData?.address ?true:false}
      />}
      <label style={labelStyle}>{t("BPA_CITY_LABEL")}<span style={requiredMark}>*</span></label>
      {!isOpen && <RadioOrSelect
        options={cities}
        selectedOption={selectedCity}
        optionKey="code"
        onSelect={selectCity}
        t={t}
        isDependent={true}
        disabled={propertyData?.address ?true:false}
      />}
      {!isOpen && selectedCity && localities && !propertyData?.address?.locality.name && (
        <span className={"form-pt-dropdown-only"}>
          <label style={labelStyle}>{t("BPA_LOC_MOHALLA_LABEL")}<span style={requiredMark}>*</span></label>
          <RadioOrSelect
            optionCardStyles={{ maxHeight:"20vmax", overflow:"scroll" }}
            isMandatory={config.isMandatory}
            options={localities.sort((a, b) => a.name.localeCompare(b.name))}
            selectedOption={selectedLocality}
            optionKey="i18nkey"
            onSelect={selectLocality}
            t={t}
            isDependent={true}
            labelKey={`${stringReplaceAll(selectedCity?.code,".","_").toUpperCase()}_REVENUE`}
          />
        </span>
       )}
         {!isOpen  && propertyData?.address?.locality.name && (
        <span className={"form-pt-dropdown-only"}>
          <label style={labelStyle}>{t("BPA_LOC_MOHALLA_LABEL")}<span style={requiredMark}>*</span></label>
          <TextInput
            optionCardStyles={{ maxHeight:"20vmax", overflow:"scroll" }}
            isMandatory={config.isMandatory}
            value={propertyData?.address.locality.name}
            optionKey="i18nkey"
            t={t}
            isDependent={true}
            labelKey={`${stringReplaceAll(selectedCity?.code,".","_").toUpperCase()}_REVENUE`}
            disabled={propertyData?.address ?true:false}
          />
        </span>
            )}
      <label style={labelStyle}>{t("BPA_DETAILS_SRT_NAME_LABEL")}</label>
      {!isOpen && <TextInput
        style={{ }}
        isMandatory={false}
        optionKey="i18nKey"
        t={t}
        name="street"
        onChange={selectStreet}
        value={street}
        disabled={propertyData?.address ?true:false}
      />}
      <label style={labelStyle}>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK")}</label>
      {!isOpen && <TextInput
        style={{ }}
        isMandatory={false}
        optionKey="i18nKey"
        t={t}
        name="landmark"
        onChange={selectLandmark}
        value={landmark}
        disabled={propertyData?.address ?true:false}
      />}
      </div>
    </FormStep>}
    </div>
  );
};

export default LocationDetails;