import { TextInput } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";

const TaxCharges = ({ config, onSelect, formData }) => {
  const existing = formData?.taxCharges || {};

  const [taxData, setTaxData] = useState({
    propertyArrear:    existing.propertyArrear    || "",
    propertyDemand:    existing.propertyDemand    || "",
    waterArrear:       existing.waterArrear       || "",
    waterDemand:       existing.waterDemand       || "",
    userChargeArrear:  existing.userChargeArrear  || "",
    userChargeDemand:  existing.userChargeDemand  || "",
  });

  useEffect(() => {
    onSelect(config.key, taxData);
  }, [taxData]);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setTaxData((prev) => ({ ...prev, [field]: val }));
  };

  const rows = [
    {
      category: "Property",
      fields: [
        { label: "Arrear till 31 March 2026", field: "propertyArrear" },
        { label: "Demand from 01 April 2027", field: "propertyDemand" },
      ],
    },
    {
      category: "Water",
      fields: [
        { label: "Arrear till 31 March 2026", field: "waterArrear" },
        { label: "Demand from 01 April 2027", field: "waterDemand" },
      ],
    },
    {
      category: "User Charge",
      fields: [
        { label: "Arrear till 31 March 2026", field: "userChargeArrear" },
        { label: "Demand from 01 April 2027", field: "userChargeDemand" },
      ],
    },
  ];

  return (
    <div className="pt-tax-charges-card" style={{ background: "#fff", padding: "16px", borderRadius: "4px", marginBottom: "16px" }}>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "16px",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "8px",
        }}
      >
        Tax Charges
      </h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, width: "200px" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.fields.map((item, idx) => (
              <tr key={item.field} style={{ borderBottom: "1px solid #e0e0e0" }}>
                {idx === 0 && (
                  <td
                    rowSpan={row.fields.length}
                    style={{ ...tdStyle, fontWeight: "600", verticalAlign: "middle", borderRight: "1px solid #e0e0e0" }}
                  >
                    {row.category}
                  </td>
                )}
                <td style={tdStyle}>{item.label}</td>
                <td style={{ ...tdStyle, padding: "6px 12px" }}>
                  <TextInput
                    type="number"
                    value={taxData[item.field]}
                    onChange={handleChange(item.field)}
                    style={{ margin: 0 }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  borderBottom: "2px solid #e0e0e0",
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: "14px",
};

export default TaxCharges;
