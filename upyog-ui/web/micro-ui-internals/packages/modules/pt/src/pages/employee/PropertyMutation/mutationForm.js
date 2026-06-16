import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Toast } from "@upyog/digit-ui-react-components";
import { newConfigMutate } from "../../../config/Mutate/config";
import { useHistory } from "react-router-dom";

const MutationForm = ({ applicationData, tenantId }) => {
  const { t } = useTranslation();
  const [canSubmit, setSubmitValve] = useState(false);

  const { data: mutationDocs, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "PropertyTax", "MutationDocuments");
  const defaultValues = {
    originalData: applicationData,
  };

  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", {});

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
  }, []);

  const history = useHistory();

  const onFormValueChange = (setValue, formData, formState) => {
    setSubmitValve(!Object.keys(formState.errors).length);
    if (!Object.keys(formState.errors).length) {
      let { additionalDetails } = formData;
      let {
        documentDate,
        documentNumber,
        documentValue,
        marketValue,
        reasonForTransfer,
      } = additionalDetails;
      setSubmitValve(
        !(
          !documentDate ||
          !documentNumber ||
          !documentValue ||
          !marketValue ||
          !reasonForTransfer
        )
      );
    }
    if (formData?.ownershipCategory?.code?.includes?.("MULTIPLE")) {
      if (formData?.owners?.length < 2) setSubmitValve(false);
    }
  };

  const onSubmit = (data) => {
    data.originalData.owners = data.originalData?.owners?.filter((owner) => owner.status == "ACTIVE");
    let { additionalDetails } = data;
    let prevDocs =
      data?.originalData?.documents?.filter(
        (oldDoc) => !mutationDocs?.PropertyTax?.MutationDocuments.some((mut) => oldDoc.documentType.includes(mut.code))
      ) || [];
    const submitData = {
      Property: {
        ...data.originalData,
        creationReason: "MUTATION",
        owners: [
          ...data.originalData?.owners?.map((e) => ({
            ...e,
            landlineNumber: data.owners[0].altContactNumber,
            altContactNumber: data.owners[0].altContactNumber,
            status: "INACTIVE",
          })),
          ...data.owners.map((owner,index) => {
            let obj = {};
            let gender = owner.gender.code;
            let ownerType = owner.ownerType.code;
            let relationship = owner.relationship.code;
            let additionalDetails= {ownerSequence:index, ownerName:owner?.name}
            obj.documents = [data?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF"))];
            if (owner.documents) {
              let { documentUid, documentType } = owner.documents;
              obj.documents = [...obj.documents, { documentUid, documentType: documentType.code, fileStoreId: documentUid }];
            }
            return {
              ...owner,
              gender,
              ownerType,
              relationship,
              inistitutetype: owner?.institution?.type?.code,
              landlineNumber: owner?.altContactNumber,
              ...obj,
              status: "ACTIVE",
              additionalDetails
            };
          }),
        ],
        additionalDetails: {
          ...additionalDetails,
          isMutationInCourt: additionalDetails.isMutationInCourt?.code,
          reasonForTransfer: additionalDetails?.reasonForTransfer.code,
          isPropertyUnderGovtPossession: additionalDetails?.isPropertyUnderGovtPossession?.code,
          documentDate: new Date(additionalDetails?.documentDate).getTime(),
          marketValue: Number(additionalDetails?.marketValue),
          owners: [
            ...data.originalData?.owners?.map((e) => ({
              ...e,
              landlineNumber: data.owners[0].altContactNumber,
              altContactNumber: data.owners[0].altContactNumber,
              status: "INACTIVE",
            })),
            ...data.owners.map((owner,index) => {
              let obj = {};
              let gender = owner.gender.code;
              let ownerType = owner.ownerType.code;
              let relationship = owner.relationship.code;
              let additionalDetails= {ownerSequence:index, ownerName:owner?.name}
              obj.documents = [data?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF"))];
              if (owner.documents) {
                let { documentUid, documentType } = owner.documents;
                obj.documents = [...obj.documents, { documentUid, documentType: documentType.code, fileStoreId: documentUid }];
              }
              return {
                ...owner,
                gender,
                ownerType,
                relationship,
                inistitutetype: owner?.institution?.type?.code,
                landlineNumber: owner?.altContactNumber,
                ...obj,
                status: "ACTIVE",
                additionalDetails
              };
            }),
          ],
        },
        ownershipCategory: data.ownershipCategory.code,
        documents: [
          ...prevDocs,
          ...data?.documents?.documents.map((e) =>
            e.documentType.includes("OWNER.TRANSFERREASONDOCUMENT") ? { ...e, documentType: e.documentType.split(".")[2] } : e
          ),
        ],
        workflow: { action: "OPEN", businessService: "PT.MUTATION", moduleName: "PT", tenantId: data.originalData.tenantId },
      },
    };

    if (!submitData.Property.ownershipCategory.includes("INDIVIDUAL")) {
      submitData.Property.institution = {
        nameOfAuthorizedPerson: data.owners[0].name,
        name: data.owners[0].institution.name,
        designation: data.owners[0].designation,
        tenantId: data.originalData.tenantId,
        type: data.owners[0].institution.type.code,
      };
    }
    else {
      submitData.Property.institution=null;
    }
    history.replace("/suda-ui/employee/pt/response", { Property: submitData.Property, key: "UPDATE", action: "SUBMIT" });
  };

  const configs = newConfigMutate;

  return (
    <React.Fragment>
      <style>{`
        /* ── Outer FormComposer card — transparent shell ── */
        .pt-mutation-outer-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }

        /* ── Section header: colored gradient strip ── */
        .pt-mutation-section .card-section-header {
          background: linear-gradient(135deg, #f47738 0%, #e05a1a 100%) !important;
          color: #fff !important;
          padding: 14px 20px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin: 0 !important;
          border-radius: 0 !important;
        }

        /* ── Section body: flex column with even gap ── */
        .pt-mutation-section {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.07);
          border: 1px solid #e8ecf0;
          margin-bottom: 20px;
          overflow: hidden;
        }

        /* wrap all label-field-pairs in a flex column container */
        .pt-mutation-section > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 24px 28px;
        }

        /* card body padding */
        .pt-mutation-section {
          padding-bottom: 0 !important;
        }

        /* every label-field-pair: fixed padding on all sides */
        .pt-mutation-section .label-field-pair {
          margin: 0 !important;
          padding: 16px 20px 0 20px !important;
          box-sizing: border-box !important;
        }

        /* first field: bigger top gap from header */
        .pt-mutation-section .label-field-pair:first-of-type {
          padding-top: 20px !important;
        }

        /* last field: bottom breathing room */
        .pt-mutation-section .label-field-pair:last-of-type {
          padding-bottom: 20px !important;
        }

        /* kill all internal bottom margins so only label-field-pair margin controls spacing */
        .pt-mutation-section .field,
        .pt-mutation-section .field > *,
        .pt-mutation-section .text-input,
        .pt-mutation-section .employee-card-input,
        .pt-mutation-section input[type="text"],
        .pt-mutation-section input[type="number"],
        .pt-mutation-section input[type="date"],
        .pt-mutation-section input[type="tel"],
        .pt-mutation-section input[type="email"],
        .pt-mutation-section input[type="password"],
        .pt-mutation-section textarea,
        .pt-mutation-section .employee-select-wrap {
          margin-bottom: 0 !important;
          margin-top: 0 !important;
        }

        /* ── Text inputs & textarea ── */
        .pt-mutation-section input[type="text"],
        .pt-mutation-section input[type="number"],
        .pt-mutation-section input[type="date"],
        .pt-mutation-section input[type="tel"],
        .pt-mutation-section input[type="email"],
        .pt-mutation-section input[type="password"],
        .pt-mutation-section input.employee-card-input,
        .pt-mutation-section .employee-card-input,
        .pt-mutation-section textarea {
          border: 1.5px solid #c8d0da !important;
          border-radius: 9px !important;
          padding: 9px 13px !important;
          font-size: 13.5px !important;
          color: #1a202c !important;
          background: #ffffff !important;
          height: auto !important;
          min-height: 40px !important;
          line-height: 1.5 !important;
          margin-bottom: 0 !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
          outline: none !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
        }
        .pt-mutation-section input[type="text"]:focus,
        .pt-mutation-section input[type="number"]:focus,
        .pt-mutation-section input[type="tel"]:focus,
        .pt-mutation-section input[type="email"]:focus,
        .pt-mutation-section input.employee-card-input:focus,
        .pt-mutation-section textarea:focus {
          border-color: #f47738 !important;
          box-shadow: 0 0 0 3px rgba(244,119,56,0.14), inset 0 1px 3px rgba(0,0,0,0.02) !important;
        }

        /* ── UPYOG Dropdown (employee-select-wrap) ── */
        .pt-mutation-section .employee-select-wrap {
          border: 1.5px solid #c8d0da !important;
          border-radius: 9px !important;
          background: #ffffff !important;
          min-height: 40px !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
          overflow: visible !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
          margin-bottom: 0 !important;
        }
        .pt-mutation-section .employee-select-wrap:focus-within {
          border-color: #f47738 !important;
          box-shadow: 0 0 0 3px rgba(244,119,56,0.14) !important;
        }
        .pt-mutation-section .employee-select-wrap .select,
        .pt-mutation-section .employee-select-wrap .select-active {
          border: none !important;
          border-radius: 9px !important;
          background: transparent !important;
          min-height: 38px !important;
          padding: 0 !important;
        }
        .pt-mutation-section .employee-select-wrap input {
          border: none !important;
          background: transparent !important;
          padding: 9px 13px !important;
          font-size: 13.5px !important;
          color: #1a202c !important;
          min-height: 38px !important;
          box-shadow: none !important;
          margin-bottom: 0 !important;
        }
        .pt-mutation-section .employee-select-wrap .employee-select-wrap--elipses {
          padding: 9px 13px !important;
          font-size: 13.5px !important;
          color: #1a202c !important;
          line-height: 1.5 !important;
        }

        /* ── Upload / file buttons ── */
        .pt-mutation-section .upload-input-wrapper,
        .pt-mutation-section .uploader {
          border-radius: 8px !important;
        }

        /* ── Bottom padding on last item in section ── */
        .pt-mutation-section > *:last-child {
          padding-bottom: 16px;
        }
      `}</style>
      <FormComposer
        isDisabled={!canSubmit}
        label={t("ES_COMMON_APPLICATION_SUBMIT")}
        config={configs.map((config) => ({
          ...config,
          body: [
            ...config.body.filter((a) => !a.hideInEmployee),
            {
              withoutLabel: true,
              type: "custom",
              populators: {
                name: "originalData",
                component: (props, customProps) => <React.Fragment />,
              },
            },
          ],
        }))}
        fieldStyle={{ marginRight: 0 }}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        onFormValueChange={onFormValueChange}
        sectionWrapperClass="pt-mutation-section"
        cardClassName="pt-mutation-outer-card"
        noBoxShadow
      />
    </React.Fragment>
  );
};

export default MutationForm;
