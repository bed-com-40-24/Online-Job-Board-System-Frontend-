import { NextResponse } from "next/server";
import { BackendApiError, backendApiRequest } from "@/lib/backend-api";
import { getAdminSession } from "@/lib/admin-session";

const maximumDocumentSize = 5 * 1024 * 1024;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const session = await getAdminSession();
  if (!session?.accessToken) return jsonError("Sign in as an administrator to view this certificate.", 401);

  const { requestId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) return jsonError("The employer request ID is invalid.", 400);

  try {
    const result = await backendApiRequest<{ url: string }>(
      `/api/admin/employer-requests/${encodeURIComponent(requestId)}/document`,
      { token: session.accessToken },
    );
    let downloadUrl: URL;
    try {
      downloadUrl = new URL(result.url);
    } catch {
      return jsonError("The backend did not provide a valid certificate link.", 502);
    }
    const localHttp = downloadUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(downloadUrl.hostname);
    if (
      (downloadUrl.protocol !== "https:" && !localHttp) ||
      downloadUrl.username ||
      downloadUrl.password
    ) {
      return jsonError("The backend did not provide a secure certificate link.", 502);
    }

    let storageResponse: Response;
    try {
      storageResponse = await fetch(downloadUrl, { cache: "no-store", redirect: "error" });
    } catch (error) {
      console.error("Employer certificate storage request failed.", {
        host: downloadUrl.host,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      const localStorageHost = ["localhost", "127.0.0.1", "::1"].includes(downloadUrl.hostname);
      return jsonError(
        localStorageHost
          ? "The backend returned a localhost certificate link, which this frontend server cannot reach. Set PROFILE_STORAGE_PUBLIC_ENDPOINT to a storage URL reachable from the frontend server."
          : "The certificate storage could not be reached. Ask an administrator to check that its public endpoint is reachable from the frontend server.",
        502,
      );
    }
    if (!storageResponse.ok) {
      return jsonError("The certificate could not be retrieved from storage.", 502);
    }

    const contentLength = Number(storageResponse.headers.get("content-length") ?? 0);
    if (contentLength > maximumDocumentSize) {
      return jsonError("The stored certificate exceeds the 5 MB size limit.", 413);
    }

    const reader = storageResponse.body?.getReader();
    if (!reader) return jsonError("The certificate storage returned an empty response.", 502);
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > maximumDocumentSize) {
        await reader.cancel();
        return jsonError("The stored certificate exceeds the 5 MB size limit.", 413);
      }
      chunks.push(value);
    }

    const document = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      document.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const signature = new TextDecoder().decode(document.slice(0, 5));
    if (signature !== "%PDF-") {
      return jsonError(
        "Storage returned something other than the uploaded PDF. Ask an administrator to check the document storage configuration.",
        502,
      );
    }

    return new Response(document, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="employer-certificate.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Employer certificate preview failed.", error);
    return jsonError(
      error instanceof BackendApiError ? error.message : "The employer certificate could not be loaded.",
      error instanceof BackendApiError ? error.status || 502 : 500,
    );
  }
}
