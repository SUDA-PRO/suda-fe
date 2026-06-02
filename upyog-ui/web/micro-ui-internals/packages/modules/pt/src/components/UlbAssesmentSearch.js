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
          <p style={{ textAlign: "center", fontSize: "16px", fontWeight: 600 }}>
            {t("PT_BULK_DEMAND_RESULT_SUCCESS")}: {resultInfo.count} {t("PT_BULK_DEMAND_PROPERTIES_ASSESSED")}
          </p>
          {resultInfo.failed > 0 && (
            <p style={{ textAlign: "center", color: "#d4351c" }}>
              {t("PT_BULK_DEMAND_RESULT_FAILED")}: {resultInfo.failed}
            </p>
          )}
        </Card>
      )}

      {isLoading && <Loader />}
    </React.Fragment>
  );
};

export default UlbAssesmentSearch;