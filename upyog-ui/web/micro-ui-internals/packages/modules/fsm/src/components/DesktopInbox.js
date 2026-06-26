import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Loader } from "@upyog/digit-ui-react-components";
import FSMLink from "./inbox/FSMLink";
import ApplicationTable from "./inbox/ApplicationTable";
import Filter from "./inbox/Filter";
import SearchApplication from "./inbox/search";

const ACCENT = "#B54708";
const ORANGE = "#f47738";
const NAVY  = "#1a2b49";

const DesktopInbox = (props) => {
  const { t } = useTranslation();
  const DSO  = Digit.UserService.hasAccess(["FSM_DSO"])   || false;
  const FSTP = Digit.UserService.hasAccess("FSM_EMP_FSTPO") || false;
  const location = useLocation();

  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const GetSlaCell = (value) => {
    const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "34px", height: "22px", borderRadius: "11px", fontSize: "12px", fontWeight: "700", padding: "0 8px" };
    if (value === "-") return <span style={{ ...base, background: "#f3f4f6", color: "#6b7280" }}>-</span>;
    if (isNaN(value)) return <span style={{ ...base, background: "#d1fae5", color: "#065f46" }}>0</span>;
    return value < 0
      ? <span style={{ ...base, background: "#fee2e2", color: "#991b1b" }}>{value}</span>
      : <span style={{ ...base, background: "#d1fae5", color: "#065f46" }}>{value}</span>;
  };

  function goTo(id) {
    // history.push("/suda-ui/employee/fsm/complaint/details/" + id);
  }

  const columns = React.useMemo(() => {
    if (props.isSearch) {
      return [
        {
          Header: t("ES_INBOX_APPLICATION_NO"),
          accessor: "applicationNo",
          disableSortBy: true,
          Cell: ({ row }) => {
            return (
              <div>
                <span className="link">
                  <Link to={`${props.parentRoute}/${DSO ? "dso-application-details" : "application-details"}/` + row.original["applicationNo"]}>
                    {row.original["applicationNo"]}
                  </Link>
                </span>
                {/* <a onClick={() => goTo(row.row.original["serviceRequestId"])}>{row.row.original["serviceRequestId"]}</a> */}
              </div>
            );
          },
        },
        {
          Header: t("ES_APPLICATION_DETAILS_APPLICANT_NAME"),
          disableSortBy: true,
          accessor: (row) => GetCell(row.citizen?.name || ""),
        },
        {
          Header: t("ES_APPLICATION_DETAILS_APPLICANT_MOBILE_NO"),
          disableSortBy: true,
          accessor: (row) => GetCell(row.citizen?.mobileNumber || ""),
        },
        {
          Header: t("ES_APPLICATION_DETAILS_PROPERTY_TYPE"),
          accessor: (row) => {
            const key = t(`PROPERTYTYPE_MASTERS_${row.propertyUsage.split(".")[0]}`);
            return key;
          },
          disableSortBy: true,
        },
        {
          Header: t("ES_APPLICATION_DETAILS_PROPERTY_SUB-TYPE"),
          accessor: (row) => {
            const key = t(`PROPERTYTYPE_MASTERS_${row.propertyUsage}`);
            return key;
          },
          disableSortBy: true,
        },
        {
          Header: t("ES_INBOX_LOCALITY"),
          accessor: (row) => GetCell(t(Digit.Utils.locale.getRevenueLocalityCode(row.address.locality.code, row.tenantId))),
          disableSortBy: true,
        },
        {
          Header: t("ES_INBOX_STATUS"),
          accessor: (row) => {
            return GetCell(t(`CS_COMMON_FSM_${row.applicationStatus}`));
          },
          disableSortBy: true,
        },
      ];
    }
    switch (props.userRole) {
      case "FSM_EMP_FSTPO_REQUEST":
        return [
          {
            Header: t("ES_INBOX_APPLICATION_NO"),
            accessor: "applicationNo",
            // disableSortBy: true,
            Cell: ({ row }) => {
              // fetching out citizen info
              let citizen_info = props?.fstprequest?.find((i) => row.original.tripDetails[0].referenceNo === i.applicationNo);
              return (
                <div>
                  <span className="link">
                    <Link to={"/suda-ui/employee/fsm/fstp-operator-details/" + row.original["applicationNo"]}> {citizen_info?.applicationNo}</Link>
                  </span>
                </div>
              );
            },
          },
          {
            Header: t("CS_COMMON_CITIZEN_NAME"),
            disableSortBy: true,
            Cell: ({ row }) => {
              let citizen_info = props?.fstprequest?.find((i) => row.original.tripDetails[0].referenceNo === i.applicationNo);
              return (
                <div>
                  <span>{citizen_info?.citizen?.name}</span>
                </div>
              );
            },
          },
          {
            Header: t("CS_COMMON_CITIZEN_NUMBER"),
            disableSortBy: true,
            accessor: "number",
            Cell: ({ row }) => {
              let citizen_info = props?.fstprequest?.find((i) => row.original.tripDetails[0].referenceNo === i.applicationNo);
              return (
                <div>
                  <span>{citizen_info?.citizen?.mobileNumber}</span>
                </div>
              );
            },
          },
          {
            Header: t("ES_INBOX_LOCALITY"),
            disableSortBy: true,
            accessor: "locality",
            Cell: ({ row }) => {
              let citizen_info = props?.fstprequest?.find((i) => row.original.tripDetails[0].referenceNo === i.applicationNo);
              return (
                <div>
                  <span>{t(`${citizen_info?.address?.locality?.name}`)}</span>
                </div>
              );
            },
          },
        ];
      case "FSM_EMP_FSTPO":
        return [
          {
            Header: t("ES_INBOX_APPLICATION_NO"),
            disableSortBy: true,
            accessor: "tripDetails",
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/suda-ui/employee/fsm/fstp-operator-details/" + row.original["applicationNo"]}>
                      {row.original["tripDetails"].map((i) => (
                        <div>
                          {i.referenceNo}
                          <br />
                        </div>
                      ))}
                    </Link>
                  </span>
                </div>
              );
            },
          },
          {
            Header: t("ES_INBOX_VEHICLE_LOG"),
            accessor: "applicationNo",
            disableSortBy: true,
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/suda-ui/employee/fsm/fstp-operator-details/" + row.original["applicationNo"]}>{row.original["applicationNo"]}</Link>
                  </span>
                </div>
              );
            },
          },
          {
            Header: t("ES_INBOX_APPLICATION_DATE"),
            accessor: "createdTime",
            Cell: ({ row }) => {
              return GetCell(
                `${new Date(row.original.auditDetails.createdTime).getDate()}/${
                  new Date(row.original.auditDetails.createdTime).getMonth() + 1
                }/${new Date(row.original.auditDetails.createdTime).getFullYear()}`
              );
            },
          },
          {
            Header: t("ES_INBOX_VEHICLE_NO"),
            disableSortBy: true,
            accessor: (row) => row.vehicle?.registrationNumber,
          },
          {
            Header: t("ES_INBOX_DSO_NAME"),
            disableSortBy: true,
            accessor: (row) => (row.dsoName ? `${row.dsoName} - ${row.tripOwner.name}` : `${row.tripOwner.name}`),
          },
          {
            Header: t("ES_INBOX_VEHICLE_STATUS"),
            disableSortBy: true,
            accessor: (row) => row.status,
          },
          {
            Header: t("ES_INBOX_WASTE_COLLECTED"),
            disableSortBy: true,
            accessor: (row) => row.tripDetails[0]?.volume,
          },
        ];
      default:
        return [
          {
            Header: t("CS_FILE_DESLUDGING_APPLICATION_NO"),
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={`${props.parentRoute}/${DSO ? "dso-application-details" : "application-details"}/` + row.original["applicationNo"]}>
                      {row.original["applicationNo"]}
                    </Link>
                  </span>
                  {/* <a onClick={() => goTo(row.row.original["serviceRequestId"])}>{row.row.original["serviceRequestId"]}</a> */}
                </div>
              );
            },
          },
          {
            Header: t("ES_INBOX_APPLICATION_DATE"),
            accessor: "createdTime",
            Cell: ({ row }) => {
              return GetCell(
                `${row.original.createdTime.getDate()}/${row.original.createdTime.getMonth() + 1}/${row.original.createdTime.getFullYear()}`
              );
            },
          },
          {
            Header: t("ES_INBOX_LOCALITY"),
            Cell: ({ row }) => {
              return GetCell(t(Digit.Utils.locale.getRevenueLocalityCode(row.original["locality"], row.original["tenantId"])));
            },
            // Cell: (row) => {
            //   return GetCell(t(`CS_COMMON_${row.row.original["status"]}`));
            // },
          },
          {
            Header: t("ES_INBOX_STATUS"),
            Cell: (row) => {
              return GetCell(t(`CS_COMMON_FSM_${row.row.original["status"]}`));
            },
          },
          {
            Header: t("ES_INBOX_SLA_DAYS_REMAINING"),
            Cell: ({ row }) => {
              return GetSlaCell(row.original["sla"]);
            },
          },
        ];
    }
  }, [props.fstprequest, props.data]);

  let result;
  if (props.isLoading) {
    result = (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader />
      </div>
    );
  } else if ((props.isSearch && !props.shouldSearch) || props?.data?.table?.length === 0) {
    result = (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚿</div>
        {
          t("CS_MYAPPLICATIONS_NO_APPLICATION")
            .split("\\n")
            .map((text, index) => (
              <p key={index} style={{ textAlign: "center", margin: "4px 0", color: "#6b7280", fontSize: "14px" }}>
                {text}
              </p>
            ))
        }
      </div>
    );
  } else if (props?.data?.table?.length > 0) {
    result = (
      <ApplicationTable
        t={t}
        data={props.data.table}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            style: {
              minWidth: cellInfo.column.Header === t("CS_FILE_DESLUDGING_APPLICATION_NO") ? "200px" : "",
              padding: "12px 18px",
              fontSize: "13px",
              verticalAlign: "middle",
            },
          };
        }}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
        isPaginationRequired={props.isPaginationRequired}
      />
    );
  }

  const showSidebar = props.userRole !== "FSM_EMP_FSTPO" && !props.isSearch;

  return (
    <div className="fsm-inbox-page">

      {/* ── Page header banner (inbox mode only) ── */}
      {!props.isSearch && (
        <div style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #274080 60%, ${ACCENT}cc 100%)`,
          padding: "10px 32px 22px",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "160px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

          {/* Breadcrumb path inside banner */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px", zIndex: 1 }}>
            <a href="/suda-ui/employee" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: "500", textDecoration: "none" }}>
              {t("ES_COMMON_HOME")}
            </a>
            <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px" }}>›</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontWeight: "500" }}>FSM</span>
            <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "11px" }}>›</span>
            <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: "600" }}>
              {props.isSearch ? t("ES_TITILE_SEARCH_APPLICATION") : t("ES_COMMON_INBOX")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
              🚿
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>
                {t("ES_TITLE_FAECAL_SLUDGE_MGMT")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800" }}>{t("ES_COMMON_INBOX")}</span>
                {props.inboxTotalCount != null && Number(props.inboxTotalCount) > 0 && (
                  <span style={{ background: ORANGE, borderRadius: "20px", padding: "3px 12px", fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                    {props.inboxTotalCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          {!DSO && !FSTP && (
            <Link
              to={`${props.parentRoute}/new-application`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: ORANGE, color: "#ffffff",
                padding: "10px 18px", borderRadius: "9px",
                fontSize: "13px", fontWeight: "700", textDecoration: "none",
                boxShadow: "0 4px 14px rgba(244,119,56,0.4)",
                flexShrink: 0,
              }}
            >
              + {t("ES_TITLE_NEW_DESULDGING_APPLICATION")}
            </Link>
          )}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ display: "flex", padding: "20px 24px 40px", gap: "20px", alignItems: "flex-start", background: "#f0f2f7", minHeight: "60vh" }}>

        {/* Left Sidebar */}
        {showSidebar && (
          <div style={{ width: "258px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {props.userRole !== "FSM_EMP_FSTPO_REQUEST" && (
              <FSMLink parentRoute={props.parentRoute} />
            )}
            <Filter
              searchParams={props.searchParams}
              paginationParms={props.paginationParms}
              applications={props.data}
              onFilterChange={props.onFilterChange}
              type="desktop"
            />
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchApplication
            onSearch={props.onSearch}
            type="desktop"
            searchFields={props.searchFields}
            isInboxPage={!props?.isSearch}
            searchParams={props.searchParams}
          />
          <div className="fsm-table-wrap" style={{ marginTop: "16px" }}>
            {result}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
