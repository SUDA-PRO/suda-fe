import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Loader } from "@upyog/digit-ui-react-components";

/**
 * @author - Shivank Shukla - NIUA
 * 
 * This component displays a dashboard with key metrics for employees.
 * 
 * How it works:
 * 1. The component initially renders cards with loaders.
 * 2. When the component loads, it fetches dashboard data from an API.
 * 3. It displays four cards showing different metrics:
 *    - Applications Received
 *    - Total Amount
 *    - Pending Applications
 *    - Approved Applications
 * 
 * Technical details:
 * - Fetches data using the Digit.EmployeeDashboardService.search method.
 * - Uses the current tenant ID from Digit.ULBService.getCurrentUlb().
 * - Each card has its own loading state, replaced by data when available.
 * - Smart number formatting for large values (lakhs/crores)
 * 
 * Note: If the API call fails, an error is logged to the console, and the cards
 * will remain in their loading state.
 * 
 */

const formatNumbers = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  const num = Number(amount);
  const numStr = num.toString();
  
  // If number has 5 digits or less, show exact value with Indian comma formatting
  if (numStr.length <= 5) {
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNums = numStr.substring(0, numStr.length - 3);
    const formatted = otherNums.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return otherNums ? formatted + ',' + lastThree : lastThree;
  }
  
  // For numbers greater than 5 digits
  else if (num >= 10000000) { // 1 crore and above
    const crores = num / 10000000;
    if (crores >= 100) {
      return `${Math.round(crores)} Crores`;
    } else if (crores >= 10) {
      return `${(crores).toFixed(1)} Crores`;
    } else {
      return `${(crores).toFixed(2)} Crores`;
    }
  } else if (num >= 100000) { // 1 lakh and above
    const lakhs = num / 100000;
    if (lakhs >= 100) {
      return `${Math.round(lakhs)} Lakhs`;
    } else if (lakhs >= 10) {
      return `${(lakhs).toFixed(1)} Lakhs`;
    } else {
      return `${(lakhs).toFixed(2)} Lakhs`;
    }
  }
  
  // Fallback for edge cases
  return numStr;
};

const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  const formattedNumber = formatNumbers(amount);
  return `₹${formattedNumber}`;
};

const EmployeeDashboard = ({modules}) => {
  const { t } = useTranslation();
  const [cardData, setCardData] = useState([
    { title: "", count: null, color: "blue" },
    { title: "", count: null, color: "teal" },
    { title: "", count: null, color: "purple" },
    { title: "", count: null, color: "green" },
  ]);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const tenantId = Digit.ULBService.getCurrentUlb().code;
        const payload = {
          tenantId: tenantId,
          moduleName: "ALL"
        };
        
        const response = await Digit.EmployeeDashboardService.search(payload);
        if (response && response.employeeDashboard) {
          setCardData([
            { title: t("ES_APPLICATION_RECEIVED"), count: response.employeeDashboard.applicationReceived || 0, color: "blue" },
            { title: t("ES_TOTAL_AMOUNT"), count: response.employeeDashboard.totalAmount || 0, color: "teal", isAmount: true },
            { title: t("ES_APPLICATION_PENDING"), count: response.employeeDashboard.applicationPending || 0, color: "purple" },
            { title: t("ES_APPLICATION_APPROVED"), count: response.employeeDashboard.applicationApproved || 0, color: "green" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [t]);

  return (
    <React.Fragment>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "8px",
      }}>
        {cardData.map(({ title, count, color, isAmount }, index) => {
          const configs = [
            { grad: "linear-gradient(135deg, #1a2b49 0%, #2c4a8c 100%)", icon: "📥", shadow: "rgba(26,43,73,0.25)" },
            { grad: "linear-gradient(135deg, #f47738 0%, #d44f0a 100%)", icon: "💰", shadow: "rgba(244,119,56,0.30)" },
            { grad: "linear-gradient(135deg, #7b3fa0 0%, #5c2d80 100%)", icon: "⏳", shadow: "rgba(123,63,160,0.25)" },
            { grad: "linear-gradient(135deg, #1a7a4a 0%, #14603a 100%)", icon: "✅", shadow: "rgba(26,122,74,0.25)" },
          ];
          const cfg = configs[index] || configs[0];
          return (
            <div key={index} style={{
              background: cfg.grad,
              borderRadius: "14px",
              padding: "22px 20px 18px",
              color: "#ffffff",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 6px 20px ${cfg.shadow}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              minHeight: "110px",
            }}>
              <div style={{ fontSize:"30px", lineHeight:"1", flexShrink:0, marginTop:"2px", filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
                {cfg.icon}
              </div>
              <div style={{ flex:1, zIndex:1 }}>
                {count === null ? (
                  <Loader />
                ) : (
                  <React.Fragment>
                    <div style={{ fontSize:"30px", fontWeight:"800", lineHeight:"1.1", letterSpacing:"-0.5px", marginBottom:"5px" }}>
                      {isAmount ? formatIndianCurrency(count) : formatNumbers(count)}
                    </div>
                    <div style={{ fontSize:"13px", fontWeight:"500", opacity:0.85, lineHeight:"1.3" }}>{title}</div>
                  </React.Fragment>
                )}
              </div>
              {/* decorative circle */}
              <div style={{ position:"absolute", right:"-22px", bottom:"-22px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
};

export default EmployeeDashboard;