import React, { useEffect, useRef, useState } from "react";
import { Loader, Modal, KeyNote, SubmitBar, CitizenInfoLabel } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const statusConfig = {
  ACTIVE:             { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "PT_COMMON_ACTIVE" },
  INACTIVE:           { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: "PT_COMMON_INACTIVE" },
  INWORKFLOW:         { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "PT_COMMON_INWORKFLOW" },
  MUTATIONINWORKFLOW: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "PT_COMMON_MUTATIONINWORKFLOW" },
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#1a2b49", fontWeight: "600", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  </div>
);

const SearchPropertyCard = ({ property, payment, onSubmit, isMutation, actionButtonLabel }) => {
  const { t } = useTranslation();
  if (!property || !payment) return null;
  const address = property?.address;
  const rawOwners = property?.owners;

  // Normalize owners to always be an array (API may return single object or array)
  const owners = Array.isArray(rawOwners) ? rawOwners : (rawOwners ? [rawOwners] : []);

  const sortedOwners = [...owners].sort((a, b) => (a?.additionalDetails?.ownerSequence || 0) - (b?.additionalDetails?.ownerSequence || 0));

  const primaryOwner = sortedOwners[0];
  const ownerNames = sortedOwners.map(o => o?.name).filter(Boolean).join(", ");
  const mobileNo = primaryOwner?.mobileNumber;

  const addressLine = [
    address?.doorNo ? `Door No. ${address.doorNo}` : null,
    address?.street || null,
    address?.locality?.name ? t(address.locality.name) : null,
    address?.city ? t(address.city) : null,
    address?.pincode ? `- ${address.pincode}` : null,
  ].filter(Boolean).join(", ");

  const status = property?.status?.toUpperCase();
  const statusStyle = statusConfig[status] || { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db", label: `PT_COMMON_${status}` };

  const paymentInfo = payment[property?.propertyId];
  const totalDue = paymentInfo?.total_due || 0;
  const hasBill = totalDue > 0;

  const cardData = {
    property_id: property?.propertyId,
    owner_name: ownerNames,
    property_address: addressLine,
    total_due: totalDue,
    bil_due__date: paymentInfo?.bil_due__date || t("N/A"),
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 2px 14px rgba(26,43,73,0.09), 0 1px 3px rgba(26,43,73,0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        border: "1px solid #f0f2f5",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(244,119,56,0.15)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,43,73,0.09)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Orange gradient header */}
      <div style={{ background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "30px", bottom: "-30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: "0.6px", textTransform: "uppercase" }}>{t("PT_COMMON_TABLE_COL_PT_ID")}</div>
              <div style={{ fontSize: "15px", color: "#ffffff", fontWeight: "800", letterSpacing: "0.2px", marginTop: "2px" }}>{property?.propertyId}</div>
            </div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
            {t(statusStyle.label)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 12px", flex: 1 }}>
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label={t("PT_COMMON_TABLE_COL_OWNER_NAME")}
          value={ownerNames}
        />
        {mobileNo && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
            label={t("CORE_COMMON_MOBILE_NUMBER") || "Mobile"}
            value={mobileNo}
          />
        )}
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          label={t("PT_COMMON_COL_ADDRESS")}
          value={addressLine}
        />

        {/* Due Amount banner */}
        {hasBill && (
          <div style={{ padding: "10px 14px", background: "linear-gradient(135deg, #fff7ed 0%, #fff3e6 100%)", borderRadius: "10px", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span style={{ fontSize: "12px", color: "#92400e", fontWeight: "600" }}>{t("PT_TOTAL_DUE_AMOUNT") || "Total Due"}</span>
            </div>
            <span style={{ fontSize: "16px", color: "#c2410c", fontWeight: "800" }}>₹ {Number(totalDue || 0).toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{ padding: "0 20px 18px 20px", display: "flex", gap: "10px" }}>
        {isMutation ? (
          <button
            onClick={() => onSubmit(cardData)}
            style={{ flex: 1, height: "40px", background: "transparent", border: "2px solid #f47738", borderRadius: "10px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {actionButtonLabel || t("CS_VIEW_DETAILS")}
          </button>
        ) : (
          <React.Fragment>
            <Link to={`/suda-ui/citizen/pt/property/properties/${property?.propertyId}`} style={{ flex: 1, textDecoration: "none" }}>
              <button
                style={{ width: "100%", height: "40px", background: "transparent", border: "2px solid #f47738", borderRadius: "10px", color: "#f47738", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s, color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f47738"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f47738"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {t("PT_VIEW_DETAILS")}
              </button>
            </Link>
            {hasBill && (
              <button
                onClick={() => onSubmit(cardData)}
                style={{ flex: 1, height: "40px", background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(244,119,56,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(244,119,56,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(244,119,56,0.35)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {t("COMMON_MAKE_PAYMENT")}
              </button>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};


const PropertySearchResults = ({ template, header, actionButtonLabel, isMutation, onSelect, config, clearParams = () => {} }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const { mobileNumber, propertyIds, oldPropertyIds, locality, city,doorNo,name, PToffset } = Digit.Hooks.useQueryParams();
  let filters = {};
  const [modalData, setShowModal] = useState(false);

  let OfsetForSearch = PToffset;
  let t1;
  let off;
  if (!isNaN(parseInt(OfsetForSearch))) {
    off = OfsetForSearch;
    t1 = parseInt(OfsetForSearch) + 5;
  } else {
    t1 = 5;
  }
  let filter1 = !isNaN(parseInt(OfsetForSearch))
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off ,status:"ACTIVE"}
    : { limit: "5", sortOrder: "ASC", sortBy: "createdTime", offset: "0",status:"ACTIVE" };

  const closeModal = () => {
    setShowModal(false);
  };
  Digit.Hooks.useClickOutside(modalRef, closeModal, modalData);

  if (mobileNumber) filters.mobileNumber = mobileNumber;
  if (propertyIds) filters.propertyIds = propertyIds;
  if (oldPropertyIds) filters.oldPropertyIds = oldPropertyIds;
  if (locality) filters.locality = locality;
  if (doorNo) filters.doorNo = doorNo;
  if (name) filters.name = name;
  filters.limit = filter1.limit;
  filters.sortOrder = filter1.sortOrder;
  filters.sortBy = filter1.sortBy;
  filters.offset = filter1.offset;
  filters.status = filter1.status;


  const [owners, setOwners, clearOwners] = Digit.Hooks.useSessionStorage("PT_MUTATE_MULTIPLE_OWNERS", null);
  // const [params, setParams, ] = Digit.Hooks.useSessionStorage("PT_MUTATE_PROPERTY");
  const [lastPath, setLastPath, clearLastPath] = Digit.Hooks.useSessionStorage("PT_MUTATE_MULTIPLE_OWNERS_LAST_PATH", null);

  useEffect(() => {
    setOwners([]);
    clearParams();
    setLastPath("");
  }, []);

  // const auth = !!isMutation;    /*  to enable open search set false  */
  const auth =true;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const searchArgs = city ? { tenantId: city, filters, auth } : { filters, auth };
  const result = Digit.Hooks.pt.usePropertySearch(searchArgs);
  const consumerCode = result?.data?.Properties?.map((a) => a.propertyId).join(",");

  let fetchBillParams = mobileNumber ? { mobileNumber, consumerCode } : { consumerCode };

  if (window.location.href.includes("/search-results")) fetchBillParams = { consumerCode };

  const paymentDetails = Digit.Hooks.useFetchBillsForBuissnessService(
    { businessService: "PT", ...fetchBillParams, tenantId: city },
    {
      enabled: consumerCode ? true : false,
      retry: false,
    }
  );

  const history = useHistory();

  const proceedToPay = (data) => {
    history.push(`/suda-ui/citizen/payment/my-bills/PT/${data.property_id}`, { tenantId });
  };

  if (paymentDetails.isLoading || result.isLoading) {
    return <Loader />;
  }

  if (result.error || !consumerCode) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)", maxWidth: "480px", width: "100%" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>{t("CS_PT_NO_PROPERTIES_FOUND")}</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    if (isMutation) {
      let property = result?.data?.Properties?.filter?.((e) => e.propertyId === data.property_id)[0];
      if (Number(data.total_due) > 0) {
        setShowModal(data);
      } else onSelect(config.key, { data, property });
    } else history.push(`/suda-ui/citizen/payment/my-bills/PT/${data.property_id}`, { tenantId });
  };

  const payment = {};

  paymentDetails?.data?.Bill?.forEach((element) => {
    if (element?.consumerCode) {
      payment[element?.consumerCode] = {
        total_due: element?.totalAmount,
        bil_due__date: new Date(element?.billDetails?.[0]?.expiryDate).toDateString(),
      };
    }
  });

  const arr = isMutation ? result?.data?.Properties?.filter((e) => e.status === "ACTIVE") : result?.data?.Properties;
  const count = arr?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", padding: "24px 16px 40px" }}>

      {/* Page header */}
      <div style={{ maxWidth: "960px", margin: "0 auto 28px auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a2b49", letterSpacing: "-0.3px" }}>
              {header || t("CS_SEARCH_RESULTS")}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {count > 0 ? `${count} ${t("PT_PROPERTIES_FOUND") || "properties found"}` : t("PT_NO_PROP_FOUND_MSG")}
            </p>
          </div>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(244,119,56,0.1)", borderRadius: "20px", border: "1px solid rgba(244,119,56,0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f47738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f47738" }}>{count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Property cards grid */}
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {count > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {arr.map((property, index) => (
              <SearchPropertyCard
                key={property.propertyId || index}
                property={property}
                payment={payment}
                onSubmit={onSubmit}
                isMutation={isMutation}
                actionButtonLabel={actionButtonLabel}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 2px 12px rgba(26,43,73,0.07)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #f0f4ff 0%, #fef6f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700", color: "#1a2b49" }}>{t("PT_NO_PROP_FOUND_MSG")}</p>
          </div>
        )}

        {/* Load more */}
        {count !== 0 && (count === 5 || count === 50) && (
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link
              to={`/suda-ui/citizen/pt/property/search-results?mobileNumber=${mobileNumber || ""}&propertyIds=${propertyIds || ""}&oldPropertyIds=${oldPropertyIds || ""}&doorNo=${doorNo || ""}&name=${name || ""}&city=${city || ""}&locality=${locality || ""}&PToffset=${t1}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{ padding: "12px 32px", background: "transparent", border: "2px solid #1a2b49", borderRadius: "12px", color: "#1a2b49", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "background 0.15s, color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a2b49"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a2b49"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                </svg>
                {t("PT_LOAD_MORE_MSG")}
              </button>
            </Link>
          </div>
        )}

        {/* Mutation info label */}
        {isMutation && count !== 0 && (
          <CitizenInfoLabel
            info={t("CS_FILE_APPLICATION_INFO_LABEL")}
            text={t("PT_CANNOT_TRANSFER_IF_AMOUNT_PENDING")}
          />
        )}
      </div>

      {/* Mutation pending dues modal */}
      {modalData ? (
        <Modal
          hideSubmit={true}
          isDisabled={false}
          popupStyles={{ width: "319px", height: "250px", margin: "auto" }}
          formId="modal-action"
        >
          <div ref={modalRef}>
            <KeyNote
              keyValue={t("PT_AMOUNT_DUE")}
              note={`₹ ${modalData?.total_due?.toLocaleString("en-IN")}`}
              noteStyle={{ fontSize: "24px", fontWeight: "bold" }}
            />
            <p>
              {t("PT_YOU_HAVE") +
                " " +
                "₹" +
                " " +
                modalData?.total_due.toLocaleString("en-IN") +
                " " +
                t("PT_PENDING_AMOUNT") +
                " " +
                t("PT_INORDER_TO_TRANSFER")}
            </p>
            <SubmitBar
              submit={false}
              onSubmit={() => proceedToPay(modalData)}
              style={{ marginTop: "14px", width: "100%" }}
              label={t("PT_PROCEED_PAYMENT")}
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

PropertySearchResults.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string,
};

PropertySearchResults.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null,
};

export default PropertySearchResults;
