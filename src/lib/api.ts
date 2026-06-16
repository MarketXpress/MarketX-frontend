const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "BUYER" | "SELLER";
}

export interface LoginBody {
  email: string;
  password: string;
}

export const authApi = {
  register: (body: RegisterBody) =>
    request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: LoginBody) =>
    request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

/** Decode a JWT payload without verifying the signature (client-side only). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export { ApiError };
