import jsPDF from "jspdf";
import JSZip from "jszip";
import cgLogo from "./cgLogo";

/**
 * Resolves a taxHeadCode to a display label.
 * Uses t() (localization) first — same as the citizen Tax Bill Details page.
 * Falls back to a readable format of the code if no translation exists.
 */
function resolveLabel(code, t) {
  if (!code) return "";
  if (!t) return code;
  const translated = t(code);
  // i18n returns the key itself when no translation is found
  if (translated === code) {
    return code
      .replace(/^PT_/, "")
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return translated;
}
function fmtAmt(val) {
  if (val == null) return "0.00";
  return Number(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getUlbName(tenantId) {
  if (!tenantId) return "";
  const parts = tenantId.split(".");
  const city = parts[parts.length - 1];
  return city.charAt(0).toUpperCase() + city.slice(1) + " Municipal Corporation";
}

/**
 * Builds a jsPDF document for a single property demand notice.
 * Tax heads and their labels are fully dynamic — driven by the API response
 * and the same localization (t) used on the citizen Tax Bill Details page.
 *
 * @param {Object} assessment - enriched assessment containing demandDetails from demand/_search
 * @param {Function} t - react-i18next translation function
 */
export function buildDemandDoc(assessment, taxItems, t) {
  const {
    propertyId,
    financialYear,
    totalAmount,
    balanceDue,
    tenantId,
    assessmentNumber,
    assessmentDate,
  } = assessment;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 14;
  const colRight = pageW - margin;

  // ─── Logo ───────────────────────────────────────────────────────────────────
  try {
    doc.addImage(cgLogo, "PNG", margin, 7, 20, 20);
  } catch (_) {}

  // ─── Header ─────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("URBAN ADMINISTRATION & DEPARTMENT", margin + 24, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(getUlbName(tenantId), margin + 24, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Property Tax Demand Notice", margin + 24, 27);

  // ─── Top separator ───────────────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, 31, colRight, 31);

  // ─── Property details ────────────────────────────────────────────────────────
  let y = 39;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Property ID", margin, y);
  doc.text("Billing Cycle", margin + 75, y);
  if (assessmentNumber) doc.text("Assessment No.", margin + 140, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(propertyId || "-", margin, y);
  doc.text(financialYear ? "FY " + financialYear : "-", margin + 75, y);
  if (assessmentNumber) doc.text(assessmentNumber, margin + 140, y);

  if (assessmentDate) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Assessment Date", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(new Date(assessmentDate).toLocaleDateString("en-IN"), margin, y);
  }

  y += 9;

  // ─── Tax table header ────────────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, colRight, y);
  y += 5;

  doc.setFillColor(251, 233, 216);
  doc.rect(margin, y - 4, colRight - margin, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Tax Head", margin + 3, y);
  doc.text("Amount (Rs.)", colRight - 3, y, { align: "right" });
  y += 3;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, colRight, y);
  y += 5;

  // ─── Tax rows — fully dynamic from API response ────────────────────────────
  // Iterates demandDetails exactly as returned by demand/_search.
  // Labels: t(taxHeadCode) — same localization as the citizen Tax Bill Details page.
  // Adding / removing a tax head tomorrow requires zero code changes here.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let computedTotal = 0;
  (taxItems || []).forEach((item, rowIndex) => {
    const label = resolveLabel(item.taxHeadCode, t);
    const amt = item.amount != null ? item.amount : 0;
    computedTotal += amt;

    if (rowIndex % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 4, colRight - margin, 6, "F");
    }

    doc.setTextColor(0, 0, 0);
    doc.text(String(label || ""), margin + 3, y);
    doc.text(fmtAmt(amt), colRight - 3, y, { align: "right" });
    y += 6.5;
  });

  // ─── Total row ───────────────────────────────────────────────────────────────
  y += 1;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.6);
  doc.line(margin, y, colRight, y);
  y += 6;

  doc.setFillColor(230, 92, 0);
  doc.rect(margin, y - 5, colRight - margin, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Property Tax Amount", margin + 3, y);
  // Use totalAmount from assessment if available; fall back to computed sum
  const displayTotal = totalAmount != null ? totalAmount : computedTotal;
  doc.text("Rs. " + fmtAmt(displayTotal), colRight - 3, y, { align: "right" });

  y += 3;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.line(margin, y, colRight, y);

  // ─── Balance Due row ─────────────────────────────────────────────────────────
  y += 6;
  const due = balanceDue != null ? balanceDue : displayTotal;
  const isDue = due > 0;
  doc.setFillColor(isDue ? 255 : 237, isDue ? 235 : 247, isDue ? 235 : 237);
  doc.rect(margin, y - 5, colRight - margin, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(isDue ? 180 : 0, isDue ? 0 : 130, isDue ? 0 : 60);
  doc.text("Balance Due", margin + 3, y);
  doc.text("Rs. " + fmtAmt(due), colRight - 3, y, { align: "right" });
  y += 3;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, y, colRight, y);

  // ─── Footer ──────────────────────────────────────────────────────────────────
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("Note: This is a system-generated demand notice. No signature is required.", margin, y);
  doc.text("Generated on: " + new Date().toLocaleString("en-IN"), margin, y + 5);

  return doc;
}

/**
 * Downloads a PDF for a single property assessment.
 * @param {Object} assessment - must have demandDetails from demand/_search
 * @param {Function} t - i18n translation function
 */
export function downloadSingleDemandPDF(assessment, taxItems, t) {
  const doc = buildDemandDoc(assessment, taxItems, t);
  doc.save("demand-" + (assessment.propertyId || "notice") + ".pdf");
}

/**
 * Generates one PDF per assessment and downloads all as a single ZIP.
 * @param {Array} assessments - each must have demandDetails from demand/_search
 * @param {Function} t - i18n translation function
 */
export async function downloadBulkDemandZip(assessments, itemsMap, t) {
  const zip = new JSZip();

  for (const a of assessments) {
    const taxItems = (itemsMap && itemsMap[a.propertyId]) || [];
    const doc = buildDemandDoc(a, taxItems, t);
    const pdfBytes = doc.output("arraybuffer");
    zip.file("demand-" + (a.propertyId || "property") + ".pdf", pdfBytes);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bulk-demand-" + new Date().toISOString().slice(0, 10) + ".zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
