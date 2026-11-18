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
  } = {},
): Promise<T> {
  const headers = new Headers();
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let response: Response;
  try {
    response = await fetch(`${getBackendApiUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Backend API request failed.", error);
    throw new BackendApiError("The backend is unavailable. Please try again later.", 0);
  }

  if (!response.ok) {
    const message = response.status === 401
      ? "Your session has expired. Please sign in again."
      : response.status === 403
        ? "You are not authorized to perform this action."
        : response.status === 404
          ? "The requested backend record was not found."
          : response.status === 409
            ? "This request conflicts with an existing record."
            : response.status >= 500
              ? "The backend could not complete the request. Please try again later."
              : "The backend rejected the request. Check the submitted information.";
    throw new BackendApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
