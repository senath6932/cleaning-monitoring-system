type PaymentReport = {
  recommendationId: string;
  completionPercentage: unknown;
  contractAmount: unknown;
  recommendedAmount: unknown;
  createdAt: Date | string;
  creator: {
    fullName: string;
    email: string;
    designation: string | null;
    department: string | null;
  };
  report: {
    reportId: string;
    evaluationMonth: number;
    evaluationYear: number;
    overallPercentage: unknown;
    location: {
      code: string;
      locationName: string;
    };
    adminReview: {
      reviewId: string;
      decision: string;
      remarks: string | null;
      reviewedAt: Date | string;
    } | null;
  };
};

type Agreement = {
  companyName: string;
  registrationNumber: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  address: string | null;
  tenderNumber: string | null;
  agreementNumber: string | null;
  contractStartDate: Date | string;
  contractEndDate: Date | string;
  paymentTerms: string | null;
  monthlyContractAmount: unknown;
} | null;

type PaymentBreakdown = {
  monthlyContractAmount: number;
  activeLocationCount: number;
  categoryProgress: Array<{
    category: string;
    passed: number;
    applicable: number;
    percentage: number;
  }>;
};

function text(value: unknown) {
  return String(value ?? "-").replace(/[^\x20-\x7E]/g, " ");
}

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(value: string, max = 92) {
  const words = text(value).split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length > max) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["-"];
}

function date(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function buildLines(
  recommendation: PaymentReport,
  agreement: Agreement,
  breakdown?: PaymentBreakdown
) {
  const report = recommendation.report;

  return [
    "University Cleaning Monitoring System",
    "Payment Recommendation Report",
    "",
    "Contractor Company Details:",
    `Company: ${agreement?.companyName || "-"}`,
    `Registration No: ${agreement?.registrationNumber || "-"}`,
    `Contact Person: ${agreement?.contactPerson || "-"}`,
    `Contact Number: ${agreement?.contactNumber || "-"}`,
    `Email: ${agreement?.email || "-"}`,
    ...wrapLine(`Address: ${agreement?.address || "-"}`),
    "",
    "Agreement Details:",
    `Tender No: ${agreement?.tenderNumber || "-"}`,
    `Agreement No: ${agreement?.agreementNumber || "-"}`,
    `Contract Period: ${date(agreement?.contractStartDate)} to ${date(agreement?.contractEndDate)}`,
    ...wrapLine(`Payment Terms: ${agreement?.paymentTerms || "-"}`),
    "",
    "Recommendation Details:",
    `Recommendation ID: ${recommendation.recommendationId}`,
    `Evaluation Report ID: ${report.reportId}`,
    `Location: ${report.location.code} - ${report.location.locationName}`,
    `Month / Year: ${report.evaluationMonth}/${report.evaluationYear}`,
    `Completion Percentage: ${Number(recommendation.completionPercentage ?? 0).toFixed(2)}%`,
    `Total Monthly Contract Amount: Rs. ${money(breakdown?.monthlyContractAmount ?? agreement?.monthlyContractAmount)}`,
    `Active Locations: ${breakdown?.activeLocationCount ?? "-"}`,
    `Location Monthly Allocation: Rs. ${money(recommendation.contractAmount)}`,
    `Recommended Payment Amount: Rs. ${money(recommendation.recommendedAmount)}`,
    "",
    "Task Schedule Progress:",
    ...(breakdown?.categoryProgress.map(
      (progress) =>
        `${progress.category}: ${progress.percentage.toFixed(2)}% (${progress.passed}/${progress.applicable} applicable tasks passed)`
    ) ?? ["-"]),
    "",
    "Admin Approval Reference:",
    `Admin Review ID: ${report.adminReview?.reviewId || "-"}`,
    `Decision: ${report.adminReview?.decision || "-"}`,
    `Reviewed Date: ${date(report.adminReview?.reviewedAt)}`,
    ...wrapLine(`Admin Remarks: ${report.adminReview?.remarks || "-"}`),
    "",
    "GAA Details:",
    `Prepared By: ${recommendation.creator.fullName}`,
    `Email: ${recommendation.creator.email}`,
    `Designation: ${recommendation.creator.designation || "-"}`,
    `Department: ${recommendation.creator.department || "-"}`,
    `Prepared Date: ${date(recommendation.createdAt)}`,
    "",
    "Signature Sections:",
    "",
    "General Administration Officer: _______________   Date: ______________",
    "",
    "Vice Chancellor: ______________________________   Date: ______________",
    "",
    "Finance Officer: ______________________________   Date: ______________",
  ];
}

export function generatePaymentRecommendationPdf(
  recommendation: PaymentReport,
  agreement: Agreement,
  breakdown?: PaymentBreakdown
) {
  const lines = buildLines(recommendation, agreement, breakdown);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += 44) {
    pages.push(lines.slice(index, index + 44));
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (const pageLines of pages) {
    const pageObjectId = objects.length + 1;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );

    const content = [
      "BT",
      "/F1 11 Tf",
      "50 800 Td",
      "14 TL",
      ...pageLines.map((line, index) =>
        `${index === 0 ? "" : "T* "}(${escapePdf(text(line))}) Tj`
      ),
      "ET",
    ].join("\n");

    objects.push(
      `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`
    );
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pageObjectIds.length} >>`;

  const parts = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(parts.join(""), "latin1"));
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = Buffer.byteLength(parts.join(""), "latin1");
  parts.push(`xref\n0 ${objects.length + 1}\n`);
  parts.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    parts.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  parts.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return Buffer.from(parts.join(""), "latin1");
}
