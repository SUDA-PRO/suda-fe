import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Header,
  ActionLinks,
  Card,
  CardSectionHeader,
  ConnectingCheckPoints,
  CheckPoint,
  KeyNote,
  SubmitBar,
  LinkButton,
  Loader,
  Rating,
} from "@upyog/digit-ui-react-components";
import _ from "lodash";
import TLCaption from "./TLCaption";

export const ApplicationTimeline = (props) => {
  const { t } = useTranslation();
  const { isLoading, data } = Digit.Hooks.useWorkflowDetails({
    tenantId: props.application?.tenantId,
    id: props.id,
    moduleCode: "FSM",
  });
  const [showAllTimeline, setShowAllTimeline]=useState(false);
  const getTimelineCaptions = (checkpoint) => {
    const __comment = checkpoint?.comment?.split("~");
    const reason = __comment ? __comment[0] : null;
    const reason_comment = __comment ? __comment[1] : null;
    if (checkpoint.status === "CREATED") {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        source: props.application?.source || "",
      };
      return <TLCaption data={caption} />;
    } else if (
      checkpoint.status === "PENDING_APPL_FEE_PAYMENT" ||
      checkpoint.status === "DSO_REJECTED" ||
      checkpoint.status === "CANCELED" ||
      checkpoint.status === "REJECTED"
    ) {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        name: checkpoint?.assigner,
        comment: reason ? t(`ES_ACTION_REASON_${reason}`) : null,
        otherComment: reason_comment ? reason_comment : null,
      };
      return <TLCaption data={caption} />;
    } else if (checkpoint.status === "CITIZEN_FEEDBACK_PENDING") {
      return (
        <>
          {data?.nextActions.length > 0 && (
            <div>
              <Link to={`/suda-ui/citizen/fsm/rate/${props.id}`}>
                <ActionLinks>{t("CS_FSM_RATE")}</ActionLinks>
              </Link>
            </div>
          )}
        </>
      );
    } else if (checkpoint.status === "DSO_INPROGRESS") {
      const caption = {
        name: checkpoint?.assigner,
        mobileNumber: props.application?.dsoDetails?.mobileNumber,
        date: `${t("CS_FSM_EXPECTED_DATE")} ${Digit.DateUtils.ConvertTimestampToDate(props.application?.possibleServiceDate)}`,
      };
      return <TLCaption data={caption} />;
    } else if (checkpoint.status === "COMPLETED") {
      return (
        <div>
          <Rating withText={true} text={t(`CS_FSM_YOU_RATED`)} currentRating={checkpoint.rating} />
          <Link to={`/suda-ui/citizen/fsm/rate-view/${props.id}`}>
            <ActionLinks>{t("CS_FSM_RATE_VIEW")}</ActionLinks>
          </Link>
        </div>
      );
    } else if (checkpoint.status === "DISPOSAL_IN_PROGRESS") {
      const caption = {
        date: checkpoint?.auditDetails?.created,
        name: checkpoint?.assigner,
        mobileNumber: checkpoint?.assigner?.mobileNumber,
      };
      if (checkpoint?.numberOfTrips) caption.comment = `${t("NUMBER_OF_TRIPS")}: ${checkpoint?.numberOfTrips}`;
      return <TLCaption data={caption} />;
    }
    else if (checkpoint.status === "PENDING_PAYYY") {
      const caption = {
        name: checkpoint?.assigner,
        mobileNumber: checkpoint?.assigner?.mobileNumber,
        date: `${t("CS_FSM_EXPECTED_DATE")} ${Digit.DateUtils.ConvertTimestampToDate(props.application?.possibleServiceDate)}`,
      };
      return <TLCaption data={caption} />;
  };
}

  const showNextActions = (nextAction) => {
    switch (nextAction?.action) {
      case "PAY":
        return (
          <div style={{ marginTop: "24px" }}>
            <Link
              to={{
                pathname: `/suda-ui/citizen/payment/my-bills/FSM.TRIP_CHARGES/${props.id}/?tenantId=${props.application.tenantId}`,
                state: { tenantId: props.application.tenantId },
              }}
            >
              {window.location.href.includes("citizen/fsm/") && <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} />}
            </Link>
          </div>
        );
      case "SUBMIT_FEEDBACK":
        return (
          <div style={{ marginTop: "24px" }}>
            <Link to={`/suda-ui/citizen/fsm/rate/${props.id}`}>
              <SubmitBar label={t("CS_APPLICATION_DETAILS_RATE")} />
            </Link>
          </div>
        );
    }
  };

  if (isLoading) {
    return <Loader />;
  }
  const toggleTimeline=()=>{
    setShowAllTimeline((prev)=>!prev);
  }

//   let deepCopy = _.cloneDeep( data )
// let index1 =0
// deepCopy?.timeline.map((check,index) => {
//   if (check.status == "ASSING_DSO" && index1 ==0)
//   {
//       let obj= check
//       obj.status = "PENDING_PAYYY"
//       index1 +=1
//       data.timeline[index].status ="ASSING_DSO_PAY"
//       data.timeline.splice(index, 0, obj);
//   }
// })
  return (
    <React.Fragment>
      {!isLoading && data?.timeline && data.timeline.length > 0 && (
        <div style={{ position: "relative" }}>
          {/* Vertical connector line */}
          <div style={{ position: "absolute", left: "9px", top: "12px", bottom: "12px", width: "2px", background: "linear-gradient(180deg, #22394d 0%, #e2e8f0 100%)", zIndex: 0 }} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.timeline.slice(0, showAllTimeline ? data.timeline.length : 2).map((checkpoint, index, arr) => {
              const isFirst = index === 0;
              const isLast = index === arr.length - 1;
              const prefix = data.timeline.length === 1 ? "CS_COMMON_FSM_" : "CS_COMMON_";
              const updatePart = checkpoint?.performedAction === "UPDATE" ? "UPDATE_" : "";
              const label = t(prefix + updatePart + checkpoint.status);
              return (
                <div key={index} style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative", paddingBottom: isLast ? "0" : "24px" }}>
                  {/* Dot */}
                  <div style={{
                    flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%",
                    background: isFirst ? "#22394d" : "#ffffff",
                    border: isFirst ? "none" : "2px solid #cbd5e1",
                    boxShadow: isFirst ? "0 0 0 4px rgba(34,57,77,0.1)" : "none",
                    zIndex: 1, marginTop: "2px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isFirst && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f47738" }} />}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: isLast ? "4px" : "0" }}>
                    <div style={{
                      display: "inline-block",
                      fontSize: "13px", fontWeight: "700",
                      color: isFirst ? "#ffffff" : "#64748b",
                      background: isFirst ? "#22394d" : "transparent",
                      padding: isFirst ? "3px 10px" : "0",
                      borderRadius: isFirst ? "20px" : "0",
                      marginBottom: "6px",
                    }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                      {getTimelineCaptions(checkpoint)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {data.timeline.length > 2 && (
            <button
              onClick={toggleTimeline}
              style={{ marginTop: "12px", background: "none", border: "1px solid #f47738", borderRadius: "8px", color: "#f47738", fontWeight: "600", cursor: "pointer", fontSize: "12px", padding: "5px 14px" }}
            >
              {showAllTimeline ? t("COLLAPSE") : t("VIEW_TIMELINE")}
            </button>
          )}
        </div>
      )}
      {data && showNextActions(data?.nextActions[0])}
    </React.Fragment>
  );
};
