import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Header, SearchForm, SearchField, Dropdown, SubmitBar, Loader, Card } from "@upyog/digit-ui-react-components";

const modeButtonStyle = (active) => ({
  padding: "8px 24px",
  borderRadius: "4px",
  border: "2px solid #F47738",
  background: active ? "#F47738" : "#fff",
  color: active ? "#fff" : "#F47738",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
});

function downloadCSV(assessments, t) {
  const headers = ["Property ID", "Assessment No.", "Financial Year", "Status", "Assessment Date"];
  const rows = assessments.map((a) => [
    a.propertyId || "",
    a.assessmentNumber || "",
    a.financialYear || "",
    a.status || "",
    a.assessmentDate ? new Date(a.assessmentDate).toLocaleDateString("en-IN") : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bulk-demand-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const UlbAssesmentSearch = ({ t, isLoading, onSubmit, resultInfo, setShowToast }) => {
  const stateId = Digit.ULBService.getStateId();

  const [assessmentMode, setAssessmentMode] = useState("ULB");
  const [selectedTenantCode, setSelectedTenantCode] = useState(null);

  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { tenant: null, ward: null, financialYear: null },
  });

  const watchedTenant = watch("tenant");

  useEffect(() => {
    setSelectedTenantCode(watchedTenant?.code || null);
    setValue("ward", null);
  }, [watchedTenant]);

  // Tenants list from PT session data
  const tenants = Digit.Hooks.pt.useTenants();
  const tenantOptions =
    tenants
      ?.filter((tn) => tn.code !== stateId)
      ?.map((tn) => ({ code: tn.code, i18nKey: tn.city?.name || tn.code })) || [];

  // Financial Years from MDMS (PT module)
  const { data: fyMDMS } = Digit.Hooks.useCustomMDMS(stateId, "egf-master", [
    { name: "FinancialYear", filter: "[?(@.module == 'PT')]" },
  ]);
  const financialYearOptions =
    fyMDMS?.["egf-master"]?.FinancialYear?.map((fy) => ({ code: fy.code, i18nKey: fy.code })) || [];

  // Ward/Locality list from boundary MDMS for the selected tenant
  const { data: boundaryData, isLoading: boundaryLoading } = Digit.Hooks.useCustomMDMS(
    selectedTenantCode || stateId,
    "egov-location",
    [{ name: "TenantBoundary" }],
    { enabled: !!selectedTenantCode }
  );
  const wardOptions =
    boundaryData?.["egov-location"]?.TenantBoundary?.[0]?.boundary?.children?.map((w) => ({
      code: w.code,
      i18nKey: w.name,
    })) || [];

  function handleFormSubmit(data) {
    if (!data.tenant || !data.financialYear) {
      setShowToast({ key: "warning", label: "PT_BULK_DEMAND_FILL_REQUIRED_FIELDS" });
      return;
    }
    if (assessmentMode === "WARD" && !data.ward) {
      setShowToast({ key: "warning", label: "PT_BULK_DEMAND_SELECT_WARD" });
      return;
    }
    const payload = {
      tenantId: data.tenant.code,
      assessmentYear: data.financialYear.code,
      ...(assessmentMode === "WARD" && data.ward ? { locality: [data.ward.code] } : {}),
    };
    onSubmit(payload);
  }

  function handleReset() {
    reset({ tenant: null, ward: null, financialYear: null });
    setSelectedTenantCode(null);
    setAssessmentMode("ULB");
  }

  return (
    <React.Fragment>
      <Header>{t("PT_CREATE_BULK_DEMAND")}</Header>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "12px", margin: "16px 0 24px 8px" }}>
        <button type="button" style={modeButtonStyle(assessmentMode === "ULB")}
          onClick={() => { setAssessmentMode("ULB"); setValue("ward", null); }}>
          {t("PT_BULK_MODE_ULB_WISE")}
        </button>
        <button type="button" style={modeButtonStyle(assessmentMode === "WARD")}
          onClick={() => setAssessmentMode("WARD")}>
          {t("PT_BULK_MODE_WARD_WISE")}
        </button>
      </div>

      <SearchForm onSubmit={handleSubmit(handleFormSubmit)} handleSubmit={handleSubmit}>
        {/* ULB Dropdown */}
        <SearchField>
          <label>{t("PT_BULK_DEMAND_SELECT_ULB")} *</label>
          <Controller
            control={control}
            name="tenant"
            render={(props) => (
              <Dropdown
                selected={props.value}
                select={props.onChange}
                onBlur={props.onBlur}
                option={tenantOptions}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </SearchField>

        {/* Ward Dropdown — only in WARD mode */}
        {assessmentMode === "WARD" && (
          <SearchField>
            <label>{t("PT_BULK_DEMAND_SELECT_WARD")} *</label>
            <Controller
              control={control}
              name="ward"
              render={(props) =>
                boundaryLoading ? (
                  <Loader />
                ) : (
                  <Dropdown
                    selected={props.value}
                    select={props.onChange}
                    onBlur={props.onBlur}
                    option={wardOptions}
                    optionKey="i18nKey"
                    t={t}
                    disable={!selectedTenantCode || wardOptions.length === 0}
                  />
                )
              }
            />
          </SearchField>
        )}

        {/* Financial Year Dropdown */}
        <SearchField>
          <label>{t("PT_BULK_DEMAND_SELECT_FY")} *</label>
          <Controller
            control={control}
            name="financialYear"
            render={(props) => (
              <Dropdown
                selected={props.value}
                select={props.onChange}
                onBlur={props.onBlur}
                option={financialYearOptions}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </SearchField>

        <SearchField className="submit">
          <SubmitBar label={t("PT_GENERATE_DEMAND")} submit disabled={isLoading} />
          <p style={{ marginTop: "10px", cursor: "pointer" }} onClick={handleReset}>
            {t("ES_COMMON_CLEAR_ALL")}
          </p>
        </SearchField>
      </SearchForm>

      {/* Result summary after generation */}
      {resultInfo && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
              {t("PT_BULK_DEMAND_RESULT_SUCCESS")}: {resultInfo.count} {t("PT_BULK_DEMAND_PROPERTIES_ASSESSED")}
            </p>
            {resultInfo.assessments?.length > 0 && (
              <button
                type="button"
                onClick={() => downloadCSV(resultInfo.assessments, t)}
                style={{
                  padding: "8px 18px",
                  background: "#F47738",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                ⬇ {t("PT_BULK_DEMAND_DOWNLOAD_CSV")}
              </button>
            )}
          </div>
          {resultInfo.failed > 0 && (
            <p style={{ color: "#d4351c", marginTop: 8 }}>
              {t("PT_BULK_DEMAND_RESULT_FAILED")}: {resultInfo.failed}
            </p>
          )}
          {resultInfo.assessments?.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#fbe9d8", textAlign: "left" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>{t("PT_PROPERTY_ID")}</th>
                    <th style={thStyle}>{t("PT_ASSESSMENT_NO")}</th>
                    <th style={thStyle}>{t("PT_COMMON_TABLE_COL_FIN_YEAR")}</th>
                    <th style={thStyle}>{t("PT_STATUS")}</th>
                    <th style={thStyle}>{t("PT_ASSESSMENT_DATE")}</th>
                  </tr>
                </thead>
                <tbody>
                  {resultInfo.assessments.map((a, i) => (
                    <tr key={a.id || i} style={{ borderBottom: "1px solid #e0e0e0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{a.propertyId}</td>
                      <td style={tdStyle}>{a.assessmentNumber}</td>
                      <td style={tdStyle}>{a.financialYear}</td>
                      <td style={tdStyle}>
                        <span style={{ color: a.status === "ACTIVE" ? "#00703c" : "#d4351c", fontWeight: 600 }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {a.assessmentDate ? new Date(a.assessmentDate).toLocaleDateString("en-IN") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {isLoading && <Loader />}
    </React.Fragment>
  );
};

const thStyle = { padding: "10px 12px", fontWeight: 600, whiteSpace: "nowrap" };
const tdStyle = { padding: "8px 12px" };

export default UlbAssesmentSearch;