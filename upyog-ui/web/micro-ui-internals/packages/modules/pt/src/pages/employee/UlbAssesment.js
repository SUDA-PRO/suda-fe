import React, { useState } from "react";
import { Toast } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import UlbAssesmentSearch from "../../components/UlbAssesmentSearch";

const UlbAssesment = ({ path }) => {
  const { t } = useTranslation();
  const stateId = Digit.ULBService.getStateId();
  const [showToast, setShowToast] = useState(null);
  const [resultInfo, setResultInfo] = useState(null);

  // Use state-level tenantId for URL param; actual ULB tenantId goes in the request body
  const { isLoading, mutate: assessmentMutate } = Digit.Hooks.pt.UseAssessmentCreateUlb(stateId);

  const closeToast = () => setShowToast(null);

  function onSubmit(payload) {
    setResultInfo(null);
    assessmentMutate(payload, {
      onError: (error) => {
        setShowToast({
          key: "error",
          label: error?.response?.data?.Errors?.[0]?.message || error.message,
        });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data) => {
        const assessed = data?.Assessments?.length || 0;
        setResultInfo({ count: assessed });
        setShowToast({ label: "PT_BULK_DEMAND_SUCCESS" });
        setTimeout(closeToast, 5000);
      },
    });
  }

  return (
    <React.Fragment>
      <UlbAssesmentSearch
        t={t}
        isLoading={isLoading}
        onSubmit={onSubmit}
        resultInfo={resultInfo}
        setShowToast={setShowToast}
      />
      {showToast && (
        <Toast
          error={showToast.key === "error"}
          warning={showToast.key === "warning"}
          label={t(showToast.label)}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default UlbAssesment