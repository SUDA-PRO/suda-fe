import React, { useEffect, useState } from "react";
import {
  CardLabel,
  CardLabelDesc,
  Dropdown,
  TextInput,
  UploadFile,
  RadioOrSelect,
  FormStep,
} from "@upyog/digit-ui-react-components";
import Timeline from "../components/TLTimeline";
import { stringReplaceAll } from "../utils";
import UploadFileDigiLocker from "../utils/UploadFile";

const PTAllAddressDetails = ({ t, config, onSelect, userType, formData = {} }) => {
  const allCities = Digit.Hooks.pt.useTenants();
  const stateId = Digit.ULBService.getStateId();
  const mountedRef = React.useRef(true);
  React.useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  /* ── Pincode (not mandatory) ── */
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");

  /* ── City ── */
  const [cities, setCities] = useState(allCities || []);
  const [selectedCity, setSelectedCity] = useState(formData?.address?.city || null);

  /* ── Locality ── */
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    { enabled: !!selectedCity },
    t
  );
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality || null);

  /* ── Street, Door No, Landmark ── */
  const [street, setStreet] = useState(formData?.address?.street || "");
  const [doorNo, setDoorNo] = useState(formData?.address?.doorNo || "");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || "");

  /* ── Proof of Address ── */
  const { data: Documentsob = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Documents");
  const docs = Documentsob?.PropertyTax?.Documents;
  const proofOfAddress = Array.isArray(docs) ? docs.filter((doc) => doc.code.includes("ADDRESSPROOF")) : [];
  let dropdownData = [];
  if (proofOfAddress.length > 0) {
    dropdownData = proofOfAddress[0]?.dropdownData?.filter((doc) => doc?.active === true) || [];
    dropdownData.forEach((d) => { d.i18nKey = stringReplaceAll(d.code, ".", "_"); });
  }
  const [digiLockerUpload, setDigiLockerUpload] = useState(false);
  const [proofDocType, setProofDocType] = useState(
    formData?.address?.documents?.ProofOfAddress?.documentType || null
  );
  const [uploadedFile, setUploadedFile] = useState(
    formData?.address?.documents?.ProofOfAddress?.fileStoreId || null
  );
  const [uploadedFileObj, setUploadedFileObj] = useState(
    formData?.address?.documents?.ProofOfAddress || null
  );
  const [uploadError, setUploadError] = useState(null);

  /* ── Effects ── */
  // Update city list when pincode or allCities changes (same logic as PTSelectAddress citizen flow)
  useEffect(() => {
    if (!allCities?.length) return;
    if (pincode) {
      const filtered = allCities.filter((c) => c?.pincode?.some((p) => p == pincode));
      const list = filtered.length > 0 ? filtered : allCities;
      setCities(list);
      if (list.length === 1) setSelectedCity(list[0]);
    } else {
      setCities(allCities);
    }
  }, [pincode, allCities]);

  // Update localities when city or fetchedLocalities changes (same logic as PTSelectAddress)
  useEffect(() => {
    if (!selectedCity) {
      setLocalities([]);
      setSelectedLocality(null);
      return;
    }
    if (selectedCity && fetchedLocalities) {
      let list = fetchedLocalities;
      if (formData?.address?.locality) setSelectedLocality(formData.address.locality);
      if (pincode) {
        const filtered = list.filter((obj) => obj.pincode?.find((p) => p == pincode));
        if (filtered.length > 0) {
          list = filtered;
          if (!formData?.address?.locality) setSelectedLocality(null);
        }
      }
      setLocalities(list);
      if (list.length === 1) setSelectedLocality(list[0]);
    }
  }, [selectedCity, pincode, fetchedLocalities]);

  /* file upload */
  useEffect(() => {
    if (!uploadedFileObj) return;
    if (uploadedFileObj.fileStoreId || uploadedFile) return;
    (async () => {
      setUploadError(null);
      if (uploadedFileObj.size >= 2000000) {
        setUploadError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        return;
      }
      try {
        const response = await Digit.UploadServices.Filestorage(
          "property-upload",
          uploadedFileObj,
          Digit.ULBService.getStateId()
        );
        if (!mountedRef.current) return;
        if (response?.data?.files?.length > 0) {
          setUploadedFile(response.data.files[0].fileStoreId);
        }
      } catch (e) {}
    })();
  }, [uploadedFileObj]);

  /* ── Handlers ── */
  function selectCity(city) {
    setSelectedLocality(null);
    setLocalities([]);
    setSelectedCity(city);
  }

  function selectLocality(locality) {
    setSelectedLocality(locality);
  }

  function setTypeOfProofDoc(val) {
    val?.digiLockerFetch === true ? setDigiLockerUpload(true) : setDigiLockerUpload(false);
    setUploadedFile(null);
    setProofDocType(val);
  }

  function selectFile(e, newFile) {
    if (newFile) {
      setUploadedFileObj(newFile);
    } else {
      setUploadedFileObj(e.target.files[0]);
    }
  }

  /* ── Validation ── */
  const isFormValid = () =>
    selectedCity &&
    selectedLocality &&
    street &&
    doorNo &&
    proofDocType &&
    uploadedFileObj;

  /* ── Submit ── */
  const goNext = () => {
    const address = {
      ...formData?.address,
      pincode,
      city: selectedCity,
      locality: selectedLocality,
      street,
      doorNo,
      landmark,
      documents: {
        ...(formData?.address?.documents || {}),
        ProofOfAddress: {
          documentType: proofDocType,
          fileStoreId: uploadedFile,
        },
      },
    };
    onSelect(config.key, address);
  };

  const onSkip = () => onSelect();

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={!isFormValid()}>

        {/* Pincode — not mandatory */}
        <CardLabel>{t("PT_PROPERTY_ADDRESS_PINCODE")}</CardLabel>
        <TextInput
          name="pincode"
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={7}
          pattern="[0-9]+"
        />

        {/* City — same RadioOrSelect as PTSelectAddress citizen flow */}
        <CardLabel>
          {t("MYCITY_CODE_LABEL")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <span className="form-pt-dropdown-only">
          <RadioOrSelect
            options={cities.sort((a, b) => a.name.localeCompare(b.name))}
            selectedOption={selectedCity}
            optionKey="i18nKey"
            onSelect={selectCity}
            t={t}
            isPTFlow={true}
          />
        </span>

        {/* Locality — dependent on city, same as PTSelectAddress */}
        {selectedCity && localities && localities.length > 0 && (
          <React.Fragment>
            <CardLabel>
              {t("PT_LOCALITY_LABEL")}
              <span className="check-page-link-button"> *</span>
            </CardLabel>
            <span className="form-pt-dropdown-only">
              <RadioOrSelect
                dropdownStyle={{ paddingBottom: "20px" }}
                options={localities.sort((a, b) => a.name.localeCompare(b.name))}
                selectedOption={selectedLocality}
                optionKey="i18nkey"
                onSelect={selectLocality}
                t={t}
              />
            </span>
          </React.Fragment>
        )}

        {/* Street Name */}
        <CardLabel>
          {t("PT_PROPERTY_ADDRESS_STREET_NAME")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <TextInput
          name="street"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          maxLength={64}
        />

        {/* House / Door No */}
        <CardLabel>
          {t("PT_PROPERTY_ADDRESS_HOUSE_NO")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <TextInput
          name="doorNo"
          type="text"
          value={doorNo}
          onChange={(e) => setDoorNo(e.target.value)}
          maxLength={64}
        />

        {/* Landmark — not mandatory */}
        <CardLabel>{t("ES_NEW_APPLICATION_LOCATION_LANDMARK")}</CardLabel>
        <TextInput
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          maxLength={1024}
        />

        {/* Proof of Address */}
        <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_TYPES")}</CardLabelDesc>
        <CardLabelDesc>{t("PT_UPLOAD_RESTRICTIONS_SIZE")}</CardLabelDesc>
        <CardLabel>
          {t("PT_CATEGORY_DOCUMENT_TYPE")}
          <span className="check-page-link-button"> *</span>
        </CardLabel>
        <Dropdown
          t={t}
          isMandatory={false}
          option={dropdownData}
          selected={proofDocType}
          optionKey="i18nKey"
          select={setTypeOfProofDoc}
          placeholder={t("PT_MUTATION_SELECT_DOC_LABEL")}
        />
        {digiLockerUpload ? (
          <UploadFileDigiLocker
            id="pt-address-proof"
            extraStyleName="propertyCreate"
            accept=".jpg,.png,.pdf"
            onUpload={selectFile}
            onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }}
            message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
            error={uploadError}
          />
        ) : (
          <UploadFile
            id="pt-address-proof"
            extraStyleName="propertyCreate"
            accept=".jpg,.png,.pdf"
            onUpload={selectFile}
            onDelete={() => { setUploadedFile(null); setUploadedFileObj(null); }}
            message={uploadedFileObj ? `1 ${t("PT_ACTION_FILEUPLOADED")}` : t("PT_ACTION_NO_FILEUPLOADED")}
            error={uploadError}
          />
        )}
        {uploadError && (
          <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{uploadError}</div>
        )}

      </FormStep>
    </React.Fragment>
  );
};

export default PTAllAddressDetails;
