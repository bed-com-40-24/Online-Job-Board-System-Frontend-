import "server-only";

export class BackendApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new Error("BACKEND_API_URL is not configured.");
  return url.replace(/\/+$/, "");
}

export async function backendApiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    unauthorizedMessage?: string;
  } = {},
): Promise<T> {
  const headers = new Headers();
  const isFormData = options.body instanceof FormData;
  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const requestBody: BodyInit | undefined = options.body === undefined
    ? undefined
    : options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body);

  let response: Response;
  try {
    response = await fetch(`${getBackendApiUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: requestBody,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Backend API request failed.", error);
    throw new BackendApiError(
      "Unable to connect to the service. Check your internet connection and try again.",
      0,
    );
  }

  if (!response.ok) {
    let backendMessage = "";
    try {
      const responseBody = await response.clone().text();
      if (responseBody) {
        try {
          const parsed = JSON.parse(responseBody) as { message?: unknown; error?: unknown; detail?: unknown };
          for (const value of [parsed.message, parsed.error, parsed.detail]) {
            if (typeof value === "string" && value.trim()) {
              backendMessage = value.trim();
              break;
            }
          }
        } catch {
          backendMessage = responseBody.trim();
        }
      }
    } catch {
      // Keep the stable fallback messages below when the backend has no JSON body.
    }

    const message = response.status === 401
      ? (options.unauthorizedMessage ?? backendMessage) || "Your session has expired. Please sign in again."
      : response.status === 503 && path === "/api/employer-requests" && options.method === "POST"
      ? "The backend's private document storage is unavailable. Your employer request was not submitted. Please try again later or contact the administrator."
      : response.status === 403
        ? backendMessage || "You are not authorized to perform this action."
        : response.status === 404
          ? backendMessage || "The requested backend record was not found."
          : response.status === 409
            ? backendMessage || "This request conflicts with an existing record."
            : response.status >= 500
              ? backendMessage || "The service is temporarily having trouble. Please try again later."
              : backendMessage || "The backend rejected the request. Check the submitted information.";
    throw new BackendApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
