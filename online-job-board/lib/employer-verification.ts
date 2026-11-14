import "server-only";

export type EmployerVerificationStatus = "Pending" | "Verified" | "Rejected";

export type EmployerVerificationInput = {
  companyName: string;
  email: string;
  physicalBusinessAddress: string;
  companyPhone: string;
  representativeName: string;
  representativePosition: string;
  certificate: Buffer;
  certificateName: string;
  certificateMime: string;
};

export type EmployerVerificationResult = {
  status: EmployerVerificationStatus;
  checked: boolean;
  reason?: string;
};

/**
 * Calls the configured verification gateway. The gateway must return a JSON object
 * with status "verified", "rejected", or "pending" based on a trusted registry/provider.
 * Missing, malformed, or unavailable integrations fail closed to Pending.
 */
export async function verifyEmployer(
  input: EmployerVerificationInput,
): Promise<EmployerVerificationResult> {
  const endpoint = process.env.EMPLOYER_VERIFICATION_API_URL;
  const apiKey = process.env.EMPLOYER_VERIFICATION_API_KEY;
  if (!endpoint || !apiKey) {
    return { status: "Pending", checked: false, reason: "Employer verification provider is not configured." };
  }

  let verificationUrl: URL;
  try {
    verificationUrl = new URL(endpoint);
  } catch {
    return { status: "Pending", checked: false, reason: "Employer verification provider URL is invalid." };
  }
  if (verificationUrl.protocol !== "https:") {
    return { status: "Pending", checked: false, reason: "Employer verification provider must use HTTPS." };
  }

  const request = new FormData();
  request.set("companyName", input.companyName);
  request.set("email", input.email);
  request.set("physicalBusinessAddress", input.physicalBusinessAddress);
  request.set("companyPhone", input.companyPhone);
  request.set("representativeName", input.representativeName);
  request.set("representativePosition", input.representativePosition);
  request.set(
    "businessRegistrationCertificate",
    new Blob([Uint8Array.from(input.certificate)], { type: input.certificateMime }),
    input.certificateName,
  );

  try {
    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      body: request,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      return { status: "Pending", checked: false, reason: "Employer verification provider did not return a successful result." };
    }

    const result: unknown = await response.json();
    if (typeof result !== "object" || result === null || !("status" in result)) {
      return { status: "Pending", checked: false, reason: "Employer verification provider returned an invalid result." };
    }

    const providerResult = result as { status?: unknown; reason?: unknown };
    const reason = typeof providerResult.reason === "string"
      ? providerResult.reason.trim().slice(0, 1000)
      : undefined;
    if (providerResult.status === "verified") return { status: "Verified", checked: true, reason };
    if (providerResult.status === "rejected") return { status: "Rejected", checked: true, reason };
    if (providerResult.status === "pending") return { status: "Pending", checked: true, reason };
    return { status: "Pending", checked: false, reason: "Employer verification provider returned an unsupported status." };
  } catch {
    return { status: "Pending", checked: false, reason: "Employer verification provider is unavailable." };
  }
}
