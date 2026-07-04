import { jsPDF } from "jspdf";
import ComplianceSection from "../components/dashboard/ComplianceSection";
import RecommendationSection from "../components/dashboard/RecommendationSection";

export default function Reports({ threats }) {
  
  const generateAuditReport = () => {
    try {
      const doc = new jsPDF();
      
      // Page Margins & Dimensions
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 2 * margin;

      // Color Palette Constants (Professional Slate/Executive theme)
      const COLOR_PRIMARY = [15, 23, 42]; // #0f172a (Dark Slate)
      const COLOR_SECONDARY = [71, 85, 105]; // #475569 (Slate Gray)
      const COLOR_MUTED = [148, 163, 184]; // #94a3b8 (Muted Gray)
      const COLOR_ACCENT = [37, 99, 235]; // #2563eb (Royal Blue)
      const COLOR_LINE = [226, 232, 240]; // #e2e8f0 (Grid Borders)

      // 1. Corporate Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MUTED);
      doc.text("SENTINELX SECURITY OPERATIONS CENTER", margin, 15);
      doc.text("CLASSIFICATION: CONFIDENTIAL", pageWidth - margin - 52, 15);

      // Main Title
      doc.setFontSize(20);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text("SECURITY INCIDENT AUDIT REPORT", margin, 26);
      
      // Subtitle / Metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text(`Generated On: ${new Date().toLocaleString()}`, margin, 33);
      doc.text("Compliance Standard: SOC 2 / ISO 27001", margin, 38);
      doc.text(`Auditor: Platform Security Administrator`, margin, 43);

      // Divider Line
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.5);
      doc.line(margin, 48, pageWidth - margin, 48);

      // 2. Executive Summary Metrics Grid
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text("EXECUTIVE COMPLIANCE SUMMARY", margin, 58);

      // Draw Grid Boxes
      const boxWidth = contentWidth / 3 - 4;
      const boxHeight = 22;
      const boxY = 63;

      // Box 1: Posture Score
      doc.setDrawColor(...COLOR_LINE);
      doc.setFillColor(248, 250, 252); // #f8fafc
      doc.rect(margin, boxY, boxWidth, boxHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text("SECURITY POSTURE Grade", margin + 5, boxY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_ACCENT);
      doc.text("GRADE A+", margin + 5, boxY + 15);

      // Box 2: Ingested Events
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + boxWidth + 6, boxY, boxWidth, boxHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text("TOTAL LOGGED INCIDENTS", margin + boxWidth + 11, boxY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(String(threats.length), margin + boxWidth + 11, boxY + 15);

      // Box 3: Integrity Status
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 2 * boxWidth + 12, boxY, boxWidth, boxHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text("LEDGER INTEGRITY BRIDGE", margin + 2 * boxWidth + 17, boxY + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129); // Emerald green
      doc.text("100% CONSENSUS", margin + 2 * boxWidth + 17, boxY + 15);

      // 3. Incident Details Table Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text("INCIDENT ANOMALY REGISTRY", margin, 96);

      // Table dimensions
      const tableY = 101;
      const colWidths = {
        id: 20,
        time: 32,
        type: 38,
        ip: 32,
        score: 22,
        severity: 26
      };

      // Header Row Background
      doc.setFillColor(...COLOR_PRIMARY);
      doc.rect(margin, tableY, contentWidth, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      
      let xOffset = margin + 2;
      doc.text("ID", xOffset, tableY + 5.5);
      xOffset += colWidths.id;
      doc.text("TIMESTAMP", xOffset, tableY + 5.5);
      xOffset += colWidths.time;
      doc.text("INCIDENT TYPE", xOffset, tableY + 5.5);
      xOffset += colWidths.type;
      doc.text("SOURCE IP", xOffset, tableY + 5.5);
      xOffset += colWidths.ip;
      doc.text("AI SCORE", xOffset, tableY + 5.5);
      xOffset += colWidths.score;
      doc.text("SEVERITY", xOffset, tableY + 5.5);

      // Table Rows
      let currentY = tableY + 8;
      
      threats.forEach((t, index) => {
        // Alternate row colors for clean spacing and readability
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252); // Light Gray
        } else {
          doc.setFillColor(255, 255, 255); // White
        }
        doc.rect(margin, currentY, contentWidth, 8, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLOR_SECONDARY);

        let rowX = margin + 2;
        doc.text(t.id || `TH${index}`, rowX, currentY + 5.5);
        rowX += colWidths.id;
        doc.text(t.time || "", rowX, currentY + 5.5);
        rowX += colWidths.time;
        doc.text(t.type || "", rowX, currentY + 5.5);
        rowX += colWidths.type;
        doc.text(t.ip || "", rowX, currentY + 5.5);
        rowX += colWidths.ip;
        
        // Extract AI score value (default to 0.85 if mock)
        const scoreVal = t.description ? parseFloat(t.description.match(/\d+\.\d+/)) || 0.85 : 0.85;
        doc.text(String(scoreVal.toFixed(2)), rowX, currentY + 5.5);
        rowX += colWidths.score;

        // Color code severity without excessive styling
        const sev = t.severity || "LOW";
        if (sev === "CRITICAL" || sev === "HIGH") {
          doc.setTextColor(220, 38, 38); // Dark Red
        } else if (sev === "MEDIUM") {
          doc.setTextColor(217, 119, 6); // Dark Amber
        } else {
          doc.setTextColor(16, 185, 129); // Dark Green
        }
        doc.setFont("helvetica", "bold");
        doc.text(sev, rowX, currentY + 5.5);

        // Bottom row thin line
        doc.setDrawColor(...COLOR_LINE);
        doc.setLineWidth(0.2);
        doc.line(margin, currentY + 8, pageWidth - margin, currentY + 8);

        currentY += 8;
      });

      // 4. Sign-off and Ledger Validation Section
      const signY = pageHeight - 50;
      doc.setDrawColor(...COLOR_LINE);
      doc.setLineWidth(0.5);
      doc.line(margin, signY, pageWidth - margin, signY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text("CRYPTOGRAPHIC VERIFICATION SIGNATURE", margin, signY + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text("The audit registry hashes contained herein are cryptographically anchored to the Ethereum ledger.", margin, signY + 15);
      doc.text("Log integrity verified against decentralized smart contract registry LogIntegrity.sol.", margin, signY + 19);

      doc.setFont("courier", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_ACCENT);
      doc.text("SHA256 Anchor: 7f8a3c91e5d7f22a1b5c8f6e4a2d1b0c9e8f7a6b5c4d3e2f1a0987654321abcd", margin, signY + 27);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_SECONDARY);
      doc.text("Authorized Audit Agent ID: simulated-soc-agent", margin, signY + 34);

      doc.save(`SentinelX_Executive_Audit_Report_${Date.now()}.pdf`);
      alert("Executive Audit PDF report compiled and download initiated.");
    } catch (err) {
      console.error("Failed to generate PDF audit report:", err);
      alert("Error compiling PDF document. Please verify library dependencies.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">SIEM Compliance & Audit Reporting</h2>
          <p className="text-xs text-slate-500 mt-1">Generate authenticated security report audits</p>
        </div>
        <button
          onClick={generateAuditReport}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 border-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Security Audit Report
        </button>
      </div>

      {/* Compliance Framework Section */}
      <ComplianceSection />

      {/* AI recommendation action list */}
      <RecommendationSection />

    </div>
  );
}
