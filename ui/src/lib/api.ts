const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Params = Record<string, string | number | null | undefined>;
export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Turn FastAPI's `detail` (a string, or an array of 422 validation errors) into one message. */
function extractDetail(body: unknown): string | null {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((err) => {
      const loc = Array.isArray(err?.loc)
        ? err.loc.filter((part: unknown) => part !== "body").join(".")
        : "";
      const msg = typeof err?.msg === "string" ? err.msg : String(err);
      return loc ? `${loc}: ${msg}` : msg;
    });
    if (messages.length > 0) return messages.join("; ");
  }
  return null;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Token expired or invalid: clear the session and send the user to the login page.
    if (res.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    let message = res.statusText || "Request failed";
    try {
      message = extractDetail(await res.json()) ?? message;
    } catch {
      // The response had no JSON body.
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function apiGet<T>(
  path: string,
  params: Params = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse<T>(res);
}

export async function apiSend<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(new URL(path, BASE_URL), {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}


export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const res = await fetch(new URL(path, BASE_URL), {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
    body: formData,
  });

  return handleResponse<T>(res);
}
