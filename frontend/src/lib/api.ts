export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function toApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "/window.svg";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/${imageUrl}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(toApiUrl(path), init);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed");
  }

  return payload as T;
}
