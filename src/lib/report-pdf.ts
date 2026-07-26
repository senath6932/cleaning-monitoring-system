type PdfReport = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: unknown;
  officerRemarks: string | null;
  location: {
    code: string;
    locationName: string;
  };
  officer: {
    fullName: string;
    email: string;
    designation: string | null;
    department: string | null;
  };
  adminReview: {
    decision: string;
    remarks: string | null;
    reviewedAt: Date | string;
  } | null;
  taskEvaluations: {
    result: string;
    remarks: string | null;
    locationTask: {
      task: {
        taskName: string;
        category: {
          categoryName: string;
        } | null;
      };
    };
  }[];
};

function text(value: unknown) {
  return String(value ?? "-").replace(/[^\x20-\x7E]/g, " ");
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
      continue;
    }

    if (`${current} ${word}`.length > max) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["-"];
}

function buildLines(report: PdfReport) {
  const pCount = report.taskEvaluations.filter((item) => item.result === "P").length;
  const xCount = report.taskEvaluations.filter((item) => item.result === "X").length;
  const naCount = report.taskEvaluations.filter((item) => item.result === "NA").length;
  const reviewedAt = report.adminReview?.reviewedAt
    ? new Date(report.adminReview.reviewedAt).toLocaleDateString()
    : "-";

  const lines = [
    "University Cleaning Monitoring System",
    "Evaluation Report",
    "",
    `Report ID: ${report.reportId}`,
    `Location: ${report.location.code} - ${report.location.locationName}`,
    `Officer: ${report.officer.fullName}`,
    `Officer Email: ${report.officer.email}`,
    `Designation: ${report.officer.designation || "-"}`,
    `Department: ${report.officer.department || "-"}`,
    `Month / Year: ${report.evaluationMonth}/${report.evaluationYear}`,
    `Completion Percentage: ${Number(report.overallPercentage ?? 0).toFixed(2)}%`,
    `P / X / NA Summary: ${pCount} / ${xCount} / ${naCount}`,
    `Admin Decision: ${report.adminReview?.decision || "-"}`,
    `Reviewed Date: ${reviewedAt}`,
    "",
    "Officer Remarks:",
    ...wrapLine(report.officerRemarks || "No remarks"),
    "",
    "Admin Remarks:",
    ...wrapLine(report.adminReview?.remarks || "No remarks"),
    "",
    "Task Evaluation Results:",
  ];

  report.taskEvaluations.forEach((evaluation, index) => {
    const task = evaluation.locationTask.task;
    lines.push(
      `${index + 1}. [${evaluation.result}] ${task.category?.categoryName || "-"} - ${task.taskName}`
    );

    if (evaluation.remarks) {
      wrapLine(`Remarks: ${evaluation.remarks}`, 84).forEach((line) =>
        lines.push(`   ${line}`)
      );
    }
  });

  lines.push(
    "",
    "Signature Sections:",
    "",
    "Evaluating Officer: ___________________________   Date: ______________",
    "",
    "Administration Officer: _______________________   Date: ______________",
    "",
    "General Administration Officer: _______________   Date: ______________"
  );

  return lines;
}

export function generateEvaluationReportPdf(report: PdfReport) {
  const lines = buildLines(report);
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

    objects.push(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
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
