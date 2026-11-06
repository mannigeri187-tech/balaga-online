import { supabase } from "./supabase";

/**
 * Returns authorization headers for API requests.
 * Uses real Supabase session access token when authenticated.
 * Includes x-platform-world for strict world context isolation.
 */
export async function getAuthHeaders(world?: "socializing" | "founders"): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (world) {
    headers["x-platform-world"] = world;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (import.meta.env.DEV) {
      // In local development, provide mock header if remote session is inactive
      headers["x-mock-user"] = "true";
    }
  } catch {
    if (import.meta.env.DEV) {
      headers["x-mock-user"] = "true";
    }
  }

  return headers;
}

/**
 * Authenticated API Fetch wrapper.
 * Injects Supabase Bearer token and headers automatically.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  world?: "socializing" | "founders"
): Promise<Response> {
  const authHeaders = await getAuthHeaders(world);
  const finalHeaders = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  return fetch(endpoint, {
    ...options,
    headers: finalHeaders,
  });
}
