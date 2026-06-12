import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = new Set([
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
  "UPCOMING",
]);

type CompanyAgreementBody = {
  companyName?: string;
  registrationNumber?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  tenderNumber?: string;
  agreementNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  monthlyContractAmount?: string | number;
  totalContractAmount?: string | number;
  serviceScope?: string;
  coveredLocations?: string;
  minimumWorkersRequired?: string | number;
  equipmentResponsibility?: string;
  chemicalResponsibility?: string;
  supervisorResponsibility?: string;
  paymentTerms?: string;
  penaltyTerms?: string;
  renewalDetails?: string;
  remarks?: string;
  status?: string;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validate(body: CompanyAgreementBody) {
  const start = body.contractStartDate
    ? new Date(body.contractStartDate)
    : null;
  const end = body.contractEndDate
    ? new Date(body.contractEndDate)
    : null;
  const monthlyAmount = Number(body.monthlyContractAmount);
  const email = optionalString(body.email);

  if (!optionalString(body.companyName)) {
    return "Company name is required.";
  }
  if (!start || Number.isNaN(start.getTime())) {
    return "Contract start date is required.";
  }
  if (!end || Number.isNaN(end.getTime())) {
    return "Contract end date is required.";
  }
  if (end <= start) {
    return "Contract end date must be after start date.";
  }
  if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
    return "Monthly contract amount must be positive.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Contact email is invalid.";
  }
  if (
    body.status &&
    !VALID_STATUSES.has(String(body.status).toUpperCase())
  ) {
    return "Status is invalid.";
  }

  return null;
}

function buildData(body: CompanyAgreementBody) {
  return {
    companyName: String(body.companyName).trim(),
    registrationNumber: optionalString(body.registrationNumber),
    contactPerson: optionalString(body.contactPerson),
    contactNumber: optionalString(body.contactNumber),
    email: optionalString(body.email),
    address: optionalString(body.address),
    tenderNumber: optionalString(body.tenderNumber),
    agreementNumber: optionalString(body.agreementNumber),
    contractStartDate: new Date(String(body.contractStartDate)),
    contractEndDate: new Date(String(body.contractEndDate)),
    monthlyContractAmount: Number(body.monthlyContractAmount),
    totalContractAmount:
      body.totalContractAmount === undefined ||
      body.totalContractAmount === ""
        ? null
        : Number(body.totalContractAmount),
    serviceScope: optionalString(body.serviceScope),
    coveredLocations: optionalString(body.coveredLocations),
    minimumWorkersRequired:
      body.minimumWorkersRequired === undefined ||
      body.minimumWorkersRequired === ""
        ? null
        : Number(body.minimumWorkersRequired),
    equipmentResponsibility: optionalString(
      body.equipmentResponsibility
    ),
    chemicalResponsibility: optionalString(
      body.chemicalResponsibility
    ),
    supervisorResponsibility: optionalString(
      body.supervisorResponsibility
    ),
    paymentTerms: optionalString(body.paymentTerms),
    penaltyTerms: optionalString(body.penaltyTerms),
    renewalDetails: optionalString(body.renewalDetails),
    remarks: optionalString(body.remarks),
    status: body.status
      ? String(body.status).toUpperCase()
      : "ACTIVE",
  };
}

function serializeAgreement<
  T extends {
    monthlyContractAmount: unknown;
    totalContractAmount: unknown | null;
  },
>(agreement: T) {
  return {
    ...agreement,
    monthlyContractAmount: Number(agreement.monthlyContractAmount),
    totalContractAmount:
      agreement.totalContractAmount === null
        ? null
        : Number(agreement.totalContractAmount),
  };
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await context.params;
    const body = (await req.json()) as CompanyAgreementBody;
    const validationError = validate(body);

    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    const data = buildData(body);

    if (data.status === "ACTIVE") {
      await prisma.companyAgreement.updateMany({
        where: {
          agreementId: {
            not: agreementId,
          },
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    const agreement = await prisma.companyAgreement.update({
      where: {
        agreementId,
      },
      data,
    });

    return NextResponse.json(serializeAgreement(agreement));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update company agreement." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await context.params;
    const agreement = await prisma.companyAgreement.update({
      where: {
        agreementId,
      },
      data: {
        status: "TERMINATED",
      },
    });

    return NextResponse.json(serializeAgreement(agreement));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete company agreement." },
      { status: 500 }
    );
  }
}
