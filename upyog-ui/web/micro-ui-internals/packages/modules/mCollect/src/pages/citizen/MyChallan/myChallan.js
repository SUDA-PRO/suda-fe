import React from "react";
import { Header, ResponseComposer, Loader } from "@upyog/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MyChallanResult = ({ template, header, actionButtonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const filters = {};
  const userInfo = Digit.UserService.getUser();
  const tenantId = userInfo?.info?.tenantId;

  filters.mobileNumber = userInfo?.info?.mobileNumber;

  const result = Digit.Hooks.mcollect.useMcollectSearchBill({ tenantId, filters });

  if (result.isLoading) {
    return <Loader />;
  }

  const onSubmit = (data) => {
   history.push(`/suda-ui/citizen/payment/my-bills/${data?.businesService}/${data?.ChannelNo}?workflow=mcollect`);
  };

  const payment = {};
  function getBillingPeriod(fromPeriod, toPeriod) {
    if (fromPeriod && toPeriod) {
      let from =
        new Date(fromPeriod).getDate() +
        " " +
        Digit.Utils.date.monthNames[new Date(fromPeriod).getMonth()] +
        " " +
        new Date(fromPeriod).getFullYear();
      let to =
        new Date(toPeriod).getDate() + " " + Digit.Utils.date.monthNames[new Date(toPeriod).getMonth()] + " " + new Date(toPeriod).getFullYear();
      return from + " - " + to;
    } else return "N/A";
  }

  /* paymentDetails?.data?.Bill?.forEach((element) => {
    if (element?.consumerCode) {
      payment[element?.consumerCode] = {
        total_due: element?.totalAmount,
        bil_due__date: new Date(element?.billDate).toDateString(),
      };
    }
  }); */

  const searchResults = result?.data?.Bills?.map((bill) => {
    return {
      businesService: bill.businessService,
      total_due:bill.status === "ACTIVE" ? bill.totalAmount : 0 ,
      OwnerName: bill.payerName || t("CS_NA"),
      BillingPeriod: getBillingPeriod(bill.billDetails[0].fromPeriod, bill.billDetails[0].toPeriod),
      //bil_due__date: bill.billDetails[0].expiryDate || 0,
      bil_due__date: `${
        new Date(bill.billDetails[0].expiryDate).getDate().toString() +
        "/" +
        (new Date(bill.billDetails[0].expiryDate).getMonth() + 1).toString() +
        "/" +
        new Date(bill.billDetails[0].expiryDate).getFullYear().toString()
      }`,
      ChannelNo: bill?.consumerCode || t("CS_NA"),
       ServiceCategory: bill.businessService ? t(bill.businessService.split(".")[bill.businessService.split(".").length - 1]) : t("CS_NA"),
    };
  });

  const hasResults = searchResults && searchResults.length > 0;

  return (
    <div style={{ marginTop: "16px" }}>
      <div>
        {hasResults ? (
          <React.Fragment>
            {header && (
              <div style={{
                background: "#EBF5FB",
                borderRadius: "4px",
                padding: "16px 20px",
                marginBottom: "16px",
                width: "70vw",
                boxSizing: "border-box",
              }}>
                <Header style={{ marginLeft: "0", marginBottom: "0" }}>
                  {t(header)} ({searchResults.length})
                </Header>
              </div>
            )}
            <ResponseComposer data={searchResults} template={template} actionButtonLabel={actionButtonLabel} onSubmit={onSubmit} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 4px", color: "#505A5F", fontSize: "14px" }}>
                {t("CS_APPLICATIONS_FOR")}
              </p>
              <p style={{ margin: 0, fontSize: "25px", fontWeight: "600", color: "#0B0C0C" }}>
                {t("UC_COMMON_HEADER")}
              </p>
            </div>
            <div style={{
              textAlign: "center",
              padding: "40px 24px",
              border: "1px solid #D4D4D4",
              borderRadius: "8px",
              background: "#FFFFFF",
              width: "70vw",
              boxSizing: "border-box",
            }}>
              <p style={{ margin: "0 0 16px", color: "#505A5F", fontSize: "16px" }}>
                {t("UC_NOT_ABLE_TO_FIND_BILL_MSG")}
              </p>
              <p style={{ margin: 0 }} className="link">
                <Link to="/suda-ui/citizen/mcollect/search">{t("UC_CLICK_HERE_TO_SEARCH_LINK")}</Link>
              </p>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

MyChallanResult.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string,
};

MyChallanResult.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null,
};

export default MyChallanResult;
