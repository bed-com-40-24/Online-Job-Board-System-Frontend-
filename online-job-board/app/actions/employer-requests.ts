"use server";

import { revalidatePath } from "next/cache";
import { BackendApiError, backendApiRequest } from "@/lib/backend-api";
import { getAdminSession } from "@/lib/admin-session";

export type EmployerRequestActionState = {
  error?: string;
  success?: string;
};

export async function reviewEmployerRequest(
  _previousState: EmployerRequestActionState,
  formData: FormData,
): Promise<EmployerRequestActionState> {
  const session = await getAdminSession();
  if (!session?.accessToken) return { error: "Please sign in again to review this request." };

  const requestId = formData.get("requestId");
  const decision = formData.get("decision");
  const reason = formData.get("reason");
  const rejectionReason = typeof reason === "string" ? reason.trim() : "";
  if (typeof requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "The employer request ID is invalid." };
  }

  if (decision !== "approve" && decision !== "reject") {
    return { error: "Choose an approval decision." };
  }
  if (decision === "reject" && rejectionReason.length < 2) {
    return { error: "Enter a reason before rejecting this request." };
  }

  try {
    await backendApiRequest(
      `/api/admin/employer-requests/${encodeURIComponent(requestId)}/${decision}`,
      {
        method: "PATCH",
        token: session.accessToken,
        ...(decision === "reject" ? { body: { reason: rejectionReason } } : {}),
      },
    );
    revalidatePath("/admin/employers");
    revalidatePath("/admin/dashboard");
    return { success: decision === "approve" ? "Employer request approved." : "Employer request rejected." };
  } catch (error) {
    console.error("Employer request review failed.", error);
    return {
      error: error instanceof BackendApiError
        ? error.message
        : "The employer request could not be updated. Please try again.",
    };
  }
}

export async function updateBackendUserStatus(
  _previousState: EmployerRequestActionState,
  formData: FormData,
): Promise<EmployerRequestActionState> {
  const session = await getAdminSession();
  if (!session?.accessToken) return { error: "Please sign in again to manage accounts." };
  const userId = formData.get("userId");
  const operation = formData.get("operation");
  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return { error: "The account ID is invalid." };
  }
  if (operation !== "suspend" && operation !== "remove") {
    return { error: "Choose an account action." };
  }
  try {
    await backendApiRequest(`/api/admin/users/${encodeURIComponent(userId)}/${operation}`, {
      method: "PATCH",
      token: session.accessToken,
    });
    revalidatePath("/admin/employers");
    revalidatePath("/admin/dashboard");
    return { success: operation === "suspend" ? "Account suspended." : "Account removed." };
  } catch (error) {
    console.error("Backend account status update failed.", error);
    return {
      error: error instanceof BackendApiError
        ? error.message
        : "The account could not be updated. Please try again.",
    };
  }
}
