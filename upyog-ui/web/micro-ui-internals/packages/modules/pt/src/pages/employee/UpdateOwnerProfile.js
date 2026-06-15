import {
  Localities,
  Loader,
  SearchField,
  SearchForm,
  Table,
  DetailsCard,
  Toast,
  MobileNumber,
  TextInput,
  CardLabel,
  CardLabelError,
} from "@upyog/digit-ui-react-components";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

const defaultSearchValues = {
  locality: null,
  name: "",
  mobileNumber: "",
  propertyId: "",
};

const GetCell = (value) => <span className="cell-text">{value}</span>;

const UpdateOwnerProfile = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [searchPayload, setSearchPayload] = useState({});
  const [showToast, setShowToast] = useState(null);
  const isMobile = window.Digit.Utils.browser.isMobile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultSearchValues,
  });

  const { data, isLoading, error } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: searchPayload,
    },
    {
      enabled: Object.keys(searchPayload).length > 0,
      retry: false,
      retryOnMount: false,
      staleTime: Infinity,
    }
  );

  const onSubmit = useCallback((formValues) => {
    const locality = formValues.locality?.code;
    const name = formValues.name?.trim();
    const mobileNumber = formValues.mobileNumber?.trim();
    const propertyId = formValues.propertyId?.trim();

    if (!locality && !name && !mobileNumber && !propertyId) {
      setShowToast({ warning: true, label: "PT_UPDATE_OWNER_ATLEAST_ONE_FIELD" });
      return;
    }

    const payload = {};
    if (locality) payload.locality = locality;
    if (name) payload.name = name;
    if (mobileNumber) payload.mobileNumber = mobileNumber;
    if (propertyId) payload.propertyIds = propertyId;

    setShowToast(null);
    setSearchPayload(payload);
  }, []);

  const onReset = useCallback(() => {
    reset(defaultSearchValues);
    setSearchPayload({});
    setShowToast(null);
  }, [reset]);

  const columns = useMemo(
    () => [
      {
        Header: t("PT_COMMON_TABLE_COL_PT_ID"),
        disableSortBy: true,
        Cell: ({ row }) => {
          const pid = row.original?.propertyId;
          const ackNo = row.original?.acknowldgementNumber;
          const linkPath = pid
            ? `/suda-ui/employee/pt/ptsearch/property-details/${pid}`
            : `/suda-ui/employee/pt/applicationsearch/application-details/${ackNo}`;
          const label = pid || `${ackNo} (${t("PT_PROPERTY_ID_PENDING_APPROVAL")})`;
          return (
            <span className="link">
              <Link to={linkPath}>{label}</Link>
            </span>
          );
        },
      },
      {
        Header: t("PT_COMMON_TABLE_COL_OWNER_NAME"),
        disableSortBy: true,
        Cell: ({ row }) => {
          const owners = row.original?.owners || [];
          const sorted =
            owners[0]?.additionalDetails !== null
              ? owners.sort(
                  (a, b) =>
                    a?.additionalDetails?.ownerSequence -
                    b?.additionalDetails?.ownerSequence
                )
              : owners;
          return GetCell(sorted.map((o) => o.name).join(", ") || t("PT_NA"));
        },
      },
      {
        Header: t("PT_HOME_SEARCH_RESULTS_OWN_MOB_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          const owners = (row.original?.owners || []).filter(
            (o) => o.status === "ACTIVE"
          );
          return GetCell(owners.map((o) => o.mobileNumber).join(", ") || t("PT_NA"));
        },
      },
      {
        Header: t("ES_INBOX_LOCALITY"),
        disableSortBy: true,
        Cell: ({ row }) => GetCell(t(row.original?.locality) || t("PT_NA")),
      },
      {
        Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => GetCell(t(row.original?.status || "NA")),
      },
      {
        Header: t("ES_SEARCH_ACTION"),
        disableSortBy: true,
        Cell: ({ row }) => {
          const pid = row.original?.propertyId;
          return pid ? (
            <button
              onClick={() =>
                history.push(
                  `/suda-ui/employee/pt/modify-application/${pid}?from=PT_UPDATE_OWNER_PROFILE`
                )
              }
              style={{
                background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 20px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(244,119,56,0.35)",
                letterSpacing: "0.3px",
                whiteSpace: "nowrap",
                transition: "transform 0.1s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(244,119,56,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(244,119,56,0.35)";
              }}
            >
              ✎ {t("ES_COMMON_EDIT")}
            </button>
          ) : (
            GetCell(t("PT_NA"))
          );
        },
      },
    ],
    [t, history]
  );

  const tableData = useMemo(() => data?.Properties || [], [data]);

  const cardData = useMemo(
    () =>
      tableData.map((dataObj) => {
        const obj = {};
        columns.forEach((col) => {
          if (col.Cell) obj[col.Header] = col.Cell({ row: { original: dataObj } });
        });
        return obj;
      }),
    [tableData, columns]
  );

  return (
    <React.Fragment>
      {/* ── Page Header Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #f47738 0%, #e05a1a 60%, #bf4210 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        boxShadow: "0 4px 20px rgba(244,119,56,0.30)",
      }}>
        <div style={{
          width: "54px", height: "54px", borderRadius: "14px",
          background: "rgba(255,255,255,0.2)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
            Property Tax
          </div>
          <div style={{ color: "#fff", fontSize: "22px", fontWeight: "800", lineHeight: "1.2" }}>
            {t("PT_UPDATE_OWNER_PROFILE_HEADER")}
          </div>
        </div>
      </div>

      {/* ── Search Card ── */}
      <div className="uop-search-card" style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #ffe0cc",
        boxShadow: "0 2px 12px rgba(244,119,56,0.08)",
        padding: "16px 20px 12px 20px",
        marginBottom: "24px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          borderLeft: "4px solid #f47738", paddingLeft: "12px",
          marginBottom: "20px",
        }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#c0440a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("PT_SEARCH_PROPERTY")}
          </span>
        </div>

        <SearchForm onSubmit={handleSubmit(onSubmit)} handleSubmit={handleSubmit}>
          <SearchField>
            <CardLabel>{t("PT_SEARCH_LOCALITY")}</CardLabel>
            <Controller
              name="locality"
              control={control}
              render={(props) => (
                <Localities
                  t={t}
                  tenantId={tenantId}
                  boundaryType="revenue"
                  keepNull={false}
                  optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
                  disableLoader={true}
                  selected={props.value}
                  selectLocality={(val) => props.onChange(val)}
                />
              )}
            />
          </SearchField>

          <SearchField>
            <CardLabel>{t("PT_SEARCHPROPERTY_TABEL_OWNERNAME")}</CardLabel>
            <TextInput
              name="name"
              inputRef={register({
                minLength: { value: 3, message: "PT_MIN_3CHAR" },
                pattern: { value: /^[a-zA-Z ]+$/, message: "PAYMENT_INVALID_NAME" },
              })}
              placeholder={t("PT_SEARCH_OWNER_NAME_PLACEHOLDER")}
            />
            {errors?.name && (
              <CardLabelError>{t(errors.name.message)}</CardLabelError>
            )}
          </SearchField>

          <SearchField>
            <CardLabel>{t("PT_COMMON_TABLE_COL_PT_ID")}</CardLabel>
            <TextInput
              name="propertyId"
              inputRef={register()}
              placeholder={t("PT_SEARCH_PROPERTY_ID_PLACEHOLDER", "Enter Property ID")}
            />
          </SearchField>

          <SearchField>
            <CardLabel>{t("PT_HOME_SEARCH_RESULTS_OWN_MOB_LABEL")}</CardLabel>
            <MobileNumber
              name="mobileNumber"
              inputRef={register({
                minLength: { value: 10, message: "CORE_COMMON_MOBILE_ERROR" },
                maxLength: { value: 10, message: "CORE_COMMON_MOBILE_ERROR" },
                pattern: {
                  value: /^[6789][0-9]{9}$/,
                  message: "CORE_COMMON_MOBILE_ERROR",
                },
              })}
              placeholder={t("PT_HOME_SEARCH_RESULTS_OWN_MOB_PLACEHOLDER")}
              type="number"
            />
            {errors?.mobileNumber && (
              <CardLabelError>{t(errors.mobileNumber.message)}</CardLabelError>
            )}
          </SearchField>

          <SearchField className="submit" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", width: "100%" }}>
              <button
                type="button"
                onClick={onReset}
                style={{
                  cursor: "pointer",
                  background: "#e8eaed",
                  color: "#5f6368",
                  border: "1px solid #d0d5dd",
                  borderRadius: "8px",
                  width: "130px",
                  height: "42px",
                  fontSize: "13px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#d9dde3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#e8eaed"; }}
              >
                {t("ES_COMMON_CLEAR_SEARCH")}
              </button>
              <button
                type="submit"
                style={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #f47738 0%, #e05a1a 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  width: "130px",
                  height: "42px",
                  fontSize: "13px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {t("ES_COMMON_SEARCH")}
              </button>
            </div>
          </SearchField>
        </SearchForm>
      </div>

      {/* ── Results ── */}
      {Object.keys(searchPayload).length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #ffe0cc",
          boxShadow: "0 2px 12px rgba(244,119,56,0.08)",
          padding: "24px 28px",
          marginBottom: "24px",
          overflowX: "auto",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            borderLeft: "4px solid #f47738", paddingLeft: "12px",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#c0440a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {t("PT_SEARCH_RESULTS_TABLE_HEADER")}
            </span>
          </div>

          {isLoading ? (
            <Loader />
          ) : error ? (
            (() => {
              if (!showToast)
                setShowToast({
                  error: true,
                  label:
                    error?.response?.data?.Errors?.[0]?.code ||
                    "PT_COMMON_UNEXPECTED_ERROR",
                });
              return null;
            })()
          ) : tableData.length === 0 ? (
            <p style={{ margin: "16px 0", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
              {t("PT_COMMON_NO_DATA")}
            </p>
          ) : isMobile ? (
            <DetailsCard data={cardData} t={t} />
          ) : (
            <div className="uop-table-wrap">
              <Table
                t={t}
                data={tableData}
                totalRecords={tableData.length}
                columns={columns}
                getCellProps={() => ({
                  style: { padding: "14px 16px", fontSize: "13.5px" },
                })}
                manualPagination={false}
                disableSort={true}
              />
            </div>
          )}
        </div>
      )}

      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => setShowToast(null)}
        />
      )}
    </React.Fragment>
  );
};

export default UpdateOwnerProfile;

