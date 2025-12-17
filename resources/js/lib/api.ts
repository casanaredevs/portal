// Utilidades simples para llamadas a la API JSON con manejo de errores uniforme
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const csrf = (typeof document !== 'undefined') ? (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content : undefined;
  const merged: RequestInit = {
    method: options.method || 'GET',
    credentials: 'same-origin', // incluir cookies para sesión/CSRF
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };
  const res = await fetch(url, merged);
  if (!res.ok) {
    // Intentar parsear JSON; en 419 puede venir vacío
    let body: any = null;
    try { body = await res.json(); } catch { /* ignore */ }
    if (res.status === 419) {
      body = body || { message: 'CSRF token mismatch.' };
    }
    const err: ApiErrorResponse = body || { message: res.statusText };
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const patchJson = <T>(url: string, data: any) => apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(data) });
export const postJson =  <T>(url: string, data: any) => apiFetch<T>(url, { method: 'POST', body: JSON.stringify(data) });
export const del =       <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' });
